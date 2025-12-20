
export * from "./types";

import { Decompressor } from "./types";
export const DECOMPRESSORS: Array<Decompressor> = [];

import { decompressGzip } from "./gzip";
DECOMPRESSORS.push(decompressGzip);

import { decompressBrotli } from "./brotli";
DECOMPRESSORS.push(decompressBrotli);

export function getDecompressorFromMimeType(mimeType: string): Decompressor | undefined {
  return DECOMPRESSORS.find(decompressor => decompressor.mimeType.includes(mimeType));
}