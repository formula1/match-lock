import { JSONSchemaType } from "ajv";
import { RosterLockPiece } from "../types";
import { RosterLockEngineWithRosterConfig } from "../types";
import { defineKeyword } from "../../../../util-types/json-schema";
import {
  validatePathVariableNameIsExpected,
  validatePathVariableValue, 
  validateAllExpectedPathVariableNamesSet,
} from "../validate";

import { getPieceDefFromEngineWithPath } from "./utils";

export const pathVariableNameSchemaValidator = defineKeyword({
  keyword: "pathVariableName",
  type: "object",
  validate: function (pathVariableValue, { engine }: RosterLockEngineWithRosterConfig, path){
    const pathParts = path.split("/");
    // config/pieces/pieceType/pieceIndex/pathVariables/variableName/index
    pathParts.pop();
    const variableName = pathParts.at(-1);
    if(!variableName)
      throw new Error(`Invalid variable name path`);

    const pieceDefinition = getPieceDefFromEngineWithPath(engine, path);
    validatePathVariableNameIsExpected(variableName, pieceDefinition);
  }
});

export const pathVariableValueSchemaValidator = defineKeyword({
  keyword: "pathVariableValue",
  type: "object",
  validate: function (pathVariableValue, { engine }: RosterLockEngineWithRosterConfig, path){
    validatePathVariableValue(pathVariableValue);
  }
});

export const allPathVariableNameSetSchemaValidator = defineKeyword({
  keyword: "allPathVariableNameSet",
  type: "object",
  validate: function (pathVariables, { engine }: RosterLockEngineWithRosterConfig, path){
    const pieceDefinition = getPieceDefFromEngineWithPath(engine, path);
    validateAllExpectedPathVariableNamesSet(pathVariables, pieceDefinition);
  }
});

export const pathVariablesSchema: JSONSchemaType<RosterLockPiece["pathVariables"]> = {
  type: "object",
  required: [],
  additionalProperties: {
    type: "string",
    [pathVariableNameSchemaValidator.keyword]: true,
    [pathVariableValueSchemaValidator.keyword]: true,
  },
  [allPathVariableNameSetSchemaValidator.keyword]: true,
}
