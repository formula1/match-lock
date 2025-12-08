
import { InputProps } from "../../../../../utils/react";
import { ToolTipSpan } from "../../../../../components/ToolTip";
import { AssetDefinitionCreator } from "./Creation";
import { AssetDefinitionForm } from "./AssetItem";
import { MatchLockEngineConfig } from "@match-lock/shared";

import tooltip from "./tooltip.md";

export function AssetsInput(
  { value, onChange, pathVariables }: (
    & InputProps<MatchLockEngineConfig["pieceDefinitions"][string]["assets"]>
    & { pathVariables: MatchLockEngineConfig["pieceDefinitions"][string]["pathVariables"] }
  )
){
  return <>
    <h3><ToolTipSpan tip={tooltip} clickable>Assets</ToolTipSpan></h3>
    <AssetDefinitionCreator
      validate={(v)=>{
        if(value.some((a) => a.name === v)) throw new Error("Name already exists")
      }}
      onSubmit={(v) => onChange([...value, v])}
    />
    {value.map((asset, i) => (
      <div className="section" key={i}>
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
  </>;
}
