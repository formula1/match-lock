const { lua, lauxlib, lualib, to_luastring } = require('fengari');

// Test that removing pcall prevents gas limit bypass
function testPcallRemoved() {
  let gasUsed = 0;
  const gasLimit = 100;

  const L = lauxlib.luaL_newstate();
  lualib.luaL_openlibs(L);

  // Remove pcall and xpcall to prevent gas limit bypass
  lua.lua_pushnil(L);
  lua.lua_setglobal(L, to_luastring("pcall"));
  lua.lua_pushnil(L);
  lua.lua_setglobal(L, to_luastring("xpcall"));

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

  // Test script that tries to use pcall (should fail)
  const testScript = `
    print("Testing script with pcall removed...")
    
    -- Check if pcall exists
    if pcall then
      print("ERROR: pcall is still available!")
    else
      print("GOOD: pcall has been removed")
    end
    
    -- Try to use pcall anyway (should cause error)
    print("Attempting to call pcall...")
    local success, result = pcall(function()
      print("This should not execute")
      return "bad"
    end)
    
    print("This line should not be reached")
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

console.log("=== Testing with pcall removed ===");
testPcallRemoved();

// Also test a script that tries to bypass gas limit without pcall
function testGasLimitWithoutPcall() {
  console.log("\n=== Testing gas limit without pcall ===");
  
  let gasUsed = 0;
  const gasLimit = 50;

  const L = lauxlib.luaL_newstate();
  lualib.luaL_openlibs(L);

  // Remove pcall and xpcall
  lua.lua_pushnil(L);
  lua.lua_setglobal(L, to_luastring("pcall"));
  lua.lua_pushnil(L);
  lua.lua_setglobal(L, to_luastring("xpcall"));

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

  // Script that should hit gas limit
  const expensiveScript = `
    print("Starting expensive operation...")
    local sum = 0
    for i = 1, 1000 do
      sum = sum + i
    end
    print("This should not be reached - sum:", sum)
  `;

  try {
    console.log("Running expensive script...");
    const result = lauxlib.luaL_dostring(L, to_luastring(expensiveScript));
    
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

testGasLimitWithoutPcall();
