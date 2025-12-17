
import { Decompressor } from "./types";
export const DECOMPRESSORS: Array<Decompressor> = [];

import { decompressGzip } from "./gzip";
DECOMPRESSORS.push(decompressGzip);

import { decompressTar } from "./tar";
DECOMPRESSORS.push(decompressTar);

import { decompressTarGz } from "./targz";
DECOMPRESSORS.push(decompressTarGz);

import { decompressZip } from "./zip";
DECOMPRESSORS.push(decompressZip);


function getDecompressor(mimeType: string): Decompressor | undefined {
  return DECOMPRESSORS.find(decompressor => decompressor.mimeType.includes(mimeType));
}