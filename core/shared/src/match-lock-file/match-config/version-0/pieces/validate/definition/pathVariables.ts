import { MatchLockEngineConfig } from "../../../../version-1/engine";
import { PATH_VARIABLE_VALUE_VALIDATION } from "../../../../version-1/engine/validate/piece/assets/glob/pathvariables";

export function validateAllExpectedPathVariableNamesSet(
  pathVariableValues: pathVariables
  pieceConfig: MatchLockEngineConfig["pieceDefinitions"][string],
){
  for(const variableName of pieceConfig.pathVariables){
    if(!(variableName in pathVariableValues)){
      throw new Error(`Piece is missing value for path variable ${variableName}`);
    }
  }
}

export function validatePathVariableValue(
  variableValue: string,
){
  if (variableValue.length < PATH_VARIABLE_VALUE_VALIDATION.minLength) {
    throw new Error(`Path variable value is too short`);
  }
  
  if (variableValue.length > PATH_VARIABLE_VALUE_VALIDATION.maxLength) {
    throw new Error(`Path variable value is too long`);
  }
  
  const charsetRegex = new RegExp(`^[${PATH_VARIABLE_VALUE_VALIDATION.charset}]+$`);
  if (!charsetRegex.test(variableValue)) {
    throw new Error(`Path variable value contains invalid characters`);
  }
}

export function validatePathVariableNameIsExpected(
  variableName: string,
  pieceConfig: MatchLockEngineConfig["pieceDefinitions"][string],
){
  if(!pieceConfig.pathVariables.includes(variableName)){
    throw new Error(`Piece does not have path variable ${variableName}`);
  }
}
