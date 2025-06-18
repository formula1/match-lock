
import {
  PieceId,
} from "../../config-types";

import { Count } from "../../util-types";

import { JSON_Primitive } from "../../../utils/JSON";

export type GasLimittedScript = {
  type: "text/typescript" | "text/javascript" | "text/lua",
  content: string,
}

export type UserSelectionValidation = {
  count: Count | [Count, Count],
  unique: boolean,
  customValidation: Array<ScriptWithPieceMeta<any>>
}

export type ScriptWithPieceMeta<Meta extends Record<string, JSON_Primitive>> = {
  name: string,
  scriptMeta?: {
    defaultValue: Meta,
    pieceValues: Record<PieceId, Partial<Meta>>,
  }
  script: GasLimittedScript,
}

export type MatchLockSelectionConfig = (
  // The pieces must be downloaded ahead of time
  | { type: "mandatory" }
  // These pieces cannot be chosen but instead are required by other pieces 
  | { type: "on-demand" }
  // The users agree on a set of pieces within the game and feed it to the Selection
  // Since the users agree on this, the selection config is expecting the game to validate the choices
  | { type: "agreed" }
  // The user chooses their own pieces
  // an algorithm may or may not run to change the player's choices
  // The algorithm is always considered correct even if the count and uniqueness is not met
  | {
    type: "player-choices"
    validation: UserSelectionValidation,
    algorithm?: ScriptWithPieceMeta<any>
  }
  // The users may or may not input their choices
  // but an algorithm always runs to determine the order and contents of a list
  | {
    type: "global-choices",
    validation?: UserSelectionValidation,
    algorithm: ScriptWithPieceMeta<any>
  }
  // The users input their choices and a random piece is chosen from the list
  // Technically this can be done through a custom algorithm
  // I'm unsure if the scripts are going to run properly so this might have to be seperate
  | {
    type: "democracy-random",
    validation?: UserSelectionValidation,
  }
)
