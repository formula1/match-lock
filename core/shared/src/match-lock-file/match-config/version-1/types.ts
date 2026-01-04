import { MatchLockEngineConfig } from "./engine/types";
import { RosterLockPiece } from "./rosters/types";
import { RosterLockSelectionConfig } from "./selection/types";

export type RosterLockV1Config = {
  version: 1,
  engine: MatchLockEngineConfig,
  rosters: Record<string, Array<RosterLockPiece>>,
  selection: RosterLockSelectionConfig,
}
