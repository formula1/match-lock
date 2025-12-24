

import { join as pathJoin } from "path";
import { PATH_ROSTERLOCK_PIECE_META, ROSTERLOCK_PIECEMETADATA_CASTER_JSONSCHEMA } from "@match-lock/shared";
import { calculatePieceVersion } from "@match-lock/shared";
import { FS } from "../../../../../../globals/fs";
import { getAssetsOfFiles } from "@match-lock/shared";
import { PieceDefinition, PieceValue } from "../../types";

export type ProgressListener = (progress: { file: string, total: number, current: number })=>any

export async function createPieceValue(
  { 
    folderPath, pathVariables, filesWithAssets, pieceDefinition, progressListener }: {
    folderPath: string,
    pathVariables: Record<string, string>,
    filesWithAssets: Awaited<ReturnType<typeof getAssetsOfFiles>>["filesWithAssets"],
    pieceDefinition: PieceDefinition,
    progressListener?: ProgressListener
  }
){
  const piece: PieceValue = {
    id: "",
    version: {
      logic: "",
      media: "",
      docs: "",
    },
    humanInfo: {
      name: "",
      author: "",
      url: "",
    },
    downloadSources: [],
    pathVariables,
    requiredPieces: {},
  };

  const [version, humanInfo] = await Promise.all([
    Promise.resolve().then(async ()=>{
      piece.version = await calculatePieceVersion(
        filesWithAssets, async (path)=>{
          path = pathJoin(folderPath, path);
          const byteSize = await FS.stat(path).then(r=>r.size);
          return { byteSize, stream: FS.getFileStream(path) };
        },
        progressListener
      )
      return piece.version;
    }),
    Promise.resolve().then(async ()=>{
      try {
        const path = pathJoin(folderPath, PATH_ROSTERLOCK_PIECE_META);
        if(!await FS.exists(path)) return;
        const json = await FS.readJSON(path);
        const metaData = ROSTERLOCK_PIECEMETADATA_CASTER_JSONSCHEMA.cast(json, true);
        piece.downloadSources = metaData.downloadSources;
        piece.humanInfo = metaData.humanInfo;
        return metaData.humanInfo;
      }catch(e){
        console.log("Failed To Load Human Info", e);
      }
    })
  ])

  if(humanInfo) piece.id = `@${humanInfo.author}/${humanInfo.name}`;
  else piece.id = `#${version.logic}/${version.media}`;

  return piece;
}
