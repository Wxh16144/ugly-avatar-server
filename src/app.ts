import 'dotenv/config';
import Koa from 'koa';
import { helpHandler } from './controllers/help';
import { avatarHandler, avatarPathHandler, validFormats } from './controllers/avatar';
import { getErrorSvg } from './utils/image/error';
import { whitelistMiddleware } from './middleware/whitelist';
import { rateLimitMiddleware } from './middleware/ratelimit';

const app = new Koa();

const enableHelp = process.env.ENABLE_HELP !== 'false';

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