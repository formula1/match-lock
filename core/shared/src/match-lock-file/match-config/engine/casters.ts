
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
    selectionStrategy: CastUnion(
      Literal("mandatory"),
      Literal("personal"),
      Literal("shared"),
      Literal("on demand"),
    ),
    requires: CastArray(CastString),
    pathVariables: CastArray(CastString),
    assets: CastArray(CastObject({
      name: CastString,
      glob: CastArray(CastString),
      classification: CastUnion(Literal("logic"), Literal("media"), Literal("doc")),
      count: CastUnion(
        CountCaster,
        Literal("*"),
        CastTuple(CountCaster, CountCaster),
        CastTuple(CountCaster, Literal("*")),
      )
    }))
  })),
}).conform<MatchLockEngineConfig>();

