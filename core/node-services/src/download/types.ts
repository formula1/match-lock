
export type AvailableFiles = Map<string, Uint8Array>;

export type FileSignature = {
  offset: number;
  bytes: number[];
};
