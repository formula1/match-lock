
import { InputProps } from "../../../../../utils/react";
import { ToolTipSpan } from "../../../../../components/ToolTip";
import { AssetDefinitionCreator } from "./Creation";
import { AssetDefinitionForm } from "./AssetItem";
import { MatchLockEngineConfig } from "@match-lock/shared";

import tooltip from "./tooltip.md";

export function AssetsInput({ value, onChange }: InputProps<MatchLockEngineConfig["pieceDefinitions"][string]>){
  return <>
    <h3><ToolTipSpan tip={tooltip} clickable>Assets</ToolTipSpan></h3>
    <AssetDefinitionCreator value={value} onChange={onChange} />
    {value.assets.map((asset, i) => (
      <div className="section" key={i}>
        <AssetDefinitionForm
          index={i}
          value={asset}
          onChange={v => onChange({ ...value, assets: value.assets.map((a, j) => j === i ? v : a) })}
          onDelete={() => onChange({ ...value, assets: value.assets.filter((_, j) => j !== i) })}
          items={value.assets}
        />
      </div>
    ))}
  </>;
}
