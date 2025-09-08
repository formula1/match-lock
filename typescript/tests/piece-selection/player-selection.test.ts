import { describe, it, expect } from 'vitest';
import { validatePlayerSelection, createRandomSeed, PlayerSelection } from '../../client/src/piece-selection/steps/player-selection';
import { createMockRestrictionConfig } from './test-data/mock-restriction-config';

describe('Player Selection Validation', () => {
  const mockConfig = createMockRestrictionConfig();

  describe('createRandomSeed', () => {
    it('should create a 32-character hex string', () => {
      const seed = createRandomSeed();
      expect(seed).toMatch(/^[0-9a-f]{32}$/);
      expect(seed.length).toBe(32);
    });

    it('should create unique seeds', () => {
      const seed1 = createRandomSeed();
      const seed2 = createRandomSeed();
      expect(seed1).not.toBe(seed2);
    });
  });

  describe('validatePlayerSelection', () => {
    it('should validate a correct character selection', async () => {
      const validSelection = {
        selection: {
          characters: ["kfmZ"]
        },
        rngSeed: createRandomSeed()
      };

      const result = await validatePlayerSelection(mockConfig, validSelection);
      expect(result).toEqual(validSelection);
    });

    it('should validate a correct stage selection', async () => {
      const validSelection = {
        selection: {
          characters: ["kfmZ"],
          stages: ["stage0", "stage1"]
        },
        rngSeed: createRandomSeed()
      };

      const result = await validatePlayerSelection(mockConfig, validSelection);
      expect(result).toEqual(validSelection);
    });

    it('should reject selection with invalid RNG seed length', async () => {
      const invalidSelection = {
        selection: {
          characters: ["kfmZ"]
        },
        rngSeed: "tooshort"
      };

      await expect(validatePlayerSelection(mockConfig, invalidSelection))
        .rejects.toThrow("Invalid RNG Seed");
    });

    it('should reject selection with wrong character count', async () => {
      const invalidSelection = {
        selection: {
          characters: ["kfmZ", "Baiken"] // Should only select 1 character
        },
        rngSeed: createRandomSeed()
      };

      await expect(validatePlayerSelection(mockConfig, invalidSelection))
        .rejects.toThrow("Invalid Piece Count in Selection characters");
    });

    it('should reject selection with no character', async () => {
      const invalidSelection = {
        selection: {
          characters: [] // Should select exactly 1 character
        },
        rngSeed: createRandomSeed()
      };

      await expect(validatePlayerSelection(mockConfig, invalidSelection))
        .rejects.toThrow("Invalid Piece Count in Selection characters");
    });

    it('should reject selection with non-existent character', async () => {
      const invalidSelection = {
        selection: {
          characters: ["NonExistentCharacter"]
        },
        rngSeed: createRandomSeed()
      };

      await expect(validatePlayerSelection(mockConfig, invalidSelection))
        .rejects.toThrow("Piece NonExistentCharacter not found in collection characters");
    });

    it('should reject selection with duplicate pieces when unique is required', async () => {
      const invalidSelection = {
        selection: {
          stages: ["stage0", "stage0"] // Duplicates not allowed
        },
        rngSeed: createRandomSeed()
      };

      await expect(validatePlayerSelection(mockConfig, invalidSelection))
        .rejects.toThrow("Duplicate Piece in Collection stages");
    });

    it('should reject selection with too many stages', async () => {
      // Create a config that only allows 1 stage max
      const restrictiveConfig = createMockRestrictionConfig();
      restrictiveConfig.pieces.stages.selectionConfig = {
        type: "global-choices",
        validation: {
          count: 1, // Only 1 stage allowed
          unique: true,
          customValidation: []
        },
        algorithm: restrictiveConfig.pieces.stages.selectionConfig.algorithm!
      };

      const invalidSelection = {
        selection: {
          characters: ["kfmZ"],
          stages: ["stage0", "stage1"] // Too many stages
        },
        rngSeed: createRandomSeed()
      };

      await expect(validatePlayerSelection(restrictiveConfig, invalidSelection))
        .rejects.toThrow("Invalid Piece Count in Selection stages");
    });

    it('should handle missing collection gracefully', async () => {
      const selectionWithMissingCollection = {
        selection: {
          characters: ["kfmZ"]
          // Missing stages collection
        },
        rngSeed: createRandomSeed()
      };

      // Should not throw for missing optional collections
      const result = await validatePlayerSelection(mockConfig, selectionWithMissingCollection);
      expect(result.selection.characters).toEqual(["kfmZ"]);
    });

    it('should validate 1v1 character selection scenario', async () => {
      // Player 1 selects kfmZ
      const player1Selection = {
        selection: {
          characters: ["kfmZ"]
        },
        rngSeed: createRandomSeed()
      };

      // Player 2 selects Baiken
      const player2Selection = {
        selection: {
          characters: ["Baiken"]
        },
        rngSeed: createRandomSeed()
      };

      const result1 = await validatePlayerSelection(mockConfig, player1Selection);
      const result2 = await validatePlayerSelection(mockConfig, player2Selection);

      expect(result1.selection.characters).toEqual(["kfmZ"]);
      expect(result2.selection.characters).toEqual(["Baiken"]);
    });

    it('should handle range-based count validation', async () => {
      // Stages allow 1-2 selections
      const validSingleStage = {
        selection: {
          characters: ["kfmZ"],
          stages: ["stage0"]
        },
        rngSeed: createRandomSeed()
      };

      const validDoubleStage = {
        selection: {
          characters: ["kfmZ"],
          stages: ["stage0", "stage1"]
        },
        rngSeed: createRandomSeed()
      };

      const result1 = await validatePlayerSelection(mockConfig, validSingleStage);
      const result2 = await validatePlayerSelection(mockConfig, validDoubleStage);

      expect(result1.selection.stages).toEqual(["stage0"]);
      expect(result2.selection.stages).toEqual(["stage0", "stage1"]);
    });
  });
});
