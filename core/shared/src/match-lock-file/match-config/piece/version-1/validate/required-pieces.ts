import { MatchLockEngineConfig, RosterLockEngineWithRoster } from "../types";

export function validateAllExpectedRequiredPieceTypesSet(
  requiredPieces: RosterLockEngineWithRoster["pieces"][string][0]["requiredPieces"],
  pieceConfig: MatchLockEngineConfig["pieceDefinitions"][string],
){
  for(const requiredPieceType of pieceConfig.requires){
    if(!(requiredPieceType in requiredPieces)){
      throw new Error(`Piece is missing required piece type ${requiredPieceType}`);
    }
  }
}

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
