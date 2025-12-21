
export type JSONSchemaType = (
  | "null" | "boolean" | "integer" |  "number" | "string" | "object" | "array"
  | ("string" | "number" | "boolean" | "object" | "integer" | "null" | "array")[]
)
