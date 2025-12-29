import { Context, Next } from 'koa';
import { getErrorSvg } from '../utils/image/error';

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()).filter(Boolean);
// Default to true to maintain backward compatibility and ease of use
const allowEmptyReferer = process.env.ALLOW_EMPTY_REFERER !== 'false';

export const whitelistMiddleware = async (ctx: Context, next: Next) => {
  // Only enforce if whitelist is configured
  if (allowedOrigins && allowedOrigins.length > 0) {
    const origin = ctx.get('Origin');
    const referer = ctx.get('Referer');
    
    const hasOrigin = !!origin;
    const hasReferer = !!referer;
    
    // Case 1: No Origin/Referer (Direct access, or privacy blocking)
    if (!hasOrigin && !hasReferer) {
      if (!allowEmptyReferer) {
        ctx.status = 403;
        ctx.type = 'image/svg+xml';
        ctx.body = getErrorSvg('403 Forbidden');
        return;
      }
      // If allowed, proceed
    } 
    // Case 2: Has Origin or Referer
    else {
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
  }
  
  await next();
};
