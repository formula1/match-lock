import type { MatchLockEngineConfig } from "@match-lock/shared";
import { useValidator, type InputProps } from "../../../../utils/react";
import { InputError } from "../../../../components/InputError";

type AssetDefinition = MatchLockEngineConfig["pieceDefinitions"][string]["assets"][number];

export function AssetNameInput({ value, onChange, assetList }: (
  & { assetList: Array<AssetDefinition> }
  & InputProps<string>
)){
  const error = useValidator(value, (assetName)=>{
    const exists = assetList.some((a) => a.name === assetName);
    if(exists) throw new Error("Asset Name Already Exists");
  });
  
  return <>
    <h3>
      <div>Asset Name</div>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </h3>
    {error !== null && <div><InputError>{error}</InputError></div>}
  </>
}
