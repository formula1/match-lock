import { defineKeyword } from "../../../../util-types/json-schema";
import { MatchLockEngineConfig } from "../../types";

import { validatePieceRequirementList } from "../../validate/piece/requirements";
export const requirementListSchemaValidator = defineKeyword({
  keyword: "requirementList",
  type: "array",
  validate: validatePieceRequirementList
})

import { validatePieceInCycles } from "../../validate/piece/requirements";
export const requirementCycleSchemaValidator = defineKeyword({
  keyword: "requirementCycle",
  type: "array",
  validate: function(item: string, engine: MatchLockEngineConfig, path){
    const parts = path.split("/");
    parts.pop();
    const pieceType = parts.at(-1);
    if(!pieceType) throw new Error("Invalid path");

    validatePieceInCycles(pieceType, engine);
  }
})

import { validatePieceRequirementIsResolved } from "../../validate/piece/requirements";
export const requirementItemSchemaValidator = defineKeyword({
  keyword: "requirementResolved",
  type: "string",
  validate: function(item: string, engine: MatchLockEngineConfig, path){
    validatePieceRequirementIsResolved(item, engine);
  }
})

