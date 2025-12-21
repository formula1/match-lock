
import { getDecompressor } from "../compression";

import { DOWNLOADABLE_SOURCE_PROTOCOLS } from "@match-lock/shared";

export const httpHandler = {
  name: "http",
  
  async function downloadAndDecompress(url: string) {