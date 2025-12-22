
export * from "./types";
import { ArchiveHandler } from "./types";
export const ARCHIVE_HANDLERS: Array<ArchiveHandler> = [];

import { tar } from "./tar";
ARCHIVE_HANDLERS.push(tar);

import { zip } from "./zip";
ARCHIVE_HANDLERS.push(zip);


export function getArchiveHandlerFromMimeType(mimeType: string): ArchiveHandler | undefined {
  return ARCHIVE_HANDLERS.find(tool => tool.mimeType.includes(mimeType));
}

