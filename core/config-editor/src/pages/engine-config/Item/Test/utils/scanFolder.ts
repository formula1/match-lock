import type { MatchLockEngineConfig } from "@match-lock/shared";
import { FS } from "../../../../../globals/fs";
import { type FileTestResult } from "./types";

import { getMatchingAssetsForFile } from "@match-lock/shared";

import { DEFAULT_TEST_STATISTICS, updateStatistics, type TestStatistics } from "./statistics";
import { updateViolations, updateEmptyViolations, type CountViolation } from "./validateAssetCounts";

import { TestFormValue } from "../Form";

import { cloneJSON } from "@match-lock/shared";

export const DEFAULT_SCAN_UPDATE: ScanUpdateType = {
  results: [],
  statistics: DEFAULT_TEST_STATISTICS,
  countViolations: {},
};

export type ScanUpdateType = {
  results: FileTestResult[];
  statistics: TestStatistics;
  countViolations: Record<string, CountViolation>;
}
export async function scanFolder(
  { folderPath, pieceName, pathVariables }: TestFormValue,
  engineConfig: MatchLockEngineConfig,
  setUpdate: (updatedValue: ScanUpdateType) => void,
){
  const pieceDefinition = engineConfig.pieceDefinitions[pieceName];
  if (!pieceDefinition) {
    throw new Error(`Piece definition not found: ${pieceName}`);
  }

  const readState = cloneJSON(DEFAULT_SCAN_UPDATE);

  await FS.startWalkStream(folderPath, {
    onData: (walkResult) => {
      // Only process files, skip directories
      if (!walkResult.is_file) return;

      const matchedAssets = getMatchingAssetsForFile(
        pieceDefinition,
        pathVariables,
        walkResult.relative_path,
      );

      const testResult: FileTestResult = {
        filePath: walkResult.path,
        relativePath: walkResult.relative_path,
        matchedAssets,
        fileSize: walkResult.size,
      };

      readState.results = [...readState.results, testResult]
      readState.statistics = updateStatistics(readState.statistics, testResult);
      readState.countViolations = updateViolations(readState.countViolations, testResult);
      setUpdate(readState);
    },

    onError: (error) => {
      console.error('Stream error:', error);
    },

    onEnd: () => {
      setUpdate({
        ...readState,
        countViolations: updateEmptyViolations(readState.countViolations, pieceDefinition),
      });
    }
  });
}
