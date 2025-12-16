import { MatchLockEngineConfig } from "../../../engine";
import { MatchLockScanPiece } from "../../types";

import { getPieceId } from "../../utils";
import { validatePathVariableValues } from "./pathVariables";
import { validateAssetType } from "./assetType";
import { validateAssetCount } from "./assetCount";

export * from "./pathVariables";

export function validatePieceMatchesEngineDefinition(
  engine: MatchLockEngineConfig, piece: MatchLockScanPiece
){
  const pieceId = getPieceId(piece);
  const pieceConfig = engine.pieceDefinitions[piece.pieceDefinition];
  if(!pieceConfig){
    throw new Error(`Piece ${pieceId} is of type ${piece.pieceDefinition} which is not in the engine config`);
  }
  validatePathVariableValues(pieceConfig, piece.pathVariables);
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

