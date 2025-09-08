import { PieceId, ScriptWithPieceMeta, UserId } from "@match-lock/shared";

import {
  Object as CastObject,
  Array as CastArray,
  String as CastString,
  Record as CastRecord
} from "runtypes";

export type ValidatorArgs = { pieceIds: Array<string> };
export const ValidatorArgsCaster = CastObject({
  pieceIds: CastArray(CastString),
});

export type AlgorithmArgs = {
  pieceIds: Array<string>,
  playerChoices: Record<UserId, Array<PieceId>>,
  playerSeeds: Record<UserId, string>
};
export const AlgorithmArgsCaster = CastObject({
  pieceIds: CastArray(CastString),
  playerChoices: CastRecord(CastString, CastArray(CastString)),
  playerSeeds: CastRecord(CastString, CastString),
});

