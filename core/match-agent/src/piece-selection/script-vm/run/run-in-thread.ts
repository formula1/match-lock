
import { runners as luaRunners } from "../../../tools/script-vm/lua/fns";

import { ScriptInput } from "./types";

import { ValidationScript, AlgorithmScriptGlobal, AlgorithmScriptPlayer } from "../shared/function-types";

const MimeTypeToRunners: Record<string, {
    validation: ValidationScript;
    "global-choices": AlgorithmScriptGlobal;
    "player-choices": AlgorithmScriptPlayer;
}> = {
  "text/lua": luaRunners,
}

export async function runScriptInThread(toRun: ScriptInput){
  const runners = MimeTypeToRunners[toRun.scriptConfig.script.type];
  if(!runners){
    throw new Error("Cannot run script of type " + toRun.scriptConfig.script.type);
  }
  switch(toRun.type){
    case "validation":
      return runners.validation(toRun.scriptConfig, toRun.args);
    case "global-choices":
      return runners["global-choices"](toRun.scriptConfig, toRun.args);
    case "player-choices":
      return runners["player-choices"](toRun.scriptConfig, toRun.args);
    default:
      throw new Error("Cannot run script of type " + (toRun as any).type);
  }
}

