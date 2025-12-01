import { useState } from "react";
import { validateGlobItem } from "@match-lock/shared";
import { ToolTipSpan } from "../../../../../components/ToolTip";
import { InputError } from "../../../../../components/InputError";
import { useValidator } from "../../../../../utils/react";
import type { InputProps } from "../../../../../utils/react";
import GlobTT from "./GlobTT.md";

export function GlobListInput({ value, onChange }: InputProps<Array<string>>){

  return <div>
    <h3><ToolTipSpan tip={GlobTT}>Glob</ToolTipSpan></h3>
    <div>
      <GlobCreator value={value} onChange={onChange} />
      {value.map((glob, i) => (
        <GlobItem key={`${glob}-${i}`} index={i} value={value} onChange={onChange} />
      ))}
    </div>
  </div>
}

function GlobCreator({ value, onChange }: InputProps<Array<string>>){
  const [newGlob, setNewGlob] = useState("");
  const error = useValidator(newGlob, validateGlobItem);
  return <>
    <div>Add Glob</div>
    <div>
      <input
        type="text"
        value={newGlob}
        onChange={(e)=>{
          setNewGlob(e.target.value)
        }}
      />
      <button onClick={() => onChange([...value, newGlob])}>Add</button>
    </div>
    {error !== null && <InputError>{error}</InputError>}
  </>
}

function GlobItem({ index, value: globList, onChange: setGlobList }: (
  & { index: number }
  & InputProps<Array<string>>
)){
  const value = globList[index];
  const onChange = (newGlob: string)=>(setGlobList(
    globList.map((oldGlob, i) => i !== index ? oldGlob : newGlob)
  ));
  const error = useValidator(value, (value)=>{
    lookForDuplicate(index, value, globList);
    validateGlobItem(value);
  });
  // const error = useValidator(value, validateGlobItem);
  return <>
    <div >
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
      />
      <button
        onClick={()=> setGlobList(globList.filter((_, i) => i !== index))}
      >Remove</button>
    </div>
    {error !== null && <InputError>{error}</InputError>}
  </>;
}

function lookForDuplicate(index: number, item: string, list: Array<string>){
  for(let i = 0; i < list.length; i++){
    if(i === index) continue;
    if(list[i] === item){
      throw new Error("Duplicate Glob");
    }
  }
}
