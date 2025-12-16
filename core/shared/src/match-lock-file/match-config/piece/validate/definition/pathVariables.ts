import { MatchLockEngineConfig } from "../../../engine";
import { MatchLockScanPiece } from "../../types";
import { PATH_VARIABLE_VALUE_VALIDATION } from "../../../engine/validate/piece/assets/glob/pathvariables";

export function validatePathVariableValues(
  pieceConfig: MatchLockEngineConfig["pieceDefinitions"][string],
  pathVariableValues: MatchLockScanPiece["pathVariables"]
){
  if(Object.keys(pathVariableValues).length !== pieceConfig.pathVariables.length){
    throw new Error(`Piece has incorrect number of path variables`);
  }
  for(const variableName of pieceConfig.pathVariables){
    if(!(variableName in pathVariableValues)){
      throw new Error(`Piece is missing value for path variable ${variableName}`);
    }
    const value = pathVariableValues[variableName];
    validatePathVariableValue(value);
  }
}

type VariableConstraints = {
  minLength: number,
  maxLength: number,
  charset: string,
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