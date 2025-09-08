// Remove dangerous functions to prevent gas limit bypass and other security issues
const dangerousFunctions = [
  "pcall",      // Protected call - can catch gas limit errors
  "xpcall",     // Extended protected call - can catch gas limit errors
  "loadstring", // Can execute arbitrary code
  "load",       // Can execute arbitrary code
  "dofile",     // Can read/execute files
  "loadfile",   // Can read/execute files
  "require",    // Can load modules
  "module",     // Can create modules
  "getfenv",    // Can access function environments
  "setfenv",    // Can modify function environments
  "rawget",     // Can bypass metamethods
  "rawset",     // Can bypass metamethods
  "rawequal",   // Can bypass metamethods
  "rawlen",     // Can bypass metamethods
  "debug"       // Debug library access
];

import { lua, lauxlib, to_luastring } from "fengari";
export function removeDangerous(
  L: ReturnType<typeof lauxlib.luaL_newstate>
){
  dangerousFunctions.forEach(funcName => {
    lua.lua_pushnil(L);
    lua.lua_setglobal(L, to_luastring(funcName));
  });
}
