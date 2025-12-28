import { parseFilePath } from "../../../piece/version-0/caster-runtypes/util-casters";
import { MatchLockRestrictionConfig, MatchLockRestrictionPiece } from "../../types";
import {
  validatePieceMatchesEngineDefinition,
  validatePieceVersion,
  validatePublishPieceSha,
} from "../../../piece";

export function validatePieces(restriction: MatchLockRestrictionConfig){
  for(const [collectionId, collection] of Object.entries(restriction.pieces)){
    if(!(collection.pieceDefinition in restriction.engine.pieceDefinitions)){
      throw new Error(`Collection ${collectionId} is of  non existant type ${collection.pieceDefinition}`);
    }
    const ids = new Set<string>()
    for(const piece of collection.pieces){
      if(ids.has(piece.id)){
        throw new Error(`Duplicate piece id ${piece.id} in collection ${collectionId}`);
      }
      ids.add(piece.id);

      validatePiecesRequired(restriction, piece);
      validatePieceMatchesEngineDefinition(restriction.engine, piece);
      validatePieceVersion(restriction.engine, piece);
      validatePublishPieceSha(piece);
    }
    validateMatchLockSelection(collection.selectionConfig, ids);
  }
}

function validatePiecesRequired(
  restriction: MatchLockRestrictionConfig, piece: MatchLockRestrictionPiece
){
  if(!piece.requiredPieces) return;
  for(const [requiredCollectionId, requiredPieceIds] of Object.entries(piece.requiredPieces)){
    if(!(requiredCollectionId in restriction.pieces)){
      throw new Error(`Piece ${piece.id} requires piece from non existant collection ${requiredCollectionId}`);
    }
    for(const requiredPieceId of requiredPieceIds){
      if(!restriction.pieces[requiredCollectionId].pieces.find(p=>p.id === requiredPieceId)){
        throw new Error(`Piece ${piece.id} requires piece ${requiredPieceId} from collection ${requiredCollectionId} which does not exist`);
      }
    }
  }
}
import { validateMatchLockSelection } from "../../../selection";

