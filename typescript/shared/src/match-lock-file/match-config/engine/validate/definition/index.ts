import { MatchLockEngineConfig, MatchLockEngineAssetDefinition } from "../../types";

import { validateRange } from "./range";

export function validatePieceDefinitions(engine: MatchLockEngineConfig){
  for(const [pieceType, definition] of Object.entries(engine.pieceDefinitions)){
    const names = new Set<string>();
    for(const pieceAssetDefinition of definition.assets){
      if(names.has(pieceAssetDefinition.name)){
        throw new Error(`Piece ${pieceType} has duplicate asset name ${pieceAssetDefinition.name}`);
      }
      names.add(pieceAssetDefinition.name);
      validateRange(pieceType, pieceAssetDefinition)
      validateGlobList(pieceType, pieceAssetDefinition)
    }
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
