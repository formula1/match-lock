
import {
  PieceType,
} from "../../config-types";


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
  count: number | "*" | [number, number | "*"]
  glob: Array<string>,
}

export type MatchLockEngineSelectionStrategy = (
  | "mandatory"
  | "personal"
  | "shared"
  | "on demand"
)
