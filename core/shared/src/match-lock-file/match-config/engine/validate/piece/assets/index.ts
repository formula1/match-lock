import { MatchLockEngineAssetDefinition, MatchLockEngineConfig } from "../../../types";

import { validateRange } from "./range";
export function validateAssets(pieceType: string, definition: MatchLockEngineConfig["pieceDefinitions"][string]){
  const names = new Set<string>();
  for(const pieceAssetDefinition of definition.assets){
    if(pieceAssetDefinition.name === ""){
      throw new Error(`Piece ${pieceType} has empty asset name`);
    }
    if(names.has(pieceAssetDefinition.name)){
      throw new Error(`Piece ${pieceType} has duplicate asset name ${pieceAssetDefinition.name}`);
    }
    if(pieceAssetDefinition.name !== pieceAssetDefinition.name.trim()){
      throw new Error(`Piece ${pieceType} asset name ${pieceAssetDefinition.name} contains a trailing or leading space`);
    }
    names.add(pieceAssetDefinition.name);
    validateRange(pieceAssetDefinition.count)
    validateGlobList(pieceType, pieceAssetDefinition)
  }
}

import { validateGlobItem } from "./glob";
function validateGlobList(pieceType: string, { name, glob }: MatchLockEngineAssetDefinition){
  if(glob.length === 0){
    throw new Error(`Piece ${pieceType} asset ${name} has no globs`);
  }
  if(new Set(glob).size !== glob.length){
    throw new Error(`Piece ${pieceType} asset ${name} has duplicate globs`);
  }
  for(const g of glob){
    validateGlobItem(g);
  }
}

export { validateRange, validateGlobItem };
