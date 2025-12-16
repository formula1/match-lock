import { JSONSchemaType } from "ajv";
import { sha256SchemaValidator } from "./version";
import { RosterLockEngineWithRoster, RosterLockPiece } from "../types";
import { defineKeyword } from "../../../../util-types/json-schema";
import { validateRequiredPieceType, validateRequiredPieceValue } from "../validate";

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
  // config/pieces/pieceType/pieceIndex/requiredPieces/pieceType/index
  validate: function (requiredPiece: string, { engine, pieces }: RosterLockEngineWithRoster, path){
    const pathParts = path.split("/");
    pathParts.pop();
    const pieceType = pathParts[2];

    validateRequiredPieceType(pieceType, { engine, pieces });
  }
});


export const requiredPiecesSchema: JSONSchemaType<RosterLockPiece["requiredPieces"]> = {
  type: "object",
  required: [],
  additionalProperties: {
    type: "object",
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
        [requiredPieceTypeSchemaValidator.keyword]: true,
      },
      selectable: { type: "boolean" },
    },
  }
};
