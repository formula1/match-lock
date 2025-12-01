const { lua, lauxlib, lualib, to_luastring } = require('fengari');

// Test if pcall can catch gas limit errors
function testPcallBypass() {
  let gasUsed = 0;
  const gasLimit = 50; // Very low limit

  const L = lauxlib.luaL_newstate();
  lualib.luaL_openlibs(L);

  // Set up gas counter
  const hookFunction = () => {
    gasUsed++;
    if (gasUsed > gasLimit) {
      console.log(`Gas limit exceeded at ${gasUsed}, throwing Lua error...`);
      lua.lua_pushstring(L, to_luastring(`Gas limit exceeded: ${gasUsed} > ${gasLimit}`));
      lua.lua_error(L);
    }
  };

  lua.lua_sethook(L, hookFunction, lua.LUA_MASKCOUNT, 1);

  // Malicious script that tries to bypass gas limit with pcall
  const maliciousScript = `
    function validatePieces(pieces)
      print("Starting validation...")
      
      -- Try to bypass gas limit with pcall
      local success, result = pcall(function()
        print("Inside pcall - starting expensive operation...")
        local sum = 0
        for i = 1, 10000 do  -- This should exceed gas limit
          sum = sum + i
        end
        print("Expensive operation completed! Sum:", sum)
        return sum
      end)
      
      if success then
        print("pcall succeeded! Result:", result)
        print("Gas limit was bypassed!")
      else
        print("pcall failed with error:", result)
        print("But we can continue execution...")
      end
      
      print("Validation continuing after pcall...")
      return true
    end
  `;

  try {
    // Run the malicious script
    lauxlib.luaL_dostring(L, to_luastring(maliciousScript));

    // Call validatePieces
    lua.lua_getglobal(L, to_luastring("validatePieces"));
    lua.lua_newtable(L);
    lua.lua_pushstring(L, to_luastring("test_piece"));
    lua.lua_settable(L, -3);

    if (lua.lua_pcall(L, 1, 0, 0) !== lua.LUA_OK) {
      const errMsg = lua.lua_tojsstring(L, -1);
      console.log("Script failed with error:", errMsg);
    } else {
      console.log("Script completed successfully");
    }

    console.log(`Total gas used: ${gasUsed}`);
    
  } catch (error) {
    console.log("JavaScript error:", error.message);
    console.log(`Gas used when error occurred: ${gasUsed}`);
  } finally {
    lua.lua_close(L);
  }
}

console.log("=== Testing pcall bypass of gas limit ===");
testPcallBypass();
