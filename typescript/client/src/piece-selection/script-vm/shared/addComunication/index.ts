import { JSON_Unknown, ScriptWithPieceMeta, ScriptWithPieceMetaCaster } from "@match-lock/shared";
import {
  String as CastString,
  Union as CastUnion,
  Literal,
  Object as CastObject,
  Unknown as CastUnknown
} from "runtypes";
import {
  AlgorithmScriptGlobal, AlgorithmScriptPlayer, ValidationScript,
  ValidatorArgsCaster, AlgorithmArgsCaster
} from "../function-types";

const ScriptStarterCaster = CastObject({
  type: CastUnion(
    Literal("validation"),
    Literal("player-choices"),
    Literal("global-choices")
  ),
  scriptConfig: ScriptWithPieceMetaCaster,
  args: CastUnknown,
});

if(!process.send){
  console.error("Cannot communicate");
  process.exit(1);
}

const send = process.send.bind(process);

type AvailableScriptRunners = {
  "validation": ValidationScript;
  "global-choices": AlgorithmScriptGlobal
  "player-choices": AlgorithmScriptPlayer
};

export function bindToProcess(runers: AvailableScriptRunners){
  let running = false;
  process.on("message", async (message)=>{
    try {
      if(running){
        throw new Error("Already Running");
      }
      running = true;
      console.log("Recieved Message", message);
      const input = ScriptStarterCaster.check(message);
      
      const result = await runFunction(runers, input);
      send({
        type: "result",
        data: result
      })
    }catch(e: any){
      send({
        type: "error",
        data: { message: e.message }
      })
      process.exit(1)
    }
  });
  send({
    type: "ready"
  })
}

async function runFunction(
  runners: AvailableScriptRunners,
  {
    type, scriptConfig, args: uncastedArgs,
  }: { type: keyof AvailableScriptRunners, scriptConfig: ScriptWithPieceMeta<any>, args: unknown },
): Promise<JSON_Unknown | undefined>{
  if(!runners[type]){
    throw new Error(`Cannot run unknown script ${type}`);
  }
  if(type === "validation"){
    const args = ValidatorArgsCaster.check(uncastedArgs);
    return runners[type](scriptConfig, args);
  }
  if(type === "global-choices"){
    const args = AlgorithmArgsCaster.check(uncastedArgs);
    return runners[type](scriptConfig, args);
  }
  if(type === "player-choices"){
    const args = AlgorithmArgsCaster.check(uncastedArgs);
    return runners[type](scriptConfig, args);
  }
}
