import { RosterLockEngineWithRosterConfig } from "@match-lock/shared";

export function resetPieces(engine: RosterLockEngineWithRosterConfig["engine"]){
  const pieces: RosterLockEngineWithRosterConfig["pieces"] = {}
  for(const pieceName of Object.keys(engine.pieceDefinitions)){
    pieces[pieceName] = [];
  }
  return pieces;
}
