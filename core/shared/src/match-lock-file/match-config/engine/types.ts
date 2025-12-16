
import {
  PieceType,
  AssetType,
} from "../../config-types";
import {
  Count,
} from "../../util-types";


export type MatchLockEngineConfig = {
  name: string,
  version: string,
  pieceDefinitions: Record<PieceType, {
    selectionStrategy: MatchLockEngineSelectionStrategy,
    requires: Array<PieceType>
    pathVariables: Array<string>,
    assets: Array<MatchLockEngineAssetDefinition>
  }>
}

export type AssetClassification = "logic" | "media" | "doc";
export type MatchLockEngineAssetDefinition = {
  name: string,
  classification: AssetClassification,
  count: Count | "*" | [Count, Count | "*"]
  glob: Array<string>,
}

export type MatchLockEngineSelectionStrategy = (
  | "mandatory"
  | "personal"
  | "shared"
  | "on demand"
)
