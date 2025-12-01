// Browser-compatible compression interface
export type CompressionConfig = {
  "extension": string,
  "mime": string,
  createCompressor(): any, // Generic transform interface
  createDecompressor(): any, // Generic transform interface
}
