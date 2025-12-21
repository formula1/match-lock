import { MatchLockEngineConfig } from "../../../engine";


export function getPieceDefFromEngineWithPath(engine: MatchLockEngineConfig, path: string){
  const pathParts = path.split("/");
  const pieceType = pathParts[2];
  const pieceDefinition = engine.pieceDefinitions[pieceType];
  if(!pieceDefinition)
    throw new Error(`Piece type ${pieceType} is not defined in engine`);
  return pieceDefinition;
}
