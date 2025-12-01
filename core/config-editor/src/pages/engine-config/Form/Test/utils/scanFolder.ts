import type { MatchLockEngineConfig } from "@match-lock/shared";
import { FS } from "../../../../../globals/fs";
import { type FileTestResult } from "./types";

import { getMatchingAssetsForFile } from "@match-lock/shared";

import { updateStatistics, type TestStatistics } from "./statistics";
import { updateViolations, updateEmptyViolations, type CountViolation } from "./validateAssetCounts";

export async function scanFolder(
  folderPath: string,
  pieceName: string,
  engineConfig: MatchLockEngineConfig,
  setResults: (updater: (prev: FileTestResult[]) => FileTestResult[]) => void,
  setStatistics: (updater: (prev: TestStatistics) => TestStatistics) => void,
  setCountViolations: (updater: (prev: Record<string, CountViolation>) => Record<string, CountViolation>) => void,
) {
  const pieceDefinition = engineConfig.pieceDefinitions[pieceName];
  if (!pieceDefinition) {
    throw new Error(`Piece definition not found: ${pieceName}`);
  }

  await FS.startWalkStream(folderPath, {
    onData: (walkResult) => {
      // Only process files, skip directories
      if (!walkResult.isFile) return;

      const matchedAssets = getMatchingAssetsForFile(
        pieceDefinition,
        walkResult.relativePath,
      );

      const testResult: FileTestResult = {
        filePath: walkResult.path,
        relativePath: walkResult.relativePath,
        matchedAssets,
        fileSize: walkResult.size,
      };

      // Update results and statistics in real-time
      setResults(prev => [...prev, testResult]);
      setStatistics(prev => updateStatistics(prev, testResult));
      setCountViolations(prev => updateViolations(prev, testResult));
    },

    onError: (error) => {
      console.error('Stream error:', error);
    },

    onEnd: () => {
      // After all files are processed, calculate count violations
      setCountViolations(prev => updateEmptyViolations(prev, pieceDefinition));
    }
  });
}
