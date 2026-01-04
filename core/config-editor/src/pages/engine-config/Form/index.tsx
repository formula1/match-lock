
import { PageArrayTabs } from "../../../components/Tabs";

import type { MatchLockEngineConfig } from "@match-lock/shared";
import type { InputProps } from "../../../utils/react/input";
import { PieceDefinitions } from "./PieceDefinitions";
export { EngineLegend } from "./Legend";

export function EngineConfigForm({ value, onChange }: InputProps<MatchLockEngineConfig>){
  return <>
    <div className="section">
      <h2>Engine Config</h2>
      <div>
        <div>Engine Name</div>
        <input type="text" value={value.name} onChange={e => onChange({ ...value, name: e.target.value })} />
      </div>
      <div>
        <div>Engine Version</div>
        <input
          type="text"
          value={value.version}
          onChange={e => onChange({ ...value, version: e.target.value })}
        />
      </div>
    </div>
    <PieceDefinitions
      value={value.pieceDefinitions}
      onChange={v => onChange({ ...value, pieceDefinitions: v })}
      engineConfig={value}
    />
  </>
}
