
import { PageArrayTabs } from "../../../components/Tabs";

import type { RosterLockEngineWithRosterConfig } from "@match-lock/shared";
import type { InputProps } from "../../../utils/react/input";
import { PieceCollection } from "./PieceCollection";
export { PieceRosterLegend } from "./Legend";

export * from "./resetPieces"

import { EngineConfigInput } from "./EngineConfigInput";
import { useEffect } from "react";
import { resetPieces } from "./resetPieces";

export function RosterConfigForm({ value, onChange }: InputProps<RosterLockEngineWithRosterConfig>){

  useEffect(()=>{
    onChange({ ...value, pieces: resetPieces(value.engine) });
  }, [value.engine])

  return <>
    <EngineConfigInput
      value={value.engine}
      onChange={(v)=>{
        if(!v) throw new Error("Engine config is required");
        onChange({ ...value, engine: v })
      }}
    />
    <PieceCollection
      value={value.pieces}
      onChange={v => onChange({ ...value, pieces: v })}
      engineConfig={value.engine}
    />
  </>
}
