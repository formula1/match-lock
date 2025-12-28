import { MatchLockEngineAssetDefinition, MatchLockEngineConfig } from "../../../types";

import { validateRange } from "./range";

export function validateAsset(
  pieceAssetDefinition: MatchLockEngineConfig["pieceDefinitions"][string]["assets"][0],
  definition: MatchLockEngineConfig["pieceDefinitions"][string]
){
  validateAssetName(pieceAssetDefinition.name, definition.assets);
  validateRange(pieceAssetDefinition.count)
  validateGlobList(pieceAssetDefinition.glob);
  for(const g of pieceAssetDefinition.glob){
    validatePathVariablesInGlob(g, definition.pathVariables);
    validateGlobItem(g);
  }
}

export function validateAssetName(
  name: MatchLockEngineAssetDefinition["name"], assets: MatchLockEngineConfig["pieceDefinitions"][string]["assets"]
){
  if(name === ""){
    throw new Error(`Name is empty`);
  }
  if(name !== name.trim()){
    throw new Error(`Name contains a trailing or leading space`);
  }
  if(assets.find((a) => a.name === name)){
    throw new Error(`Duplicate name`);
  }
}

import { validatePathVariablesInGlob, validateGlobItem } from "./glob";
export function validateGlobList(
  glob: MatchLockEngineAssetDefinition["glob"],
){
  if(glob.length === 0){
    throw new Error(`Expecting at least 1 glob`);
  }
  if(new Set(glob).size !== glob.length){
    throw new Error(`Has duplicate globs`);
  }
}

export { validatePathVariablesInGlob, validateRange, validateGlobItem };
