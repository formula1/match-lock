import { RosterLockEngineWithRosterConfig } from "@match-lock/shared";
import { ROSTERCONFIG_ID } from "../paths";

export function PieceRosterLegend(
  { rosters }: { rosters: RosterLockEngineWithRosterConfig["rosters"] }
){
  return (
    <div className="section" style={{ textAlign: "left" }}>
      <h2>Legend</h2>
      <div className="alternate-list">
        {Object.entries(rosters).map(([pieceName, pieceValues]) => (
          <div key={pieceName} className="section">
            <h4><a href={`#${ROSTERCONFIG_ID.pieceTypeId(pieceName)}`}>{pieceName}</a></h4>
            <ul>
              {pieceValues.map((piece) => (
                <li key={piece.version.logic}>
                  <a href={`#${ROSTERCONFIG_ID.pieceValueId(piece)}`}>
                    <div>{piece.humanInfo.author}@{piece.humanInfo.name}</div>
                    <div>{piece.version.logic}</div>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
