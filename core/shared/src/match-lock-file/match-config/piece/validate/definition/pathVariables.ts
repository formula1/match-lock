import { MatchLockEngineConfig } from "../../../engine";
import { MatchLockScanPiece } from "../../types";

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
  constraints: VariableConstraints = {
    minLength: 1,
    maxLength: 64,
    charset: 'a-zA-Z0-9_\\- ',
  }
){
  if (variableValue.length < constraints.minLength) {
    throw new Error(`Path variable value is too short`);
  }
  
  if (variableValue.length > constraints.maxLength) {
    throw new Error(`Path variable value is too long`);
  }
  
  const charsetRegex = new RegExp(`^[${constraints.charset}]+$`);
  if (!charsetRegex.test(variableValue)) {
    throw new Error(`Path variable value contains invalid characters`);
  }
}