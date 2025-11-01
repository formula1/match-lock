import Router from 'router';
import { IncomingMessage, ServerResponse } from 'http';
import { createStorageRouter } from './storage';
import { createUserSettingsRouter } from './user-settings';
import { jsonBody, sendJson, sendError } from '../util/http-json';


// Create the main router
export function createMainRouter(): Router {
  const router = Router();

  // Health check endpoint
  router.get('/health', (req: IncomingMessage, res: ServerResponse) => {
    sendJson(res, { 
      status: 'ok', 
      timestamp: Date.now(),
      service: 'matchlock-prep-app-ipc'
    });
  });

  // Console logging endpoint for Rust to send logs to Node.js console
  router.post('/console/log', async (req: IncomingMessage, res: ServerResponse) => {
    try {
      const body = await jsonBody(req) as { level: string; message: string };
      const { level, message } = body;
      
      switch (level.toLowerCase()) {
        case 'error':
          console.error(`🔴 [RUST ERROR] ${message}`);
          break;
        case 'warn':
          console.warn(`🟡 [RUST WARN] ${message}`);
          break;
        case 'info':
          console.info(`🔵 [RUST INFO] ${message}`);
          break;
        default:
          console.log(`⚪ [RUST LOG] ${message}`);
      }
      
      sendJson(res, { success: true });
    } catch (error) {
      sendError(res, `Failed to log message: ${error}`);
    }
  });

  // Use sub-routers - Router doesn't have .use() like Express, so we need to handle this differently
  // We'll manually route to the sub-routers based on path prefixes
  
  // Handle all requests and route to appropriate sub-router
  router.use("/storage", createStorageRouter());
  router.use("/user-settings", createUserSettingsRouter());

  // 404 handler for unmatched routes
  router.all('*', (req: IncomingMessage, res: ServerResponse) => {
    sendError(res, `Route not found: ${req.method} ${req.url}`, 404);
  });

  return router;
}
