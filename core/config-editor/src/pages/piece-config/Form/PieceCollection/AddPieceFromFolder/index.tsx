import { WINDOW } from "../../../../../globals/window";
import { PieceDefinition, PieceValue } from "../types";
import { PathVariableValuesInput } from "../../../../engine-config/Item/Test/Form/PathVariablesInput";
import { useState } from "react";

import { AssetsAndFiles, AssetsAndFilesValue } from "./AssetsAndFiles";
import { CreatePiece } from "./CreatePiece";

export function AddPieceFromFolder(
  { onSubmit, pieceDefinition }: {
    onSubmit: (v: PieceValue)=>unknown,
    pieceDefinition: PieceDefinition
  }
){
  const [currentFolder, setCurrentFolder] = useState<null | string>(null);
  const [pathVariables, setPathVariables] = useState(resetPathVariables(pieceDefinition));
  const [assetsAndFiles, setAssetsAndFiles] = useState<null | AssetsAndFilesValue>(null);

  return (
    <>
      <div className="section">
        <div>
          <button
            onClick={async () => {
            try {
              const result = await WINDOW.showOpenDialog({
                title: 'Select Piece Folder',
                properties: ['openDirectory'],
                filters: [],
              });

              if(result.canceled) return;
              if(result.filePaths.length === 0) return;

              const folderPath = result.filePaths[0];
              setCurrentFolder(folderPath);
            } catch (error) {
              console.error('Error opening file:', error);
            }
          }}
          >Load Piece From Folder</button>
        </div>
        {currentFolder && <div>Selected: {currentFolder}</div>}
      </div>
      {pieceDefinition.pathVariables.length > 0 && (
        <div className="section">
          <PathVariableValuesInput
            value={pathVariables}
            onChange={setPathVariables}
            pathVariables={pieceDefinition.pathVariables}
          />
        </div>
      )}
      {currentFolder && (
        <AssetsAndFiles
          folderPath={currentFolder}
          pathVariables={pathVariables}
          pieceDefinition={pieceDefinition}
          onChange={setAssetsAndFiles}
        />
      )}
      {currentFolder && assetsAndFiles && (
        <CreatePiece
          folderPath={currentFolder}
          fileErrors={assetsAndFiles.errors}
          filesWithAssets={assetsAndFiles.filesWithAssets}
          pathVariables={pathVariables}
          pieceDefinition={pieceDefinition}
          onSubmit={onSubmit}
        />
      )}
    </>
  )
}

function resetPathVariables(pieceDefinition: PieceDefinition){
  const pathVariables: Record<string, string> = {};
  for(const variable of pieceDefinition.pathVariables){
    pathVariables[variable] = "";
  }
  return pathVariables;
}

