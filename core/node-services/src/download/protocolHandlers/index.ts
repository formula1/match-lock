
import { ProtocolHandler } from "./types";
export const SOURCE_HANDLERS: Array<ProtocolHandler> = [];

import { ftpHandler } from "./ftp";
SOURCE_HANDLERS.push(ftpHandler);
import { ipfsHandler } from "./ipfs";
SOURCE_HANDLERS.push(ipfsHandler);
import { torrentHandler } from "./magnet";
SOURCE_HANDLERS.push(torrentHandler);
import { gitHandler } from "./git";
SOURCE_HANDLERS.push(gitHandler);
import { httpHandler } from "./http";
SOURCE_HANDLERS.push(httpHandler);

export function getSourceHandlerFromProtocol(protocol: string): ProtocolHandler | undefined {
  return SOURCE_HANDLERS.find(handler => handler.protocols.includes(protocol));
}