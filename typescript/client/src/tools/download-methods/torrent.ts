
import WebTorrent from 'webtorrent';       // for magnet/torrent
import { ResolvableStream } from "./types";
import { Readable } from 'node:stream';

export const torrentStream: ResolvableStream<{ type: "torrent", uri: string }> = async (config)=>{
  const client = new WebTorrent();
  const torrent = await new Promise<WebTorrent.Torrent>((resolve, reject) => {
    client.add(config.uri, resolve)
  });
  // assume single-file torrent for logic/media bundles
  if(torrent.files.length !== 1){
    throw new Error("Torrent should have only one file");
  }

  const file = torrent.files[0];

  return {
    filename: file.name,
    stream: file.createReadStream() as Readable
  };
}
