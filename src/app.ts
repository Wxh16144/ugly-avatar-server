import 'dotenv/config';
import { createApiApp } from './server/api';
import { startWebServer } from './server/web';

const apiApp = createApiApp();
const port = process.env.PORT || 3000;
const webPort = Number(process.env.WEB_PORT) || 3002;

apiApp.listen(port, () => {
  console.log(`API Server running on port ${port}`);
});

startWebServer(webPort);