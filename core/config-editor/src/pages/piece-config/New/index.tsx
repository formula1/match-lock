
import { useState } from "react";
import { compareJSON, type MatchLockEngineConfig, type RosterLockEngineWithRosterConfig } from "@match-lock/shared";
import { FS } from "../../../globals/fs";
import { WINDOW } from "../../../globals/window";
import { join as pathJoin } from "path";
import { useNavigate } from "react-router";
import { replaceParams } from "../../../utils/router";
import { RosterConfigPaths } from "../paths";

import { EngineConfigInput } from "../Form/EngineConfigInput";
import { NewPieceConfig } from "./PieceForm";
import { resetPieces } from "../Form/resetPieces";

export function NewEngineConfig(){
  const [config, setConfig] = useState<null | RosterLockEngineWithRosterConfig>(null);
  const navigate = useNavigate();

  if(!config){
    return <EngineConfigInput
      value={null}
      onChange={(v) => {
        if(!v) return;
        setConfig({ engine: v, pieces: resetPieces(v) });
      }}
    />;
  };


  return (
    <NewPieceConfig
      value={config}
      onChange={setConfig}
      onSave={async ()=>{
        const matchlockDir = await FS.getMatchLockDir();
        const { canceled, filePath } = await WINDOW.showSaveDialog({
          title: 'Save Engine Config',
          defaultPath: pathJoin(matchlockDir,`${new Date().toISOString()}.matchlock.roster.json`),
          filters: [
            { name: 'JSON Files', extensions: ['json'] }
          ]
        })
        if(canceled || !filePath) return;

        await FS.writeJSON(filePath, config);
        navigate(replaceParams(RosterConfigPaths.edit, { enginePath: encodeURIComponent(filePath) }))
      }}
    />
  )
}
