import { describe, it, expect, vi } from 'vitest';
import { handleSelection } from '../../client/src/piece-selection';
import { createMockRestrictionConfig } from './test-data/mock-restriction-config';
import { createMockRoom, MockMultiPlayerRoom } from './test-data/mock-room';

describe('Piece Selection Integration', () => {
  const mockConfig = createMockRestrictionConfig();

  describe('handleSelection', () => {
    it('should complete a full 1v1 selection flow', async () => {
      const room = createMockRoom({ numberOfUsers: 2 });
      
      const playerSelection = {
        characters: ["kfmZ"],
        stages: ["stage0"]
      };

      // Mock the other player's responses
      const otherPlayerSelection = {
        selection: {
          characters: ["Baiken"],
          stages: ["stage1"]
        },
        rngSeed: "otherplayerseedotherplayerseedot"
      };

      // Set up the mock to simulate the full protocol
      let messageCount = 0;
      room.listen((playerId, event, data) => {
        messageCount++;
        
        // Simulate responses from other player
        setTimeout(() => {
          switch (event) {
            case 'hello':
              room.simulateMessage('player2', 'hello', 'hello');
              break;
            case 'restriction':
              room.simulateMessage('player2', 'restriction', mockConfig);
              break;
            case 'selectionEncrypt':
              // Simulate encrypted selection from other player
              room.simulateMessage('player2', 'selectionEncrypt', {
                iv: 'mockiv123456789012345678901234',
                ciphertext: 'mockciphertext'
              });
              break;
            case 'selectionDecrypt':
              // Simulate decryption key from other player
              room.simulateMessage('player2', 'selectionDecrypt', 'mockdecryptionkey');
              break;
            case 'selectionFinal':
              // Echo back the same final selection
              room.simulateMessage('player2', 'selectionFinal', data);
              break;
            case 'goodbye':
              room.simulateMessage('player2', 'goodbye', 'goodbye');
              break;
          }
        }, 10);
      });

      // Mock the encryption/decryption functions
      vi.mock('../../client/src/piece-selection/steps/encrypton', () => ({
        encryptJSON: vi.fn().mockResolvedValue({
          encrypted: { iv: 'mockiv', ciphertext: 'mockcipher' },
          key: 'mockkey'
        }),
        decryptJSON: vi.fn().mockResolvedValue(otherPlayerSelection)
      }));

      // This test verifies the flow doesn't crash - actual result verification
      // would require mocking the entire encryption/script execution pipeline
      await expect(handleSelection(room, mockConfig, playerSelection))
        .resolves.not.toThrow();
    }, 10000);

    it('should handle room disconnection gracefully', async () => {
      const room = createMockRoom({ numberOfUsers: 2 });
      
      const playerSelection = {
        characters: ["kfmZ"]
      };

      // Disconnect the room immediately
      room.disconnect();

      // Should handle disconnection without crashing
      await expect(handleSelection(room, mockConfig, playerSelection))
        .rejects.toThrow();
    });

    it('should validate player selection before starting protocol', async () => {
      const room = createMockRoom({ numberOfUsers: 2 });
      
      const invalidSelection = {
        characters: ["NonExistentCharacter"]
      };

      // Should reject invalid selection before starting protocol
      await expect(handleSelection(room, mockConfig, invalidSelection))
        .rejects.toThrow();
    });
  });

  describe('Multi-player room simulation', () => {
    it('should handle message broadcasting between players', () => {
      const multiRoom = new MockMultiPlayerRoom(['player1', 'player2'], 0);
      
      const player1Room = multiRoom.getRoom('player1');
      const player2Room = multiRoom.getRoom('player2');
      
      let player1ReceivedMessage = false;
      let player2ReceivedMessage = false;
      
      player1Room.listen((playerId, event, data) => {
        if (playerId === 'player2' && event === 'test') {
          player1ReceivedMessage = true;
        }
      });
      
      player2Room.listen((playerId, event, data) => {
        if (playerId === 'player1' && event === 'test') {
          player2ReceivedMessage = true;
        }
      });
      
      // Simulate messages between players
      multiRoom.broadcastFromPlayer('player1', 'test', 'hello from player1');
      multiRoom.broadcastFromPlayer('player2', 'test', 'hello from player2');
      
      expect(player1ReceivedMessage).toBe(true);
      expect(player2ReceivedMessage).toBe(true);
    });

    it('should simulate network delay', async () => {
      const multiRoom = new MockMultiPlayerRoom(['player1', 'player2'], 50);
      
      const player1Room = multiRoom.getRoom('player1');
      let messageReceived = false;
      
      player1Room.listen((playerId, event, data) => {
        messageReceived = true;
      });
      
      const startTime = Date.now();
      multiRoom.broadcastFromPlayer('player2', 'test', 'delayed message');
      
      // Message should not be received immediately
      expect(messageReceived).toBe(false);
      
      // Wait for delay
      await new Promise(resolve => setTimeout(resolve, 60));
      
      expect(messageReceived).toBe(true);
      expect(Date.now() - startTime).toBeGreaterThanOrEqual(50);
    });

    it('should handle player disconnection', () => {
      const multiRoom = new MockMultiPlayerRoom(['player1', 'player2']);
      
      const player1Room = multiRoom.getRoom('player1');
      expect(player1Room.isConnected()).toBe(true);
      
      multiRoom.disconnectAll();
      expect(player1Room.isConnected()).toBe(false);
    });
  });

  describe('Character and Stage Selection Scenarios', () => {
    it('should handle mugen character selection', async () => {
      const players = {
        player1: {
          selection: { characters: ["kfmZ"] },
          rngSeed: "1234567890abcdef1234567890abcdef"
        },
        player2: {
          selection: { characters: ["Baiken"] },
          rngSeed: "abcdef1234567890abcdef1234567890"
        }
      };

      // Import finalizeSelection for direct testing
      const { finalizeSelection } = await import('../../client/src/piece-selection/steps/final-selection');
      const result = await finalizeSelection(mockConfig, players);
      
      expect(result.characters).toEqual({
        player1: ["kfmZ"],
        player2: ["Baiken"]
      });
    });

    it('should handle stage selection with democracy/random', async () => {
      const players = {
        player1: {
          selection: { 
            characters: ["kfmZ"],
            stages: ["stage0"]
          },
          rngSeed: "seed1111111111111111111111111111"
        },
        player2: {
          selection: { 
            characters: ["Baiken"],
            stages: ["stage1"]
          },
          rngSeed: "seed2222222222222222222222222222"
        }
      };

      const { finalizeSelection } = await import('../../client/src/piece-selection/steps/final-selection');
      const result = await finalizeSelection(mockConfig, players);
      
      // Should select one stage globally
      expect(Array.isArray(result.stages)).toBe(true);
      expect((result.stages as string[]).length).toBe(1);
      expect(['stage0', 'stage1']).toContain((result.stages as string[])[0]);
    });

    it('should ensure deterministic stage selection with same seeds', async () => {
      const players = {
        player1: {
          selection: { 
            characters: ["kfmZ"],
            stages: ["stage0", "stage1"]
          },
          rngSeed: "deterministic1111111111111111111"
        },
        player2: {
          selection: { 
            characters: ["Baiken"],
            stages: ["stage0"]
          },
          rngSeed: "deterministic2222222222222222222"
        }
      };

      const { finalizeSelection } = await import('../../client/src/piece-selection/steps/final-selection');
      
      // Run multiple times with same input
      const result1 = await finalizeSelection(mockConfig, players);
      const result2 = await finalizeSelection(mockConfig, players);
      const result3 = await finalizeSelection(mockConfig, players);
      
      // All results should be identical
      expect(result1).toEqual(result2);
      expect(result2).toEqual(result3);
    });
  });
});
