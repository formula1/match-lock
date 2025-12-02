import { useState } from "react";
import type { InputProps } from "../../../../utils/react/input";

export function PathVariablesInput({ value, onChange }: InputProps<Array<string>>){
  return <div>
    <h3>Path Variables</h3>
    <PathVariableCreator value={value} onChange={onChange} />
    <div className="section">
      {value.map((variable, i) => (
        <PathVariableItem key={`${variable}-${i}`} index={i} value={value} onChange={onChange} />
      ))}
    </div>
  </div>
}

function PathVariableCreator({ value, onChange }: InputProps<Array<string>>){
  const [newVariable, setNewVariable] = useState("");
  const [error, setError] = useState<null | string>(null);
  return <div className="section">
    <form onSubmit={(e)=>{
        try {
          e.preventDefault();
          if(error !== null) return;
          if(newVariable === "") throw new Error("Variable name cannot be empty");
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
          setNewVariable(e.target.value)
          setError(null);
          if(value.includes(e.target.value)) return setError("Variable already exists");
        }}
      />
      <button type="submit">Add</button>
    </form>
    {error !== null && <div className="error">{error}</div>}
  </div>;
}

import { ToolTipSpan } from "../../../../components/ToolTip";
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
