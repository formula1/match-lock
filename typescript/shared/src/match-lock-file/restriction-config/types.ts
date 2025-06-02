
import {
  CollectionId,
  PieceType, PieceId,
  AssetType, AssetId,
} from "../config-types";
import {
  SignedContent,
  DateTime,
  SemVer,
  Sha256,
  URLType,
  MagnetUri,
  Count,
  FilePath,
} from "../util-types";

export type MatchLockResolvable = (
  | { type: "http"; url: URLType }
  | { type: "torrent"; uri: MagnetUri }
  | { type: "git"; url: URLType; ref?: string }
);


export type MatchLockAsset = {
  id: AssetId,
  name: string,
  authorId: string,
  authorName: string,

  assetType: string,
  version: SemVer,
  sha256: Sha256,
  sizeBytes: Count,
};

export type MatchLockGamePiece = {
  id: PieceId,
  name: string,
  authorId: string,
  authorName: string,

  sources: MatchLockResolvable[],

  assets: Record<FilePath, (
    | { source: "internal", definition: MatchLockAsset }
    | { source: "shared", id: AssetId }
  )>,

  // This is meant to load "on-demand" pieces
  requiredPieces?: Record<CollectionId, PieceId[]>
}


export type MatchLockRestrictionConfig = {
  name: string,
  version: SemVer,
  published: DateTime,

  sha256: Sha256,
  signature: SignedContent,
  signatureVerificationUrl: URLType,

  engine: {
    name: string,
    version: string,
    assetDefinitions: Record<AssetType, { classification: "logic" | "media" }>
    pieceDefinitions: Record<PieceType, {
      assets: Record<AssetType, { count: Count | "*" | [Count, Count | "*"] }> 
    }>,
  },

  pieces: Record<CollectionId, {
    type: "mandatory" | "selectable" | "on-demand",
    pieceDefinition: PieceType,
    pieces: MatchLockGamePiece[]
  }>
  sharedAssets: Record<AssetId, {
    definition: MatchLockAsset,
    sources: MatchLockResolvable[]
  }>
}

