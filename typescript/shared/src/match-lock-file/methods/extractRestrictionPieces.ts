
import { MatchLockGamePiece, MatchLockRestrictionConfig } from "../restriction-config";
import { MatchLockSelectionConfig } from "../types/selection";

export function* extractRestrictionPiecesMatchingSelection(
  restriction: MatchLockRestrictionConfig,
  selection: MatchLockSelectionConfig
){
  const pieces: Record<string, MatchLockGamePiece> = {};
  for(const [collectionId, selectedPieces] of Object.entries(selection.selections)){
    if(!(collectionId in restriction.pieces)){
      throw new Error(`Collection ${collectionId} not found`);
    }
    const collection = restriction.pieces[collectionId];
    for(const pieceId of selectedPieces){
      if(pieceId in pieces) continue;
      const piece = collection.pieces.find(p=>p.id === pieceId);
      if(!piece) throw new Error(`Piece ${pieceId} not found in collection ${collectionId}`);
      yield piece;
    }
  }
}
