
export type DecompressedFiles = Map<string, Uint8Array>;

export type Decompressor = {
  name: string;
  mimeType: Array<string>;
  decompress: (data: Uint8Array) => Promise<DecompressedFiles>;
};
