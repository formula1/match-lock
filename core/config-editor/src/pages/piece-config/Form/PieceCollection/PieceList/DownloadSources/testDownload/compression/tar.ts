import { untar } from 'js-untar';

import { Decompressor } from './types';
export const decompressTar: Decompressor = {
  name: "tar",
  mimeType: ['application/x-tar'],
  decompress: async function (data) {
    try {
      const files = await untar(data.buffer);
      const fileMap = new Map<string, Uint8Array>();
      
      for (const file of files) {
        // Only include regular files (type '0' or '')
        if (file.type === '0' || file.type === '') {
          fileMap.set(file.name, new Uint8Array(file.buffer));
        }
      }
      
      if (fileMap.size === 0) {
        throw new Error('No files found in tar archive');
      }
      
      return fileMap;
    } catch (error) {
      throw new Error(`Failed to extract tar: ${error}`);
    }
  }
};
