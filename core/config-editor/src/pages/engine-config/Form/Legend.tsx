import { MatchLockEngineConfig } from "@match-lock/shared";

import { ENGINECONFIG_ID } from "../paths";

export function EngineLegend({ engineConfig }: { engineConfig: MatchLockEngineConfig }){
  const pieces = Object.entries(engineConfig.pieceDefinitions);
  if(pieces.length === 0) return null;
  return (
  <div className="section" style={{ textAlign: "left" }}>
    <h2>Legend</h2>
    <div className="alternate-list">
    {pieces.map(([pieceName, definition]) => (
      <div key={pieceName} className="section">
        <h4><a href={`#${ENGINECONFIG_ID.pieceId(pieceName)}`}>{pieceName}</a></h4>
        {definition.assets.length > 0 && (
          <ul>
            {definition.assets.map((asset) => (
              <li key={asset.name}>
                <a href={`#${ENGINECONFIG_ID.assetId(asset.name)}`}>{asset.name}</a>
              </li>
            ))}
          </ul>
        )}
      </div>
    ))}
    </div>
  </div>
  );
}

