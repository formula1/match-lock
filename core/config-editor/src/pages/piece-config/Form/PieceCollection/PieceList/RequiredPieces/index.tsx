import { InputProps, ListItemProps } from "../../../../../../utils/react";
import { PieceDefinition, PieceValue } from "../../types";

import { ROSTERCONFIG_ID } from "../../../../paths";
import { useState } from "react";
import { ToolTipSpan } from "../../../../../../components/ToolTip";
import { RosterLockEngineWithRosterConfig } from "@match-lock/shared";


import requiredPiecesTT from "./requiredPiecesTT.md";

export function RequiredPieces({ value, onChange, pieceDefinition, pieces }: (
  & InputProps<PieceValue["requiredPieces"]>
  & { pieceDefinition: PieceDefinition, pieces: RosterLockEngineWithRosterConfig["pieces"] }
)){

  if(pieceDefinition.requires.length === 0) return null;

  return (
    <div className="section">
      <div><ToolTipSpan tip={requiredPiecesTT}>Required Pieces</ToolTipSpan></div>
      {pieceDefinition.requires.map((requiredPieceType, index) => (
        <RequiredPieceType
          key={index}
          value={value[requiredPieceType]}
          onChange={v => onChange({ ...value, [requiredPieceType]: v })}
          pieceType={requiredPieceType}
          pieces={pieces}
        />
      ))}
    </div>
  )
}

function RequiredPieceType({ value, onChange, pieceType, pieces }: (
  & InputProps<PieceValue["requiredPieces"][string]>
  & {
    pieceType: string, pieces: RosterLockEngineWithRosterConfig["pieces"]
  }
)){
  const [displayMandatory, setDisplayMandatory] = useState(false);
  return (
    <div className="section">
      <div>{pieceType}</div>
      <div>
        <label>Selectable: </label>
        <input
          type="checkbox"
          checked={value.selectable}
          onChange={(e) => onChange({ ...value, selectable: e.target.checked })}
        />
      </div>
      <div>
        <div>
          <button
            onClick={() => setDisplayMandatory(!displayMandatory)}
          >{displayMandatory ? 'Hide' : 'Show'} Mandatory</button>
        </div>
        {displayMandatory && pieces[pieceType].map((piece, index) => (
          <div
            key={index}
            style={{ display: "flex", flexDirection: "row"}}
          >
            <input
              type="checkbox"
              checked={value.expected.includes(piece.version.logic)}
              onChange={(e) => onChange({
                ...value,
                expected: (
                  e.target.checked ? [...value.expected, piece.version.logic]
                  : value.expected.filter((v) => v !== piece.version.logic)
                )
              })}
            />
            <a href={`#${ROSTERCONFIG_ID.pieceValueId(piece)}`} >
              <div>
                <span>{piece.humanInfo.author}@{piece.humanInfo.name}</span>
                <span>{piece.version.logic}</span>
              </div>
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
