
import { useEffect, useMemo, useState } from "react";
import { EngineConfigForm } from "../Form";
import { useRecentFiles } from "../services/RecentFilesStorage";
import { useNavigate, useParams } from "react-router";
import type { MatchLockEngineConfig } from "@match-lock/shared";
import { FS } from "../../../globals/fs";
import { WINDOW } from "../../../globals/window";
import { EngineConfigPaths } from "../paths";
import { replaceParams } from "../../../utils/router";

export function EditEngineConfig(){
  const navigate = useNavigate();
  const params = useParams();
  const filePath = useMemo(() => {
    if(!params.enginePath) return;
    return decodeURIComponent(params.enginePath);
  }, [params.enginePath]);

  const { addRecentFile } = useRecentFiles();

  // Adds the current file to the recent files list
  useEffect(()=>{
    if(filePath) addRecentFile(filePath);
  }, [filePath])

  const [value, setValue] = useState<null | MatchLockEngineConfig>(null);

  // Loads the file from disk if not already loaded
  useEffect(()=>{
    if(!filePath) return;
    if(value !== null) return;
    Promise.resolve().then(async ()=>{
      const contents = await FS.readFile(filePath);
      const str = new TextDecoder().decode(contents);
      setValue(JSON.parse(str));
    });
  }, [filePath])

  if(value === null){
    return <div>Loading...</div>
  }

  return <div>
    <div>
      <button
        onClick={async ()=>{
          if(!filePath) return;
          await FS.writeFile(filePath, new TextEncoder().encode(JSON.stringify(value, null, 2)));
        }}
      >Save</button>
      <button
        onClick={async ()=>{
          if(!filePath) return;
          const { canceled, filePaths } = await WINDOW.showSaveDialog({
            title: 'Save Engine Config',
            defaultPath: filePath,
            filters: [
              { name: 'JSON Files', extensions: ['json'] }
            ]
          })
          if(canceled) return;
          const newFilePath = filePaths[0];
          await FS.writeFile(newFilePath, new TextEncoder().encode(JSON.stringify(value, null, 2)));

          // Update the file path to the new file
          navigate(replaceParams(EngineConfigPaths.edit, { enginePath: encodeURIComponent(newFilePath) }));
        }}
      >Save As...</button>
    </div>
    <EngineConfigForm value={value} onChange={setValue} />
  </div>;
}
