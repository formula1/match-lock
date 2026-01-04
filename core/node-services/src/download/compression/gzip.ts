import { Decompressor } from './types';
import { 
  createGunzip, 
} from 'node:zlib';

export const decompressGzip: Decompressor = {
  name: "gzip",
  mimeType: ['application/gzip', 'application/x-gzip'],
  signature: [{ offset: 0, bytes: [0x1f, 0x8b] }],
  decompress: createGunzip
}
