const { lua, lauxlib, lualib, to_luastring } = require('fengari');

// Test the practical implications of Promise handling
function testPromiseImplications() {
  console.log("=== Promise Handling Implications ===\n");

  const L = lauxlib.luaL_newstate();
  lualib.luaL_openlibs(L);

  // Scenario 1: Function that might return a Promise (bad)
  console.log("1. Function that accidentally returns Promise:");
  lua.lua_pushcfunction(L, (L) => {
    // Simulate an async operation that returns a Promise
    const asyncResult = fetch('https://api.example.com/data'); // This returns a Promise
    
    // If we accidentally return the Promise, Lua gets userdata
    lua.lua_pushlightuserdata(L, asyncResult);
    return 1;
  });
  lua.lua_setglobal(L, to_luastring("badAsyncFunction"));

  // Scenario 2: Function that properly handles async (good)
  console.log("\n2. Function that properly handles async:");
  lua.lua_pushcfunction(L, (L) => {
    // We can't await here, but we can return a default/cached value
    // or throw an error to indicate async operations aren't supported
    
    lua.lua_pushstring(L, to_luastring("Sync result only"));
    return 1;
  });
  lua.lua_setglobal(L, to_luastring("goodSyncFunction"));

  // Scenario 3: Function that detects and rejects Promises
  console.log("\n3. Function that detects Promises:");
  lua.lua_pushcfunction(L, (L) => {
    const someValue = Math.random() > 0.5 ? "sync value" : Promise.resolve("async value");
    
    if (someValue instanceof Promise) {
      // Throw Lua error for Promises
      lua.lua_pushstring(L, to_luastring("Error: Async operations not supported in validator"));
      lua.lua_error(L);
      return 0;
    }
    
    lua.lua_pushstring(L, to_luastring(someValue));
    return 1;
  });
  lua.lua_setglobal(L, to_luastring("promiseDetector"));

  // Test script
  const testScript = `
    print("Testing Promise implications...")
    
    print("\\n1. Calling badAsyncFunction:")
    local result1 = badAsyncFunction()
    print("   Type:", type(result1))
    print("   Can we use it as string?", tostring(result1))
    print("   Can we use it as number?", tonumber(result1))
    
    print("\\n2. Calling goodSyncFunction:")
    local result2 = goodSyncFunction()
    print("   Type:", type(result2))
    print("   Value:", result2)
    
    print("\\n3. Calling promiseDetector (may error):")
    local success, result3 = pcall(promiseDetector)
    if success then
      print("   Success! Value:", result3)
    else
      print("   Error caught:", result3)
    end
  `;

  try {
    // First remove pcall to test without protection
    lua.lua_pushnil(L);
    lua.lua_setglobal(L, to_luastring("pcall"));
    
    console.log("Running test script...");
    const result = lauxlib.luaL_dostring(L, to_luastring(testScript));
    
    if (result === lua.LUA_OK) {
      console.log("\nScript completed successfully");
    } else {
      const errMsg = lua.lua_tojsstring(L, -1);
      console.log("Script failed:", errMsg);
    }
    
  } catch (error) {
    console.log("JavaScript error:", error.message);
  } finally {
    lua.lua_close(L);
  }
}

// Test what happens with different return types
function testReturnTypes() {
  console.log("\n\n=== Testing Different Return Types ===\n");

  const L = lauxlib.luaL_newstate();
  lualib.luaL_openlibs(L);

  // Function that returns various types
  lua.lua_pushcfunction(L, (L) => {
    const arg = lua.lua_tojsstring(L, 1);
    
    switch(arg) {
      case "string":
        lua.lua_pushstring(L, to_luastring("Hello"));
        break;
      case "number":
        lua.lua_pushnumber(L, 42);
        break;
      case "boolean":
        lua.lua_pushboolean(L, true);
        break;
      case "nil":
        lua.lua_pushnil(L);
        break;
      case "table":
        lua.lua_newtable(L);
        lua.lua_pushstring(L, to_luastring("key"));
        lua.lua_pushstring(L, to_luastring("value"));
        lua.lua_settable(L, -3);
        break;
      case "promise":
        // This is what we want to avoid!
        lua.lua_pushlightuserdata(L, Promise.resolve("bad"));
        break;
      case "function":
        lua.lua_pushcfunction(L, (L) => {
          lua.lua_pushstring(L, to_luastring("nested function result"));
          return 1;
        });
        break;
      default:
        lua.lua_pushstring(L, to_luastring("unknown"));
    }
    
    return 1;
  });
  lua.lua_setglobal(L, to_luastring("getType"));

  const typeTestScript = `
    local types = {"string", "number", "boolean", "nil", "table", "promise", "function"}
    
    for _, typename in ipairs(types) do
      print("\\nTesting type:", typename)
      local result = getType(typename)
      print("  Lua type:", type(result))
      print("  Value:", tostring(result))
      
      if type(result) == "function" then
        local funcResult = result()
        print("  Function returned:", funcResult)
      elseif type(result) == "table" then
        for k, v in pairs(result) do
          print("  Table entry:", k, "=", v)
        end
      end
    end
  `;

  try {
    console.log("Running type test script...");
    const result = lauxlib.luaL_dostring(L, to_luastring(typeTestScript));
    
    if (result === lua.LUA_OK) {
      console.log("\nType test completed successfully");
    } else {
      const errMsg = lua.lua_tojsstring(L, -1);
      console.log("Type test failed:", errMsg);
    }
    
  } catch (error) {
    console.log("JavaScript error in type test:", error.message);
  } finally {
    lua.lua_close(L);
  }
}

// Run tests
testPromiseImplications();
testReturnTypes();
