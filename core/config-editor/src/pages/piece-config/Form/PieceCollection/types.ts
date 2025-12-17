import { RosterLockEngineWithRosterConfig } from "@match-lock/shared";

export type PieceDefinition = RosterLockEngineWithRosterConfig["engine"]["pieceDefinitions"][string];
export type PieceValue = RosterLockEngineWithRosterConfig["pieces"][string][number];
