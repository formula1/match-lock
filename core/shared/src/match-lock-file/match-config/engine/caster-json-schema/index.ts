

import { MatchLockEngineConfig } from "../types";
import { engineSchema, engineKeywords } from "./schema";
import { Ajv, ErrorObject } from "ajv";

function returnTrue(){ return true; }
function createAJVInstance(validate: boolean = false){
  const ajv = new Ajv({ allErrors: true, strict: true, allowUnionTypes: true });
  for(const keyword of engineKeywords){
    ajv.addKeyword({
      keyword: keyword.keyword,
      errors: true,
      schema: true,
      type: keyword.type,
      validate: !validate ? returnTrue : keyword.validate,
    });
  }
  return ajv.compile(engineSchema);
}

type SafeValue = (
  | { valid: true, value: MatchLockEngineConfig }
  | { valid: false, error: Array<ErrorObject> }
)
export const ROSTERLOCK_ENGINE_CASTER_JSONSCHEMA = {
  safeCast: function(input: unknown, validate: boolean = false): SafeValue {
    try {
      return { valid: true, value: this.cast(input, validate) };
    }catch(e){
      return { valid: false, error: e as Array<ErrorObject> };
    }
  },
  cast: function(input: unknown, validate: boolean = false) {
    const schemaValidator = createAJVInstance(validate);
    if(!schemaValidator(input)){
      if(!schemaValidator.errors) throw new Error("Validation failed with no information");
      throw schemaValidator.errors;
    }
    return input as MatchLockEngineConfig;
  }
}
