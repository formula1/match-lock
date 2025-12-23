
type Sha256 = string;
type URLType = string;

import { MatchLockEngineConfig } from "../../engine";
export { MatchLockEngineConfig };
export type RosterLockEngineWithRosterConfig = {
  engine: MatchLockEngineConfig,
  rosters: Record<string, Array<RosterLockPiece>>,
}

export type RosterLockPiece = {
  id: string,
  version: {
    logic: Sha256,
    media: Sha256,
    docs: Sha256,
  },
  humanInfo: {
    name: string,
    author: string,
    url: URLType,
    image?: URLType,
  }
  downloadSources: Array<DownloadableSource>,
  pathVariables: Record<string, string>,
  requiredPieces: Record<string, {
    expected: Array<Sha256>,
    selectable: boolean,
  }>,
}

type DownloadableSource = string;

export type RosterLockPieceMetadata = (
  & { rosterlockVersion: ""}
  & Omit<RosterLockPiece, "id" | "version" | "requiredPieces">
)
