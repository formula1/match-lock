import { lua, lauxlib } from "fengari";

export function pieceArray(
  L: ReturnType<typeof lauxlib.luaL_newstate>
){
  // Now result table is on stack
  const result: Array<string> = [];
  lua.lua_pushnil(L); // First key
  while (lua.lua_next(L, -2) !== 0) {
    // key at -2, value at -1
    const value = lua.lua_tojsstring(L, -1);
    if(typeof value !== "string"){
      throw new Error("Invalid type in result array");
    }
    result.push(value);

    lua.lua_pop(L, 1); // Pop value, keep key
  }

  lua.lua_pop(L, 1); // Pop the table itself

  return result;
}

export function playerPieceMap(
  L: ReturnType<typeof lauxlib.luaL_newstate>
){
  // Now result table is on stack
  const resultRecord: Record<string, string[]> = {};

  lua.lua_pushnil(L); // First key
  while (lua.lua_next(L, -2) !== 0) {
    const key = lua.lua_tojsstring(L, -2);
    if(typeof key !== "string"){
      throw new Error("Invalid key in result");
    }

    // Value should be a table (array)
    const array: string[] = [];
    lua.lua_pushnil(L);
    while (lua.lua_next(L, -2) !== 0) {
      const value = lua.lua_tojsstring(L, -1);
      if(typeof value !== "string"){
        throw new Error("Invalid value in result");
      }
      array.push(value);
      lua.lua_pop(L, 1);
    }

    resultRecord[key] = array;

    lua.lua_pop(L, 1); // Pop inner table
  }

  lua.lua_pop(L, 1); // Pop the result table

  return resultRecord;
}
