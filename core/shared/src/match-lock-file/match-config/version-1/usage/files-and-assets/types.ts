import { RosterLockV1Config } from "../../types";

export type PieceDefinition = RosterLockV1Config["engine"]["pieceDefinitions"][string];

export type EngineAssetDefinition = PieceDefinition["assets"][number];
