
import {
  String as CastString,
  Object as CastObject,
  Unknown as CastUnknown,
  Union as CastUnion,
  Literal,
} from "runtypes";


import { join as pathJoin } from "path";
import { fork } from "child_process";

const ScriptMessageCaster = CastUnion(
  CastObject({
    type: Literal("ready"),
  }),
  CastObject({
    type: Literal("error"),
    data: CastObject({
      message: CastString,
    })
  }),
  CastObject({
    type: Literal("result"),
    data: CastUnknown,
  }),
);

import { ScriptInput } from "./types";

const __script_vm = pathJoin(__dirname, "../../../script-vm");
const MimeTypeToFolder: Record<string, string> = {
  "text/lua": "lua",
}

export async function runScriptInFork(toRun: ScriptInput){
  const folder = MimeTypeToFolder[toRun.scriptConfig.script.type];
  if(!folder){
    throw new Error("Cannot run script of type " + toRun.scriptConfig.script.type);
  }
  return new Promise((res, rej)=>{
    const { file, options } = getFileAndEnvironment();
    const child = fork(pathJoin(__script_vm, folder, file));
    child.on("message", (uncasted)=>{
      try {
        const message = ScriptMessageCaster.check(uncasted);
        if(message.type === "ready"){
          return child.send(toRun);
        }
        if(message.type === "error"){
          throw new Error(message.data.message);
        }
        if(message.type === "result"){
          res(message.data);
        }
      }catch(e){
        child.kill();
        rej(e);
      }
    });
    child.on("error", rej);
  })
}


function getFileAndEnvironment(){
  if(__filename.endsWith('.ts')){
    return { file: "fork.ts", options: { execArgv: ['-r', 'ts-node/register'] }};
  }
  return { file: "fork.js", options: void 0 };
}

