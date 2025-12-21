import { defineKeyword } from "../../../../util-types/json-schema";
import { MatchLockEngineConfig } from "../../types";

import { validateRange } from "../../validate"
export const assetCountSchemaValidator = defineKeyword({
  keyword: "assetCount",
  type: ["number", "string", "array"],
  validate: validateRange
})


import { validateAssetName } from "../../validate/piece/assets";
export const assetNameSchemaValidator = defineKeyword({
  keyword: "assetName",
  type: "string",
  validate: function(name: string, engine: MatchLockEngineConfig, path){
    const pathParts = path.split("/");
    const assets = engine.pieceDefinitions[pathParts[2]].assets;
    validateAssetName(name, assets);
  }
})

import { validateGlobList } from "../../validate/piece/assets";
export const assetGlobListSchemaValidator = defineKeyword({
  keyword: "assetGlobList",
  type: "array",
  validate: validateGlobList
})

import { validatePathVariablesInGlob } from "../../validate/piece/assets/glob/pathvariables";
export const assetGlobPathVariablesSchemaValidator = defineKeyword({
  keyword: "assetGlobPathVariables",
  type: "string",
  validate: function(globItem: string, engine: MatchLockEngineConfig, path){
    const pathParts = path.split("/");
    const variables = engine.pieceDefinitions[pathParts[2]].pathVariables;
    validatePathVariablesInGlob(globItem, variables);
  },
})

import { validateGlobItem } from "../../validate/piece/assets/glob";
export const assetGlobItemSchemaValidator = defineKeyword({
  keyword: "assetGlobItem",
  type: "string",
  validate: validateGlobItem
})



