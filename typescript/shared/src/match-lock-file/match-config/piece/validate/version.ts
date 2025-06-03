import { MatchLockEngineConfig, AssetClassification } from "../../engine";
import { MatchLockScanPiece } from "../types";

import { getPieceId } from "../utils";

export function validatePieceVersion(
  engine: MatchLockEngineConfig, piece: MatchLockScanPiece
){
  const pieceId = getPieceId(piece);
  const logicSha = getCombinedAssetSha(engine, piece, "logic");
  if(logicSha !== piece.version.logic){
    throw new Error(`Logic SHA Mismatch for ${pieceId}`);
  }
}

import { canonicalJSONStringify } from "../../../../utils/JSON";
import { createHash } from "node:crypto";
function getCombinedAssetSha(
  engine: MatchLockEngineConfig, piece: MatchLockScanPiece, type: AssetClassification
){
  const pieceId = getPieceId(piece);
  const assetShas: Array<string> = [];
  for(const asset of Object.values(piece.assets)){
    const config = engine.pieceDefinitions[piece.pieceDefinition].assets[asset.assetType];
    if(!config) throw new Error(`Asset Type for ${pieceId} doesn't exist in engine config`);
    if(config.classification !== type) continue;
    assetShas.push(canonicalJSONStringify(asset));
  }

  if(assetShas.length === 0) {
    return ""
  }

  // 2) Sort
  assetShas.sort();

  // 3) Concatenate
  const concatenated = Buffer.from(assetShas.join(""), "hex");

  // 4) Hash it
  return createHash("sha256").update(concatenated).digest("hex");
}
