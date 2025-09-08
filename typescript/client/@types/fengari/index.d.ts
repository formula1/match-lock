// TypeScript definitions for Fengari - Lua VM written in JavaScript
// Based on Lua 5.3 C API and Fengari extensions
// https://github.com/fengari-lua/fengari

// Lua state type - opaque pointer to Lua state
type lua_State = unknown;

// Module declaration for fengari
declare module "fengari" {
  // Lua constants
  export namespace lua {
  // Lua types
  const LUA_TNONE: number;
  const LUA_TNIL: number;
  const LUA_TBOOLEAN: number;
  const LUA_TLIGHTUSERDATA: number;
  const LUA_TNUMBER: number;
  const LUA_TSTRING: number;
  const LUA_TTABLE: number;
  const LUA_TFUNCTION: number;
  const LUA_TUSERDATA: number;
  const LUA_TTHREAD: number;

  // Lua status codes
  const LUA_OK: number;
  const LUA_YIELD: number;
  const LUA_ERRRUN: number;
  const LUA_ERRSYNTAX: number;
  const LUA_ERRMEM: number;
  const LUA_ERRGCMM: number;
  const LUA_ERRERR: number;

  // Hook masks
  const LUA_MASKCOUNT: number;
  const LUA_MASKCALL: number;
  const LUA_MASKRET: number;
  const LUA_MASKLINE: number;

  // Stack manipulation
  function lua_gettop(L: lua_State): number;
  function lua_settop(L: lua_State, idx: number): void;
  function lua_pushvalue(L: lua_State, idx: number): void;
  function lua_rotate(L: lua_State, idx: number, n: number): void;
  function lua_copy(L: lua_State, fromidx: number, toidx: number): void;
  function lua_checkstack(L: lua_State, n: number): boolean;
  function lua_pop(L: lua_State, n: number): void;

  // Access functions (stack -> JS)
  function lua_isnumber(L: lua_State, idx: number): boolean;
  function lua_isstring(L: lua_State, idx: number): boolean;
  function lua_iscfunction(L: lua_State, idx: number): boolean;
  function lua_isinteger(L: lua_State, idx: number): boolean;
  function lua_isuserdata(L: lua_State, idx: number): boolean;
  function lua_type(L: lua_State, idx: number): number;
  function lua_typename(L: lua_State, tp: number): string;

  function lua_tonumber(L: lua_State, idx: number): number | false;
  function lua_tointeger(L: lua_State, idx: number): number | false;
  function lua_toboolean(L: lua_State, idx: number): boolean;
  function lua_tolstring(L: lua_State, idx: number, len?: any): Uint8Array | null;
  function lua_rawlen(L: lua_State, idx: number): number;
  function lua_tocfunction(L: lua_State, idx: number): Function | null;
  function lua_touserdata(L: lua_State, idx: number): any;
  function lua_tothread(L: lua_State, idx: number): lua_State | null;
  function lua_topointer(L: lua_State, idx: number): any;

  // Push functions (JS -> stack)
  function lua_pushnil(L: lua_State): void;
  function lua_pushnumber(L: lua_State, n: number): void;
  function lua_pushinteger(L: lua_State, n: number): void;
  function lua_pushstring(L: lua_State, s: Uint8Array): string;
  function lua_pushlstring(L: lua_State, s: Uint8Array, len: number): string;
  function lua_pushboolean(L: lua_State, b: boolean): void;
  function lua_pushcfunction(L: lua_State, f: Function): void;
  function lua_pushlightuserdata(L: lua_State, p: any): void;
  function lua_pushthread(L: lua_State): boolean;

  // Get functions (Lua -> stack)
  function lua_getglobal(L: lua_State, name: Uint8Array): number;
  function lua_gettable(L: lua_State, idx: number): number;
  function lua_getfield(L: lua_State, idx: number, k: Uint8Array): number;
  function lua_geti(L: lua_State, idx: number, n: number): number;
  function lua_rawget(L: lua_State, idx: number): number;
  function lua_rawgeti(L: lua_State, idx: number, n: number): number;
  function lua_rawgetp(L: lua_State, idx: number, p: any): number;
  function lua_createtable(L: lua_State, narr: number, nrec: number): void;
  function lua_newtable(L: lua_State): void;
  function lua_newuserdata(L: lua_State, sz: number): any;
  function lua_getmetatable(L: lua_State, objindex: number): boolean;
  function lua_getuservalue(L: lua_State, idx: number): number;

  // Set functions (stack -> Lua)
  function lua_setglobal(L: lua_State, name: Uint8Array): void;
  function lua_settable(L: lua_State, idx: number): void;
  function lua_setfield(L: lua_State, idx: number, k: Uint8Array): void;
  function lua_seti(L: lua_State, idx: number, n: number): void;
  function lua_rawset(L: lua_State, idx: number): void;
  function lua_rawseti(L: lua_State, idx: number, n: number): void;
  function lua_rawsetp(L: lua_State, idx: number, p: any): void;
  function lua_setmetatable(L: lua_State, objindex: number): boolean;
  function lua_setuservalue(L: lua_State, idx: number): void;

  // Load and call functions
  function lua_call(L: lua_State, nargs: number, nresults: number): void;
  function lua_pcall(L: lua_State, nargs: number, nresults: number, errfunc: number): number;
  function lua_load(L: lua_State, reader: Function, dt: any, chunkname: Uint8Array, mode: Uint8Array): number;
  function lua_dump(L: lua_State, writer: Function, data: any, strip: boolean): number;

  // Coroutine functions
  function lua_yield(L: lua_State, nresults: number): number;
  function lua_resume(L: lua_State, from: lua_State | null, narg: number): number;
  function lua_status(L: lua_State): number;
  function lua_isyieldable(L: lua_State): boolean;

  // Garbage collection functions
  function lua_gc(L: lua_State, what: number, data: number): number;

  // Miscellaneous functions
  function lua_error(L: lua_State): never;
  function lua_next(L: lua_State, idx: number): number;
  function lua_concat(L: lua_State, n: number): void;
  function lua_len(L: lua_State, idx: number): void;
  function lua_stringtonumber(L: lua_State, s: Uint8Array): number;
  function lua_getallocf(L: lua_State, ud: any): Function;
  function lua_setallocf(L: lua_State, f: Function, ud: any): void;

  // Debug API
  function lua_sethook(L: lua_State, func: Function, mask: number, count: number): void;
  function lua_gethook(L: lua_State): Function | null;
  function lua_gethookmask(L: lua_State): number;
  function lua_gethookcount(L: lua_State): number;

  // Fengari extensions
  function lua_tojsstring(L: lua_State, idx: number): string | null;
  function lua_pushliteral(L: lua_State, s: string): string;
  function lua_pushclosure(L: lua_State, f: Function, n: number): void;
  function lua_pushjsfunction(L: lua_State, f: Function): void;
  function lua_pushjsclosure(L: lua_State, f: Function, n: number): void;
  }

  // Auxiliary library
  export namespace lauxlib {
  // State manipulation
  function luaL_newstate(): lua_State;
  function luaL_close(L: lua_State): void;

  // Load functions
  function luaL_loadfile(L: lua_State, filename: string): number;
  function luaL_loadbuffer(L: lua_State, buff: Uint8Array, sz: number, name: string): number;
  function luaL_loadstring(L: lua_State, s: string): number;
  function luaL_dofile(L: lua_State, filename: string): number;
  function luaL_dostring(L: lua_State, str: string | Uint8Array): number;

  // Error handling
  function luaL_error(L: lua_State, fmt: string, ...args: any[]): never;
  function luaL_argerror(L: lua_State, arg: number, extramsg: string): never;
  function luaL_typeerror(L: lua_State, arg: number, tname: string): never;

  // Argument checking
  function luaL_checkany(L: lua_State, arg: number): void;
  function luaL_checktype(L: lua_State, arg: number, t: number): void;
  function luaL_checkinteger(L: lua_State, arg: number): number;
  function luaL_checknumber(L: lua_State, arg: number): number;
  function luaL_checkstring(L: lua_State, arg: number): Uint8Array;
  function luaL_optinteger(L: lua_State, arg: number, def: number): number;
  function luaL_optnumber(L: lua_State, arg: number, def: number): number;
  function luaL_optstring(L: lua_State, arg: number, def: Uint8Array): Uint8Array;

  // Buffer manipulation
  function luaL_buffinit(L: lua_State, B: any): void;
  function luaL_prepbuffer(B: any): Uint8Array;
  function luaL_addlstring(B: any, s: Uint8Array, l: number): void;
  function luaL_addstring(B: any, s: Uint8Array): void;
  function luaL_addvalue(B: any): void;
  function luaL_pushresult(B: any): void;

  // Reference system
  function luaL_ref(L: lua_State, t: number): number;
  function luaL_unref(L: lua_State, t: number, ref: number): void;

  // Registry
  const LUA_REGISTRYINDEX: number;
  const LUA_RIDX_MAINTHREAD: number;
  const LUA_RIDX_GLOBALS: number;
  }

  // Standard libraries
  export namespace lualib {
  function luaL_openlibs(L: lua_State): void;
  function luaopen_base(L: lua_State): number;
  function luaopen_coroutine(L: lua_State): number;
  function luaopen_table(L: lua_State): number;
  function luaopen_io(L: lua_State): number;
  function luaopen_os(L: lua_State): number;
  function luaopen_string(L: lua_State): number;
  function luaopen_utf8(L: lua_State): number;
  function luaopen_bit32(L: lua_State): number;
  function luaopen_math(L: lua_State): number;
  function luaopen_debug(L: lua_State): number;
  function luaopen_package(L: lua_State): number;
  }

  // String conversion utilities
  export function to_luastring(s: string): Uint8Array;
  export function to_jsstring(s: Uint8Array): string;
  export function to_uristring(s: Uint8Array): string;
  export function luastring_of(...args: any[]): Uint8Array;
}
