
import { ScriptWithPieceMeta } from "../types";

export function validateScriptMeta(
  script: ScriptWithPieceMeta<any>, pieceIds: Set<string>
){
  if(!script.scriptMeta) return;
  const defaultType = script.scriptMeta.defaultValue;
  const types: Record<string, string> = {};
  for(const key in defaultType){
    types[key] = typeof defaultType[key];
  }
  for(const [pieceId, pieceMeta] of Object.entries(script.scriptMeta.pieceValues)){
    if(!pieceIds.has(pieceId)){
      throw new Error(`Script ${script.name} references piece ${pieceId} which is not in the piece ids`);
    }
    for(const key in pieceMeta){
      if(!(key in types)){
        throw new Error(`Script ${script.name} references piece ${pieceId} with meta key ${key} which is not in the default meta`);
      }
      if(typeof pieceMeta[key] !== types[key]){
        throw new Error(`Script ${script.name} references piece ${pieceId} with meta key ${key} which is not the same type as the default meta`);
      }
    }
  }
}
