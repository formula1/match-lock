import { lua, lauxlib, to_luastring } from "fengari";

export interface GasTracker {
  getGasUsed: () => number;
  isGasExceeded: () => boolean;
  shouldTerminate: () => boolean;
}

export function luaHookGas(
  L: ReturnType<typeof lauxlib.luaL_newstate>, gasLimit: number
): GasTracker {
  let gasUsed = 0;
  let gasExceeded = false;

  // Set up gas counter using lua_sethook
  const hookFunction = () => {
    gasUsed++;
    if (gasUsed > gasLimit) {
      gasExceeded = true;
      // Raise a Lua error to stop execution
      lua.lua_pushstring(L, to_luastring(`Gas limit exceeded: ${gasUsed} > ${gasLimit}`));
      lua.lua_error(L);
    }
  };

  // Set hook to count every instruction
  lua.lua_sethook(L, hookFunction, lua.LUA_MASKCOUNT, 1);

  return {
    getGasUsed: () => gasUsed,
    isGasExceeded: () => gasExceeded,
    shouldTerminate: () => gasExceeded
  };
}