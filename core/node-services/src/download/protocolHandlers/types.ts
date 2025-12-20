
import { ISimpleEventEmitter } from "@match-lock/shared";

export type DownloadResult = {
  onProgress: ISimpleEventEmitter<[progress: number, total?: undefined | number]>,
  finishPromise: Promise<void | any>,
  metaData?: any
};

export type ProtocolHandler = {
  protocols: Array<string>;
  download: (
    url: string,
    folderDestination: string,
    abortSignal: AbortSignal
  ) => Promise<DownloadResult>;
};
