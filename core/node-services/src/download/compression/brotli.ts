import { Decompressor } from './types';
import { 
  createBrotliDecompress, 
} from 'node:zlib';

export const decompressBrotli: Decompressor = {
  name: "gzip",
  mimeType: ['application/x-br', 'application/brotli'],
  signature: [],
  decompress: createBrotliDecompress
}
