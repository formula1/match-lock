

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
  UserSelectionValidation,
  ScriptWithPieceMeta,
  MatchLockSelectionConfig
} from "./types";
import {
  CountCaster,
  JSONPrimitiveCaster,
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

const SelectionCountCaster = CastUnion(
  CountCaster,
  CastTuple(CountCaster, CountCaster),
).withConstraint((value) => {
  if(!Array.isArray(value)){
    if(value < 0) return "Count is negative";
    return true;
  }
  if(value[0] < 0) return "Count range min is negative";
  const [min, max] = value;
  if(min > max) return "Count range min is greater than max";
  return true;
});

export const ScriptWithPieceMetaCaster = CastObject({
  name: CastString,
  scriptMeta: CastObject({
    defaultValue: CastRecord(CastString, JSONPrimitiveCaster),
    pieceValues: CastRecord(CastString, CastRecord(CastString, CastUnion(JSONPrimitiveCaster, CastUndefined))),
  }).optional(),
  script: ScriptCaster,
}).conform<ScriptWithPieceMeta<any>>();


export const UserSelectionValidationCaster = CastObject({
  count: SelectionCountCaster,
  unique: CastBoolean,
  customValidation: CastArray(ScriptWithPieceMetaCaster),
}).conform<UserSelectionValidation>();


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
    type: Literal("player-choices"),
    validation: CastObject({
      count: SelectionCountCaster,
      unique: CastBoolean,
      customValidation: CastArray(ScriptWithPieceMetaCaster),
    }),
    algorithm: ScriptWithPieceMetaCaster.optional(),
  }),
  CastObject({
    type: Literal("global-choices"),
    validation: CastObject({
      count: SelectionCountCaster,
      unique: CastBoolean,
      customValidation: CastArray(ScriptWithPieceMetaCaster),
    }).optional(),
    algorithm: ScriptWithPieceMetaCaster,
  }),
  CastObject({
    type: Literal("democracy-random"),
    validation: CastObject({
      count: SelectionCountCaster,
      unique: CastBoolean,
      customValidation: CastArray(ScriptWithPieceMetaCaster),
    }).optional(),
  }),
).conform<MatchLockSelectionConfig>();
