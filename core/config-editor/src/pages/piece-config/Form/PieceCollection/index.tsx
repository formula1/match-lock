import { RosterLockEngineWithRosterConfig } from "@match-lock/shared";
import { InputProps } from "../../../../utils/react";

import { PieceValueList } from "./PieceList";
export function PieceCollection(
  { value, onChange, engineConfig }: (
    & InputProps<RosterLockEngineWithRosterConfig["pieces"]>
    & { engineConfig: RosterLockEngineWithRosterConfig["engine"] }
  )
){
  return (
    <>
      {Object.entries(value).map(([pieceType, pieceValues]) => (
        <PieceValueList
          key={pieceType}
          value={pieceValues}
          onChange={v => onChange({ ...value, [pieceType]: v })}
          pieceType={pieceType}
          pieceDefinition={engineConfig.pieceDefinitions[pieceType]}
          pieces={value}
        />
      ))}
    </>
  )
}

