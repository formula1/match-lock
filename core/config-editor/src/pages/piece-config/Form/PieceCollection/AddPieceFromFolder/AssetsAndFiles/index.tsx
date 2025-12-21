import { usePromisedMemo } from "../../../../../../utils/react";
import { PieceDefinition, PieceValue } from "../../types";
import { getAssetsOfFiles, collectErrors } from "./getAssetsOfFiles";

import { PageArrayTabs } from "../../../../../../components/Tabs";
import { DisplayByFile } from "./DisplayByFile";
import { DisplayByAssets } from "./DisplayByAssets";

import { useEffect } from "react";

export type AssetsAndFilesValue = (
  & Awaited<ReturnType<typeof getAssetsOfFiles>>
  & { errors: ReturnType<typeof collectErrors> }
);

export function AssetsAndFiles(
  { folderPath, pathVariables, pieceDefinition, onChange }: {
    folderPath: string,
    pathVariables: Record<string, string>,
    pieceDefinition: PieceDefinition,
    onChange: (v: null | AssetsAndFilesValue)=>unknown,
  }
){
  const assetsAndFiles = usePromisedMemo(async ()=>{
    const { assetsWithFiles, filesWithAssets } = await getAssetsOfFiles(folderPath, pathVariables, pieceDefinition);
    const errors = collectErrors({ assetsWithFiles, filesWithAssets });
    return { assetsWithFiles, filesWithAssets, errors };
  }, [folderPath, pathVariables, pieceDefinition])

  useEffect(()=>{
    if(assetsAndFiles.status !== "success"){
      onChange(null);
    } else {
      onChange(assetsAndFiles.value);
    }
  }, [assetsAndFiles])

  if(assetsAndFiles.status === "failed"){
    return <div className="error">
      <h3>Failed to load assets and files</h3>
      <pre>{JSON.stringify(assetsAndFiles.error, null, 2)}</pre>
    </div>
  }
  if(assetsAndFiles.status === "pending") return <div>Loading...</div>

  return (
    <>
      <PageArrayTabs
        pages={[
          {
            title: 'Display By Files',
            content: (
              <DisplayByFile
                assets={assetsAndFiles.value.assetsWithFiles}
                files={assetsAndFiles.value.filesWithAssets}
              />
            )
          },
          {
            title: 'Display By Assets',
            content: (
              <DisplayByAssets
                assets={assetsAndFiles.value.assetsWithFiles}
                files={assetsAndFiles.value.filesWithAssets}
              />
            )
          },
        ]}
      />
    </>
  )
}
