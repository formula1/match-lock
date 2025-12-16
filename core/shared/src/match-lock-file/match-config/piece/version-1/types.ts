
type Sha256 = string;
type URLType = string;

import { MatchLockEngineConfig } from "../../engine";
export { MatchLockEngineConfig };
export type RosterLockEngineWithRoster = {
  engine: MatchLockEngineConfig,
  pieces: Record<string, Array<RosterLockPiece>>,
}

export type RosterLockPiece = {
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
