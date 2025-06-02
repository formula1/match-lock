import { JSON_Unknown } from "../JSON";
import { uniqueId } from "../string";

import { SimpleMessenger } from "./types"

import {
  Object as CastObject,
  String as CastString,
  Unknown as CastUnknown,
  Union as CastUnion,
  Literal,
} from "runtypes";


const RequestMessageCaster = CastObject({
  type: Literal("request"),
  path: CastString,
  id: CastString,
  data: CastUnknown,
})

export function handleRequest(
  messager: SimpleMessenger, path: string, handler: (data: undefined | JSON_Unknown)=>Promise<JSON_Unknown>
){
  messager.onMessage(async (message)=>{
    if(!RequestMessageCaster.guard(message)){
      return console.log("Ignoring Message, Invalid Request Message", message);
    }
    const { path: messagePath, id: messageId, data } = message;
    if(messagePath !== path){
      return console.warn("Ignoring Message, different path");
    };
    try {
      const result = await handler(data as undefined | JSON_Unknown);
      messager.sendMessage({
        type: "response",
        path, id: messageId,
        responseType: "result", data: result
      });
    }catch(e: unknown){
      if(!(e instanceof Error)){
        e = new Error("Unkown Error");
      }
      messager.sendMessage({
        type: "response",
        path, id: messageId,
        responseType: "error",
        data: { message: (e as Error).message }
      });
    }
  })
}

const ResponseMessageCaster = CastObject({
  type: Literal("response"),
  path: CastString,
  id: CastString,
  responseType: CastUnion(Literal("result"), Literal("error")),
  data: CastUnknown,
})

export function makeRequest(
  messager: SimpleMessenger, path: string, data: undefined | JSON_Unknown
): Promise<JSON_Unknown>{
  const originalId = uniqueId();
  const { resolve, reject, promise } = Promise.withResolvers<JSON_Unknown>();
  const off = messager.onMessage(async (message)=>{
    try {
      if(!ResponseMessageCaster.guard(message)){
        return console.log("Ignoring Message, Invalid Response Message", message);
      }
      const { path: messagePath, id: messageId, responseType, data: dataUncasted } = message;
      if(messagePath !== path){
        return console.warn("Ignoring Message, different path");
      };
      if(originalId !== messageId){
        return console.warn("Ignoring Message, different ids");
      }
      const data = dataUncasted as JSON_Unknown;
      if(responseType === "error"){
        throw new ResponseError("Response Failed", data);
      }
      off();
      resolve(data);
    }catch(e){
      off();
      reject(e);
    }
  });
  messager.sendMessage({ type: "request", path, id: originalId, ...(data ? { data } : {}) });
  return promise;
}


class ResponseError extends Error {
  constructor(message: string, public data: JSON_Unknown){
    super(message);
  }
}