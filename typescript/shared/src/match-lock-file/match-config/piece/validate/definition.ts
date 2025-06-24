import { parseFilePath } from "../../../util-types";
import { MatchLockEngineConfig } from "../../engine";
import { MatchLockScanPiece } from "../types";

import { getPieceId } from "../utils";

export function validatePieceMatchesEngineDefinition(
  engine: MatchLockEngineConfig, piece: MatchLockScanPiece
){
  const pieceId = getPieceId(piece);
  const pieceConfig = engine.pieceDefinitions[piece.pieceDefinition];
  if(!pieceConfig){
    throw new Error(`Piece ${pieceId} is of type ${piece.pieceDefinition} which is not in the engine config`);
  }
  const counts = new Map<string, number>();
  for(const [filePath, assetInfo] of Object.entries(piece.assets)){
    const assetType = validateAssetType(pieceConfig, pieceId, filePath, assetInfo);
    counts.set(assetType, (counts.get(assetType) ?? 0) + 1);
  }
  for(const [assetType, assetConfig] of Object.entries(pieceConfig.assets)){
    const assetCount = counts.get(assetType) ?? 0;
    validateAssetCount(assetConfig, assetCount, { pieceId: pieceId, assetType });
  }
}



function validateAssetType(
  pieceConfig: MatchLockEngineConfig["pieceDefinitions"][string],
  pieceId: string,
  filePath: string,
  assetInfo: MatchLockScanPiece["assets"][string]
){
  const file = parseFilePath(filePath);
  const assetType = file.extension.toLowerCase();
  if(!(assetType in pieceConfig.assets)){
    throw new Error(`Piece ${pieceId} references asset ${assetType} which is not in the piece definition`);
  }
  const assetTypeFromDef = assetInfo.assetType;
  if(assetTypeFromDef !== assetType){
    throw new Error(`Piece ${pieceId} references asset at ${filePath} which is of type ${assetTypeFromDef} but the piece is of type ${assetType}`);
  }
  return assetType;
}


type ErrorInfo = {
  pieceId: string,
  assetType: string,
}

type AssetConfig = MatchLockEngineConfig["pieceDefinitions"][string]["assets"][0];

function validateAssetCount(
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
