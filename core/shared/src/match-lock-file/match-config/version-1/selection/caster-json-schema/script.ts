
import { JSONSchemaType } from "ajv";
import { GasLimittedScript } from "../types";

export const gasLimittedScriptSchema: JSONSchemaType<GasLimittedScript> = {
  type: "object",
  required: ["src"],
  additionalProperties: false,
  properties: {
    type: { type: "string", nullable: true },
    src: { type: "string" },
  },
}

