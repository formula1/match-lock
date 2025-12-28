
import {
  DateTimeCaster,
  SemVerCaster,
  Sha256Caster,
  URLTypeCaster,
  MagnetURICaster,
  CountCaster,
} from "../pieces/caster-runtypes/util-casters";

import {
  Record as CastRecord,
  Object as CastObject,
  Array as CastArray,
  Tuple as CastTuple,
  Literal,
  Union as CastUnion,
  String as CastString,
} from "runtypes"

import { MatchLockRestrictionConfig } from "./types";


import { MatchLockEngineCaster } from "../../engine";
import { MatchLockPublishPieceCaster } from "../../piece";
import { MatchLockSelectionConfigCaster } from "../../selection";

export const MatchLockRestrictionConfigCaster = CastObject({
  name: CastString,
  version: SemVerCaster,
  sha256: Sha256Caster,

  published: DateTimeCaster,

  signature: CastString,
  signatureVerificationUrl: URLTypeCaster,

  engine: MatchLockEngineCaster,

  pieces: CastRecord(CastString, CastObject({
    selectionConfig: MatchLockSelectionConfigCaster,
    pieceDefinition: CastString,
    pieces: CastArray(
      CastObject({
        ...MatchLockPublishPieceCaster.fields,
        id: CastString,
        requiredPieces: CastRecord(CastString, CastArray(CastString)).optional(),
      })
    ),
  }))
}).conform<MatchLockRestrictionConfig>();

