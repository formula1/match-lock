
import {
  SemVerCaster,
  Sha256Caster,
} from "../../util-types";

import {
  Record as CastRecord,
  Object as CastObject,
  Array as CastArray,
  String as CastString,
} from "runtypes"


import {
  MatchLockSelectionConfig
} from "./types";

export const MatchLockSelectionConfigCaster = CastObject({
  roomId: CastString,
  restriction: CastObject({
    name: CastString,
    version: SemVerCaster,
    sha256: Sha256Caster,
  }),
  ownerId: CastString,
  selections: CastRecord(CastString, CastArray(CastString)),
  signatures: CastRecord(CastString, CastString)
}).conform<MatchLockSelectionConfig>();
