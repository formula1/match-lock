import type { MatchLockEngineConfig } from "@match-lock/shared";
import { type InputProps } from "../../../../../utils/react";

type AssetDefinition = MatchLockEngineConfig["pieceDefinitions"][string]["assets"][number];

import { TitleInput } from "../../../../../components/TitleInput";

export function AssetNameInput({ value, onChange, onDelete, assetList }: (
  & InputProps<string>
  & { assetList: Array<AssetDefinition> }
  & { onDelete: ()=>unknown }
)){

  return <TitleInput
    placeholder="Asset Name..."
    originalValue={value}
    existingNames={assetList.map((a) => a.name)}
    validate={name => {}}
    onSubmit={onChange}
    onDelete={onDelete}
  />
}
