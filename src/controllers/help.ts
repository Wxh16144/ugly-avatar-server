import { Context } from 'koa';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const HELP_FILE_PATH = path.join(__dirname, '../assets/help.txt');

export const helpHandler = async (ctx: Context) => {
  if (ctx.method !== 'GET' && ctx.method !== 'HEAD') {
    ctx.status = 405; // Method Not Allowed
    return;
  }

  try {
    const stats = await fs.promises.stat(HELP_FILE_PATH);
    const fileBuffer = await fs.promises.readFile(HELP_FILE_PATH);

    // 1. 设置 Last-Modified
    ctx.set('Last-Modified', stats.mtime.toUTCString());

    // 2. 计算并设置 ETag (MD5)
    const hash = crypto.createHash('md5').update(fileBuffer).digest('hex');
    ctx.set('ETag', `"${hash}"`);

    // 3. 设置过期时间 (例如 1 小时)
    // Cache-Control: public, max-age=3600
    ctx.set('Cache-Control', 'public, max-age=3600');

    // 4. 检查缓存是否新鲜 (Koa 会自动对比 If-None-Match / If-Modified-Since 和响应头)
    if (ctx.fresh) {
      ctx.status = 304;
      return;
    }

    // 如果缓存过期或不存在，返回新内容
    ctx.type = 'text/plain';
    ctx.body = fileBuffer;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      ctx.status = 404;
      ctx.body = 'Help file not found';
    } else {
      ctx.status = 500;
      ctx.body = 'Internal Server Error';
      console.error(err);
    }
  }
};
