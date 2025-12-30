import Koa from 'koa';
import serve from 'koa-static';
import path from 'path';
import fs from 'fs';

export const startWebServer = (port: number) => {
  const app = new Koa();
  
  // Determine the path to serve static files from
  // In Docker, this is usually ./public
  // In local dev, it might be apps/web/dist if built locally
  const distPath = process.env.WEB_DIST_PATH || path.join(process.cwd(), 'public');

  // Dynamic Configuration Endpoint
  // Injects the API_BASE_URL into the frontend at runtime
  app.use(async (ctx, next) => {
    if (ctx.path === '/config.js') {
      const apiBaseUrl = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
      ctx.type = 'application/javascript';
      ctx.body = `window.UGLY_AVATAR_BASE_URL = "${apiBaseUrl}";`;
      return;
    }
    await next();
  });

  // Serve static files (SPA)
  app.use(serve(distPath));

  // Fallback to index.html for SPA routing
  app.use(async (ctx) => {
    if (ctx.status === 404 && ctx.method === 'GET') {
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        ctx.type = 'html';
        ctx.body = fs.createReadStream(indexPath);
      }
    }
  });

  app.listen(port, () => {
    console.log(`Web server running at http://localhost:${port}`);
    console.log(`Serving static files from: ${distPath}`);
  });
};
