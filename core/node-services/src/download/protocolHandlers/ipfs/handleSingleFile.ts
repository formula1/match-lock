// services/src/download/ipfs.ts
import { IPFSHTTPClient } from 'ipfs-http-client';
import { DownloadResult } from "../types";
import { getProcessorsFromPathnameMimetypes, storeFile } from "../../utils";
import { createSimpleEmitter } from "@match-lock/shared";
import { PassThrough, Readable } from 'node:stream';
import { saveStreamToFilesystem } from "../../utils";

import { IPFSError } from "./utils";

export async function handleSingleFile(
  ipfs: IPFSHTTPClient,
  cid: string,
  folderDestination: string,
  abortSignal?: AbortSignal
): Promise<DownloadResult> {
  if (abortSignal?.aborted) {
    throw new IPFSError(cid, 'Download aborted');
  }

  // Assume it's an archive (we don't know the filename from IPFS)
  const fileName = `${cid}.tar.gz`; // Default assumption
  
  try {
    const { decompressors, archiveHandler } = getProcessorsFromPathnameMimetypes(fileName);
    
    const onProgress = createSimpleEmitter<[progress: number, total: number | undefined]>();
    const progressWatcher = new PassThrough();
    let downloaded = 0;
    
    progressWatcher.on('data', (chunk: Buffer) => {
      downloaded += chunk.length;
      onProgress.emit(downloaded, undefined);
    });

    // Stream directly from IPFS - no buffering!
    const ipfsStream = ipfs.cat(cid, { signal: abortSignal });
    const stream = Readable.from(ipfsStream);

    const finishPromise = saveStreamToFilesystem(
      stream,
      decompressors,
      archiveHandler,
      folderDestination,
      { abortSignal, progressWatcher }
    );

    return {
      finishPromise,
      onProgress,
      metaData: {
        url: `ipfs://${cid}`,
        cid,
        type: 'file',
      }
    };
  } catch (e) {
    // Not an archive, just save as-is
    return handleRawFile(ipfs, cid, folderDestination, abortSignal);
  }
}


async function handleRawFile(
  ipfs: IPFSHTTPClient,
  cid: string,
  folderDestination: string,
  abortSignal?: AbortSignal
): Promise<DownloadResult> {
  const onProgress = createSimpleEmitter<[progress: number, total: number | undefined]>();
  const progressWatcher = new PassThrough();
  let downloaded = 0;
  
  progressWatcher.on('data', (chunk: Buffer) => {
    downloaded += chunk.length;
    onProgress.emit(downloaded, undefined);
  });

  // Stream directly - no buffering
  const ipfsStream = ipfs.cat(cid, { signal: abortSignal });
  const stream = Readable.from(ipfsStream);
  const fileName = cid; // Use CID as filename

  const finishPromise = storeFile(
    folderDestination,
    fileName,
    stream,
    { abortSignal, progressWatcher }
  );

  return {
    finishPromise,
    onProgress,
    metaData: {
      url: `ipfs://${cid}`,
      cid,
      type: 'file',
    }
  };
}