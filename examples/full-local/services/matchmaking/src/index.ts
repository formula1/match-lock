import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT;
if (!PORT) throw new Error('PORT is not defined');
const RELAY_SERVER_URL = process.env.RELAY_SERVER_URL;
if (!RELAY_SERVER_URL) throw new Error('RELAY_SERVER_URL is not defined');
const GAME_SERVER_URL = process.env.GAME_SERVER_URL;
if (!GAME_SERVER_URL) throw new Error('GAME_SERVER_URL is not defined');

app.use(cors());
app.use(express.json());

// Simple queue to hold waiting users
interface QueuedUser {
  userId: string;
  timestamp: number;
  rosterConfig?: any;
}

const matchmakingQueue: QueuedUser[] = [];

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'matchmaking-server' });
});

// Get queue status
app.get('/queue', (req: Request, res: Response) => {
  res.json({
    queueLength: matchmakingQueue.length,
    users: matchmakingQueue.map(u => ({ userId: u.userId, waitTime: Date.now() - u.timestamp }))
  });
});

// Join matchmaking queue
app.post('/join', async (req: Request, res: Response) => {
  const { userId, rosterConfig } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  // Check if user is already in queue
  const existingIndex = matchmakingQueue.findIndex(u => u.userId === userId);
  if (existingIndex !== -1) {
    return res.status(400).json({ error: 'User already in queue' });
  }

  // Add user to queue
  const queuedUser: QueuedUser = {
    userId,
    timestamp: Date.now(),
    rosterConfig
  };
  matchmakingQueue.push(queuedUser);

  console.log(`User ${userId} joined queue. Queue length: ${matchmakingQueue.length}`);

  // Check if we can make a match (2 users)
  if (matchmakingQueue.length >= 2) {
    // Take first two users
    const user1 = matchmakingQueue.shift()!;
    const user2 = matchmakingQueue.shift()!;

    console.log(`Matching users: ${user1.userId} and ${user2.userId}`);

    try {
      // Create a match
      const matchId = `match-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const users = [user1.userId, user2.userId];
      const rosterConfig = user1.rosterConfig || user2.rosterConfig;

      // Step 1: Create game session (in pending state)
      const gameSessionResponse = await fetch(`${GAME_SERVER_URL}/session/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId,
          users
        })
      });

      if (!gameSessionResponse.ok) {
        throw new Error(`Failed to create game session: ${gameSessionResponse.statusText}`);
      }

      const gameSession = await gameSessionResponse.json();
      console.log(`Game session created: ${gameSession.sessionId}`);

      // Step 2: Create relay room with webhooks pointing to game server
      const relayRoomResponse = await fetch(`${RELAY_SERVER_URL}/api/v1/room`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publicKey: process.env.MATCHMAKER_PUBLIC_KEY || 'test-public-key',
          signature: 'test-signature', // TODO: Sign this properly
          rosterConfig,
          users,
          webhooks: {
            onRoomComplete: `${GAME_SERVER_URL}/webhooks/room-complete`,
            onRoomFailed: `${GAME_SERVER_URL}/webhooks/room-failed`
          },
          metadata: {
            gameSessionId: gameSession.sessionId,
            matchId
          }
        })
      });

      if (!relayRoomResponse.ok) {
        // If relay room creation fails, we should clean up the game session
        // For now, just log the error
        console.error(`Failed to create relay room: ${relayRoomResponse.statusText}`);
        throw new Error(`Failed to create relay room: ${relayRoomResponse.statusText}`);
      }

      const relayRoom = await relayRoomResponse.json();
      console.log(`Relay room created: ${relayRoom.roomId}`);

      // Return match info with both room details
      return res.json({
        status: 'matched',
        match: {
          matchId,
          users,
          rosterConfig,
          relayRoom: {
            roomId: relayRoom.roomId,
            users: relayRoom.users,
            wsUrl: `${RELAY_SERVER_URL}/api/v1/room/${relayRoom.roomId}`
          },
          gameSession: {
            sessionId: gameSession.sessionId,
            signalingUrl: gameSession.signalingUrl
          },
          createdAt: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error creating match:', error);

      // Put users back in queue
      matchmakingQueue.unshift(user2, user1);

      return res.status(500).json({
        error: 'Failed to create match',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // User is waiting
  res.json({
    status: 'waiting',
    position: matchmakingQueue.length,
    queuedAt: queuedUser.timestamp
  });
});

// Leave matchmaking queue
app.post('/leave', (req: Request, res: Response) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  const index = matchmakingQueue.findIndex(u => u.userId === userId);
  if (index === -1) {
    return res.status(404).json({ error: 'User not in queue' });
  }

  matchmakingQueue.splice(index, 1);
  console.log(`User ${userId} left queue. Queue length: ${matchmakingQueue.length}`);

  res.json({ status: 'left' });
});

app.listen(PORT, () => {
  console.log(`Matchmaking server running on port ${PORT}`);
  console.log(`Relay server URL: ${RELAY_SERVER_URL}`);
});

