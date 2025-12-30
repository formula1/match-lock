import { RosterLockV1Config } from "@match-lock/shared";

export type PieceDefinition = RosterLockV1Config["engine"]["pieceDefinitions"][string];
export type PieceValue = RosterLockV1Config["rosters"][string][number];
