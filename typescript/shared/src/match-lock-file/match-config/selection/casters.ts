

import {
  Record as CastRecord,
  Object as CastObject,
  Array as CastArray,
  String as CastString,
  Literal,
  Union as CastUnion,
  Tuple as CastTuple,
  Boolean as CastBoolean,
  Undefined as CastUndefined,
} from "runtypes"


import {
  GasLimittedScript,
  ScriptWithPieceMeta,
  MatchLockSelectionConfig
} from "./types";
import {
  CountCaster,
  JSONPrimitiveCaster
} from "../../util-types";
import { JSON_Primitive } from "../../../utils/JSON";


const ScriptCaster = CastObject({
  type: CastUnion(
    Literal("text/typescript"),
    Literal("text/javascript"),
    Literal("text/lua"),
  ),
  content: CastString,
}).conform<GasLimittedScript>();

export const ScriptWithPieceMetaCaster = CastObject({
  name: CastString,
  scriptMeta: CastObject({
    defaultValue: CastRecord(CastString, JSONPrimitiveCaster),
    pieceValues: CastRecord(CastString, CastRecord(CastString, CastUnion(JSONPrimitiveCaster, CastUndefined))),
  }).optional(),
  script: ScriptCaster,
}).conform<ScriptWithPieceMeta<any>>();

export const MatchLockSelectionConfigCaster = CastUnion(
  CastObject({
    type: Literal("mandatory"),
  }),
  CastObject({
    type: Literal("on-demand"),
  }),
  CastObject({
    type: Literal("agreed"),
  }),
  CastObject({
    type: Literal("choice"),
    count: CastUnion(CountCaster, CastTuple(CountCaster, CountCaster)),
    unique: CastBoolean,
    customValidation: CastArray(ScriptWithPieceMetaCaster).optional(),
  }),
  CastObject({
    type: Literal("algorithm"),
    algorithm: ScriptWithPieceMetaCaster,
  }),
  CastObject({
    type: Literal("choice-algorithm"),
    count: CastUnion(CountCaster, CastTuple(CountCaster, CountCaster)),
    unique: CastBoolean,
    customValidation: CastArray(ScriptWithPieceMetaCaster).optional(),
    algorithm: ScriptWithPieceMetaCaster,
  }),
  CastObject({
    type: Literal("democracy-random"),
    count: CastUnion(CountCaster, CastTuple(CountCaster, CountCaster)),
    unique: CastBoolean,
    customValidation: CastArray(ScriptWithPieceMetaCaster).optional(),
  }),
).conform<MatchLockSelectionConfig>();
