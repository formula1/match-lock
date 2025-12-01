import { describe, it, expect } from 'vitest';
import { validateEngineConfig } from '@match-lock/shared/src/match-lock-file/match-config/engine/validate';
import { MatchLockEngineConfig } from '@match-lock/shared/src/match-lock-file/match-config/engine/types';

describe('Engine Config Validation', () => {
  const createValidEngineConfig = (): MatchLockEngineConfig => ({
    name: "Test Engine",
    version: "1.0.0",
    pieceDefinitions: {
      "character": {
        assets: [
          {
            name: "sprites",
            glob: ["*.png", "*.jpg"],
            classification: "media",
            count: 1
          }
        ]
      }
    }
  });

  describe('validateEngineConfig', () => {
    it('should validate a correct engine config', () => {
      const config = createValidEngineConfig();
      expect(() => validateEngineConfig(config)).not.toThrow();
    });

    it('should reject duplicate asset names', () => {
      const config = createValidEngineConfig();
      config.pieceDefinitions.character.assets.push({
        name: "sprites", // Duplicate name
        glob: ["*.webp"],
        classification: "media",
        count: 1
      });

      expect(() => validateEngineConfig(config))
        .toThrow("Piece character has duplicate asset name sprites");
    });

    it('should reject empty glob arrays', () => {
      const config = createValidEngineConfig();
      config.pieceDefinitions.character.assets[0].glob = [];

      expect(() => validateEngineConfig(config))
        .toThrow("Piece character asset sprites has no globs");
    });
  });

  describe('glob and file path validation', () => {
    it('should accept valid glob patterns', () => {
      const config = createValidEngineConfig();
      config.pieceDefinitions.character.assets[0].glob = [
        "*.png",
        "**/*.jpg",
        "sprites/*.{png,jpg,webp}",
        "assets/**/textures/*.png"
      ];

      expect(() => validateEngineConfig(config)).not.toThrow();
    });

    it('should accept specific file paths', () => {
      const config = createValidEngineConfig();
      config.pieceDefinitions.character.assets[0].glob = [
        "sounds/config.json",
        "data/character.xml",
        "assets/sprites/main.png",
        "config/settings.yaml"
      ];

      expect(() => validateEngineConfig(config)).not.toThrow();
    });

    it('should accept mixed glob patterns and file paths', () => {
      const config = createValidEngineConfig();
      config.pieceDefinitions.character.assets[0].glob = [
        "*.png",                    // glob pattern
        "sounds/config.json",       // specific file
        "**/*.wav",                 // glob pattern
        "data/character.def"        // specific file
      ];

      expect(() => validateEngineConfig(config)).not.toThrow();
    });

    it('should reject invalid file paths with dangerous characters', () => {
      const config = createValidEngineConfig();
      config.pieceDefinitions.character.assets[0].glob = [
        "file<with>invalid:chars.png"
      ];

      expect(() => validateEngineConfig(config))
        .toThrow("Piece character asset sprites has invalid glob or file path");
    });

    it('should reject path traversal attempts', () => {
      const config = createValidEngineConfig();
      config.pieceDefinitions.character.assets[0].glob = [
        "../../../etc/passwd"
      ];

      expect(() => validateEngineConfig(config))
        .toThrow("Piece character asset sprites has invalid glob or file path");
    });

    it('should reject directory paths (ending with slash)', () => {
      const config = createValidEngineConfig();
      config.pieceDefinitions.character.assets[0].glob = [
        "sounds/"
      ];

      expect(() => validateEngineConfig(config))
        .toThrow("Piece character asset sprites has invalid glob or file path");
    });

    it('should reject empty strings', () => {
      const config = createValidEngineConfig();
      config.pieceDefinitions.character.assets[0].glob = [
        ""
      ];

      expect(() => validateEngineConfig(config))
        .toThrow("Piece character asset sprites has invalid glob or file path");
    });

    it('should handle complex file paths with multiple extensions', () => {
      const config = createValidEngineConfig();
      config.pieceDefinitions.character.assets[0].glob = [
        "sounds/config.sound.json",
        "data/character.config.xml",
        "assets/sprites/main.sprite.png"
      ];

      expect(() => validateEngineConfig(config)).not.toThrow();
    });

    it('should handle deep nested file paths', () => {
      const config = createValidEngineConfig();
      config.pieceDefinitions.character.assets[0].glob = [
        "assets/characters/ryu/sprites/idle/frame001.png",
        "data/configs/game/settings/audio.json"
      ];

      expect(() => validateEngineConfig(config)).not.toThrow();
    });

    it('should reject Windows reserved names', () => {
      const config = createValidEngineConfig();
      config.pieceDefinitions.character.assets[0].glob = [
        "sounds/CON.json"
      ];

      expect(() => validateEngineConfig(config))
        .toThrow("Piece character asset sprites has invalid glob or file path");
    });

    it('should accept files without extensions', () => {
      const config = createValidEngineConfig();
      config.pieceDefinitions.character.assets[0].glob = [
        "Dockerfile",
        "Makefile",
        "README",
        "sounds/config"
      ];

      expect(() => validateEngineConfig(config)).not.toThrow();
    });

    it('should reject absolute paths', () => {
      const config = createValidEngineConfig();
      config.pieceDefinitions.character.assets[0].glob = [
        "/etc/passwd"
      ];

      expect(() => validateEngineConfig(config))
        .toThrow("Piece character asset sprites has invalid glob or file path");
    });

    it('should reject Windows absolute paths', () => {
      const config = createValidEngineConfig();
      config.pieceDefinitions.character.assets[0].glob = [
        "C:\\Windows\\System32\\config.json"
      ];

      expect(() => validateEngineConfig(config))
        .toThrow("Piece character asset sprites has invalid glob or file path");
    });

    it('should accept files with spaces in names', () => {
      const config = createValidEngineConfig();
      config.pieceDefinitions.character.assets[0].glob = [
        "sounds/my config.json",
        "assets/character sprite.png"
      ];

      expect(() => validateEngineConfig(config)).not.toThrow();
    });

    it('should reject paths with spaces at start/end of components', () => {
      const config = createValidEngineConfig();
      config.pieceDefinitions.character.assets[0].glob = [
        " sounds/config.json"  // Leading space in component
      ];

      expect(() => validateEngineConfig(config))
        .toThrow("Piece character asset sprites has invalid glob or file path");
    });

    it('should accept hidden files (starting with dots)', () => {
      const config = createValidEngineConfig();
      config.pieceDefinitions.character.assets[0].glob = [
        ".gitignore",
        "config/.env"
      ];

      expect(() => validateEngineConfig(config)).not.toThrow();
    });

    it('should reject paths ending with dots', () => {
      const config = createValidEngineConfig();
      config.pieceDefinitions.character.assets[0].glob = [
        "sounds/config."
      ];

      expect(() => validateEngineConfig(config))
        .toThrow("Piece character asset sprites has invalid glob or file path");
    });
  });

  describe('count validation', () => {
    it('should accept valid single counts', () => {
      const config = createValidEngineConfig();
      config.pieceDefinitions.character.assets[0].count = 5;

      expect(() => validateEngineConfig(config)).not.toThrow();
    });

    it('should accept wildcard count', () => {
      const config = createValidEngineConfig();
      config.pieceDefinitions.character.assets[0].count = "*";

      expect(() => validateEngineConfig(config)).not.toThrow();
    });

    it('should accept valid range counts', () => {
      const config = createValidEngineConfig();
      config.pieceDefinitions.character.assets[0].count = [1, 5];

      expect(() => validateEngineConfig(config)).not.toThrow();
    });

    it('should accept range with wildcard max', () => {
      const config = createValidEngineConfig();
      config.pieceDefinitions.character.assets[0].count = [2, "*"];

      expect(() => validateEngineConfig(config)).not.toThrow();
    });

    it('should reject zero count', () => {
      const config = createValidEngineConfig();
      config.pieceDefinitions.character.assets[0].count = 0;

      expect(() => validateEngineConfig(config))
        .toThrow("Piece character asset sprites count should be greater than 0");
    });

    it('should reject negative count', () => {
      const config = createValidEngineConfig();
      config.pieceDefinitions.character.assets[0].count = -1;

      expect(() => validateEngineConfig(config))
        .toThrow("Piece character asset sprites count should be greater than 0");
    });

    it('should reject invalid range (min > max)', () => {
      const config = createValidEngineConfig();
      config.pieceDefinitions.character.assets[0].count = [5, 2];

      expect(() => validateEngineConfig(config))
        .toThrow("Piece character asset sprites has invalid range");
    });

    it('should reject negative range minimum', () => {
      const config = createValidEngineConfig();
      config.pieceDefinitions.character.assets[0].count = [-1, 5];

      expect(() => validateEngineConfig(config))
        .toThrow("Piece character asset sprites has invalid range");
    });
  });
});
