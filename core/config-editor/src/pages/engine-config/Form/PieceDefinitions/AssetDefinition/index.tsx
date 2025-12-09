
import { InputProps } from "../../../../../utils/react";
import { ToolTipSpan } from "../../../../../components/ToolTip";
import { AssetDefinitionCreator } from "./Creation";
import { AssetDefinitionForm } from "./AssetItem";
import { MatchLockEngineConfig } from "@match-lock/shared";

import tooltip from "./tooltip.md";
import { useEffect, useState } from "react";

export function AssetsInput(
  { value, onChange, pathVariables }: (
    & InputProps<MatchLockEngineConfig["pieceDefinitions"][string]["assets"]>
    & { pathVariables: MatchLockEngineConfig["pieceDefinitions"][string]["pathVariables"] }
  )
){
  const [newAsset, setNewAsset] = useState<null | string>(null);

  useEffect(()=>{
    const to = setTimeout(()=>(setNewAsset(null)), 10 * 1000);
    return () => clearTimeout(to);
  }, [newAsset])

  return <>
    <h3><ToolTipSpan tip={tooltip} clickable>Assets</ToolTipSpan></h3>
    <AssetDefinitionCreator
      validate={(v)=>{
        if(value.some((a) => a.name === v)) throw new Error("Name already exists")
      }}
      onSubmit={(v) =>{
        onChange([...value, v])
        setNewAsset(v.name);
      }}
    />
    {newAsset !== null && <div className="error">
      <a href={`#${assetElementId(newAsset)}`}>New asset created: {newAsset}</a>
    </div>}

    <div className="alternate-list">
      {value.map((asset, i) => (
        <div className="section" key={i} id={assetElementId(asset.name)}>
          <AssetDefinitionForm
            index={i}
            value={asset}
            onChange={v => onChange(value.map((a, j) => j === i ? v : a))}
            onDelete={() => onChange(value.filter((_, j) => j !== i))}
            items={value}
            pathVariables={pathVariables}
          />
        </div>
      ))}
    </div>
  </>;
}

function assetElementId(assetName: string){
  return `engine-piece-asset-${assetName}`;
}
