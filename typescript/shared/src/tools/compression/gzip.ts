import { CompressionConfig } from "./types";
import { createGzip, createGunzip } from "node:zlib";

export const gzip: CompressionConfig = {
  "extension": "gz",
  "mime": "application/gzip",
  createCompressor(){
    return createGzip();
  },
  createDecompressor(){
    return createGunzip();
  },
}