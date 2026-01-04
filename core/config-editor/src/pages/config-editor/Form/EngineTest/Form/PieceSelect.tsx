import { RosterLockEngineConfig } from "@match-lock/shared";
import { InputProps } from "../../../../../utils/react";
import { useEffect } from "react";


export function PieceSelect(
  { value, onChange, engineConfig }: (
    & InputProps<string>
    & { engineConfig: RosterLockEngineConfig }
  )
) {

  const pieceNames = Object.keys(engineConfig.pieceDefinitions);
  useEffect(() => {
    if(!value && pieceNames.length > 0){
      onChange(pieceNames[0]);
    }
  }, [value, pieceNames])

  return (
    <>
      <h3>Piece Type</h3>
      <div>
        <select
          value={value}
          onChange={(e)=>(onChange(e.target.value))}
        >
          {pieceNames.map((name)=>(
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>
    </>
  )
}
