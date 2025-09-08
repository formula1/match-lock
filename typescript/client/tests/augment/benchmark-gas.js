const { lua, lauxlib, lualib, to_luastring } = require('fengari');

function benchmarkGasUsage(scriptContent, timeLimit = 1000) {
  let gasUsed = 0;
  let startTime = Date.now();
  let timeExceeded = false;

  const L = lauxlib.luaL_newstate();
  lualib.luaL_openlibs(L);

  // Set up gas counter with time tracking
  const hookFunction = () => {
    gasUsed++;
    const elapsed = Date.now() - startTime;
    if (elapsed > timeLimit) {
      timeExceeded = true;
      lua.lua_pushstring(L, to_luastring(`Time limit exceeded: ${elapsed}ms > ${timeLimit}ms`));
      lua.lua_error(L);
    }
  };

  // Set hook to count every instruction
  lua.lua_sethook(L, hookFunction, lua.LUA_MASKCOUNT, 1);

  try {
    // Run the script
    lauxlib.luaL_dostring(L, to_luastring(scriptContent));
    
    const elapsed = Date.now() - startTime;
    return {
      gasUsed,
      timeElapsed: elapsed,
      gasPerSecond: Math.round(gasUsed / (elapsed / 1000)),
      completed: true
    };
  } catch (error) {
    const elapsed = Date.now() - startTime;
    return {
      gasUsed,
      timeElapsed: elapsed,
      gasPerSecond: Math.round(gasUsed / (elapsed / 1000)),
      completed: false,
      error: error.message || String(error)
    };
  } finally {
    lua.lua_close(L);
  }
}

console.log('=== Benchmarking Lua Gas Usage ===\n');

// Test 1: Simple operations
console.log('1. Simple arithmetic operations:');
const simpleScript = `
  local sum = 0
  for i = 1, 10000 do
    sum = sum + i * 2
  end
  return sum
`;
const result1 = benchmarkGasUsage(simpleScript);
console.log(`   Gas used: ${result1.gasUsed.toLocaleString()}`);
console.log(`   Time: ${result1.timeElapsed}ms`);
console.log(`   Rate: ${result1.gasPerSecond.toLocaleString()} gas/second`);
console.log(`   Completed: ${result1.completed}\n`);

// Test 2: Table operations
console.log('2. Table operations:');
const tableScript = `
  local data = {}
  for i = 1, 1000 do
    data[i] = {
      id = i,
      value = i * 3,
      name = "item" .. i
    }
  end
  
  local sum = 0
  for i = 1, 1000 do
    sum = sum + data[i].value
  end
  return sum
`;
const result2 = benchmarkGasUsage(tableScript);
console.log(`   Gas used: ${result2.gasUsed.toLocaleString()}`);
console.log(`   Time: ${result2.timeElapsed}ms`);
console.log(`   Rate: ${result2.gasPerSecond.toLocaleString()} gas/second`);
console.log(`   Completed: ${result2.completed}\n`);

// Test 3: String operations
console.log('3. String operations:');
const stringScript = `
  local text = ""
  for i = 1, 1000 do
    text = text .. "piece" .. i .. ","
  end
  return #text
`;
const result3 = benchmarkGasUsage(stringScript);
console.log(`   Gas used: ${result3.gasUsed.toLocaleString()}`);
console.log(`   Time: ${result3.timeElapsed}ms`);
console.log(`   Rate: ${result3.gasPerSecond.toLocaleString()} gas/second`);
console.log(`   Completed: ${result3.completed}\n`);

// Test 4: Function calls
console.log('4. Function calls:');
const functionScript = `
  function validate(piece)
    if type(piece) == "string" and #piece > 0 then
      return true
    end
    return false
  end
  
  local pieces = {}
  for i = 1, 1000 do
    pieces[i] = "piece" .. i
  end
  
  local validCount = 0
  for i = 1, 1000 do
    if validate(pieces[i]) then
      validCount = validCount + 1
    end
  end
  return validCount
`;
const result4 = benchmarkGasUsage(functionScript);
console.log(`   Gas used: ${result4.gasUsed.toLocaleString()}`);
console.log(`   Time: ${result4.timeElapsed}ms`);
console.log(`   Rate: ${result4.gasPerSecond.toLocaleString()} gas/second`);
console.log(`   Completed: ${result4.completed}\n`);

// Test 5: Realistic validator scenario
console.log('5. Realistic piece validator:');
const validatorScript = `
  function validatePieces(pieces)
    local requiredTypes = {
      character = true,
      stage = true,
      music = true
    }
    
    local foundTypes = {}
    local totalCost = 0
    
    for i = 1, #pieces do
      local piece = pieces[i]
      local pieceType = string.match(piece, "^(%w+)_")
      
      if pieceType and requiredTypes[pieceType] then
        foundTypes[pieceType] = true
        
        -- Simulate cost calculation
        local cost = #piece * 2
        for j = 1, #piece do
          local char = string.byte(piece, j)
          cost = cost + (char % 10)
        end
        totalCost = totalCost + cost
      end
    end
    
    -- Check all required types are present
    for reqType, _ in pairs(requiredTypes) do
      if not foundTypes[reqType] then
        error("Missing required piece type: " .. reqType)
      end
    end
    
    -- Check cost limit
    if totalCost > 10000 then
      error("Total cost too high: " .. totalCost)
    end
    
    return true
  end
  
  local testPieces = {
    "character_ryu", "character_chun_li", "character_ken",
    "stage_training", "stage_beach", 
    "music_theme1", "music_victory"
  }
  
  return validatePieces(testPieces)
`;
const result5 = benchmarkGasUsage(validatorScript);
console.log(`   Gas used: ${result5.gasUsed.toLocaleString()}`);
console.log(`   Time: ${result5.timeElapsed}ms`);
console.log(`   Rate: ${result5.gasPerSecond.toLocaleString()} gas/second`);
console.log(`   Completed: ${result5.completed}\n`);

// Calculate recommendations
const rates = [result1, result2, result3, result4, result5]
  .filter(r => r.completed && r.timeElapsed > 0)
  .map(r => r.gasPerSecond);

if (rates.length > 0) {
  const avgRate = Math.round(rates.reduce((a, b) => a + b, 0) / rates.length);
  const minRate = Math.min(...rates);
  const maxRate = Math.max(...rates);
  
  console.log('=== RECOMMENDATIONS ===');
  console.log(`Average rate: ${avgRate.toLocaleString()} gas/second`);
  console.log(`Range: ${minRate.toLocaleString()} - ${maxRate.toLocaleString()} gas/second`);
  console.log('');
  console.log('Suggested gas limits for 1 second execution:');
  console.log(`  Conservative (min rate): ${minRate.toLocaleString()}`);
  console.log(`  Average: ${avgRate.toLocaleString()}`);
  console.log(`  Aggressive (max rate): ${maxRate.toLocaleString()}`);
  console.log('');
  console.log(`Recommended default: ${Math.round(avgRate * 0.8).toLocaleString()} (80% of average for safety margin)`);
}
