import { ScriptWithPieceMeta } from "@match-lock/shared";

export function getPieceMeta(
  scriptConfig: ScriptWithPieceMeta<any>, pieceId: string
){
  if(!scriptConfig.scriptMeta) return {};
  return {
    ...scriptConfig.scriptMeta.defaultValue,
    ...scriptConfig.scriptMeta.pieceValues[pieceId],
  }
} 
