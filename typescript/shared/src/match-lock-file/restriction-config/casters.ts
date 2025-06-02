
import {
  DateTimeCaster,
  SemVerCaster,
  Sha256Caster,
  URLTypeCaster,
  MagnetURICaster,
  CountCaster,
} from "../util-types";

import {
  Record as CastRecord,
  Object as CastObject,
  Array as CastArray,
  Tuple as CastTuple,
  Literal,
  Union as CastUnion,
  String as CastString,
} from "runtypes"

import {
  MatchLockResolvable,
  MatchLockAsset,
  MatchLockGamePiece,
  MatchLockRestrictionConfig,
} from "./types";


const OwnableIdentificationCaster = {
  id: CastString,
  name: CastString,
  authorId: CastString,
  authorName: CastString,
};

const ResolvableCaster = CastUnion(
  CastObject({
    type: Literal("http"),
    url: URLTypeCaster,
  }),
  CastObject({
    type: Literal("torrent"),
    uri: MagnetURICaster,
  }),
  CastObject({
    type: Literal("git"),
    url: URLTypeCaster,
    ref: CastString.optional(),
  }),
).conform<MatchLockResolvable>();


const MatchLockAssetCaster = CastObject({
  ...OwnableIdentificationCaster,

  assetType: CastString,
  version: SemVerCaster,
  sha256: Sha256Caster,
  sizeBytes: CountCaster,
}).conform<MatchLockAsset>();


export const MatchLockGamePieceCaster = CastObject({
  ...OwnableIdentificationCaster,

  sources: CastArray(ResolvableCaster),

  assets: CastRecord(CastString, CastUnion(
    CastObject({
      source: Literal("internal"),
      definition: MatchLockAssetCaster,
    }),
    CastObject({
      source: Literal("shared"),
      id: CastString,
    }),
  )),
  requiredPieces: CastRecord(CastString, CastArray(CastString)).optional(),
}).conform<MatchLockGamePiece>();


export const MatchLockRestrictionConfigCaster = CastObject({
  name: CastString,
  version: SemVerCaster,
  sha256: Sha256Caster,

  published: DateTimeCaster,

  signature: CastString,
  signatureVerificationUrl: URLTypeCaster,

  engine: CastObject({
    name: CastString,
    version: CastString,
    assetDefinitions: CastRecord(CastString, CastObject({
      classification: CastUnion(Literal("logic"), Literal("media"))
    })),
    pieceDefinitions: CastRecord(CastString, CastObject({
      assets: CastRecord(CastString, CastObject({
        count: CastUnion(
          CountCaster,
          Literal("*"),
          CastTuple(CountCaster, CastUnion(CountCaster, Literal("*")))
        )
      }))
    })),
  }),

  pieces: CastRecord(CastString, CastObject({
    type: CastUnion(
      Literal("mandatory"),
      Literal("selectable"),
      Literal("on-demand"),
    ),
    pieceDefinition: CastString,
    pieces: CastArray(MatchLockGamePieceCaster),
  })),
  sharedAssets: CastRecord(CastString, CastObject({
    definition: MatchLockAssetCaster,
    sources: CastArray(ResolvableCaster),
  }))
}).conform<MatchLockRestrictionConfig>();

