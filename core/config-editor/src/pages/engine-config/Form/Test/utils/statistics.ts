
import { type FileTestResult } from "./types";


export type TestStatistics = {
  totalFiles: number;
  logicFiles: number;
  mediaFiles: number;
  docFiles: number;
  unmatchedFiles: number;
  totalBytes: number;
  logicBytes: number;
  mediaBytes: number;
  docBytes: number;
};

export const DEFAULT_TEST_STATISTICS: TestStatistics = {
  totalFiles: 0,
  logicFiles: 0,
  mediaFiles: 0,
  docFiles: 0,
  unmatchedFiles: 0,
  totalBytes: 0,
  logicBytes: 0,
  mediaBytes: 0,
  docBytes: 0,
};

/**
 * Calculate statistics from test results
 */
export function calculateStatistics(results: FileTestResult[]): TestStatistics {
  const stats: TestStatistics = {
    totalFiles: 0,
    logicFiles: 0,
    mediaFiles: 0,
    docFiles: 0,
    unmatchedFiles: 0,
    totalBytes: 0,
    logicBytes: 0,
    mediaBytes: 0,
    docBytes: 0,
  };
  
  for (const result of results) {
    updateStatistics(stats, result);
  }
  
  return stats;
}

/**
 * Update statistics incrementally (for streaming)
 */
export function updateStatistics(
  currentStats: TestStatistics,
  newResult: FileTestResult
): TestStatistics {
  
  currentStats.totalFiles++;
  currentStats.totalBytes += newResult.fileSize;

  if(newResult.matchedAssets.length === 0) {
    currentStats.unmatchedFiles++;
    return currentStats;
  }

  const activeAsset = newResult.matchedAssets[0];
  switch(activeAsset.classification) {
    case 'logic':
      currentStats.logicFiles++;
      currentStats.logicBytes += newResult.fileSize;
      break;
    case 'media':
      currentStats.mediaFiles++;
      currentStats.mediaBytes += newResult.fileSize;
      break;
    case 'doc':
      currentStats.docFiles++;
      currentStats.docBytes += newResult.fileSize;
      break;
  }
  
  return currentStats;
}
