import 'dotenv/config';
import Koa from 'koa';
import cors from '@koa/cors';
import serve from 'koa-static';
import path from 'path';
import fs from 'fs';
import { helpHandler } from './controllers/help';
import { avatarHandler, avatarPathHandler, validFormats } from './controllers/avatar';
import { getErrorSvg } from './utils/image/error';
import { whitelistMiddleware } from './middleware/whitelist';
import { rateLimitMiddleware } from './middleware/ratelimit';

const app = new Koa();

// Trust proxy if deployed behind a reverse proxy (Nginx, Cloudflare, etc.)
// Required for rate limiting to work correctly when behind a proxy
if (process.env.TRUST_PROXY === 'true') {
  app.proxy = true;
}

const enableHelp = process.env.ENABLE_HELP !== 'false';

// CORS Middleware
app.use(cors({
  origin: (ctx) => {
    // If ALLOWED_ORIGINS is set, we could strictly return the origin if it matches,
    // but whitelistMiddleware already handles the blocking logic.
    // Here we just need to ensure that if the request is allowed, the browser gets the correct CORS header.
    // Returning the request Origin allows the browser to process the response.
    // If whitelistMiddleware blocks it later, the browser will receive 403 anyway.
    const origin = ctx.get('Origin');
    return origin || '*';
  },
  allowMethods: ['GET', 'HEAD', 'OPTIONS'],
}));

app.use(whitelistMiddleware);
app.use(rateLimitMiddleware);

app.use(async (ctx, next) => {
  if (ctx.path === '/help' && enableHelp) {
    await helpHandler(ctx);
    return;
  }

  if (ctx.path === '/') {
    await avatarHandler(ctx);
    return;
  }

  // Parse path: /[id].[format]
  // format is mandatory
  const segments = ctx.path.split('/').filter(Boolean);

  if (segments.length === 1) {
    const idAndFormat = segments[0];
    const lastDotIndex = idAndFormat.lastIndexOf('.');
    
    if (lastDotIndex !== -1) {
      const possibleFormat = idAndFormat.substring(lastDotIndex + 1);
      // Support valid formats + svg
      if (validFormats.includes(possibleFormat) || possibleFormat === 'svg') {
        // If svg, pass empty string to use default SVG generation logic
        const format = possibleFormat === 'svg' ? '' : possibleFormat;
        const id = idAndFormat.substring(0, lastDotIndex);
        const size = (ctx.query.s as string) || "";
        await avatarPathHandler(ctx, size, id, format);
        return;
      }
    }
  }

  await next();

  if (ctx.status === 404 && !ctx.body) {
    ctx.status = 404;
    ctx.type = 'image/svg+xml';
    ctx.body = getErrorSvg('404 Not Found');
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Web Server
const webPort = process.env.WEB_PORT || 3002;
// Try to find web dist path from env or default to ./public
let webDistPath = process.env.WEB_DIST_PATH;
if (!webDistPath) {
  const defaultPath = path.join(process.cwd(), 'public');
  if (fs.existsSync(defaultPath)) {
    webDistPath = defaultPath;
  }
}

if (webDistPath) {
  const webApp = new Koa();
  webApp.use(serve(path.resolve(webDistPath)));
  
  webApp.listen(webPort, () => {
    console.log(`Web server running on port ${webPort}`);
  });
}