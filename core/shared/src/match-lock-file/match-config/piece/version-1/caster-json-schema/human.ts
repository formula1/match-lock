import { JSONSchemaType } from "ajv"
import { RosterLockPiece } from "../types"
import { defineKeyword } from "../../../../util-types/json-schema";


import { validateURL } from "../validate";
export const urlSchemaValidator = defineKeyword({
  keyword: "URL",
  type: "string",
  validate: validateURL
});


export const humanInfoSchema: JSONSchemaType<RosterLockPiece["humanInfo"]> = {
  type: "object",
  additionalProperties: false,
  required: ["name", "author", "url"],
  properties: {
    name: { type: "string" },
    author: { type: "string" },
    url: { type: "string", [urlSchemaValidator.keyword]: true },
    image: { type: "string", [urlSchemaValidator.keyword]: true, nullable: true },
  },
}

