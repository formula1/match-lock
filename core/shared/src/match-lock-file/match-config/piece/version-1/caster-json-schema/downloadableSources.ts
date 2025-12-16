import { JSONSchemaType } from "ajv";
import { RosterLockPiece } from "../types";
import { defineKeyword } from "../../../../util-types/json-schema";

import {
  validateDownloadableSource, validateDownloadableSourceList
} from "../validate";

export const downloadableSourceListSchemaValidator = defineKeyword({
  keyword: "downloadableSourceList",
  type: "array",
  validate: validateDownloadableSourceList
});

export const downloadableSourceSchemaValidator = defineKeyword({
  keyword: "downloadableSource",
  type: "string",
  validate: validateDownloadableSource
});



export const downloadableSourcesSchema: JSONSchemaType<RosterLockPiece["downloadSources"]> = {
  type: "array",
  [downloadableSourceListSchemaValidator.keyword]: true,
  items: {
    type: "string",
    [downloadableSourceSchemaValidator.keyword]: true,
  },
}


