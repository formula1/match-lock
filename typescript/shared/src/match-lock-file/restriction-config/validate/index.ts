
import { MatchLockRestrictionConfig } from "../types";
import { validateRestrictionSha } from "./sha";
import { validatePieceDefinitions } from "./defintions";
import { validatePieces } from "./piece";

export function validateRestriction(restriction: MatchLockRestrictionConfig) {
  validateRestrictionSha(restriction);
  validatePieceDefinitions(restriction);
  validatePieces(restriction);
  return true;
}



