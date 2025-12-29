import Koa from 'koa';
import { helpHandler } from './controllers/help';
import { avatarHandler, avatarPathHandler, validFormats } from './controllers/avatar';

const app = new Koa();

app.use(async (ctx, next) => {
  if (ctx.path === '/help') {
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
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});