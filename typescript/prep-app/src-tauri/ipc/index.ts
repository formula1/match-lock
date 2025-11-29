#!/usr/bin/env node

import { createServer, Server } from 'http';
import { createMainRouter } from './router';
import finalhandler from 'finalhandler';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';


// Get socket path from command line argument, or generate one
const socketPath = process.argv[2] || path.join(os.tmpdir(), `matchlock-ipc-${process.pid}.sock`);

console.log(`🚀 Starting IPC server on socket: ${socketPath}`);

// Create the main router
const router = createMainRouter();

// Create HTTP server
const server: Server = createServer((req, res) => {
  // Add CORS headers for local development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Route the request through our router
  router(req, res, finalhandler(req, res));
});

// Handle server errors
server.on('error', (error: any) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Socket ${socketPath} is already in use`);
  } else {
    console.error('❌ Server error:', error);
  }
  process.exit(1);
});

// Cleanup function
function cleanup() {
  console.log('🧹 Cleaning up IPC server...');

  server.close(() => {
    // Clean up socket file
    if (fs.existsSync(socketPath)) {
      fs.unlinkSync(socketPath);
      console.log('🗑️ Socket file removed');
    }
    console.log('🛑 HTTP server closed');
  });
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('📨 Received SIGTERM, shutting down gracefully...');
  cleanup();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('📨 Received SIGINT, shutting down gracefully...');
  cleanup();
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught exception:', error);
  cleanup();
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled rejection at:', promise, 'reason:', reason);
  cleanup();
  process.exit(1);
});

// Clean up existing socket file
if (fs.existsSync(socketPath)) {
  fs.unlinkSync(socketPath);
  console.log('🗑️ Removed existing socket file');
}

// Start the server
server.listen(socketPath, () => {
  console.log(`✅ IPC server listening on socket: ${socketPath}`);
  console.log('🔗 Available endpoints:');
  console.log('  GET  /health');
  console.log('  POST /console/log');
  console.log('  GET  /storage/:key');
  console.log('  POST /storage/:key');
  console.log('  DELETE /storage/:key');
  console.log('  GET  /storage/keys');
  console.log('  POST /storage/clear');
  console.log('  GET  /user-settings');
  console.log('  POST /user-settings');
  console.log('  POST /user-settings/initialize');
  console.log('  POST /user-settings/handle-choice');

  // Write the socket path to stdout so Rust can capture it
  console.log(`IPC_SOCKET:${socketPath}`);
});

// Clean up socket file on exit
process.on('exit', () => {
  if (fs.existsSync(socketPath)) {
    fs.unlinkSync(socketPath);
  }
});

// Keep the process alive
process.stdin.resume();
