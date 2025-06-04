import { MatchLockSelectionConfig } from "../types";
import { validateCount } from "./count";
import { validateScriptMeta } from "./scriptMeta";

export function validateMatchLockSelection(
  selection: MatchLockSelectionConfig, pieceIds: Set<string>
) {
  switch(selection.type){
    case "mandatory":
      return;
    case "on-demand":
      return;
    case "agreed":
      return;
    case "choice":
      validateCount(selection.count);
      if(!selection.customValidation) return;
      for(const script of selection.customValidation){
        validateScriptMeta(script, pieceIds);
      }
      return;
    case "algorithm":
      validateScriptMeta(selection.algorithm.script, pieceIds);
      return;
    case "choice-algorithm":
      validateCount(selection.count);
      validateScriptMeta(selection.algorithm.script, pieceIds);
      if(!selection.customValidation) return;
      for(const script of selection.customValidation){
        validateScriptMeta(script, pieceIds);
      }
      return;
    case "democracy-random":
      validateCount(selection.count);
      if(!selection.customValidation) return;
      for(const script of selection.customValidation){
        validateScriptMeta(script, pieceIds);
      }
  }
}
