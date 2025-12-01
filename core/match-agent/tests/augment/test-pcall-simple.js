const { lua, lauxlib, lualib, to_luastring } = require('fengari');

// Simple test to see if pcall can catch our gas limit errors
function testPcallSimple() {
  let gasUsed = 0;
  const gasLimit = 100;

  const L = lauxlib.luaL_newstate();
  lualib.luaL_openlibs(L);

  // Set up gas counter
  const hookFunction = () => {
    gasUsed++;
    if (gasUsed > gasLimit) {
      console.log(`Gas limit exceeded at ${gasUsed}`);
      lua.lua_pushstring(L, to_luastring(`Gas limit exceeded: ${gasUsed} > ${gasLimit}`));
      lua.lua_error(L);
    }
  };

  lua.lua_sethook(L, hookFunction, lua.LUA_MASKCOUNT, 1);

  // Test script with pcall
  const testScript = `
    print("Testing pcall with gas limit...")
    
    local success, result = pcall(function()
      print("Inside pcall - starting loop...")
      local sum = 0
      for i = 1, 1000 do
        sum = sum + i
      end
      print("Loop completed, sum:", sum)
      return sum
    end)
    
    print("pcall returned:", success, result)
    
    if success then
      print("SUCCESS: pcall completed without error")
    else
      print("FAILED: pcall caught error:", result)
    end
    
    print("Script continuing after pcall...")
  `;

  try {
    console.log("Running test script...");
    const result = lauxlib.luaL_dostring(L, to_luastring(testScript));
    
    if (result === lua.LUA_OK) {
      console.log("Script completed successfully");
    } else {
      const errMsg = lua.lua_tojsstring(L, -1);
      console.log("Script failed:", errMsg);
    }
    
  } catch (error) {
    console.log("JavaScript caught error:", error.message);
  } finally {
    console.log(`Final gas used: ${gasUsed}`);
    lua.lua_close(L);
  }
}

testPcallSimple();
