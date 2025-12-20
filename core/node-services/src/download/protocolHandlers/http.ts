
import { ProtocolHandler } from "./types";
import { getProcessorsFromPathnameMimetypes } from "../utils";

import { createSimpleEmitter, DOWNLOADABLE_SOURCE_PROTOCOLS } from "@match-lock/shared";
import { request as httpRequest, IncomingMessage, ClientRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';
import { once } from "node:events";
import { saveStreamToFilesystem } from "../utils";

export const httpHandler: ProtocolHandler = {
  protocols: [
    DOWNLOADABLE_SOURCE_PROTOCOLS.http.protocol,
    DOWNLOADABLE_SOURCE_PROTOCOLS.https.protocol,
  ],
  
  download: async function (url: string, folderDestination: string, abortSignal: AbortSignal) {
    return runDownload(url, folderDestination, abortSignal);
  }
}

async function runDownload(url: string, folderDestination: string, abortSignal: AbortSignal, redirects = 0, maxRedirects = 10){
  if(redirects > maxRedirects) throw new Error("Too Many Redirects");
  let urlObj = new URL(url);
  const request = urlObj.protocol === 'https:' ? httpsRequest : httpRequest;
  const processor = getProcessorsFromPathnameMimetypes(urlObj.pathname);

  const req = request(url);
  req.end();

  const [res] = await once(req, 'response') as [IncomingMessage];

  if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400) {
    const location = res.headers.location;
    if (!location) {
      throw new HTTPError(
        req, res, 'Redirect without location header'
      );
    }
    urlObj = new URL(location, urlObj);
    return runDownload(urlObj.href, folderDestination, abortSignal, redirects + 1, maxRedirects);
  } else if (res.statusCode && res.statusCode !== 200) {
    throw new HTTPError(req, res, `Invalid Status Code`);
  }

  const contentLength = (()=>{
    if(!res.headers['content-length']) return undefined;
    const contentLength = Number.parseInt(res.headers['content-length']);
    if(Number.isNaN(contentLength)) return undefined;
    return contentLength;
  })();


  const onProgress = createSimpleEmitter<[progress: number, total: undefined | number]>();
  let totalProgress = 0;
  res.on('data', (chunk: Buffer) => {
    totalProgress += chunk.length;
    onProgress.emit(totalProgress, contentLength);
  });

  return {
    finishPromise: saveStreamToFilesystem(
      res,
      processor.decompressors,
      processor.archiveHandler,
      folderDestination,
      { abortSignal }
    ),
    onProgress,
    metaData: {
      url: urlObj.href,
      headers: res.headers,
    }
  };
}

export class HTTPError extends Error {
  public url: string;
  public method: string;
  public statusCode: undefined | number;
  constructor(
    public req: ClientRequest,
    public response: IncomingMessage,
    reason: string = "Failed To Fetch"
  ) {
    super(reason);
    this.url = req.path;
    this.method = req.method;
    this.statusCode = response.statusCode;
  }
}

