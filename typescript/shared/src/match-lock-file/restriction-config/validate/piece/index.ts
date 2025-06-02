import { parseFilePath } from "../../../util-types";
import { MatchLockRestrictionConfig, MatchLockGamePiece } from "../../types";

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
      validatePieceAssets(restriction, collection.pieceDefinition, piece);
    }
  }
}

function validatePiecesRequired(
  restriction: MatchLockRestrictionConfig, piece: MatchLockGamePiece
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
import { validateAssetType } from "./validateAssetType";
import { validateAssetCount } from "./validateAssetCount";

function validatePieceAssets(
  restriction: MatchLockRestrictionConfig, pieceDefinition: string, piece: MatchLockGamePiece
){
  const pieceConfig = restriction.engine.pieceDefinitions[pieceDefinition];
  const counts = new Map<string, number>();
  for(const [filePath, assetInfo] of Object.entries(piece.assets)){
    const assetType = validateAssetType(restriction, pieceConfig, piece, filePath, assetInfo);
    counts.set(assetType, (counts.get(assetType) ?? 0) + 1);
  }
  for(const [assetType, { count: expectedCount }] of Object.entries(pieceConfig.assets)){
    const assetCount = counts.get(assetType) ?? 0;
    validateAssetCount(expectedCount, assetCount, { pieceId: piece.id, assetType });
  }
}

