
import { MatchLockAssetBundle } from "@match-lock/shared";

import { httpStream } from "./http";
import { torrentStream } from "./torrent";
import { ResolvableStream } from "./types";

import { resolveCompression } from "@match-lock/shared";

const RESOLVERS: Record<
  MatchLockAssetBundle["sources"][0]["type"],
  ResolvableStream<any>
> = {
  http: httpStream,
  torrent: torrentStream,
  git: ()=>Promise.reject("Not Implemented"),
}

export async function resolveStream(asset: MatchLockAssetBundle){
  for(const source of asset.sources){
    try {
      const resolver = RESOLVERS[source.type];
      if(!resolver) throw new Error("Unknown Resolvable Type");
      const result = await resolver(source);
      try {
        resolveCompression(result.filename);
        return result;
      }catch(e){
        result.stream.destroy();
        throw e;
      }
    }catch(e){
      console.log("Failed To Resolve", e);
    }
  }
  throw new Error("Failed To Resolve");
}
