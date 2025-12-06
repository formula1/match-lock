import type { ValidInputProps } from "../../../../../utils/react/input";
import type { MatchLockEngineConfig } from "@match-lock/shared";
import { AssetNameInput } from "./AssetName";
import { AssetClassificationInput } from "./Classification";
import { CountUnknownInput } from "./CountUnknown/Input";
import { GlobListInput } from "./Glob";

type AssetDefinition = MatchLockEngineConfig["pieceDefinitions"][string]["assets"][number];

export function AssetDefinitionForm(
  { value, onChange, onDelete, assetList, index }: (
    & ValidInputProps<AssetDefinition>
    & { index: number }
    & { assetList: Array<AssetDefinition> }
    & { onDelete: ()=>unknown }
)){
  return <>
    <h3>
      <AssetNameInput
        value={value.name}
        onChange={v => onChange({...value, name: v})}
        onDelete={onDelete}
        assetList={assetList}
      />
    </h3>
    <div className="section">
      <AssetClassificationInput
        value={value.classification}
        onChange={v => onChange({...value, classification: v})}
      />
    </div>
    <div className="section">
      <CountUnknownInput
        value={value.count}
        onChange={v => onChange({...value, count: v})}
      />
    </div>
    <GlobListInput
      value={value.glob}
      onChange={v => onChange({...value, glob: v})}
    />
  </>
}
