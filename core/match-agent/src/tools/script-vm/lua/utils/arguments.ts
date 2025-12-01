
import { PieceId, UserId } from "@match-lock/shared";
import { lua, lauxlib, to_luastring } from "fengari";

export function preparePieceList(
  L: ReturnType<typeof lauxlib.luaL_newstate>,
  pieceIds: Array<PieceId>
){
  lua.lua_newtable(L);
  for(let i = 0; i < pieceIds.length; i++){
    lua.lua_pushinteger(L, i + 1); // Lua is 1-based
    lua.lua_pushstring(L, to_luastring(pieceIds[i]));
    lua.lua_settable(L, -3);
  }
}

export function preparePlayerChoices(
  L: ReturnType<typeof lauxlib.luaL_newstate>,
  choices: Record<UserId, Array<PieceId>>
){
  lua.lua_newtable(L);
  for (const [userId, pieces] of Object.entries(choices)) {
    lua.lua_pushstring(L, to_luastring(userId));

    // Inner array table
    lua.lua_newtable(L);
    for (let i = 0; i < pieces.length; i++) {
      lua.lua_pushinteger(L, i + 1); // Lua is 1-based
      lua.lua_pushstring(L, to_luastring(pieces[i]));
      lua.lua_settable(L, -3);
    }

    // Set inner array table into outer table
    lua.lua_settable(L, -3);
  }
}
