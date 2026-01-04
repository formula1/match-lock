
import { ArchiveHandler } from '../types';
import { TarArchiveWritable } from "./Writable";
export const tar: ArchiveHandler = {
  name: "tar",
  mimeType: ['application/x-tar'],
  signature: [{ offset: 257, bytes: [0x75, 0x73, 0x74, 0x61, 0x72] }],
  extractFiles: function () {
    return new TarArchiveWritable();
  }
};




function* extractTar(data: Uint8Array): Iterable<{ path: string, contents: Uint8Array }> {
  let offset = 0;
  
  while (offset + 512 <= data.length) {
    // Check for end of archive (two consecutive zero blocks)
    if (data[offset] === 0) {
      // Verify next block is also zeros
      let allZeros = true;
      for (let i = 0; i < 512; i++) {
        if (data[offset + i] !== 0) {
          allZeros = false;
          break;
        }
      }
      if (allZeros) break;
    }
    
    // Read header (512 bytes)
    const header = data.subarray(offset, offset + 512);
    
    // Extract filename (offset 0, 100 bytes, null-terminated)
    let nameEnd = 0;
    while (nameEnd < 100 && header[nameEnd] !== 0) nameEnd++;
    const filename = new TextDecoder('utf-8').decode(header.subarray(0, nameEnd));
    
    // Extract file size (offset 124, 12 bytes, octal string)
    const sizeBytes = header.subarray(124, 136);
    let sizeStr = '';
    for (let i = 0; i < 12 && sizeBytes[i] !== 0 && sizeBytes[i] !== 0x20; i++) {
      sizeStr += String.fromCharCode(sizeBytes[i]);
    }
    const size = parseInt(sizeStr.trim(), 8) || 0;
    
    // Extract file type (offset 156, 1 byte)
    const fileType = String.fromCharCode(header[156]);
    
    offset += 512;
    
    // Read file content if it's a regular file
    if ((fileType === '0' || fileType === '\0' || fileType === '') && size > 0) {
      const content = data.subarray(offset, offset + size);
      // Copy to new buffer to avoid holding reference to large source buffer
      const copy = new Uint8Array(content);
      yield { path: filename, contents: copy };
    }
    
    // Move to next entry (content is padded to 512-byte blocks)
    const paddedSize = Math.ceil(size / 512) * 512;
    offset += paddedSize;
  }
}
