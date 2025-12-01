
import { MatchLockRestrictionConfig } from "../types";
import { validateRestrictionSha } from "./sha";
import { validateEngineConfig } from "../../engine";
import { validatePieces } from "./piece";

export function validateMatchLockRestriction(restriction: MatchLockRestrictionConfig) {
  validateRestrictionSha(restriction);
  validateEngineConfig(restriction.engine);
  validatePieces(restriction);
  return true;
}



