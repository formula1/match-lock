import { describe, it, expect, vi } from 'vitest';
import { createMockRoom, MockMultiPlayerRoom } from '../piece-selection/test-data/mock-room';

describe('Network Delay Simulation', () => {
  describe('Basic Delay Tests', () => {
    it('should simulate network delay in message broadcasting', async () => {
      const delay = 100; // 100ms delay
      const room = createMockRoom({ numberOfUsers: 2, simulateNetworkDelay: delay });
      
      const startTime = Date.now();
      
      // Broadcasting should be delayed
      await room.broadcast('test', { message: 'hello' });
      
      const endTime = Date.now();
      const actualDelay = endTime - startTime;
      
      expect(actualDelay).toBeGreaterThanOrEqual(delay - 10); // Allow 10ms tolerance
      expect(actualDelay).toBeLessThan(delay + 50); // Allow 50ms tolerance for test environment
    });

    it('should handle zero delay (immediate)', async () => {
      const room = createMockRoom({ numberOfUsers: 2, simulateNetworkDelay: 0 });
      
      const startTime = Date.now();
      await room.broadcast('test', { message: 'hello' });
      const endTime = Date.now();
      
      const actualDelay = endTime - startTime;
      expect(actualDelay).toBeLessThan(10); // Should be nearly immediate
    });

    it('should accumulate delays for multiple messages', async () => {
      const delay = 50;
      const room = createMockRoom({ numberOfUsers: 2, simulateNetworkDelay: delay });
      
      const startTime = Date.now();
      
      // Send multiple messages
      await Promise.all([
        room.broadcast('msg1', { id: 1 }),
        room.broadcast('msg2', { id: 2 }),
        room.broadcast('msg3', { id: 3 })
      ]);
      
      const endTime = Date.now();
      const totalDelay = endTime - startTime;
      
      // Each message should have its own delay, but they run in parallel
      expect(totalDelay).toBeGreaterThanOrEqual(delay - 10);
      expect(totalDelay).toBeLessThan(delay * 2); // Should not be 3x delay due to parallelism
    });
  });

  describe('Multi-Player Delay Tests', () => {
    it('should simulate delay between multiple players', async () => {
      const delay = 75;
      const multiRoom = new MockMultiPlayerRoom(['player1', 'player2', 'player3'], delay);
      
      const player1Room = multiRoom.getRoom('player1');
      const messagesReceived: Array<{ playerId: string; timestamp: number }> = [];
      
      player1Room.listen((playerId, event, data) => {
        messagesReceived.push({
          playerId,
          timestamp: Date.now()
        });
      });
      
      const startTime = Date.now();
      
      // Simulate messages from other players
      multiRoom.broadcastFromPlayer('player2', 'test', { from: 'player2' });
      multiRoom.broadcastFromPlayer('player3', 'test', { from: 'player3' });
      
      // Wait for messages to arrive
      await new Promise(resolve => setTimeout(resolve, delay + 50));
      
      expect(messagesReceived).toHaveLength(2);
      
      // Check that messages arrived after the delay
      for (const msg of messagesReceived) {
        expect(msg.timestamp - startTime).toBeGreaterThanOrEqual(delay - 10);
      }
    });

    it('should handle different delay patterns', async () => {
      const baseDelay = 100;
      
      // Create rooms with different delays
      const fastRoom = new MockMultiPlayerRoom(['fast1', 'fast2'], baseDelay / 2);
      const slowRoom = new MockMultiPlayerRoom(['slow1', 'slow2'], baseDelay * 2);
      
      const fastPlayer = fastRoom.getRoom('fast1');
      const slowPlayer = slowRoom.getRoom('slow1');
      
      let fastMessageTime = 0;
      let slowMessageTime = 0;
      
      fastPlayer.listen(() => {
        fastMessageTime = Date.now();
      });
      
      slowPlayer.listen(() => {
        slowMessageTime = Date.now();
      });
      
      const startTime = Date.now();
      
      // Send messages simultaneously
      fastRoom.broadcastFromPlayer('fast2', 'test', 'fast message');
      slowRoom.broadcastFromPlayer('slow2', 'test', 'slow message');
      
      // Wait for both messages
      await new Promise(resolve => setTimeout(resolve, baseDelay * 2 + 50));
      
      expect(fastMessageTime).toBeGreaterThan(0);
      expect(slowMessageTime).toBeGreaterThan(0);
      
      // Fast message should arrive before slow message
      expect(fastMessageTime - startTime).toBeLessThan(slowMessageTime - startTime);
    });
  });

  describe('Delay Impact on Selection Protocol', () => {
    it('should measure protocol completion time with delay', async () => {
      const delay = 50;
      const room = createMockRoom({ numberOfUsers: 2, simulateNetworkDelay: delay });
      
      const protocolSteps = ['hello', 'restriction', 'selection', 'final'];
      const stepTimes: Record<string, number> = {};
      
      room.listen((playerId, event, data) => {
        stepTimes[event] = Date.now();
        
        // Simulate responses with delay
        setTimeout(() => {
          room.simulateMessage('other-player', event, data);
        }, delay);
      });
      
      const startTime = Date.now();
      
      // Simulate protocol steps
      for (const step of protocolSteps) {
        await room.broadcast(step, { step });
        // Wait for response
        await new Promise(resolve => setTimeout(resolve, delay * 2 + 20));
      }
      
      const totalTime = Date.now() - startTime;
      
      // Total time should account for delays in both directions
      const expectedMinTime = protocolSteps.length * delay * 2;
      expect(totalTime).toBeGreaterThanOrEqual(expectedMinTime - 50);
    });

    it('should handle timeout scenarios', async () => {
      const longDelay = 1000; // 1 second delay
      const room = createMockRoom({ numberOfUsers: 2, simulateNetworkDelay: longDelay });
      
      const timeout = 500; // 500ms timeout
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), timeout);
      });
      
      const broadcastPromise = room.broadcast('test', { message: 'delayed' });
      
      // Should timeout before the delayed broadcast completes
      await expect(Promise.race([broadcastPromise, timeoutPromise]))
        .rejects.toThrow('Timeout');
    });

    it('should measure jitter in network delays', async () => {
      const baseDelay = 100;
      const room = createMockRoom({ numberOfUsers: 2, simulateNetworkDelay: baseDelay });
      
      const delays: number[] = [];
      const numTests = 10;
      
      for (let i = 0; i < numTests; i++) {
        const startTime = Date.now();
        await room.broadcast('test', { iteration: i });
        const endTime = Date.now();
        delays.push(endTime - startTime);
      }
      
      // Calculate statistics
      const avgDelay = delays.reduce((sum, d) => sum + d, 0) / delays.length;
      const maxDelay = Math.max(...delays);
      const minDelay = Math.min(...delays);
      const jitter = maxDelay - minDelay;
      
      expect(avgDelay).toBeGreaterThanOrEqual(baseDelay - 20);
      expect(avgDelay).toBeLessThan(baseDelay + 50);
      
      // Jitter should be reasonable (less than 50% of base delay)
      expect(jitter).toBeLessThan(baseDelay * 0.5);
      
      console.log(`Delay stats: avg=${avgDelay.toFixed(1)}ms, min=${minDelay}ms, max=${maxDelay}ms, jitter=${jitter}ms`);
    });
  });

  describe('Real-world Delay Scenarios', () => {
    it('should simulate LAN conditions (low delay)', async () => {
      const lanDelay = 5; // 5ms typical LAN delay
      const room = createMockRoom({ numberOfUsers: 4, simulateNetworkDelay: lanDelay });
      
      const startTime = Date.now();
      await room.broadcast('lan-test', { network: 'LAN' });
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(20); // Should be very fast
    });

    it('should simulate WAN conditions (moderate delay)', async () => {
      const wanDelay = 50; // 50ms typical WAN delay
      const room = createMockRoom({ numberOfUsers: 2, simulateNetworkDelay: wanDelay });
      
      const startTime = Date.now();
      await room.broadcast('wan-test', { network: 'WAN' });
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeGreaterThanOrEqual(wanDelay - 10);
      expect(endTime - startTime).toBeLessThan(wanDelay + 30);
    });

    it('should simulate high-latency conditions', async () => {
      const highDelay = 200; // 200ms high latency
      const room = createMockRoom({ numberOfUsers: 2, simulateNetworkDelay: highDelay });
      
      const startTime = Date.now();
      await room.broadcast('high-latency-test', { network: 'High Latency' });
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeGreaterThanOrEqual(highDelay - 20);
      expect(endTime - startTime).toBeLessThan(highDelay + 50);
    });

    it('should test protocol resilience under varying delays', async () => {
      const delays = [10, 50, 100, 200]; // Varying delay conditions
      const results: Array<{ delay: number; success: boolean; time: number }> = [];
      
      for (const delay of delays) {
        const room = createMockRoom({ numberOfUsers: 2, simulateNetworkDelay: delay });
        
        try {
          const startTime = Date.now();
          
          // Simulate a simple protocol exchange
          await room.broadcast('step1', { data: 'test' });
          await room.broadcast('step2', { data: 'test' });
          await room.broadcast('step3', { data: 'test' });
          
          const totalTime = Date.now() - startTime;
          
          results.push({
            delay,
            success: true,
            time: totalTime
          });
        } catch (error) {
          results.push({
            delay,
            success: false,
            time: 0
          });
        }
      }
      
      // All tests should succeed
      expect(results.every(r => r.success)).toBe(true);
      
      // Time should increase with delay
      for (let i = 1; i < results.length; i++) {
        expect(results[i].time).toBeGreaterThan(results[i-1].time);
      }
      
      console.log('Protocol performance under varying delays:', results);
    });
  });
});
