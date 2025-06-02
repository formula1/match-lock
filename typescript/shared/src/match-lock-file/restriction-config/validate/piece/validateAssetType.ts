import { parseFilePath } from "../../../util-types";
import { MatchLockRestrictionConfig, MatchLockGamePiece } from "../../types";

type PieceConfig = MatchLockRestrictionConfig["engine"]["pieceDefinitions"][string];
type AssetInfo = MatchLockGamePiece["assets"][string];

export function validateAssetType(
  restriction: MatchLockRestrictionConfig,
  pieceConfig: PieceConfig,
  piece: MatchLockGamePiece,
  filePath: string,
  assetInfo: AssetInfo
){
  const file = parseFilePath(filePath);
  const assetType = file.extension.toLowerCase();
  if(!restriction.engine.assetDefinitions[assetType]){
    throw new Error(`Piece ${piece.id} references asset ${assetType} which is not defined in the asset definitions`);
  }
  if(!(assetType in pieceConfig.assets)){
    throw new Error(`Piece ${piece.id} references asset ${assetType} which is not in the piece definition`);
  }
  switch(assetInfo.source){
    case "internal": {
      const assetTypeFromDef = assetInfo.definition.assetType;
      if(assetTypeFromDef !== assetType){
        throw new Error(`Piece ${piece.id} references asset at ${filePath} which is of type ${assetTypeFromDef} but the piece is of type ${assetType}`);
      }
      break;
    }
    case "shared": {
      if(!(assetInfo.id in restriction.sharedAssets)){
        throw new Error(`Piece ${piece.id} references shared asset ${assetInfo.id} which does not exist`);
      }
      const assetTypeFromDef = restriction.sharedAssets[assetInfo.id].definition.assetType;
      if(assetTypeFromDef !== assetType){
        throw new Error(`Piece ${piece.id} references asset ${assetInfo.id} at ${filePath} which is of type ${assetTypeFromDef} but the piece is of type ${assetType}`);
      }
      break;
    }
    default: {
      throw new Error(`Piece ${piece.id} references asset at ${filePath} with unknown source`);
    }
  }
  return assetType;
}
