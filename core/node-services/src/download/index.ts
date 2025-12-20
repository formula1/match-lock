
export * from "./protocolHandlers";
export * from "./utils";
export * from "./archive";
export * from "./compression";

import { getDownloadableSourceProtocol } from "@match-lock/shared";
import { getSourceHandlerFromProtocol } from "./protocolHandlers";
export function downloadToFolder(url: string, destinationFolder: string, abortSignal: AbortSignal){
  const protocol = getDownloadableSourceProtocol(url);
  if(!protocol){
    throw new Error("Invalid Protocol");
  }
  const sourceHandler = getSourceHandlerFromProtocol(protocol);
  if(!sourceHandler){
    throw new Error("No Source Handler Found");
  }
  return sourceHandler.download(url, destinationFolder, abortSignal);
}