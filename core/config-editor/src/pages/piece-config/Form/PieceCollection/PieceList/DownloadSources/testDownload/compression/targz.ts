import pako from 'pako';

import { Decompressor } from './types';
import { decompressTar } from "./tar";
export const decompressTarGz: Decompressor = {
  name: "tar.gz",
  mimeType: ['application/x-compressed-tar'],
  decompress: async function(data) {
    try {
      const decompressed = pako.inflate(data);
      return decompressTar.decompress(decompressed);
    } catch (error) {
      throw new Error(`Failed to decompress tar.gz: ${error}`);
    }
  }
}
