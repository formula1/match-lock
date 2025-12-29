import { EngineAssetDefinition } from "./types";

export function validateAssetFileCount(
  validator: EngineAssetDefinition["count"],
  actualCount: number
){
  if(!Array.isArray(validator)){
    if(validator === "*") return;
    if(actualCount !== validator){
      throw new Error(`Expected ${validator} files, got ${actualCount}`);
    }
    return;
  }
  const [min, max] = validator;
  if(actualCount < min){
    throw new Error(`Expected at least ${min} files, got ${actualCount}`);
  }
  if(max === "*") return;
  if(actualCount > max){
    throw new Error(`Expected at most ${max} files, got ${actualCount}`);
  }
}

export function isValidAssetFileCount(
  validator: EngineAssetDefinition["count"],
  actualCount: number
){
  try {
    validateAssetFileCount(validator, actualCount);
    return true;
  }catch(e){
    return false;
  }
}
