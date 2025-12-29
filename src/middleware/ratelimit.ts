import ratelimit from 'koa-ratelimit';
import { Context, Next } from 'koa';
import { getErrorSvg } from '../utils/image/error';

// Environment variables
const max = parseInt(process.env.RATELIMIT_MAX || '0', 10);
const duration = parseInt(process.env.RATELIMIT_WINDOW || '60000', 10); // Default 1 minute

// In-memory storage
const db = new Map();

let middleware: (ctx: Context, next: Next) => Promise<void>;

if (max > 0) {
  middleware = ratelimit({
    driver: 'memory',
    db: db,
    duration: duration,
    errorMessage: 'Too Many Requests',
    id: (ctx) => ctx.ip,
    headers: {
      remaining: 'Rate-Limit-Remaining',
      reset: 'Rate-Limit-Reset',
      total: 'Rate-Limit-Total'
    },
    max: max,
    disableHeader: false,
    throw: true, // Throw error so we can catch it and render SVG
  });
}

export const rateLimitMiddleware = async (ctx: Context, next: Next) => {
  if (!middleware) {
    await next();
    return;
  }

  try {
    await middleware(ctx, next);
  } catch (err: any) {
    if (err.status === 429) {
      ctx.status = 429;
      ctx.set('Retry-After', err.headers?.['Retry-After'] || Math.ceil(duration / 1000).toString());
      ctx.type = 'image/svg+xml';
      ctx.body = getErrorSvg('429 Too Many Requests');
      return;
    }
    throw err;
  }
};
