
import {
  CollectionId,
  PieceType, PieceId,
} from "../../../config-types";
import {
  DateTime,
  Sha256,
  URLType,
  SemVer,
  SignedContent,
} from "../pieces/caster-runtypes/util-casters";

import { MatchLockEngineConfig } from "../../engine";
import { MatchLockSelectionConfig } from "../../selection";
import { MatchLockPublishPiece } from "../../piece";

export type MatchLockRestrictionPiece = (
  MatchLockPublishPiece & {
    id: PieceId,
    requiredPieces?: Record<CollectionId, Array<PieceId>>
  }
);

export type MatchLockRestrictionConfig = {
  name: string,
  version: SemVer,
  published: DateTime,

  sha256: Sha256,
  signature: SignedContent,
  signatureVerificationUrl: URLType,

  engine: MatchLockEngineConfig,

  pieces: Record<CollectionId, {
    selectionConfig: MatchLockSelectionConfig,
    pieceDefinition: PieceType,
    pieces: Array<MatchLockRestrictionPiece>
  }>
}

