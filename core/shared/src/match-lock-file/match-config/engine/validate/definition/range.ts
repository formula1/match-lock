import { MatchLockEngineConfig, MatchLockEngineAssetDefinition } from "../../types";

export function validateRange(pieceType: string, { name, count }: MatchLockEngineAssetDefinition){
  if(!Array.isArray(count)){
    if(count === "*") return;
    if(count > 0) return;
    throw new Error(`Piece ${pieceType} asset ${name} count should be greater than 0`);
  }
  if(count.length !== 2){
    throw new Error(`Piece ${pieceType} asset ${name} has invalid range`);
  }
  if(count[0] < 0){
    throw new Error(`Piece ${pieceType} asset ${name} has invalid range`);
  }
  if(count[1] === "*") return;
  if(count[0] > count[1]){
    throw new Error(`Piece ${pieceType} asset ${name} has invalid range`);
  }
}