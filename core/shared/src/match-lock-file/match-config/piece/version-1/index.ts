import { JSONSchemaCaster } from "../../../util-types/json-schema";

export * from "./types";
export * from "./validate";
export * from "./caster-json-schema";

import { engineKeywords } from "../../engine/caster-json-schema";
import { rosterLockPiecesSchema, rosterLockPieceKeywords } from "./caster-json-schema";

export const ROSTERLOCK_ENGINE_WITH_ROSTER_CASTER_JSONSCHEMA = new JSONSchemaCaster(
  rosterLockPiecesSchema, [...engineKeywords, ...rosterLockPieceKeywords]
)

