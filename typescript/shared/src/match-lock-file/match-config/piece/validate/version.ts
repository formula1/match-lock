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
  for(const [filepath, asset] of Object.entries(piece.assets)){
    const assetByFilename = getAssetByGlob(engine.pieceDefinitions[piece.pieceDefinition], filepath);
    const assetByName = getAssetByName(engine.pieceDefinitions[piece.pieceDefinition], assetByFilename.name);
    if(assetByFilename.name !== assetByName.name){
      throw new Error(`Asset Name Mismatch for ${pieceId}`);
    }
    if(assetByFilename.classification !== type) continue;
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

import { getMatchingAssetsForFile } from "../../engine";
function getAssetByGlob(pieceDefinition: MatchLockEngineConfig["pieceDefinitions"][string], filepath: string){
  const assets = getMatchingAssetsForFile(pieceDefinition, filepath);
  if(assets.length === 0){
    throw new Error(`No matching asset for ${filepath}`);
  }
  return assets[0];
}

function getAssetByName(pieceDefinition: MatchLockEngineConfig["pieceDefinitions"][string], name: string){
  const config = pieceDefinition.assets.find((a) => a.name === name);
  if(!config) throw new Error(`No matching asset for ${name}`);
  return config;
}
