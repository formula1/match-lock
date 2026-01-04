import {
  DateTimeCaster,
  SemVerCaster,
  Sha256Caster,
  URLTypeCaster,
  MagnetURICaster,
  CountCaster,
} from "./util-casters";

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
  MatchLockPublishPiece,
  MatchLockScanPiece,
} from "../types";


const OwnableIdentificationCaster = {
  name: CastString,
  author: CastString,
  published: DateTimeCaster,
  preview: CastObject({
    image: URLTypeCaster,
    url: URLTypeCaster,
  }),
  sha256: Sha256Caster,
  signature: CastString,
  signatureVerificationUrl: URLTypeCaster,
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

import { validatePathVariableName } from "../../../version-1/engine";
import { validatePathVariableValue } from "../validate/definition/pathVariables";
const AssetScanCaster = {
  pieceDefinition: CastString,
  version: CastObject({
    logic: Sha256Caster,
    media: Sha256Caster,
  }),
  pathVariables: CastRecord(
    CastString.withConstraint((variableName)=>{
      try {
        validatePathVariableName(variableName);
        return true;
      }catch(e){
        return (e as Error).message;
      }
    }),
    CastString.withConstraint((variableValue)=>{
      try {
        validatePathVariableValue(variableValue);
        return true;
      }catch(e){
        return (e as Error).message;
      }
    })
  ),
  assets: CastRecord(CastString, CastObject({
    assetType: CastString,
    sha256: Sha256Caster,
    sizeBytes: CountCaster,
  })),
}

export const MatchLockPublishPieceCaster = CastObject({
  ...OwnableIdentificationCaster,
  ...AssetScanCaster,

  sources: CastArray(ResolvableCaster),
}).conform<MatchLockPublishPiece>();

export const MatchLockScanPieceCaster = (
  CastObject(AssetScanCaster).conform<MatchLockScanPiece>()
);
