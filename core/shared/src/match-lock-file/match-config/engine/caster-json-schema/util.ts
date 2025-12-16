import { MatchLockEngineConfig } from "../types";

import { ErrorObject, SchemaValidateFunction } from "ajv";

// List of JSON Schema reserved keywords
type JSONSchemaReservedKeywords = 
  | "type" | "properties" | "required" | "additionalProperties"
  | "items" | "prefixItems" | "contains" | "minItems" | "maxItems"
  | "uniqueItems" | "minContains" | "maxContains"
  | "minimum" | "maximum" | "exclusiveMinimum" | "exclusiveMaximum"
  | "multipleOf"
  | "minLength" | "maxLength" | "pattern" | "format"
  | "minProperties" | "maxProperties" | "patternProperties"
  | "dependentRequired" | "dependentSchemas"
  | "enum" | "const"
  | "allOf" | "anyOf" | "oneOf" | "not"
  | "if" | "then" | "else"
  | "$ref" | "$defs" | "$id" | "$schema" | "$comment"
  | "$anchor" | "$dynamicRef" | "$dynamicAnchor" | "$vocabulary"
  | "title" | "description" | "default" | "deprecated"
  | "readOnly" | "writeOnly" | "examples"
  | "contentMediaType" | "contentEncoding" | "contentSchema";

// Combine all checks
type SafeKeyword<T extends string> = (
  T extends "" ? "❌ Keyword cannot be an empty string" :
  T extends `${string} ${string}` ? "❌ Keyword cannot contain whitespace" :
  T extends JSONSchemaReservedKeywords ? `❌ Cannot use reserved JSON Schema keyword "${T}". Use a custom prefix like "_${T}" instead.` :
  T
);



type JSONSchemaType = (
  | "null" | "boolean" | "integer" |  "number" | "string" | "object" | "array"
  | ("string" | "number" | "boolean" | "object" | "integer" | "null" | "array")[]
)
export type AJVKeywordDefinition<K extends string = string> = {
  keyword: SafeKeyword<K>,
  type: JSONSchemaType,
  validate: SchemaValidateFunction
}

export function defineKeyword<K extends string>(
  definition: {
    keyword: SafeKeyword<K>,
    type: JSONSchemaType,
    validate: (v: any, engine: MatchLockEngineConfig, path: string)=>unknown
  }
): AJVKeywordDefinition<K>{
  return {
    ...definition, validate: wrapValidator(definition.keyword, definition.validate)
  };

}

function wrapValidator(
  keyword: string,
  validator: (v: any, engine: MatchLockEngineConfig, path: string)=>unknown
): SchemaValidateFunction {
  return function(
    this: { errors: Array<ErrorObject> },
    schema,
    value: any,
    parentSchema,
    dataCxt,
  ){
    if(!dataCxt) return true;
    try {
      validator(value, dataCxt.rootData as MatchLockEngineConfig, dataCxt.instancePath);
      return true;
    }catch(e: any){
      this.errors = [{
        instancePath: dataCxt.instancePath,
        schemaPath: "",
        keyword: keyword,
        message: e.message,
        params: {}
      }]
      return false;
    }
  }
}

