
import {
  CountCaster,
} from "../../util-types";

import {
  Record as CastRecord,
  Object as CastObject,
  Array as CastArray,
  Tuple as CastTuple,
  Literal,
  Union as CastUnion,
  String as CastString,
} from "runtypes"
import { MatchLockEngineAssetDefinition, MatchLockEngineConfig } from "./types";


import { validateRange, validateGlobItem } from "./validate";

export const MatchLockEngineCaster = CastObject({
  name: CastString,
  version: CastString,
  pieceDefinitions: CastRecord(CastString, CastObject({
    pathVariables: CastArray(CastString),
    assets: CastArray(CastObject({
      name: CastString,
      glob: CastArray(CastString).withConstraint((value) => {
        try {
          if(value.length === 0) throw new Error("Glob list is empty");
          if(new Set(value).size !== value.length) throw new Error("Duplicate globs");
          for(const g of value){
            validateGlobItem(g);
          }
          return true;
        }catch(e){
          return (e as Error).message;
        }
      }),
      classification: CastUnion(Literal("logic"), Literal("media"), Literal("doc")),
      count: CastUnion(
        CountCaster,
        Literal("*"),
        CastTuple(CountCaster, CountCaster),
        CastTuple(CountCaster, Literal("*")),
      ).withConstraint((value) => {
        try {
          validateRange(value);
          return true;
        }catch(e){
          return (e as Error).message;
        }
      })
    }))
  })),
}).conform<MatchLockEngineConfig>();

