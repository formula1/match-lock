
import { MatchLockRestrictionConfig, MatchLockGamePiece } from "../../types";

type ExpectedCount = MatchLockRestrictionConfig["engine"]["pieceDefinitions"][string]["assets"][string]["count"];

type ErrorInfo = {
  pieceId: string,
  assetType: string,
}

export function validateAssetCount(expectedCount: ExpectedCount, assetCount: number, errorInfo: ErrorInfo){
  if(!Array.isArray(expectedCount)){
    if(expectedCount === 0){
      throw new Error(`Piece ${errorInfo.pieceId} has no assets for ${errorInfo.assetType} but the piece definition expects at least one`);
    }
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
