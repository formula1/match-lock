import { JSON_Unknown } from "../JSON";

import { SimpleMessenger } from "./types"

import {
  Object as CastObject,
  String as CastString,
  Unknown as CastUnknown,
  Union as CastUnion,
  Literal,
} from "runtypes";


const TriggerMessageCaster = CastObject({
  type: Literal("trigger"),
  path: CastString,
  data: CastUnknown,
})

export function handleTrigger(
  messager: SimpleMessenger, path: string, handler: (data: undefined | JSON_Unknown)=>any
){
  messager.onMessage(async (message)=>{
    if(!TriggerMessageCaster.guard(message)){
      return console.log("Ignoring Message, Invalid Trigger Message", message);
    }
    const { path: messagePath, data } = message;
    if(messagePath !== path){
      return console.warn("Ignoring Message, different path");
    };
    handler(data as undefined | JSON_Unknown);
 })
}

export function makeTrigger(
  messager: SimpleMessenger, path: string, data: undefined | JSON_Unknown
){
  return messager.sendMessage({
    type: "trigger",
    path,
    ...(data ? { data } : {})
  });
}
