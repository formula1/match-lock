import { Hono } from 'hono';
import { Env, RoomConfig, RoomUser } from '../types';
import { RelayMessage } from './types';
import { DurableObjectState } from '@cloudflare/workers-types';

import { validateAuthFromSearch } from "./auth";

import { handleHelloMessage } from './methods/hello';
import { handleFinishMessage } from './methods/finish';
import { handleGoodbyeMessage } from './methods/goodbye';
import { failWebhook } from './webhook';

/**
 * Metadata attached to each WebSocket via state.acceptWebSocket(ws, tags)
 * and retrievable via ws.deserializeAttachment() after hibernation
 */

import {
  MATCHLOCK_SELECTION_STATE,
  MATCHLOCK_DOWNLOAD_STATE,
  USER_EVENT,
} from './constants';

type WebSocketAttachment = {
  userId: string;
  connectedAt: string;
}

import { z, ZodType } from 'zod';
const newRoomCaster: ZodType<RoomConfig> = z.object({
  matchmakerId: z.string(),
  roomId: z.string(),
  rosterConfigHash: z.string(),
  users: z.array(z.object({
    userId: z.string(),
    publicKey: z.string(),
    displayName: z.string(),
  }).strict()),
}).strict();

const wsMessageCaster: ZodType<RelayMessage> = z.object({
  type: z.string().refine((val) => {
    return (
      val in MATCHLOCK_SELECTION_STATE ||
      val in MATCHLOCK_DOWNLOAD_STATE ||
      val in USER_EVENT
    );
  }),
  payload: z.any(),
}).strict();


export class Room {
  private state: DurableObjectState;
  private env: Env;
  private app: Hono;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;

    // Initialize Hono router for this DO
    this.app = new Hono();

    // Initialize room
    this.app.post('/', async (c) => {
      const config = await this.state.storage.get<RoomConfig>('config');
      if(config) return c.json({ error: 'Room already exists' }, 400);

      const uncastedBody = await c.req.json();
      const casted = newRoomCaster.safeParse(uncastedBody);
      if(!casted.success){
        return c.json({ error: 'Invalid body' }, 400);
      }

      const body = casted.data;

      await this.state.storage.put('config', body);

      return c.json({ status: 'created' });
    });

    // Get room info
    this.app.get('/', async (c) => {
      const isClosed = await this.state.storage.get<boolean>('isClosed');
      if(isClosed) return c.json({ error: 'Room is closed' }, 400);
      const config = await this.state.storage.get('config');
      const sockets = this.state.getWebSockets();
      const messageCount = await this.state.storage.get<number>('messageCount') || 0;
      return c.json({
        config,
        connections: sockets.length,
        messageCount
      });
    });

    // Get users
    this.app.get('/users', async (c) => {
      const isClosed = await this.state.storage.get<boolean>('isClosed');
      if(isClosed) return c.json({ error: 'Room is closed' }, 400);
      const config = await this.state.storage.get<RoomConfig>('config');
      if(!config) return c.json([], 404);
      const url = new URL(c.req.url);
      const user = await validateAuthFromSearch(url.searchParams, config, 'room-users');
      if(!user) return c.json([], 403);

      const sockets = this.state.getWebSockets();
      const attachments = sockets.map(ws => {
        const attachment = ws.deserializeAttachment() as WebSocketAttachment | null;
        return attachment;
      }).filter(Boolean);
      const userInfo: {
        userId: string;
        publicKey: string;
        displayName: string;
        connected: boolean;
        connectedAt?: string
      }[] = [];
      for(const user of config.users){
        const attachment = attachments.find(attachment => {
          if(!attachment) return false;
          return attachment.userId === user.userId;
        });
        if(!attachment){
          userInfo.push({ ...user, connected: false });
          continue;
        }
        userInfo.push({ ...user, connected: true, connectedAt: attachment.connectedAt });
      }
      return c.json(userInfo);
    });

    // WebSocket upgrade
    this.app.get('/room-ws', async (c) => {
      const isClosed = await this.state.storage.get<boolean>('isClosed');
      if(isClosed) return c.json({ error: 'Room is closed' }, 400);
      if (c.req.header('upgrade') !== 'websocket') {
        return c.json({ error: 'Expected WebSocket' }, 400);
      }

      const config = await this.state.storage.get<RoomConfig>('config');
      if(!config) return c.json({ error: 'Room not found' }, 404);

      const url = new URL(c.req.url);
      const user = await validateAuthFromSearch(url.searchParams, config, 'room-ws');
      if (!user) {
        return c.json({ error: 'Invalid token' }, 401);
      }
      await this.state.storage.transaction(async (txn) => {
        const connectedUsers = await txn.get<string[]>('connectedUsers') || [];
        if(connectedUsers.includes(user.userId)) throw new Error("Duplicate Connection");
        connectedUsers.push(user.userId);
        await txn.put('connectedUsers', connectedUsers);
      });

      // Create WebSocket pair - client goes to browser, server stays in DO
      const pair = new WebSocketPair() as { 0: WebSocket; 1: WebSocket };
      const client = pair[0];
      const server = pair[1];

      // Attach user metadata to the socket (survives hibernation)
      const attachment: WebSocketAttachment = {
        userId: user.userId,
        connectedAt: new Date().toISOString(),
      };
      (server as any).serializeAttachment(attachment);

      // Accept the WebSocket with hibernation API
      // Tags allow you to get specific sockets later via state.getWebSockets(tag)
      this.state.acceptWebSocket(server as any, [user.userId]);

      // Return the client-side socket to be forwarded to the browser
      // The webSocket property is Cloudflare Workers specific
      return new Response(null, {
        status: 101,
        webSocket: client,
      } as ResponseInit);
    });
  }

  async fetch(request: Request): Promise<Response> {
    // Handle regular HTTP requests
    if (request.headers.get('upgrade') !== 'websocket') {
      return this.app.fetch(request, this.env);
    }

    // Handle WebSocket connection from main router

    // Reconstruct URL with /ws path for our internal router
    const url = new URL(request.url);
    const wsUrl = new URL('/room-ws', url.origin);
    wsUrl.search = url.search; // Preserve query params (token)
    
    const wsRequest = new Request(wsUrl.toString(), {
      method: request.method,
      headers: request.headers,
    });
    
    return this.app.fetch(wsRequest, this.env);
  }

  /**
   * Called by Cloudflare when a WebSocket receives a message.
   * This works even after hibernation - the DO wakes up and this is called.
   */
  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
    const attachment = (ws as any).deserializeAttachment() as WebSocketAttachment | null;
    if (!attachment) return console.error('WebSocket has no attachment');
    try {
      // Get user info from the WebSocket's attached metadata

      const uncastedData = JSON.parse(message as string);
      const casted = wsMessageCaster.safeParse(uncastedData);
      if(!casted.success) throw new Error('Invalid message');
      const data = casted.data;

      const isReady = await this.state.storage.get<boolean>('isReady');
      if(!isReady){
        return await handleHelloMessage(
          {
            state: this.state,
            env: this.env,
            broadcast: (...args)=>(this.broadcast(...args)),
            completeRoom: ()=>(this.completeRoom()),
          },
          attachment.userId,
          data
        );
      }

      const isGoodbye = await this.state.storage.get<boolean>('isGoodbye');
      if(isGoodbye && data.type !== USER_EVENT.goodbye){
        throw new Error('Room should be closing');
      }
      if(data.type === USER_EVENT.goodbye){
        return await handleGoodbyeMessage(
          {
            state: this.state,
            env: this.env,
            broadcast: (...args)=>(this.broadcast(...args)),
            completeRoom: ()=>(this.completeRoom()),
          },
          attachment.userId,
          data
        );
      }

      if(data.type === USER_EVENT.finish){
        return await handleFinishMessage(
          {
            state: this.state,
            env: this.env,
            broadcast: (...args)=>(this.broadcast(...args)),
            completeRoom: ()=>(this.completeRoom()),
          },
          attachment.userId,
        );
      }

      // Increment message count (persisted in storage for hibernation)
      await this.state.storage.transaction(async (txn) => {
        const messageCount = (await txn.get<number>('messageCount') || 0) + 1;
        await txn.put('messageCount', messageCount);
      });

      this.broadcast({
        userId: attachment.userId,
        type: data.type,
        payload: data.payload,
      });

    } catch (error) {
      console.error('WebSocket message error:', error);
      await this.failRoom((error as Error).message, attachment.userId);
    }
  }

  /**
   * Called by Cloudflare when a WebSocket is closed.
   * This works even after hibernation.
   */
  async webSocketClose(ws: WebSocket, _code: number, _reason: string, _wasClean: boolean) {
    const attachment = (ws as any).deserializeAttachment() as WebSocketAttachment | null;
    if (!attachment) return;
    try {

      const isGoodbye = await this.state.storage.get<boolean>('isGoodbye');
      if(!isGoodbye) throw new Error('User Left Early');
      const leavingUsers = await this.state.storage.get<string[]>('leavingUsers') || [];
      if(!leavingUsers.includes(attachment.userId)) throw new Error("User left before goodbye");
    }catch(error){
      console.error('WebSocket close error:', error);
      await this.failRoom((error as Error).message, attachment.userId);
    }
  }

  /**
   * Called by Cloudflare when a WebSocket error occurs.
   */
  async webSocketError(ws: WebSocket, error: unknown) {
    console.error('WebSocket error:', error);
    const attachment = (ws as any).deserializeAttachment() as WebSocketAttachment | null;
    if (!attachment) return;

    console.error(`Error for user ${attachment.userId}:`, error);
    await this.failRoom((error as Error).message, attachment.userId);
  }

  /**
   * Broadcast a message to all connected WebSockets.
   * Uses state.getWebSockets() which survives hibernation.
   */
  private broadcast(message: { userId: string; type: string; payload: any }, excludeUserId?: string) {
    const json = JSON.stringify(message);
    const sockets = this.state.getWebSockets();

    for (const ws of sockets) {
      const attachment = (ws as any).deserializeAttachment() as WebSocketAttachment | null;
      if (!attachment || attachment.userId === excludeUserId) continue;

      try {
        ws.send(json);
      } catch (error) {
        console.error(`Failed to send to ${attachment.userId}:`, error);
      }
    }
  }


  private async cleanupRoom(reason: string){
    await this.state.storage.put('isClosed', true);
    await this.state.storage.put("closeReason", reason);
    const sockets = this.state.getWebSockets();
    for (const ws of sockets) {
      try {
        ws.close(1000, reason);
      } catch (error) {
        console.error(`Failed to close socket:`, error);
      }
    }
  }

  private async completeRoom() {
    await this.cleanupRoom("completed");
    const config = await this.state.storage.get<any>('config');
    if (!config) return;

    const messageCount = await this.state.storage.get<number>('messageCount') || 0;

    await this.env.DB.prepare(`
      UPDATE room_stats
      SET finished_at = ?, status = ?, message_count = ?
      WHERE room_id = ?
    `).bind(
      new Date().toISOString(),
      'completed',
      messageCount,
      config.roomId
    ).run();
  }

  private async failRoom(failReason: string, failedUser: string){
    await this.cleanupRoom("failed");
    const config = await this.state.storage.get<any>('config');
    if (!config) return;

    const messageCount = await this.state.storage.get<number>('messageCount') || 0;

    await this.env.DB.prepare(`
      UPDATE room_stats
      SET finished_at = ?, status = ?, message_count = ?,
          failed_reason = ?, failed_user = ?
      WHERE room_id = ?
    `).bind(
      new Date().toISOString(), 'failed', messageCount,
      failReason, failedUser,
      config.roomId
    ).run();
    await failWebhook(this.env, config, failReason, failedUser);
  }
}

/*
If any user disconnects, the room fails
If any user sends a bad message, the room fails

async function roomServerFlow(){
  await allUsersEnterRoom(); // Simple
  await tellAllUsersToStart(); // Simple
  await waitForAllUsersToFinish();
  await closeRoom(); //
}

async function roomClientFlow(){
  await getAllUsers();
  await connectToServer();
  await waitForStartMessage();
  await shareAndValidateSelections();
  await downloadSelections();
  await sendFinishedMessage();
  await waitForRoomToClose();
}
*/