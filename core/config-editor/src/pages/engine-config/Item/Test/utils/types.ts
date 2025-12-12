import type {
  MatchLockEngineConfig,
} from '@match-lock/shared';

export type MatchLockEnginePieceDefinition = MatchLockEngineConfig['pieceDefinitions'][string];
export type MatchLockEngineAssetDefinition = MatchLockEnginePieceDefinition['assets'][number];

export type FileTestResult = {
  filePath: string;
  relativePath: string;
  fileSize: number;
  matchedAssets: Array<MatchLockEngineAssetDefinition>;
};

