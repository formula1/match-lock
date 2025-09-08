import { lua, lauxlib, to_luastring } from "fengari";
import { UserId } from "@match-lock/shared";
import { createRandomNumberGenerator } from "../../../../piece-selection/script-vm/shared/rng";

export function luaRandom(
  L: ReturnType<typeof lauxlib.luaL_newstate>, playerSeeds: Record<UserId, string>
){
  const randomFloat = createRandomNumberGenerator(playerSeeds);

  lua.lua_pushcfunction(L, (L: any) => {
    const min = lua.lua_tonumber(L, 1);
    const max = lua.lua_tonumber(L, 2);
    const result = randomFloat();
    lua.lua_pushnumber(L, result);
    return 1;
  });
  lua.lua_setglobal(L, to_luastring("randomFloat"));

}