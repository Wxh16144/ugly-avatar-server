import { Context } from 'koa';
import seedrandom from 'seedrandom';
import sharp from 'sharp';
import crypto from 'crypto';
import { getSvg } from '../utils/image';
import { getErrorSvg } from '../utils/image/error';

const defaultSize = 512;
export const validFormats = ['png', 'jpeg', 'jpg', 'webp', 'avif', 'tiff', 'gif'];

interface AvatarParams {
  id: string;
  bg: string;
  s: string;
  f: string;
}

const generateAvatar = async (ctx: Context, params: AvatarParams) => {
  const { id, bg, s, f: format } = params;

  // Helper to return error image
  const returnError = async (msg: string) => {
    ctx.status = 200; // Return 200 to ensure image is displayed
    // Prevent CDNs from caching error images
    ctx.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    ctx.set('Pragma', 'no-cache');
    ctx.set('Expires', '0');
    
    const errorSvg = getErrorSvg(msg, 256, 256);
    
    if (format && validFormats.includes(format)) {
      try {
        const outputFormat = format === 'jpg' ? 'jpeg' : format;
        const buffer = await sharp(Buffer.from(errorSvg))
          .toFormat(outputFormat as keyof sharp.FormatEnum)
          .toBuffer();
        ctx.type = `image/${outputFormat}`;
        ctx.body = buffer;
        return;
      } catch (e) {
        console.error('Error converting error image:', e);
      }
    }
    
    ctx.type = 'image/svg+xml';
    ctx.body = errorSvg;
  };

  // Validation
  let size = defaultSize;
  if (s) {
    const parsedSize = parseInt(s, 10);
    if (isNaN(parsedSize) || parsedSize < 16 || parsedSize > 2048) {
      return returnError('Invalid size: 16-2048');
    }
    size = parsedSize;
  }

  if (format && !validFormats.includes(format)) {
    return returnError(`Invalid format: ${validFormats.join(', ')}`);
  }

  const salt = process.env.AVATAR_SALT || '';
  const seed = (id || `${Math.random()}`) + salt;
  const rng = seedrandom(seed);
  const width = size;
  const height = size;

  try {
    const result = await getSvg({ rng, bgColor: bg, width, height });
    
    let finalBuffer: Buffer;
    let contentType: string;

    if (format) {
      const outputFormat = format === 'jpg' ? 'jpeg' : format;
      finalBuffer = await sharp(Buffer.from(result))
        .toFormat(outputFormat as keyof sharp.FormatEnum)
        .toBuffer();
      contentType = `image/${outputFormat}`;
    } else {
      finalBuffer = Buffer.from(result);
      contentType = 'image/svg+xml';
    }

    // Cache Headers
    ctx.set('Cache-Control', 'public, max-age=31536000, immutable');
    // Ignore all query params except those that affect generation
    ctx.set('No-Vary-Search', 'params, except=("s" "bg" "f")');
    
    // ETag
    const etag = crypto.createHash('md5').update(finalBuffer).digest('hex');
    ctx.set('ETag', `"${etag}"`);

    if (ctx.fresh) {
      ctx.status = 304;
      return;
    }

    ctx.type = contentType;
    ctx.body = finalBuffer;

  } catch (error) {
    console.error('Avatar generation error:', error);
    return returnError('Internal Server Error');
  }
};

export const avatarHandler = async (ctx: Context) => {
  const query = ctx.query;
  await generateAvatar(ctx, {
    id: (query.id as string) || (query.username as string) || "",
    bg: (query.bg as string) || "",
    s: (query.s as string) || "",
    f: (query.f as string) || "",
  });
};

export const avatarPathHandler = async (ctx: Context, size: string, id: string, format: string) => {
    const query = ctx.query;
    await generateAvatar(ctx, {
        id,
        bg: (query.bg as string) || "",
        s: size,
        f: format,
    });
};
