import type { MatchLockEngineConfig } from "@match-lock/shared";
import { useValidator, type InputProps } from "../../../../../utils/react";
import { InputError } from "../../../../../components/InputError";

type AssetDefinition = MatchLockEngineConfig["pieceDefinitions"][string]["assets"][number];

export function AssetNameInput({ value, onChange, index, assetList }: (
  & InputProps<string>
  & { index: number }
  & { assetList: Array<AssetDefinition> }
)){
  const error = useValidator(value, (assetName)=>{
    for(let i = 0; i < assetList.length; i++){
      if(i === index) continue;
      if(assetList[i].name === assetName){
        throw new Error("Asset Name Already Exists");
      }
    }
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
