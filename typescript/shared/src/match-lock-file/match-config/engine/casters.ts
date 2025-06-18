
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
import { MatchLockEngineConfig } from "./types";


export const MatchLockEngineCaster = CastObject({
  name: CastString,
  version: CastString,
  pieceDefinitions: CastRecord(CastString, CastObject({
    assets: CastArray(CastObject({
      name: CastString,
      glob: CastArray(CastString),
      classification: CastUnion(Literal("logic"), Literal("media"), Literal("doc")),
      count: CastUnion(
        CountCaster,
        Literal("*"),
        CastTuple(CountCaster, CountCaster),
        CastTuple(CountCaster, Literal("*")),
      ).withConstraint((value) => {
        if(!Array.isArray(value)){
          if(value === "*") return true;
          if(value < 0) return "Count is negative";
          return true;
        }
        if(value[0] < 0) return "Count range min is negative";
        if(value[1] === "*") return true;
        const [min, max] = value;
        if(min > max) return "Count range min is greater than max";
        return true;
      })
    }))
  })),
}).conform<MatchLockEngineConfig>();

