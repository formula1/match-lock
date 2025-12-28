import { getMatchingAssetsForFile } from "../engine/usage/getMatchingAsset";
import { RosterLockV1Config } from "../types";

type PieceDefinition = RosterLockV1Config["engine"]["pieceDefinitions"][string];

type MatchLockEngineAssetDefinition = PieceDefinition["assets"][number];

export { getMatchingAssetsForFile };

export async function getAssetsOfFiles(
  files: Iterable<string> | AsyncIterable<string>,
  pathVariables: Record<string, string>,
  pieceDefinition: PieceDefinition,
): Promise<{
  assetsWithFiles: Map<string, { asset: MatchLockEngineAssetDefinition, files: Array<string> }>
  filesWithAssets: Map<string, { assets: Array<MatchLockEngineAssetDefinition> }>
}>{
  const assetCounts = new Map<string, { files: Array<string>, asset: MatchLockEngineAssetDefinition }>();
  const fileCounts = new Map<string, { assets: Array<MatchLockEngineAssetDefinition> }>();
  for await (const filePath of files){
    const assetMatching = getMatchingAssetsForFile(pieceDefinition, pathVariables, filePath);
    const asset = assetMatching[0];
    if(!asset){
      // Error: File doesn't match any assets
      fileCounts.set(filePath, { assets: [] });
      continue;
    }
    if(assetMatching.length > 1){
      // Warning: File matches multiple assets
    }
    const currentCount = ((): { files: Array<string>, asset: MatchLockEngineAssetDefinition } =>{
      const currentCount = assetCounts.get(asset.name);
      if(currentCount) return currentCount;
      const newCount = { files: [], asset: asset };
      assetCounts.set(asset.name, newCount);
      return newCount;
    })();

    currentCount.files.push(filePath);
    fileCounts.set(filePath, { assets: assetMatching });
  }

  for(const asset of pieceDefinition.assets){
    const currentCountInfo = assetCounts.get(asset.name);
    if(!currentCountInfo){
      // Error: Asset has no files
      assetCounts.set(asset.name, { files: [], asset });
    }
  }

  return { filesWithAssets: fileCounts, assetsWithFiles: assetCounts };
}

export function collectAssetFileErrors(
  { assetsWithFiles, filesWithAssets }: Awaited<ReturnType<typeof getAssetsOfFiles>>
){
  const errors: Array<{ type: "asset" | "file", id: string, message: string }> = [];
  for(const [assetName, { asset, files }] of assetsWithFiles){
    try {
      if(files.length === 0 && !isValidAssetFileCount(asset.count, 0)){
        errors.push({
          type: "asset",
          id: assetName,
          message: `Asset is expected to have files`,
        });
        continue;
      }
      validateAssetFileCount(asset.count, files.length);
    }catch(e){
      errors.push({
        type: "asset",
        id: assetName,
        message: (e as Error).message,
      });
    }
  }
  for(const [filePath, { assets }] of filesWithAssets){
    if(assets.length === 0) errors.push({
      type: "file",
      id: filePath,
      message: "File has no matching assets",
    });
  }
  return errors;
}

export function validateAssetFileCount(
  validator: MatchLockEngineAssetDefinition["count"],
  actualCount: number
){
  if(!Array.isArray(validator)){
    if(validator === "*") return;
    if(actualCount !== validator){
      throw new Error(`Expected ${validator} files, got ${actualCount}`);
    }
    return;
  }
  const [min, max] = validator;
  if(actualCount < min){
    throw new Error(`Expected at least ${min} files, got ${actualCount}`);
  }
  if(max === "*") return;
  if(actualCount > max){
    throw new Error(`Expected at most ${max} files, got ${actualCount}`);
  }
}

export function isValidAssetFileCount(
  validator: MatchLockEngineAssetDefinition["count"],
  actualCount: number
){
  try {
    validateAssetFileCount(validator, actualCount);
    return true;
  }catch(e){
    return false;
  }
}
