
import { validatePieceDefinition } from "./piece";
import { MatchLockEngineConfig } from "../types";

export * from "./piece";

export function validateEngineConfig(engine: MatchLockEngineConfig){
  for(const [pieceType, definition] of Object.entries(engine.pieceDefinitions)){
    validatePieceDefinition(pieceType, definition, engine);
  }
}
