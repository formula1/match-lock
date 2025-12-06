
import { validatePieceDefinitions } from "./piece";
import { MatchLockEngineConfig } from "../types";

export * from "./piece";

export function validateEngineConfig(engine: MatchLockEngineConfig){
  validatePieceDefinitions(engine);
}
