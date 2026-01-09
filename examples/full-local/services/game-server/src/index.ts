import express, { Request, Response } from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';

const app = express();
const PORT = process.env.PORT;
if (!PORT) throw new Error('PORT is not defined');
const RELAY_SERVER_URL = process.env.RELAY_SERVER_URL;
if (!RELAY_SERVER_URL) throw new Error('RELAY_SERVER_URL is not defined');

app.use(cors());
app.use(express.json());

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server for WebRTC signaling
const wss = new WebSocketServer({ server, path: '/signaling' });

// Store active game sessions
interface GameSession {
  sessionId: string;
  users: Map<string, WebSocket>;
  createdAt: number;
  state: 'waiting' | 'connecting' | 'playing' | 'finished';
}

const gameSessions = new Map<string, GameSession>();

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'game-server' });
});

// Get active sessions
app.get('/sessions', (req: Request, res: Response) => {
  const sessions = Array.from(gameSessions.values()).map(session => ({
    sessionId: session.sessionId,
    userCount: session.users.size,
    state: session.state,
    uptime: Date.now() - session.createdAt
  }));
  res.json({ sessions });
});

// Webhook: Room completed successfully
app.post('/webhooks/room-complete', (req: Request, res: Response) => {
  const { roomId, matchmakerId, users, metadata, selections, signature } = req.body;

  console.log(`[WEBHOOK] Room completed: ${roomId}`);
  console.log(`  Users: ${users?.join(', ')}`);
  console.log(`  Metadata:`, metadata);

  // TODO: Verify signature from relay server

  // Find session by metadata (assuming matchmaking passed sessionId in metadata)
  const sessionId = metadata?.gameSessionId;
  if (!sessionId) {
    console.error('No gameSessionId in metadata');
    return res.status(400).json({ error: 'gameSessionId required in metadata' });
  }

  const session = gameSessions.get(sessionId);
  if (!session) {
    console.error(`Session ${sessionId} not found`);
    return res.status(404).json({ error: 'Session not found' });
  }

  // Activate the session
  session.state = 'connecting';
  console.log(`Session ${sessionId} activated and ready for WebRTC connections`);

  res.json({ status: 'ok', sessionId, state: session.state });
});

// Webhook: Room failed
app.post('/webhooks/room-failed', (req: Request, res: Response) => {
  const { roomId, matchmakerId, users, metadata, failureReason, signature } = req.body;

  console.log(`[WEBHOOK] Room failed: ${roomId}`);
  console.log(`  Reason: ${failureReason}`);
  console.log(`  Users: ${users?.join(', ')}`);

  // TODO: Verify signature from relay server

  // Find session by metadata
  const sessionId = metadata?.gameSessionId;
  if (!sessionId) {
    console.error('No gameSessionId in metadata');
    return res.status(400).json({ error: 'gameSessionId required in metadata' });
  }

  const session = gameSessions.get(sessionId);
  if (!session) {
    console.error(`Session ${sessionId} not found`);
    return res.status(404).json({ error: 'Session not found' });
  }

  // Mark session as finished/cancelled
  session.state = 'finished';

  // Close all connected WebSockets
  session.users.forEach((ws, userId) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'session-cancelled',
        reason: failureReason
      }));
      ws.close(1000, 'Room failed');
    }
  });

  // Clean up session
  gameSessions.delete(sessionId);
  console.log(`Session ${sessionId} cancelled and cleaned up`);

  res.json({ status: 'ok', sessionId, state: 'cancelled' });
});

// Create a new game session
app.post('/session/create', (req: Request, res: Response) => {
  const { matchId, users } = req.body;

  if (!matchId || !users || !Array.isArray(users)) {
    return res.status(400).json({ error: 'matchId and users array are required' });
  }

  const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const session: GameSession = {
    sessionId,
    users: new Map(),
    createdAt: Date.now(),
    state: 'waiting'
  };

  gameSessions.set(sessionId, session);

  console.log(`Created game session ${sessionId} for match ${matchId}`);

  res.json({
    sessionId,
    signalingUrl: `ws://localhost:${PORT}/signaling?sessionId=${sessionId}`,
    users
  });
});

// WebSocket signaling for WebRTC
wss.on('connection', (ws: WebSocket, req) => {
  const url = new URL(req.url!, `http://localhost:${PORT}`);
  const sessionId = url.searchParams.get('sessionId');
  const userId = url.searchParams.get('userId');

  if (!sessionId || !userId) {
    ws.close(1008, 'sessionId and userId are required');
    return;
  }

  const session = gameSessions.get(sessionId);
  if (!session) {
    ws.close(1008, 'Session not found');
    return;
  }

  // Add user to session
  session.users.set(userId, ws);
  console.log(`User ${userId} connected to session ${sessionId}. Total users: ${session.users.size}`);

  // Notify user they're connected
  ws.send(JSON.stringify({
    type: 'connected',
    sessionId,
    userId,
    userCount: session.users.size
  }));

  // Notify other users
  broadcastToSession(session, {
    type: 'user-joined',
    userId,
    userCount: session.users.size
  }, userId);

  // Handle WebRTC signaling messages
  ws.on('message', (data: Buffer) => {
    try {
      const message = JSON.parse(data.toString());
      
      console.log(`Received message from ${userId}:`, message.type);

      // Forward signaling messages to target user or broadcast
      if (message.targetUserId) {
        const targetWs = session.users.get(message.targetUserId);
        if (targetWs && targetWs.readyState === WebSocket.OPEN) {
          targetWs.send(JSON.stringify({
            ...message,
            fromUserId: userId
          }));
        }
      } else {
        // Broadcast to all other users in session
        broadcastToSession(session, {
          ...message,
          fromUserId: userId
        }, userId);
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  });

  ws.on('close', () => {
    session.users.delete(userId);
    console.log(`User ${userId} disconnected from session ${sessionId}. Remaining: ${session.users.size}`);

    // Notify other users
    broadcastToSession(session, {
      type: 'user-left',
      userId,
      userCount: session.users.size
    });

    // Clean up empty sessions
    if (session.users.size === 0) {
      gameSessions.delete(sessionId);
      console.log(`Session ${sessionId} cleaned up`);
    }
  });
});

function broadcastToSession(session: GameSession, message: any, excludeUserId?: string) {
  const messageStr = JSON.stringify(message);
  session.users.forEach((ws, userId) => {
    if (userId !== excludeUserId && ws.readyState === WebSocket.OPEN) {
      ws.send(messageStr);
    }
  });
}

server.listen(PORT, () => {
  console.log(`Game server running on port ${PORT}`);
  console.log(`WebSocket signaling available at ws://localhost:${PORT}/signaling`);
  console.log(`Relay server URL: ${RELAY_SERVER_URL}`);
});

