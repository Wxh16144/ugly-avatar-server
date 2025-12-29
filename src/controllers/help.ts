import { Context } from 'koa';
import crypto from 'crypto';

const HELP_TEXT = `Ugly Avatar Server Help
=======================

A server for generating ugly avatars.

Usage:

1. Basic Usage (Query Parameters):
   GET /?id=anything&s=256&f=png

   Parameters:
   - id: (string) Seed for random generation. Defaults to random.
   - s:  (int)    Size in pixels (16-2048). Default: 512.
   - bg: (string) Background color (hex/name). Default: random.
   - o:  (float)  Opacity (0-1). Default: 1.
   - f:  (string) Format (png, jpeg, jpg, webp, avif, tiff, gif). Default: svg.

2. Path Usage:
   GET /{id}.{format}

   Examples:
   - GET /hi.png
   - GET /hi.svg
   - GET /hi.jpg?s=100&bg=red

   Note: Query parameters (s, bg, o) can also be used with path usage.

3. Help:
   GET /help - Show this help message
`.trim();

const HELP_BUFFER = Buffer.from(HELP_TEXT);
const START_TIME = new Date().toUTCString();

export const helpHandler = async (ctx: Context) => {
  if (ctx.method !== 'GET' && ctx.method !== 'HEAD') {
    ctx.status = 405; // Method Not Allowed
    return;
  }

  try {
    // 1. 设置 Last-Modified (使用服务器启动时间)
    ctx.set('Last-Modified', START_TIME);

    // 2. 计算并设置 ETag (MD5)
    const hash = crypto.createHash('md5').update(HELP_BUFFER).digest('hex');
    ctx.set('ETag', `"${hash}"`);

    // 3. 设置过期时间
    ctx.set('Cache-Control', 'public, max-age=3600');

    // 4. 检查缓存是否新鲜
    if (ctx.fresh) {
      ctx.status = 304;
      return;
    }

    ctx.type = 'text/plain';
    ctx.body = HELP_BUFFER;
  } catch (err) {
    ctx.status = 500;
    ctx.body = 'Internal Server Error';
    console.error(err);
  }
};
