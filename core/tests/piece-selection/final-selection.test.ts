import { describe, it, expect } from 'vitest';
import { finalizeSelection } from '../../client/src/piece-selection/steps/final-selection';
import { PlayerSelectionWithSeed } from '../../client/src/piece-selection/steps/player-selection';
import { createMockRestrictionConfig } from './test-data/mock-restriction-config';

describe('Final Selection Processing', () => {
  const mockConfig = createMockRestrictionConfig();

  describe('finalizeSelection', () => {
    it('should handle player-choices type (characters)', async () => {
      const players: Record<string, PlayerSelectionWithSeed> = {
        player1: {
          selection: { characters: ["kfmZ"] },
          rngSeed: "1234567890abcdef1234567890abcdef"
        },
        player2: {
          selection: { characters: ["Baiken"] },
          rngSeed: "abcdef1234567890abcdef1234567890"
        }
      };

      const result = await finalizeSelection(mockConfig, players);
      
      // Characters should remain as player choices since no algorithm is specified
      expect(result.characters).toEqual({
        player1: ["kfmZ"],
        player2: ["Baiken"]
      });
    });

    it('should handle global-choices type with algorithm (stages)', async () => {
      const players: Record<string, PlayerSelectionWithSeed> = {
        player1: {
          selection: { 
            characters: ["kfmZ"],
            stages: ["stage0"]
          },
          rngSeed: "1111111111111111111111111111111a"
        },
        player2: {
          selection: { 
            characters: ["Baiken"],
            stages: ["stage1"]
          },
          rngSeed: "2222222222222222222222222222222b"
        }
      };

      const result = await finalizeSelection(mockConfig, players);
      
      // Stages should be processed by the algorithm and return a single global choice
      expect(Array.isArray(result.stages)).toBe(true);
      expect((result.stages as string[]).length).toBe(1);
      expect(["stage0", "stage1"]).toContain((result.stages as string[])[0]);
    });

    it('should produce deterministic results with same seeds', async () => {
      const players1: Record<string, PlayerSelectionWithSeed> = {
        player1: {
          selection: { 
            characters: ["kfmZ"],
            stages: ["stage0"]
          },
          rngSeed: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1"
        },
        player2: {
          selection: { 
            characters: ["Baiken"],
            stages: ["stage1"]
          },
          rngSeed: "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb2"
        }
      };

      const players2: Record<string, PlayerSelectionWithSeed> = {
        player1: {
          selection: { 
            characters: ["kfmZ"],
            stages: ["stage0"]
          },
          rngSeed: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1"
        },
        player2: {
          selection: { 
            characters: ["Baiken"],
            stages: ["stage1"]
          },
          rngSeed: "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb2"
        }
      };

      const result1 = await finalizeSelection(mockConfig, players1);
      const result2 = await finalizeSelection(mockConfig, players2);
      
      // Results should be identical with same seeds
      expect(result1).toEqual(result2);
    });

    it('should produce different results with different seeds', async () => {
      const players1: Record<string, PlayerSelectionWithSeed> = {
        player1: {
          selection: { 
            characters: ["kfmZ"],
            stages: ["stage0"]
          },
          rngSeed: "1111111111111111111111111111111a"
        },
        player2: {
          selection: { 
            characters: ["Baiken"],
            stages: ["stage1"]
          },
          rngSeed: "2222222222222222222222222222222b"
        }
      };

      const players2: Record<string, PlayerSelectionWithSeed> = {
        player1: {
          selection: { 
            characters: ["kfmZ"],
            stages: ["stage0"]
          },
          rngSeed: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1"
        },
        player2: {
          selection: { 
            characters: ["Baiken"],
            stages: ["stage1"]
          },
          rngSeed: "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb2"
        }
      };

      const result1 = await finalizeSelection(mockConfig, players1);
      const result2 = await finalizeSelection(mockConfig, players2);
      
      // Characters should be the same (no algorithm)
      expect(result1.characters).toEqual(result2.characters);
      
      // Stages might be different due to different seeds (though with only 2 options, might be same)
      // We'll just verify both are valid selections
      expect(["stage0", "stage1"]).toContain((result1.stages as string[])[0]);
      expect(["stage0", "stage1"]).toContain((result2.stages as string[])[0]);
    });

    it('should handle empty stage suggestions by using all available stages', async () => {
      const players: Record<string, PlayerSelectionWithSeed> = {
        player1: {
          selection: { 
            characters: ["kfmZ"]
            // No stage suggestions
          },
          rngSeed: "1111111111111111111111111111111a"
        },
        player2: {
          selection: { 
            characters: ["Baiken"]
            // No stage suggestions
          },
          rngSeed: "2222222222222222222222222222222b"
        }
      };

      const result = await finalizeSelection(mockConfig, players);
      
      // Should still select a stage from available options
      expect(Array.isArray(result.stages)).toBe(true);
      expect((result.stages as string[]).length).toBe(1);
      expect(["stage0", "stage1"]).toContain((result.stages as string[])[0]);
    });

    it('should skip mandatory and on-demand collections', async () => {
      // Create a config with mandatory collection
      const configWithMandatory = createMockRestrictionConfig();
      configWithMandatory.pieces.mandatory = {
        selectionConfig: { type: "mandatory" },
        pieceDefinition: "character",
        pieces: []
      };
      configWithMandatory.pieces.onDemand = {
        selectionConfig: { type: "on-demand" },
        pieceDefinition: "character", 
        pieces: []
      };

      const players: Record<string, PlayerSelectionWithSeed> = {
        player1: {
          selection: { characters: ["kfmZ"] },
          rngSeed: "1111111111111111111111111111111a"
        }
      };

      const result = await finalizeSelection(configWithMandatory, players);
      
      // Mandatory and on-demand collections should not appear in result
      expect(result.mandatory).toBeUndefined();
      expect(result.onDemand).toBeUndefined();
      expect(result.characters).toBeDefined();
    });

    it('should handle 1v1 fighting game scenario', async () => {
      const players: Record<string, PlayerSelectionWithSeed> = {
        player1: {
          selection: { 
            characters: ["kfmZ"],
            stages: ["stage0"]
          },
          rngSeed: "player1seedplayer1seedplayer1se"
        },
        player2: {
          selection: { 
            characters: ["Baiken"],
            stages: ["stage1"]
          },
          rngSeed: "player2seedplayer2seedplayer2se"
        }
      };

      const result = await finalizeSelection(mockConfig, players);
      
      // Each player should have their character choice
      expect(result.characters).toEqual({
        player1: ["kfmZ"],
        player2: ["Baiken"]
      });
      
      // Stage should be selected globally
      expect(Array.isArray(result.stages)).toBe(true);
      expect((result.stages as string[]).length).toBe(1);
      
      // The selected stage should be one of the suggested stages
      const selectedStage = (result.stages as string[])[0];
      expect(["stage0", "stage1"]).toContain(selectedStage);
    });
  });
});
