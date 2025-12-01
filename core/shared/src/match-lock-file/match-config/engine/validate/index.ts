
import { validatePieceDefinitions } from "./definition";
import { MatchLockEngineConfig } from "../types";

export * from "./definition";

export function validateEngineConfig(engine: MatchLockEngineConfig){
  validatePieceDefinitions(engine);
}
