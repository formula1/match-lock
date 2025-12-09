
import { useEffect, useMemo, useState } from "react";
import { EngineConfigForm } from "../../Form";
import { useRecentFiles } from "../../../../globals/recent-files";
import { RECENT_ENGINE_FILES_KEY } from "../../constants";
import { useNavigate, useParams } from "react-router";
import { WINDOW } from "../../../../globals/window";
import { EngineConfigPaths } from "../../paths";
import { replaceParams } from "../../../../utils/router";

import { useCurrentFile } from "../../Outlet/CurrentFile";

export function EditEngineConfig(){
  const navigate = useNavigate();
  const params = useParams();
  const currentFile = useCurrentFile();

  const filePath = useMemo(() => {
    if(!params.enginePath) return;
    return decodeURIComponent(params.enginePath);
  }, [params.enginePath]);

  const { addRecentFile } = useRecentFiles(RECENT_ENGINE_FILES_KEY);

  // Adds the current file to the recent files list
  useEffect(()=>{
    if(filePath) addRecentFile(filePath);
  }, [filePath])

  if(!currentFile.activeFile){
    return <div>No active file</div>
  }

  if(currentFile.state === "loading"){
    return <div>Loading...</div>
  }

  if(currentFile.state === "failed"){
    return <div>Failed</div>
  }

  return <div style={!currentFile.isDirty ? {} : DIRTY_STYLES}>
    <h1>{filePath}</h1>
    <div>
      <button
        onClick={async ()=>{
          await currentFile.save();
        }}
        disabled={!currentFile.isDirty}
      >Save</button>
      <button
        onClick={async ()=>{
          if(!filePath) return;
          const { canceled, filePath: newFilePath } = await WINDOW.showSaveDialog({
            title: 'Save Engine Config',
            defaultPath: filePath,
            filters: [
              { name: 'JSON Files', extensions: ['json'] }
            ]
          })
          if(canceled || !newFilePath) return;
          await currentFile.saveAs(newFilePath);
          if(newFilePath === filePath) return;

          // Update the file path to the new file
          navigate(replaceParams(EngineConfigPaths.edit, { enginePath: encodeURIComponent(newFilePath) }));
        }}
      >Save As...</button>
      {currentFile.isDirty && <span className="error">You have unsaved changes</span>}
    </div>
    <EngineConfigForm
      value={currentFile.config}
      onChange={currentFile.update}
    />
  </div>;
}

const DIRTY_STYLES: React.CSSProperties = {
  backgroundColor: "#FFC",
};
