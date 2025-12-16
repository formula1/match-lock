
import { JSONSchemaType } from "ajv";
import { pathVariableListSchemaValidator, pathVariableNameSchemaValidator } from "./keywords";
import { MatchLockEngineConfig } from "../../types";

export const pathVariableKeywords = [
  pathVariableListSchemaValidator,
  pathVariableNameSchemaValidator,
]


export const pathVariablesSchema: JSONSchemaType<MatchLockEngineConfig["pieceDefinitions"][string]["pathVariables"]> = {
  [pathVariableListSchemaValidator.keyword]: true,
  type: "array",
  items: {
    [pathVariableNameSchemaValidator.keyword]: true,
    type: "string",
  },
}
