import { useState } from "react";
import type { InputProps } from "../../../../../utils/react/input";
import { validatePathVariable } from "@match-lock/shared";

import PathVariablesTT from "./explain.md";

export function PathVariablesInput({ value, onChange }: InputProps<Array<string>>){
  return <>
    <h3><ToolTipSpan tip={PathVariablesTT} clickable>Path Variables</ToolTipSpan></h3>
    <PathVariableCreator value={value} onChange={onChange} />
    <div className="section">
      {value.map((variable, i) => (
        <PathVariableItem key={`${variable}-${i}`} index={i} value={value} onChange={onChange} />
      ))}
    </div>
  </>
}

function PathVariableCreator({ value, onChange }: InputProps<Array<string>>){
  const [newVariable, setNewVariable] = useState("");
  const [error, setError] = useState<null | string>(null);
  return <div className="section">
    <form onSubmit={(e)=>{
        try {
          e.preventDefault();
          if(error !== null) return;
          onChange([...value, newVariable]);
          setNewVariable("");
        }catch(error){
          setError((error as Error).message);
        }
      }}>
      <input
        type="text"
        value={newVariable}
        onChange={(e)=>{
          try {
            setNewVariable(e.target.value)
            setError(null);
            if(value.includes(e.target.value)) throw new Error("Variable already exists");
            validatePathVariable(e.target.value);
          }catch(error){
            setError((error as Error).message);
          }
        }}
      />
      <button type="submit">Add</button>
    </form>
    {error !== null && <div className="error">{error}</div>}
  </div>;
}

import { ToolTipSpan } from "../../../../../components/ToolTip";
function PathVariableItem({ index, value: variableList, onChange: setVariableList }: (
  & { index: number }
  & InputProps<Array<string>>
)){
  const value = variableList[index];
  const [error, setError] = useState<null | string>(null);
  const onChange = (newVariable: string)=>(setVariableList(
    variableList.map((oldVariable, i) => i !== index ? oldVariable : newVariable)
  ));
  return <div style={{ borderTop: "1px solid #ccc", borderBottom: "1px solid #ccc", padding: "0.5rem 0" }}>
    <div>
      <ToolTipSpan
        tip={`You can use this variable in the asset glob paths using \${${value}}`}
      >{value}</ToolTipSpan>
      <button
        onClick={()=> setVariableList(variableList.filter((_, i) => i !== index))}
      >Remove</button>
    </div>
    {error !== null && <div className="error">{error}</div>}
  </div>;
}
