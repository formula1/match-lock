import { useState } from "react";
import { type InputProps } from "../../../../../../utils/react/input";
import type { MatchLockEngineConfig } from "@match-lock/shared";
import { ToolTipSpan } from "../../../../../../components/ToolTip";

export function AssetDefinitionCreator({ value, onChange }: InputProps<MatchLockEngineConfig["pieceDefinitions"][string]>){
  const [name, setName] = useState("");
  const [asset, newAsset] = useState<MatchLockEngineConfig["pieceDefinitions"][string]["assets"][number]>({
    name: "",
    classification: "logic",
    count: 1,
    glob: [],
  });
  const [error, setError] = useState<null | string>(null);
  return <form
      className="section"
      onSubmit={(e)=>{
        e.preventDefault();
        try {
          setError(null);
          if(name === "") throw new Error("Name cannot be empty");
          if(value.assets.some((a) => a.name === name)) throw new Error("Name already exists");
          onChange({
            ...value,
            assets: [...value.assets, {
              name,
              classification: "logic",
              count: 1,
              glob: [],
            }]
          });
          setName("");
        }catch(error){
          setError((error as Error).message);
        }
      }}
    >
    <h3><ToolTipSpan tip="">Create Asset</ToolTipSpan></h3>
    <div>
      <input
        type="text" placeholder="Asset Name..."
        value={name}
        onChange={(e)=>{
          try {
            setName(e.target.value)
            setError(null);
            if(value.assets.some((a) => a.name === name)) throw new Error("Name already exists");
          }catch(error){
            setError((error as Error).message);
          }
        }}
      />
      <button
        disabled={!!error || name === ""}
        type="submit"
      >Create</button>
    </div>
    {error !== null && <div className="error">{error}</div>}
  </form>
}
