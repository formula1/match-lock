
import {
  PieceType,
  AssetType,
} from "../../config-types";
import {
  Count,
} from "../../util-types";

export type AssetClassification = "logic" | "media" | "doc";

export type MatchLockEngineConfig = {
  name: string,
  version: string,
  pieceDefinitions: Record<PieceType, {
    assets: Record<AssetType, {
      classification: AssetClassification,
      count: Count | "*" | [Count, Count | "*"]
    }>
  }>
}
