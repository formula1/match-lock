import {
  UserId, PieceId,
  ScriptWithPieceMeta
} from "@match-lock/shared";

import { lua, lauxlib, lualib, to_luastring } from "fengari";

import { removeDangerous } from "./utils/removeDangerous";
import { luaHookGas } from "./utils/hookGas";
import { luaGetPieceMeta } from "./utils/getPieceMeta";
import { luaRandom } from "./utils/random";
import { LuaError } from "./utils/error";
import { pieceArray, playerPieceMap } from "./utils/algorithmResult";
import { preparePieceList, preparePlayerChoices } from "./utils/arguments";


import {
  ChoiceAlgorithmScriptGlobalPieces,
  ChoiceAlgorithmScriptPlayerPieces
} from "../shared/function-types";

export const runChoiceAlgorithmGlobal: ChoiceAlgorithmScriptGlobalPieces = function(
  scriptConfig, { pieceIds, playerChoices, playerSeeds }
){
  const { L } = runChoiceAlgorithm(scriptConfig, { pieceIds, playerChoices, playerSeeds });
  return pieceArray(L);
}

export const runChoiceAlgorithmPlayer: ChoiceAlgorithmScriptPlayerPieces = function(
  scriptConfig, { pieceIds, playerChoices, playerSeeds }
){
  const { L } = runChoiceAlgorithm(scriptConfig, { pieceIds, playerChoices, playerSeeds });
  return playerPieceMap(L);
}

export const runChoiceAlgorithm = function(
  scriptConfig, { pieceIds, playerChoices, playerSeeds }
){
  const gasLimit = 400_000;

  const L = lauxlib.luaL_newstate();
  lualib.luaL_openlibs(L);

  removeDangerous(L);

  const gasTracker = luaHookGas(L, gasLimit);

  luaGetPieceMeta(L, scriptConfig);
  luaRandom(L, playerSeeds);

  // Run script
  lauxlib.luaL_dostring(L, to_luastring(scriptConfig.script.content));

  // Prepare pieces array
  lua.lua_getglobal(L, to_luastring("runAlgorithm"));
  if (lua.lua_type(L, -1) !== lua.LUA_TFUNCTION) {
    throw new Error("runAlgorithm is not defined in the script!");
  }

  preparePieceList(L, pieceIds);

  preparePlayerChoices(L, playerChoices);


  if (lua.lua_pcall(L, 2, 1, 0) !== lua.LUA_OK) {
    const errorMessage = lua.lua_tojsstring(L, -1);
    console.error("Algorithm failed:", errorMessage);
    throw new LuaError(errorMessage, gasTracker.getGasUsed());
  }

  console.log("Validation succeeded:", { gasUsed: gasTracker.getGasUsed() });
  return { L };
}



