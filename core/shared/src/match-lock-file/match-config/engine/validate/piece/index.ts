import { MatchLockEngineConfig, MatchLockEngineAssetDefinition } from "../../types";

export * from "./path-variables";
export * from "./assets";
import { validatePathVariables } from "./path-variables";
import { validateAssets } from "./assets";

export function validatePieceDefinitions(engine: MatchLockEngineConfig){
  for(const [pieceType, definition] of Object.entries(engine.pieceDefinitions)){
    validatePathVariables(definition.pathVariables);
    validateAssets(pieceType, definition);
  }
}

