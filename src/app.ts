import 'dotenv/config';
import Koa from 'koa';
import { helpHandler } from './controllers/help';
import { avatarHandler, avatarPathHandler, validFormats } from './controllers/avatar';
import { getErrorSvg } from './utils/image/error';

const app = new Koa();

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()).filter(Boolean);

app.use(async (ctx, next) => {
  // Whitelist check
  if (allowedOrigins && allowedOrigins.length > 0) {
    const origin = ctx.get('Origin');
    const referer = ctx.get('Referer');
    
    // Allow if no origin/referer (direct access) ? 
    // Usually whitelist is to prevent hotlinking. 
    // If we want to strictly block everything else, we should block empty referer too?
    // Let's assume if whitelist is set, we only allow matching requests.
    // But often direct access (no referer) is desired for debugging.
    // Let's check if the user wants to block direct access. 
    // "whitelist requests" implies filtering.
    // If I open image in new tab, referer is usually empty (or from previous page).
    
    // Let's implement: If Origin or Referer is present, it MUST match.
    // If both are missing, allow it? Or block?
    // If I want to protect my bandwidth, I want to block hotlinking.
    // Hotlinking sends Referer.
    // So if Referer is present, check it.
    // If Origin is present, check it.
    // If neither, allow? (This is "Hotlink Protection" style)
    
    // Or "Access Control" style (Strict whitelist).
    // Given "whitelist requests", it sounds strict.
    
    // However, blocking requests without referer breaks simple curl/browser usage.
    // Let's try to be safe: Check if headers exist.
    
    const hasOrigin = !!origin;
    const hasReferer = !!referer;
    
    if (hasOrigin || hasReferer) {
      const isAllowed = allowedOrigins.some(allowed => {
        return (origin && origin === allowed) || (referer && referer.startsWith(allowed));
      });
      
      if (!isAllowed) {
        ctx.status = 403;
        ctx.type = 'image/svg+xml';
        ctx.body = getErrorSvg('403 Forbidden');
        return;
      }
    }
    // If no headers, we allow it (assuming direct access is okay, or we can't verify).
    // This is safer for a default implementation of "whitelist" to avoid breaking CLI tools/direct visits.
    // But wait, if I want to restrict usage to ONLY my site, I might want to block empty referers too.
    // But that's hard to configure with just a list of domains.
    // I'll stick to: If header exists, it must match.
  }

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