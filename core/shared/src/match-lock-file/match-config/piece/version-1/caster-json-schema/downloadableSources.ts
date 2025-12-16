import { JSONSchemaType } from "ajv";
import { RosterLockPiece } from "../types";
import { defineKeyword } from "../../../../util-types/json-schema";

import { validateDownloadableSource } from "../validate";
export const downloadableSourceSchemaValidator = defineKeyword({
  keyword: "downloadableSource",
  type: "string",
  validate: validateDownloadableSource
});

export const downloadableSourcesSchema: JSONSchemaType<RosterLockPiece["downloadSources"]> = {
  type: "array",
  items: {
    type: "string",
    [downloadableSourceSchemaValidator.keyword]: true,
  },
}


