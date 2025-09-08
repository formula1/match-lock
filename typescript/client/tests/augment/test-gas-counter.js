// Direct test without compilation - using fengari directly
const { lua, lauxlib, lualib, to_luastring } = require('fengari');

// Simplified version of the gas counter implementation
function runValidator(pieceIds, scriptConfig, options = {}) {
  const gasLimit = options.gasLimit ?? 10000;
  let gasUsed = 0;
  let gasExceeded = false;

  const L = lauxlib.luaL_newstate();
  lualib.luaL_openlibs(L);

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

  try {
    // Set getPieceMeta global (simplified)
    lua.lua_pushcfunction(L, (L) => {
      // Return empty table for simplicity
      lua.lua_newtable(L);
      return 1;
    });
    lua.lua_setglobal(L, to_luastring("getPieceMeta"));

    // Run script
    lauxlib.luaL_dostring(L, to_luastring(scriptConfig.script.content));

    // Prepare pieces array
    lua.lua_getglobal(L, to_luastring("validatePieces"));
    if (lua.lua_type(L, -1) !== lua.LUA_TFUNCTION) {
      throw new Error("validatePieces is not defined in the script!");
    }

    lua.lua_newtable(L);
    for(let i = 0; i < pieceIds.length; i++){
      lua.lua_pushinteger(L, i + 1); // Lua is 1-based
      lua.lua_pushstring(L, to_luastring(pieceIds[i]));
      lua.lua_settable(L, -3);
    }

    if (lua.lua_pcall(L, 1, 0, 0) !== lua.LUA_OK) {
      const errMsg = lua.lua_tojsstring(L, -1);
      console.error("Validation failed:", errMsg);
      throw new Error(errMsg);
    }

    // Success case
    return {
      success: true,
      gasUsed,
      error: undefined
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Check if it was a gas limit error
    if (gasExceeded || errorMessage.includes("Gas limit exceeded")) {
      return {
        success: false,
        gasUsed,
        error: `Gas limit exceeded: used ${gasUsed} instructions (limit: ${gasLimit})`
      };
    }

    // Other validation errors
    return {
      success: false,
      gasUsed,
      error: errorMessage
    };
  } finally {
    // Clean up the Lua state
    lua.lua_close(L);
  }
}

// Test script that should use minimal gas
const simpleScript = {
  script: { content: `
    function validatePieces(pieces)
      if #pieces > 0 then
        return true
      end
      return false
    end
  ` },
  scriptMeta: {
    defaultValue: {},
    pieceValues: {}
  }
};

// Test script that should exceed gas limit
const expensiveScript = {
  script: { content: `
    function validatePieces(pieces)
      local sum = 0
      for i = 1, 1000 do
        for j = 1, 100 do
          sum = sum + i * j
        end
      end
      return sum > 0
    end
  ` },
  scriptMeta: {
    defaultValue: {},
    pieceValues: {}
  }
};

console.log('Testing simple script...');
try {
  const result1 = runValidator(['piece1', 'piece2'], simpleScript, { gasLimit: 1000 });
  console.log('Simple script result:', result1);
} catch (error) {
  console.error('Simple script error:', error.message);
}

console.log('\nTesting expensive script with low gas limit...');
try {
  const result2 = runValidator(['piece1'], expensiveScript, { gasLimit: 100 });
  console.log('Expensive script result:', result2);
} catch (error) {
  console.error('Expensive script error:', error.message);
}

console.log('\nTesting expensive script with high gas limit...');
try {
  const result3 = runValidator(['piece1'], expensiveScript, { gasLimit: 100000 });
  console.log('Expensive script result:', result3);
} catch (error) {
  console.error('Expensive script error:', error.message);
}
