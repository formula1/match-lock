
import { Transform } from "node:stream";
import { getArchiveHandlerFromMimeType, ArchiveWritable } from "../archive";
import { getDecompressorFromMimeType } from "../compression";
import mime from 'mime-types';


export function getProcessorsFromPathnameMimetypes(pathname: string): {
  decompressors: Array<Transform>,
  archiveHandler: ArchiveWritable
} {
  const splitExtensions = pathname.split('.');
  if(splitExtensions.length === 1){
    throw new Error(`Failed to determine file type - no extension found in ${pathname}`);
  }
  splitExtensions.shift()
  const fileExtension = splitExtensions.shift();
  if(!fileExtension){
    throw new Error(`Failed to determine file type - no extension found in ${pathname}`);
  }
  const mimetype = mime.lookup(fileExtension);
  if(!mimetype){
    throw new Error(`Failed to determine final mime type based on extension ${fileExtension}`);
  };
  const archiveHandler = getArchiveHandlerFromMimeType(mimetype);
  if(!archiveHandler){
    throw new Error(`No Archive Handler Found matching ${mimetype}`);
  }

  const decompressors: Array<Transform> = []
  
  for(const extension of splitExtensions){
    const mimetype = mime.lookup(fileExtension);
    if(!mimetype){
      throw new Error(`Failed to determine decompression mime type based on extension ${fileExtension}`);
    };
    const decompressor = getDecompressorFromMimeType(mimetype);
    if(!decompressor){
      throw new Error(`No Decompressor Found matching ${extension}`);
    }
    decompressors.push(decompressor.decompress());
  }

  return {
    decompressors: decompressors.reverse(),
    archiveHandler: archiveHandler.extractFiles(),
  }
}


