
import { PieceId, ScriptWithPieceMeta, UserId } from "@match-lock/shared";
import { ValidatorArgs, AlgorithmArgs } from "./arg-types";

export type ValidationScript = (
  scriptConfig: ScriptWithPieceMeta<any>,
  args: ValidatorArgs
)=>any;

type MaybePromise<T> = T | Promise<T>;

export type AlgorithmScriptGlobal = (
  scriptConfig: ScriptWithPieceMeta<any>,
  args: AlgorithmArgs
)=>MaybePromise<Array<PieceId>>

export type AlgorithmScriptPlayer = (
  scriptConfig: ScriptWithPieceMeta<any>,
  args: AlgorithmArgs
)=>MaybePromise<Record<UserId, Array<PieceId>>>

