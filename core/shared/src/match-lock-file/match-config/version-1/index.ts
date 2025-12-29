export * from "./types";

import { JSONSchemaCaster } from "../../util-types/json-schema";
import { engineKeywords, engineSchema } from "./engine";
import { rosterKeywords, rostersSchema } from "./rosters";
import { selectionConfigSchema, selectionKeywords } from "./selection";

export * from "./engine";
export * from "./rosters";
export * from "./selection";

import { RosterLockV1Config } from "./types";

export const ROSTERLOCK_V1_CASTER_JSONSCHEMA = new JSONSchemaCaster<
  RosterLockV1Config
>(
  {
    type: "object",
    required: ["version", "engine", "rosters", "selection"],
    additionalProperties: false,
    properties: {
      version: { type: "number", const: 1 },
      engine: engineSchema,
      rosters: rostersSchema,
      selection: selectionConfigSchema,
    },
  },
  [...engineKeywords, ...rosterKeywords, ...selectionKeywords]
)


export * from "./usage";
