
import { Transform } from "node:stream";
import { FileSignature } from "../types";

export type Decompressor = {
  name: string;
  mimeType: Array<string>;
  signature: Array<FileSignature>;
  decompress: ()=>Transform;
};
