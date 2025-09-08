const { lua, lauxlib, lualib, to_luastring } = require('fengari');

// Test how fengari handles Promises returned from JavaScript functions
function testPromiseHandling() {
  console.log("=== Testing Promise Handling in Fengari ===\n");

  const L = lauxlib.luaL_newstate();
  lualib.luaL_openlibs(L);

  // Test 1: Function that returns a resolved Promise
  console.log("1. Testing function that returns resolved Promise:");
  lua.lua_pushcfunction(L, (L) => {
    console.log("   JS: Creating resolved Promise");
    const promise = Promise.resolve("Hello from Promise!");
    
    // Try to push the Promise to Lua stack
    lua.lua_pushlightuserdata(L, promise);
    return 1;
  });
  lua.lua_setglobal(L, to_luastring("getResolvedPromise"));

  // Test 2: Function that returns a pending Promise
  console.log("\n2. Testing function that returns pending Promise:");
  lua.lua_pushcfunction(L, (L) => {
    console.log("   JS: Creating pending Promise");
    const promise = new Promise((resolve) => {
      setTimeout(() => {
        console.log("   JS: Promise resolving after 100ms");
        resolve("Delayed result!");
      }, 100);
    });
    
    lua.lua_pushlightuserdata(L, promise);
    return 1;
  });
  lua.lua_setglobal(L, to_luastring("getPendingPromise"));

  // Test 3: Function that tries to await a Promise (this won't work in sync context)
  console.log("\n3. Testing function that tries to handle Promise:");
  lua.lua_pushcfunction(L, (L) => {
    console.log("   JS: Creating and trying to handle Promise");
    const promise = Promise.resolve(42);
    
    // We can't await in a sync function, so let's see what happens
    promise.then(result => {
      console.log("   JS: Promise resolved with:", result);
    });
    
    // Return the promise object itself
    lua.lua_pushlightuserdata(L, promise);
    return 1;
  });
  lua.lua_setglobal(L, to_luastring("handlePromise"));

  // Test 4: Function that returns a regular value
  console.log("\n4. Testing function that returns regular value:");
  lua.lua_pushcfunction(L, (L) => {
    console.log("   JS: Returning regular string");
    lua.lua_pushstring(L, to_luastring("Regular string result"));
    return 1;
  });
  lua.lua_setglobal(L, to_luastring("getRegularValue"));

  // Lua script to test all functions
  const testScript = `
    print("=== Lua Script Testing ===")
    
    print("\\n1. Calling getResolvedPromise():")
    local result1 = getResolvedPromise()
    print("   Lua received:", type(result1), result1)
    
    print("\\n2. Calling getPendingPromise():")
    local result2 = getPendingPromise()
    print("   Lua received:", type(result2), result2)
    
    print("\\n3. Calling handlePromise():")
    local result3 = handlePromise()
    print("   Lua received:", type(result3), result3)
    
    print("\\n4. Calling getRegularValue():")
    local result4 = getRegularValue()
    print("   Lua received:", type(result4), result4)
    
    print("\\n=== End Lua Script ===")
  `;

  try {
    console.log("\nRunning Lua script...");
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

  // Wait a bit to see if any async operations complete
  setTimeout(() => {
    console.log("\n=== After 200ms delay ===");
    console.log("Any pending Promise callbacks should have executed by now");
  }, 200);
}

// Test async function handling
function testAsyncFunction() {
  console.log("\n\n=== Testing Async Function Handling ===\n");

  const L = lauxlib.luaL_newstate();
  lualib.luaL_openlibs(L);

  // Try to register an async function
  lua.lua_pushcfunction(L, async (L) => {
    console.log("   JS: Inside async function");
    
    // This will return a Promise
    const result = await new Promise(resolve => {
      setTimeout(() => resolve("Async result!"), 50);
    });
    
    lua.lua_pushstring(L, to_luastring(result));
    return 1;
  });
  lua.lua_setglobal(L, to_luastring("asyncFunction"));

  const asyncTestScript = `
    print("Calling async function from Lua:")
    local result = asyncFunction()
    print("Received:", type(result), result)
  `;

  try {
    console.log("Running async test script...");
    const result = lauxlib.luaL_dostring(L, to_luastring(asyncTestScript));
    
    if (result === lua.LUA_OK) {
      console.log("Async script completed");
    } else {
      const errMsg = lua.lua_tojsstring(L, -1);
      console.log("Async script failed:", errMsg);
    }
    
  } catch (error) {
    console.log("JavaScript error in async test:", error.message);
  } finally {
    lua.lua_close(L);
  }
}

// Run tests
testPromiseHandling();

setTimeout(() => {
  testAsyncFunction();
}, 300);
