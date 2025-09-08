
import { ScriptWithPieceMeta } from "@match-lock/shared";

import { lua, lauxlib, lualib, to_luastring } from "fengari";

import { removeDangerous } from "./utils/removeDangerous";
import { luaHookGas } from "./utils/hookGas";
import { luaGetPieceMeta } from "./utils/getPieceMeta";
import { preparePieceList } from "./utils/arguments";
import { LuaError } from "./utils/error";

import { ValidationScript } from "../../../piece-selection/script-vm/shared/function-types";

export const runValidator: ValidationScript = function(
  scriptConfig, { pieceIds }
){
  const gasLimit = 400_000;

  const L = lauxlib.luaL_newstate();
  lualib.luaL_openlibs(L);

  removeDangerous(L);

  const gasTracker = luaHookGas(L, gasLimit);

  luaGetPieceMeta(L, scriptConfig);

  // Run script
  lauxlib.luaL_dostring(L, to_luastring(scriptConfig.script.content));

  // Prepare pieces array
  lua.lua_getglobal(L, to_luastring("validatePieces"));
  if (lua.lua_type(L, -1) !== lua.LUA_TFUNCTION) {
    throw new Error("validatePieces is not defined in the script!");
  }

  preparePieceList(L, pieceIds);

  if (lua.lua_pcall(L, 1, 0, 0) !== lua.LUA_OK) {
    const errorMessage = lua.lua_tojsstring(L, -1) || "Unknown error";
    console.error("Validation failed:", errorMessage);
    throw new LuaError(errorMessage, gasTracker.getGasUsed());
  }

  // Success case
  console.log("Validation succeeded:", { gasUsed: gasTracker.getGasUsed() });
}

