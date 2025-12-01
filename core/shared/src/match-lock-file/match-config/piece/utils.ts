import { MatchLockScanPiece } from "./types";

export function getPieceId(piece: MatchLockScanPiece){
  if("id" in piece && typeof piece.id === "string"){
    return piece.id;
  }
  return `${piece.pieceDefinition}/${piece.version.logic}`;
}
