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
export type SafeKeyword<T extends string> = (
  T extends "" ? "❌ Keyword cannot be an empty string" :
  T extends `${string} ${string}` ? "❌ Keyword cannot contain whitespace" :
  T extends JSONSchemaReservedKeywords ? `❌ Cannot use reserved JSON Schema keyword "${T}". Use a custom prefix like "_${T}" instead.` :
  T
);

