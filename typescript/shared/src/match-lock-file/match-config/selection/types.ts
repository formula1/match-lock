
import {
  PieceId,
} from "../../config-types";

import { Count } from "../../util-types";

import { JSON_Primitive } from "../../../utils/JSON";

export type GasLimittedScript = {
  type: "text/typescript" | "text/javascript" | "text/lua",
  content: string,
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
  | {
    type: "choice",
    count: Count | [Count, Count],
    unique: boolean,
    customValidation?: Array<ScriptWithPieceMeta<any>>
  }
  // An algorithm chooses the pieces requiring only the user's to provide their random seed
  | {
    type: "algorithm",
    algorithm: {
      script: ScriptWithPieceMeta<any>
      expectedResult: "global" | "player"
    }
  }
  // The users input their choices but an algorithm chooses the final result
  | {
    type: "choice-algorithm",
    count: Count | [Count, Count],
    unique: boolean,
    customValidation?: Array<ScriptWithPieceMeta<any>>
    algorithm: {
      script: ScriptWithPieceMeta<any>
      expectedResult: "global" | "player"
    }
  }
  // The users input their choices and a random piece is chosen from the list
  // Technically this can be done through a custom algorithm
  // I'm unsure if the scripts are going to run properly so this might have to be seperate
  | {
    type: "democracy-random",
    count: Count | [Count, Count],
    unique: boolean,
    customValidation?: Array<ScriptWithPieceMeta<any>>,
  }
)
