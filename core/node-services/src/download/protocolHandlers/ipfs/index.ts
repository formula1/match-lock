// services/src/download/ipfs.ts
import { ProtocolHandler, DownloadResult } from "../types";
import { DOWNLOADABLE_SOURCE_PROTOCOLS } from "@match-lock/shared";
import { create as createIpfsClient } from 'ipfs-http-client';
import { IPFSError } from "./utils";
import { handleSingleFile } from "./handleSingleFile";
import { handleDirectory } from "./handleDirectory";

export const ipfsHandler: ProtocolHandler = {
  protocols: [
    DOWNLOADABLE_SOURCE_PROTOCOLS.ipfs.protocol,
  ],
  
  download: async function (url: string, folderDestination: string, abortSignal?: AbortSignal) {
    return runIpfsDownload(url, folderDestination, abortSignal);
  }
};

async function runIpfsDownload(
  url: string, 
  folderDestination: string, 
  abortSignal?: AbortSignal
): Promise<DownloadResult> {
  if (abortSignal?.aborted) {
    throw new IPFSError(url, 'Download aborted');
  }

  // Parse CID from URL (ipfs://QmXxx or just QmXxx)
  const cid = url.startsWith('ipfs://') ? url.slice(7) : url;
  
  // Connect to IPFS daemon
  const ipfs = createIpfsClient({
    url: 'http://127.0.0.1:5001',
    timeout: 5000, // 5 second timeout for daemon check
  });

  try {
    // Check if daemon is running
    await ipfs.id();
  } catch (error) {
    throw new IPFSError(
      url, 
      'IPFS daemon not running. Start with: ipfs daemon'
    );
  }

  try {
    // Get file/directory info
    const stat = await ipfs.files.stat(`/ipfs/${cid}`);
    
    if (stat.type === 'file') {
      // Single file
      return handleSingleFile(ipfs, cid, folderDestination, abortSignal);
    } else {
      // Directory - download all files
      return handleDirectory(ipfs, cid, folderDestination, abortSignal);
    }
  } catch (error) {
    throw new IPFSError(url, error);
  }
}
