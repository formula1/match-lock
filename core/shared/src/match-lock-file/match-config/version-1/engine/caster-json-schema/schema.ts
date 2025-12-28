import { JSONSchemaType } from "ajv";
import { MatchLockEngineConfig } from "../types";

import { assetsSchema, assetKeywords } from "./asset";
import { requirementsSchema, requirementKeywords } from "./requirements";
import { pathVariablesSchema, pathVariableKeywords } from "./variables";

export const engineSchema: JSONSchemaType<MatchLockEngineConfig> = {
  type: "object",
  required: ["name", "version", "pieceDefinitions"],
  additionalProperties: false,
  properties: {
    name: { type: "string" },
    version: { type: "string" },
    pieceDefinitions: {
      type: "object",
      required: [],
      additionalProperties: {
        type: "object",
        required: ["pathVariables", "requires", "assets", "selectionStrategy"],
        additionalProperties: false,
        properties: {
          selectionStrategy: { type: "string", enum: ["mandatory", "personal", "shared", "on demand"] },
          pathVariables: pathVariablesSchema,
          requires: requirementsSchema,
          assets: assetsSchema,
        },
      }
    }
  }
}

export const engineKeywords = [
  ...pathVariableKeywords,
  ...requirementKeywords,
  ...assetKeywords,
]

