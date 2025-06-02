import { Transform } from "node:stream";

export type CompressionConfig = {
  "extension": string,
  "mime": string,
  createCompressor(): Transform,
  createDecompressor(): Transform,
}
