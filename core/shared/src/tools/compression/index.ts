
import { CompressionConfig } from "./types";
import { gzip } from "./gzip";

export const COMPRESSION: Record<CompressionConfig["extension"], CompressionConfig> = {
  "gz": gzip
}

import { parse as pathParse } from "node:path";
export function resolveCompression(filename: string){
  const fileExtension = pathParse(filename).ext.slice(1);
  if(!fileExtension) throw new Error("No File Extension");
  if(!COMPRESSION[fileExtension]) throw new Error("Unknown Compression Type");
  return COMPRESSION[fileExtension];
}
