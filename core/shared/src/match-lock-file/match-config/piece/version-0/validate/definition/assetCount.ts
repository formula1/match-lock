import { MatchLockEngineConfig } from "../../../engine";

type ErrorInfo = {
  pieceId: string,
  assetType: string,
}

type AssetConfig = MatchLockEngineConfig["pieceDefinitions"][string]["assets"][0];

export function validateAssetCount(
  assetConfig: AssetConfig, assetCount: number, errorInfo: ErrorInfo
){
  const expectedCount = assetConfig.count;
  if(!Array.isArray(expectedCount)){
    if(expectedCount === "*"){
      return;
    }
    if(assetCount !== expectedCount){
      throw new Error(`Piece ${errorInfo.pieceId} has incorrect number of assets for ${errorInfo.assetType} expected ${expectedCount} but got ${assetCount}`);
    }
    return;
  }
  const [min, max] = expectedCount;
  if(assetCount < min){
    throw new Error(`Piece ${errorInfo.pieceId} has less assets for ${errorInfo.assetType} then minimum ${min}`);
  }
  if(max === "*"){
    return;
  }
  if(assetCount > max){
    throw new Error(`Piece ${errorInfo.pieceId} has more assets for ${errorInfo.assetType} than maximum ${max}`);
  }
}
