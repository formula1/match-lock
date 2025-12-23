import { JSONSchemaType } from "ajv";

import { defineKeyword } from "../../../../util-types/json-schema";
import { validateId, validateIdUniqueness } from "../validate";
import { RosterLockEngineWithRosterConfig } from "../types";


export const idSchemaValidator = defineKeyword({
  keyword: "id",
  type: "string",
  validate: validateId
});

export const idUniquenessSchemaValidator = defineKeyword({
  keyword: "idUniqueness",
  type: "string",
  validate: function (id: string, { rosters }: RosterLockEngineWithRosterConfig, path){
    // config/rosters/pieceType/pieceIndex
    const pathParts = path.split("/");
    const pieceType = pathParts[2];
    const pieceList = rosters[pieceType];
    const index = Number(pathParts[3]);
    validateIdUniqueness(id, index, pieceList);
  }
});

export const idSchema: JSONSchemaType<string> = {
  type: "string",
  [idSchemaValidator.keyword]: true,
  [idUniquenessSchemaValidator.keyword]: true,
}
