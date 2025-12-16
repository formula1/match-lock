

import { engineSchema, engineKeywords } from "./schema";
import { JSONSchemaCaster } from "../../../util-types/json-schema";

export { engineSchema, engineKeywords };
export const ROSTERLOCK_ENGINE_CASTER_JSONSCHEMA = new JSONSchemaCaster(
  engineSchema, engineKeywords
)

