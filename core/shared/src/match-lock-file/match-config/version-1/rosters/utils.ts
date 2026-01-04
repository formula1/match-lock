import { MatchLockScanPiece } from "../version-0/pieces/types";

export function getPieceId(piece: MatchLockScanPiece){
  if("id" in piece && typeof piece.id === "string"){
    return piece.id;
  }
  return `${piece.pieceDefinition}/${piece.version.logic}`;
}
