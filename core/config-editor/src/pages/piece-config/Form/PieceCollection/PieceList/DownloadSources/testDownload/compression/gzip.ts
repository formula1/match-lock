import pako from 'pako';
import { Decompressor } from './types';

export const decompressGzip: Decompressor = {
  name: "gzip",
  mimeType: ['application/gzip', 'application/x-gzip'],
  decompress: async function(data) {
    try {
      const decompressed = pako.inflate(data);
      // Single file, use a default name
      const fileMap = new Map<string, Uint8Array>();
      fileMap.set('file', decompressed);
      return fileMap;
    } catch (error) {
      throw new Error(`Failed to decompress gzip: ${error}`);
    }
  }
}
