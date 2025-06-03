import { MatchLockRestrictionConfig } from "../types";

export function validatePieceDefinitions(restriction: MatchLockRestrictionConfig){
  for(const [pieceType, definition] of Object.entries(restriction.engine.pieceDefinitions)){
    for(const [assetType, pieceAssetDefinition] of Object.entries(definition.assets)){
      const pieceAssetDefinitionCount = pieceAssetDefinition.count;
      if(!Array.isArray(pieceAssetDefinitionCount)){
        continue;
      }
      if(pieceAssetDefinitionCount.length !== 2){
        throw new Error(`Piece ${pieceType} asset ${assetType} has invalid range`);
      }
      if(pieceAssetDefinitionCount[1] === "*"){
        continue;
      }
      if(pieceAssetDefinitionCount[0] > pieceAssetDefinitionCount[1]){
        throw new Error(`Piece ${pieceType} asset ${assetType} has invalid range`);
      }
    }
  }
}
