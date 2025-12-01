
import { ScriptWithPieceMeta } from "@match-lock/shared";
// @ts-ignore - fengari doesn't have types
import { lua, lauxlib, to_luastring } from "fengari";
import { getPieceMeta } from "../../../../piece-selection/script-vm/shared/getPieceMeta";

export function luaGetPieceMeta(
  L: ReturnType<typeof lauxlib.luaL_newstate>, scriptConfig: ScriptWithPieceMeta<any>
){
  lua.lua_pushcfunction(L, (L: any) => {
    const pieceName = lua.lua_tojsstring(L, 1);

    const meta = getPieceMeta(scriptConfig, pieceName);

    // Return Lua table
    lua.lua_newtable(L);
    for(const [key, value] of Object.entries(meta)){
      // Security check: Detect and reject Promises
      if (value instanceof Promise) {
        lua.lua_pushstring(L, to_luastring(`Async operations not supported in validator: ${key} returned a Promise`));
        lua.lua_error(L);
        return 0;
      }

      lua.lua_pushstring(L, to_luastring(key));
      switch(typeof value){
        case "boolean":
          lua.lua_pushboolean(L, value);
          break;
        case "number":
          lua.lua_pushnumber(L, value);
          break;
        case "string":
          lua.lua_pushstring(L, to_luastring(value));
          break;
        default:
          // Throw a Lua error instead of JavaScript error
          lua.lua_pushstring(L, to_luastring(`Invalid Type ${typeof value} for key ${key}`));
          lua.lua_error(L);
          return 0; // This line won't be reached, but TypeScript needs it
      }
      lua.lua_settable(L, -3);
    }

    return 1; // one return value
  });
  lua.lua_setglobal(L, to_luastring("getPieceMeta"));
}
