
import { validatePieceDefinition } from "./piece";
import { RosterLockEngineConfig } from "../types";

export * from "./piece";
import { ValidationErrorPath } from "./error";

export function validateEngineConfig(engine: RosterLockEngineConfig){
  for(const [pieceType, definition] of Object.entries(engine.pieceDefinitions)){
    try {
      validatePieceDefinition(pieceType, definition, engine);
    }catch(e){
      const eTyped = ValidationErrorPath.convertError(e);
      eTyped.addPathPrefix(`pieceDefinitions/${pieceType}`);
      throw e;
    }
  }
}
