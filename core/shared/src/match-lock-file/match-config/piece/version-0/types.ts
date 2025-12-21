
import {
  PieceType,
} from "../../../config-types";
import {
  DateTime,
  Sha256,
  URLType,
  MagnetUri,
  Count,
  FilePath,
  SignedContent,
} from "./caster-runtypes/util-casters";

export type MatchLockResolvable = (
  | { type: "http"; url: URLType }
  | { type: "torrent"; uri: MagnetUri }
  | { type: "git"; url: URLType; ref?: string }
);


export type MatchLockAsset = {
  assetType: string,
  sha256: Sha256,
  sizeBytes: Count,
};

export type MatchLockPublishPiece = {
  name: string,
  author: string,

  preview: {
    image: URLType,
    url: URLType,
  },
  sources: MatchLockResolvable[],

} & MatchLockScanPiece


export type MatchLockScanPiece = {
  pieceDefinition: PieceType,
  version: {
    logic: Sha256,
    media: Sha256,
  }
  pathVariables: Record<string, string>,
  assets: Record<FilePath, MatchLockAsset>,
}
