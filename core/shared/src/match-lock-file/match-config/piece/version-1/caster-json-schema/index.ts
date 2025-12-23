import { JSONSchemaType } from "ajv";
import { defineKeyword } from "../../../../util-types/json-schema";
import { RosterLockEngineWithRosterConfig, RosterLockPiece, RosterLockPieceMetadata } from "../types";

import { idSchema, idUniquenessSchemaValidator, idSchemaValidator } from "./id";
import { versionSchema, sha256SchemaValidator } from "./version";
import { humanInfoSchema, urlSchemaValidator } from "./human";
import {
  downloadableSourcesSchema,
  downloadableSourceSchemaValidator,
  downloadableSourceListSchemaValidator,
} from "./downloadableSources";
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


const pieceTypeInEngineSchemaValidator = defineKeyword({
  keyword: "rosterPieceTypeInEngine",
  type: "object",
  validate: function (piece: RosterLockPiece, { engine }: RosterLockEngineWithRosterConfig, path){
    const pathParts = path.split("/");
    // config/pieces/pieceType/pieceIndex
    const pieceType = pathParts[2];
    validatePieceInEngine(pieceType, engine);
  }
});
export const rosterLockPiece: JSONSchemaType<RosterLockPiece> = {
  type: "object",
  [pieceTypeInEngineSchemaValidator.keyword]: true,
  required: ["version", "humanInfo", "downloadSources", "pathVariables", "requiredPieces"],
  additionalProperties: false,
  properties: {
    id: idSchema,
    version: versionSchema,
    humanInfo: humanInfoSchema,
    downloadSources: downloadableSourcesSchema,
    pathVariables: pathVariablesSchema,
    requiredPieces: requiredPiecesSchema,
  },
}


import { validateAllEnginePiecesDefined, validatePieceInEngine } from "../validate";
const allPieceTypesInEngineSchemaValidator = defineKeyword({
  keyword: "allEnginePieceTypesInRoster",
  type: "object",
  validate: function (pieces: RosterLockEngineWithRosterConfig["pieces"], { engine }: RosterLockEngineWithRosterConfig, path){
    validateAllEnginePiecesDefined(pieces, engine);
  }
});
export const rosterLockPiecesSchema: JSONSchemaType<RosterLockEngineWithRosterConfig["pieces"]> = {
  type: "object",
  [allPieceTypesInEngineSchemaValidator.keyword]: true,
  required: [],
  additionalProperties: {
    type: "array",
    items: rosterLockPiece,
  },
}



import { engineSchema } from "../../../engine";
export const rosterLockEngineWithRosterSchema: JSONSchemaType<RosterLockEngineWithRosterConfig> = {
  type: "object",
  required: ["engine", "pieces"],
  additionalProperties: false,
  properties: {
    engine: engineSchema,
    pieces: rosterLockPiecesSchema,
  },
}



export const rosterLockPieceKeywords = [
  idSchemaValidator,
  idUniquenessSchemaValidator,
  sha256SchemaValidator,
  urlSchemaValidator,
  downloadableSourceSchemaValidator,
  downloadableSourceListSchemaValidator,
  pathVariableNameSchemaValidator,
  pathVariableValueSchemaValidator,
  allPathVariableNameSetSchemaValidator,
  requiredPieceValueSchemaValidator,
  requiredPieceTypeSchemaValidator,
  allPieceTypesInEngineSchemaValidator,
  pieceTypeInEngineSchemaValidator,
]


export * from "./piecemeta";
