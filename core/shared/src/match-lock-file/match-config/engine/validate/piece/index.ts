import { MatchLockEngineConfig, MatchLockEngineAssetDefinition } from "../../types";

export * from "./requirements";
export * from "./path-variables";
export * from "./assets";
import { validatePathVariableName, validatePathVariables } from "./path-variables";
import { validateAsset } from "./assets";
import {
  validatePieceInCycles, validatePieceRequirementList, validatePieceRequirementIsResolved
} from "./requirements";
import { ValidationErrorPath } from "../error";

export function validatePieceDefinition(
  pieceType: string, definition: MatchLockEngineConfig["pieceDefinitions"][string], engine: MatchLockEngineConfig
){
  validatePieceRequirementList(definition.requires);
  for(const requiredPieceType of definition.requires){
    validatePieceRequirementIsResolved(requiredPieceType, engine);
  }
  validatePathVariables(definition.pathVariables);
  for(const variable of definition.pathVariables){
    validatePathVariableName(variable);
  }
  for(const asset of definition.assets){
    try {
      validateAsset(asset, definition);
    }catch(e){
      const eTyped = ValidationErrorPath.convertError(e);
      eTyped.addPathPrefix(`assets/${asset.name}`);
      throw e;
    }
  }
  validatePieceInCycles(pieceType, engine);
}


