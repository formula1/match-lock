
export const RosterConfigPaths = {
  root: "/roster-config" as const,
  new: "/roster-config/new" as const,
  edit: "/roster-config/:rosterPath" as const,
  test: "/roster-config/:rosterPath/test" as const,
}

import { RosterLockEngineWithRosterConfig } from "@match-lock/shared";
type RosterItem = RosterLockEngineWithRosterConfig["rosters"][string][number];
export const ROSTERCONFIG_ID = {
  pieceTypeId: (pieceName: string) => `roster-piece-id-${pieceName}`,
  pieceValueId: (value: RosterItem) => `roster-piece-value-${value.version.logic}-${value.version.media}-${value.version.docs}`,
}
