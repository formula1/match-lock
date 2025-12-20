import { getProcessorsFromPathnameMimetypes } from "../../utils";
import { createSimpleEmitter } from "@match-lock/shared";
import { Torrent, TorrentFile } from 'webtorrent';
import { saveStreamToFilesystem } from "../../utils";
import { PassThrough } from "stream";


export function handleSingleFileTorrent(
  magnetUri: string,
  torrent: Torrent,
  file: TorrentFile,
  folderDestination: string,
  abortSignal: AbortSignal
){
  try {
    const { decompressors, archiveHandler } = getProcessorsFromPathnameMimetypes(file.name);
    const totalSize = file.length;

    const onProgress = createSimpleEmitter<[progress: number, total: undefined | number]>();
    const progressWatcher = new PassThrough();
    let downloaded = 0;
    progressWatcher.on('data', (chunk: Buffer) => {
      downloaded += chunk.length;
      onProgress.emit(downloaded, totalSize);
    });

    return {
      finishPromise: saveStreamToFilesystem(
        file.createReadStream() as any,
        decompressors,
        archiveHandler,
        folderDestination,
        { abortSignal, progressWatcher }
      ),
      onProgress,
      metaData: {
        size: totalSize,
        magnetUri,
        torrentName: torrent.name,
        files: [{ name: file.name, size: file.length }],
      }
    };
  }catch(e){
    return null
  }
}