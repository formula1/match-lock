import { AvailableFiles, FileSignature } from "../types";

type ToolWithSig<T> = T & { signature: Array<FileSignature> };

const DECOMPRESSORS: Array<ToolWithSig<{ decompress: (data: Uint8Array) => Promise<Uint8Array> }>> = [];
const ARCHIVE_HANDLERS: Array<ToolWithSig<{ extractFiles: (data: Uint8Array) => Promise<AvailableFiles> }>> = [];


export async function sniffMimeType(
  data: Uint8Array, options: Partial<{ maxCompressionDepth: number }> = {}
): Promise<AvailableFiles> {
  const maxCompressionDepth = options.maxCompressionDepth ?? 10;
  let compressionDepth = 0;
  do {
    const compressor = getToolFromSignature(DECOMPRESSORS, data);
    if(!compressor) break;
    data = await compressor.decompress(data);
    compressionDepth++;
    if(compressionDepth > maxCompressionDepth){
      throw new Error("Max Compression Depth Reached");
    }
  }while(true)
  const archive = getToolFromSignature(ARCHIVE_HANDLERS, data);
  if(!archive){
    throw new Error("Failed to find archive handler");
  }
  return archive.extractFiles(data);
}


export function getToolFromSignature<T extends { signature: Array<FileSignature> }>(
  tools: Array<T>, data: Uint8Array
): T | undefined {

  const toolsWithScores = tools.map(tool => ({
    tool,
    maxSignatureLength: Math.max(...tool.signature.map(s => s.bytes.length))
  }));
  
  toolsWithScores.sort((a, b) => b.maxSignatureLength - a.maxSignatureLength);


  for (const { tool } of toolsWithScores) {
    for (const sig of tool.signature) {
      // If we don't have enough data to match the signature, skip it
      if (data.length < sig.offset + sig.bytes.length) continue;

      // Check the signature
      let matches = true;
      for (let i = 0; i < sig.bytes.length; i++) {
        if (data[sig.offset + i] !== sig.bytes[i]) {
          matches = false;
          break;
        }
      }
      if (matches)  return tool;
    }
  }
}
