import { JSONSchemaType } from "ajv";

import { defineKeyword } from "../../../../util-types/json-schema";
import { validatePieceId, validatePieceIdUniqueness } from "../validate";
import { RosterLockEngineWithRosterConfig } from "../types";


export const idSchemaValidator = defineKeyword({
  keyword: "pieceId",
  type: "string",
  validate: validatePieceId
});

export const idUniquenessSchemaValidator = defineKeyword({
  keyword: "pieceIdUniqueness",
  type: "string",
  validate: function (id: string, { rosters }: RosterLockEngineWithRosterConfig, path){
    // config/rosters/pieceType/pieceIndex
    const pathParts = path.split("/");
    const pieceType = pathParts[2];
    const pieceList = rosters[pieceType];
    const index = Number(pathParts[3]);
    validatePieceIdUniqueness(id, index, pieceList);
  }
});

export const idSchema: JSONSchemaType<string> = {
  type: "string",
  [idSchemaValidator.keyword]: true,
  [idUniquenessSchemaValidator.keyword]: true,
}
