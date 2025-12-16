import { JSONSchemaType } from "ajv";
import { sha256SchemaValidator } from "./version";
import { RosterLockEngineWithRoster, RosterLockPiece } from "../types";
import { defineKeyword } from "../../../../util-types/json-schema";
import {
  validateAllExpectedRequiredPieceTypesSet,
  validateRequiredPieceType,
  validateRequiredPieceValue
} from "../validate";

export const allRequiredPieceTypesSetSchemaValidator = defineKeyword({
  keyword: "allRequiredPieceTypesSet",
  type: "object",
  // config/pieces/pieceType/pieceIndex/requiredPieces/index
  validate: function (requiredPieces, { engine }: RosterLockEngineWithRoster, path){
    const pathParts = path.split("/");
    const pieceType = pathParts[2];
    const pieceDefinition = engine.pieceDefinitions[pieceType];
    validateAllExpectedRequiredPieceTypesSet(requiredPieces, pieceDefinition);
  }
});

export const requiredPieceValueSchemaValidator = defineKeyword({
  keyword: "requiredPieceValue",
  type: "string",
  // config/pieces/pieceType/pieceIndex/requiredPieces/pieceType/index
  validate: function (requiredPiece: string, { engine, pieces }: RosterLockEngineWithRoster, path){
    const pathParts = path.split("/");
    pathParts.pop();
    const pieceType = pathParts[2];
    const pieceValues = pieces[pieceType];
    validateRequiredPieceValue(pieceType, requiredPiece, pieceValues);
  }
});

export const requiredPieceTypeSchemaValidator = defineKeyword({
  keyword: "requiredPieceType",
  type: "array",
  // config/pieces/pieceType/pieceIndex/requiredPieces/pieceType
  validate: function (requiredPiece: string, { engine, pieces }: RosterLockEngineWithRoster, path){
    const pathParts = path.split("/");
    const pieceType = pathParts.at(-1);
    if(!pieceType) throw new Error("Invalid path");

    validateRequiredPieceType(pieceType, { engine, pieces });
  }
});


export const requiredPiecesSchema: JSONSchemaType<RosterLockPiece["requiredPieces"]> = {
  type: "object",
  [allRequiredPieceTypesSetSchemaValidator.keyword]: true,
  required: [],
  additionalProperties: {
    type: "object",
    [requiredPieceTypeSchemaValidator.keyword]: true,
    required: ["expected", "selectable"],
    additionalProperties: false,
    properties: {
      expected: {
        type: "array",
        items: {
          type: "string",
          [sha256SchemaValidator.keyword]: true,
          [requiredPieceValueSchemaValidator.keyword]: true,
        },
      },
      selectable: { type: "boolean" },
    },
  }
};
