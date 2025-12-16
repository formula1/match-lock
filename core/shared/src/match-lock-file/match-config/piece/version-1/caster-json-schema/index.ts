import { JSONSchemaType } from "ajv";
import { RosterLockEngineWithRoster, RosterLockPiece } from "../types";

import { versionSchema, sha256SchemaValidator } from "./version";
import { humanInfoSchema, urlSchemaValidator } from "./human";
import { downloadableSourcesSchema, downloadableSourceSchemaValidator } from "./downloadableSources";
import {
  pathVariablesSchema,
  pathVariableNameSchemaValidator,
  pathVariableValueSchemaValidator,
  allPathVariableNameSetSchemaValidator,
} from "./pathVariables";
import {
  requiredPiecesSchema,
  requiredPieceValueSchemaValidator,
  requiredPieceTypeSchemaValidator,
} from "./requiresPieces";

export const rosterLockPieceKeywords = [
  sha256SchemaValidator,
  urlSchemaValidator,
  downloadableSourceSchemaValidator,
  pathVariableNameSchemaValidator,
  pathVariableValueSchemaValidator,
  allPathVariableNameSetSchemaValidator,
  requiredPieceValueSchemaValidator,
  requiredPieceTypeSchemaValidator,
]

export const rosterLockPiece: JSONSchemaType<RosterLockPiece> = {
  type: "object",
  required: ["version", "humanInfo", "downloadSources", "pathVariables", "requiredPieces"],
  additionalProperties: false,
  properties: {
    version: versionSchema,
    humanInfo: humanInfoSchema,
    downloadSources: downloadableSourcesSchema,
    pathVariables: pathVariablesSchema,
    requiredPieces: requiredPiecesSchema,
  },
}

export const rosterLockPiecesSchema: JSONSchemaType<RosterLockEngineWithRoster["pieces"]> = {
  type: "object",
  required: [],
  additionalProperties: {
    type: "array",
    items: rosterLockPiece,
  },
}