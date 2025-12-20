import { Readable, Transform } from "stream";
import { ArchiveWritable } from "../archive/types";
import { join as pathJoin, dirname as pathDirname } from "node:path";
import { mkdir } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { PassThrough } from "node:stream";

type ProgressHandlers = {
  progressWatcher: PassThrough,
  abortSignal: AbortSignal
}

export function saveStreamToFilesystem(
  src: Readable | ReadableStream,
  decompressors: Array<Transform>,
  archiveHandler: ArchiveWritable,
  destinationFolder: string,
  { progressWatcher, abortSignal }: Partial<ProgressHandlers> = {}
){

  const filePromises: Array<Promise<any>> = [];
  archiveHandler.onFile.on(async (path, contents) => {
    filePromises.push(storeFile(destinationFolder, path, contents, { abortSignal }));
  });

  const pipelinePromise = pipeline(
    src,
    ...(progressWatcher ? [progressWatcher] : []),
    ...decompressors,
    archiveHandler,
    { signal: abortSignal }
  )
  return Promise.all([
    pipelinePromise,
    Promise.all(filePromises),
  ])
}


export async function storeFile(
  destinationFolder: string,
  filePath: string,
  fileContents: Readable | ReadableStream,
  { progressWatcher, abortSignal }: Partial<ProgressHandlers> = {}
){

  const fullPath = pathJoin(destinationFolder, filePath);
  await mkdir(pathDirname(fullPath), { recursive: true });
  await pipeline(
    fileContents,
    ...(progressWatcher ? [progressWatcher] : []),
    createWriteStream(fullPath),
    { signal: abortSignal }
  );
}
