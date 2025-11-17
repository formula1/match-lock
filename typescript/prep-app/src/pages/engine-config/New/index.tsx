
import { useState } from "react";
import { EngineConfigForm } from "../Form";
import type { MatchLockEngineConfig } from "@match-lock/shared";
import { FS } from "../../../globals/fs";
import { WINDOW } from "../../../globals/window";
import { keyToFilename } from "../../../utils/filename";
import { join as pathJoin } from "path";
import { useNavigate } from "react-router";
import { replaceParams } from "../../../utils/router";
import { EngineConfigPaths } from "../paths";

export function NewEngineConfig(){
  const navigate = useNavigate();
  const [value, setValue] = useState<MatchLockEngineConfig>({
    name: "",
    version: "",
    pieceDefinitions: {},
  });

  return <div>
    <h1>New Engine Config</h1>
    <div>
      <button
        onClick={async ()=>{
          const filename = keyToFilename(value.name);
          const matchlockDir = await FS.getMatchLockDir();
          const { canceled, filePath } = await WINDOW.showSaveDialog({
            title: 'Save Engine Config',
            defaultPath: pathJoin(matchlockDir,`${filename}.matchlock.engine.json`),
            filters: [
              { name: 'JSON Files', extensions: ['json'] }
            ]
          })
          if(canceled || !filePath) return;

          await FS.writeFile(filePath, new TextEncoder().encode(JSON.stringify(value, null, 2)));
          navigate(replaceParams(EngineConfigPaths.edit, { enginePath: encodeURIComponent(filePath) }))
        }}
      >Save</button>
    </div>
    <EngineConfigForm value={value} onChange={setValue} />
  </div>
}
