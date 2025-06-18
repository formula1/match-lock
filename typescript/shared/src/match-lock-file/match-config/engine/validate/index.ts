
import { validatePieceDefinitions } from "./definition/defintions";
import { MatchLockEngineConfig } from "../types";

export * from "./definition/defintions";

export function validateEngineConfig(engine: MatchLockEngineConfig){
  validatePieceDefinitions(engine);
}
