import { JSONSchemaCaster } from "../../../util-types/json-schema";

export * from "./types";
export * from "./validate";
export * from "./caster-json-schema";
export * from "./file-paths";

import { engineKeywords } from "../../engine/caster-json-schema";
import { rosterLockEngineWithRosterSchema, rosterLockPieceKeywords } from "./caster-json-schema";
import { RosterLockEngineWithRosterConfig } from "./types";

export const ROSTERLOCK_ENGINE_WITH_ROSTER_CASTER_JSONSCHEMA = new JSONSchemaCaster<RosterLockEngineWithRosterConfig>(
  rosterLockEngineWithRosterSchema,
  [...engineKeywords, ...rosterLockPieceKeywords]
)

import { RosterLockPieceMetadata } from "./types"
import { rosterLockPieceMetadataSchema, rosterLockPieceMetadataKeywords } from "./caster-json-schema";


export const ROSTERLOCK_PIECEMETADATA_CASTER_JSONSCHEMA = new JSONSchemaCaster<RosterLockPieceMetadata>(
  rosterLockPieceMetadataSchema,
  rosterLockPieceMetadataKeywords
)
