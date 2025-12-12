
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

import { FollowButtonForm } from "../../../components/FollowButtonForm";

export function NewEngineConfig(){
  const navigate = useNavigate();
  const [value, setValue] = useState<MatchLockEngineConfig>({
    name: "",
    version: "",
    pieceDefinitions: {},
  });

  return <div style={{ overflow: "hidden", flexGrow: 1 }}>
    <h1>New Engine Config</h1>
    <FollowButtonForm
      info={{
        title: "New Engine Config",
        note: null,
      }}
      buttons={[
        {
          label: "Save",
          onClick: async ()=>{
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

            await FS.writeJSON(filePath, value);
            navigate(replaceParams(EngineConfigPaths.edit, { enginePath: encodeURIComponent(filePath) }))
          }
        }
      ]}
    >
      <EngineConfigForm value={value} onChange={setValue} />
    </FollowButtonForm>
  </div>
}
