import Koa from 'koa';
import cors from '@koa/cors';
import { helpHandler } from '../controllers/help';
import { avatarHandler, avatarPathHandler, validFormats } from '../controllers/avatar';
import { getErrorSvg } from '../utils/image/error';
import { whitelistMiddleware } from '../middleware/whitelist';
import { rateLimitMiddleware } from '../middleware/ratelimit';

export const createApiApp = () => {
  const app = new Koa();

  // Trust proxy for correct IP detection behind reverse proxies
  if (process.env.TRUST_PROXY === 'true') {
    app.proxy = true;
  }

  const enableHelp = process.env.ENABLE_HELP !== 'false';

  // CORS configuration
  app.use(cors({
    origin: (ctx) => {
      const origin = ctx.get('Origin');
      return origin || '*';
    },
    allowMethods: ['GET', 'HEAD', 'OPTIONS'],
  }));

  // Security and Rate Limiting
  app.use(whitelistMiddleware);
  app.use(rateLimitMiddleware);

  // Main Router
  app.use(async (ctx, next) => {
    // Help endpoint
    if (ctx.path === '/help' && enableHelp) {
      await helpHandler(ctx);
      return;
    }

    // Root endpoint: /?id=...
    if (ctx.path === '/') {
      await avatarHandler(ctx);
      return;
    }

    // Path endpoint: /[id].[format]
    const segments = ctx.path.split('/').filter(Boolean);

    if (segments.length === 1) {
      const idAndFormat = segments[0];
      const lastDotIndex = idAndFormat.lastIndexOf('.');
      
      if (lastDotIndex !== -1) {
        const possibleFormat = idAndFormat.substring(lastDotIndex + 1);
        if (validFormats.includes(possibleFormat) || possibleFormat === 'svg') {
          const format = possibleFormat === 'svg' ? '' : possibleFormat;
          const id = idAndFormat.substring(0, lastDotIndex);
          const size = (ctx.query.s as string) || "";
          await avatarPathHandler(ctx, size, id, format);
          return;
        }
      }
    }

    await next();

    // 404 Handler
    if (ctx.status === 404 && !ctx.body) {
      ctx.status = 404;
      ctx.type = 'image/svg+xml';
      ctx.body = getErrorSvg('404 Not Found');
    }
  });

  return app;
};
