import { MatchLockRestrictionConfig } from "../restriction-config";
import { MatchLockSelectionConfig } from "../types/selection";

export function doesSelectionFitRestriction(
  restriction: MatchLockRestrictionConfig,
  selection: MatchLockSelectionConfig
): boolean {
  if(!validRestrictionInfo(restriction, selection)) return false;

  return true;
}

function validRestrictionInfo(
  restriction: MatchLockRestrictionConfig,
  selection: MatchLockSelectionConfig
){
  if(restriction.name !== selection.restriction.name) return false;
  if(restriction.version !== selection.restriction.version) return false;
  if(restriction.sha256 !== selection.restriction.sha256) return false;
  return true;
}

function validSelectedPeices(
  restriction: MatchLockRestrictionConfig,
  selection: MatchLockSelectionConfig
){
  for(const [collectionId, peices] of Object.entries(selection.selections)){
    if(!(collectionId in restriction.pieces)) return false;
    const collection = restriction.pieces[collectionId];
    for(const peice of peices){
      if(!collection.pieces.find(p=>p.id === peice)) return false;
    }
  }
  return true;
}
