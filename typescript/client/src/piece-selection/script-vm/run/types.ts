import { ScriptWithPieceMeta } from "@match-lock/shared";
import { ValidatorArgs, AlgorithmArgs } from "../shared/function-types";

export type ScriptInput = (
  | { type: "validation", scriptConfig: ScriptWithPieceMeta<any>, args: ValidatorArgs }
  | { type: "player-choices", scriptConfig: ScriptWithPieceMeta<any>, args: AlgorithmArgs }
  | { type: "global-choices", scriptConfig: ScriptWithPieceMeta<any>, args: AlgorithmArgs }
);
