import type { MatchLockEngineConfig } from "@match-lock/shared";
import { ListItemProps, type InputProps } from "../../../../../utils/react";

type AssetDefinition = MatchLockEngineConfig["pieceDefinitions"][string]["assets"][number];

import { TitleInput } from "../../../../../components/TitleInput";

export function AssetNameInput({ value, onChange, onDelete, items }: (
  & InputProps<string>
  & ListItemProps<AssetDefinition>
)){

  return <TitleInput
    placeholder="Asset Name..."
    originalValue={value}
    existingNames={items.map((a) => a.name)}
    validate={name => {}}
    onSubmit={onChange}
    onDelete={onDelete}
  />
}
