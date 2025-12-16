import { RosterLockEngineWithRoster } from "../types";


export function validateRequiredPieceType(
  pieceType: string, { engine, pieces }: RosterLockEngineWithRoster
){
  const pieceDefinition = engine.pieceDefinitions[pieceType];
  if(!pieceDefinition)
    throw new Error(`Piece type ${pieceType} is not defined in engine`);
  if(!(pieceType in pieces))
    throw new Error(`Piece type ${pieceType} is not defined in roster`);
}

export function validateRequiredPieceValue(
  pieceType: string, pieceSha: string, pieces: RosterLockEngineWithRoster["pieces"][string]
){
  if(!pieces.find((p) => p.version.logic === pieceSha)){
    throw new Error(`Piece type ${pieceType} does not have the required piece`);
  }
}
