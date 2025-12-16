import { parseFilePath } from "../../../../util-types";
import { MatchLockEngineConfig } from "../../../engine";
import { MatchLockScanPiece } from "../../types";

export function validateAssetType(
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

