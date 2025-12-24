import { MatchLockEngineConfig, RosterLockEngineWithRosterConfig } from "../types";

export function validateAllExpectedRequiredPieceTypesSet(
  requiredPieces: RosterLockEngineWithRosterConfig["rosters"][string][0]["requiredPieces"],
  pieceConfig: MatchLockEngineConfig["pieceDefinitions"][string],
){
  for(const requiredPieceType of pieceConfig.requires){
    if(!(requiredPieceType in requiredPieces)){
      throw new Error(`Piece is missing required piece type ${requiredPieceType}`);
    }
  }
}

export function validateRequiredPieceType(
  pieceType: string, { engine, rosters }: RosterLockEngineWithRosterConfig
){
  const pieceDefinition = engine.pieceDefinitions[pieceType];
  if(!pieceDefinition)
    throw new Error(`Piece type ${pieceType} is not defined in engine`);
  if(!(pieceType in rosters))
    throw new Error(`Piece type ${pieceType} is not defined in roster`);
}

export function validateRequiredPieceValue(
  pieceType: string, pieceId: string, roster: RosterLockEngineWithRosterConfig["rosters"][string]
){
  if(!roster.find((p) => p.id === pieceId)){
    throw new Error(`Piece type ${pieceType} does not have the required piece with id ${pieceId}`);
  }
}
