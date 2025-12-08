import type { ValidInputProps, ListItemProps } from "../../../../../utils/react/input";
import type { MatchLockEngineConfig } from "@match-lock/shared";
import { AssetNameInput } from "./AssetName";
import { AssetClassificationInput } from "./Classification";
import { CountUnknownInput } from "./CountUnknown/Input";
import { GlobListInput } from "./Glob";

type AssetDefinition = MatchLockEngineConfig["pieceDefinitions"][string]["assets"][number];

export function AssetDefinitionForm(
  { value, onChange, index, items, onDelete }: (
    & ValidInputProps<AssetDefinition>
    & ListItemProps<AssetDefinition>
)){
  return <>
    <h3>
      <AssetNameInput
        value={value.name}
        onChange={v => onChange({...value, name: v})}
        index={index}
        onDelete={onDelete}
        items={items}
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
    <div className="section">
      <GlobListInput
        value={value.glob}
        onChange={v => onChange({...value, glob: v})}
      />
    </div>
  </>
}
