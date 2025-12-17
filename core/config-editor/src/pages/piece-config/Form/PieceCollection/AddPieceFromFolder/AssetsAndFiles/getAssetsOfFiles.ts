import { FS } from "../../../../../../globals/fs";
import { PieceDefinition } from "../../types";
import { getMatchingAssetsForFile } from "@match-lock/shared"

type MatchLockEngineAssetDefinition = PieceDefinition["assets"][number];

export async function getAssetsOfFiles(
  folderPath: string,
  pathVariables: Record<string, string>,
  pieceDefinition: PieceDefinition,
): Promise<{
  assetsWithFiles: Map<string, { asset: MatchLockEngineAssetDefinition, files: Array<string> }>
  filesWithAssets: Map<string, { assets: Array<MatchLockEngineAssetDefinition> }>
}>{
  const files = await FS.walkDir(folderPath);
  const assetCounts = new Map<string, { files: Array<string>, asset: MatchLockEngineAssetDefinition }>();
  const fileCounts = new Map<string, { assets: Array<MatchLockEngineAssetDefinition> }>();
  for(const filePath of files){
    if(filePath.is_directory) continue;
    const assetMatching = getMatchingAssetsForFile(pieceDefinition, pathVariables, filePath.relative_path);
    if(assetMatching.length === 0){
      // Error: File doesn't match any assets
      fileCounts.set(filePath.relative_path, { assets: [] });
      continue;
    }
    if(assetMatching.length > 1){
      // Warning: File matches multiple assets
    }
    const currentCount = (()=>{
      const currentCount = assetCounts.get(assetMatching[0].name);
      if(currentCount) return currentCount;
      const newCount = { files: [], asset: assetMatching[0] };
      assetCounts.set(assetMatching[0].name, newCount);
      return newCount;
    })();

    currentCount.files.push(filePath.relative_path);
    fileCounts.set(filePath.relative_path, { assets: assetMatching });
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

export function collectErrors(
  { assetsWithFiles, filesWithAssets }: Awaited<ReturnType<typeof getAssetsOfFiles>>
){
  const errors: Array<{ type: "asset" | "file", id: string, message: string }> = [];
  for(const [assetName, { asset, files }] of assetsWithFiles){
    try {
      if(files.length === 0 && !isValidCount(asset.count, 0)){
        errors.push({
          type: "asset",
          id: assetName,
          message: `Asset is expected to have files`,
        });
        continue;
      }
      validateCount(asset.count, files.length);
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

export function validateCount(
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

export function isValidCount(
  validator: MatchLockEngineAssetDefinition["count"],
  actualCount: number
){
  try {
    validateCount(validator, actualCount);
    return true;
  }catch(e){
    return false;
  }
}
