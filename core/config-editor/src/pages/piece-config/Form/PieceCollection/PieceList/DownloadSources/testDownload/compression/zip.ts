

import JSZip from 'jszip';

import { Decompressor } from "./types";
export const decompressZip: Decompressor = {
  name: "zip",
  mimeType: ['application/zip', 'application/x-zip-compressed'],
  decompress: async function decompressZip(data) {
    try {
      const zip = await JSZip.loadAsync(data);
      const fileMap = new Map<string, Uint8Array>();
      
      for (const [filename, file] of Object.entries(zip.files)) {
        if (!file.dir) {
          const content = await file.async('uint8array');
          fileMap.set(filename, content);
        }
      }
      
      if (fileMap.size === 0) {
        throw new Error('No files found in zip archive');
      }
      
      return fileMap;
    } catch (error) {
      throw new Error(`Failed to extract zip: ${error}`);
    }
  }
}
