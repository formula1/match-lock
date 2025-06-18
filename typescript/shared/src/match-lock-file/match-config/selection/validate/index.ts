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
    case "player-choices":
      validateCount(selection.validation.count);
      for(const script of selection.validation.customValidation){
        validateScriptMeta(script, pieceIds);
      }
      if(!selection.algorithm) return;
      validateScriptMeta(selection.algorithm, pieceIds);
      return;
    case "global-choices":
      if(selection.validation){
        validateCount(selection.validation.count);
        for(const script of selection.validation.customValidation){
          validateScriptMeta(script, pieceIds);
        }
      }
      validateScriptMeta(selection.algorithm, pieceIds);
      return;
    case "democracy-random":
      if(!selection.validation) return;
      validateCount(selection.validation.count);
      if(!selection.validation.customValidation) return;
      for(const script of selection.validation.customValidation){
        validateScriptMeta(script, pieceIds);
      }
  }
}
