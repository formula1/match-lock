import { IncomingMessage, ServerResponse } from 'http';
import jsonBodyCallback from "body/json";

export type JSON_Unknown = unknown;

export function jsonBody(req: IncomingMessage): Promise<JSON_Unknown> {
  // console.log("🔂 jsonBody init");
  return new Promise((res, rej) => {
    jsonBodyCallback(req, (err: any, json: any) => {
      // console.log("🔂 jsonBodyCallback", err, json);
      if (err) return rej(err);
      res(json as JSON_Unknown);
    });
  });
}

// Helper function to send JSON response
export function sendJson(res: ServerResponse, data: any, status: number = 200) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

// Helper function to send error response
export function sendError(res: ServerResponse, message: string, status: number = 500) {
  console.error('Error:', message);
  sendJson(res, { error: message }, status);
}
