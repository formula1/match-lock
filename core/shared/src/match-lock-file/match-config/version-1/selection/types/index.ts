
import { PieceType } from "./shared";
import { GasLimittedScript } from "./script";
import { SelectionPreselectedConfig } from "./selection-types/preselected";
import { SelectionGameControlledConfig } from "./selection-types/game-controlled";
import { SelectionNormalConfig } from "./selection-types/normal";

export {
  SelectionPreselectedConfig,
  SelectionGameControlledConfig,
  SelectionNormalConfig,
}

export { GasLimittedScript }

export type RosterLockSelectionConfig = {
  piece: Record<PieceType, (
    | SelectionGameControlledConfig
    | SelectionNormalConfig
    | SelectionPreselectedConfig
  )>,
  globalValidation?: Array<GasLimittedScript>
}


