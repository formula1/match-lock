
import { getDownloadableSourceProtocol } from "../../usage/downloadable-source";

export function validateDownloadableSource(url: string){
  if(!getDownloadableSourceProtocol(url))
    throw new Error(`Unsupported protocol: ${url}`);
}

