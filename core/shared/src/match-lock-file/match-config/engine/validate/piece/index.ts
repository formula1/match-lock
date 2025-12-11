import { MatchLockEngineConfig, MatchLockEngineAssetDefinition } from "../../types";

export * from "./requirements";
export * from "./path-variables";
export * from "./assets";
import { validatePathVariables } from "./path-variables";
import { validateAssets } from "./assets";
import { validatePieceInCycles, validatePieceRequirementsIsResolved } from "./requirements";

export function validatePieceDefinition(
  pieceType: string, definition: MatchLockEngineConfig["pieceDefinitions"][string], engine: MatchLockEngineConfig
){
  validatePieceRequirementsIsResolved(pieceType, definition.requires, engine);
  validatePathVariables(definition.pathVariables);
  validateAssets(pieceType, definition);
  validatePieceInCycles(pieceType, engine);
}


