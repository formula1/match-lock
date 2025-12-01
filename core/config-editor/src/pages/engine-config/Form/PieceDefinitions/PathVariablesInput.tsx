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
    <div>
      <input
        type="text"
        value={newVariable}
        onChange={(e)=>{
          setNewVariable(e.target.value)
          setError(null);
          if(value.includes(e.target.value)) return setError("Variable already exists");
        }}
      />
      <button onClick={() => onChange([...value, newVariable])}>Add</button>
    </div>
    {error !== null && <div className="error">{error}</div>}
  </div>;
}

function PathVariableItem({ index, value: variableList, onChange: setVariableList }: (
  & { index: number }
  & InputProps<Array<string>>
)){
  const value = variableList[index];
  const onChange = (newVariable: string)=>(setVariableList(
    variableList.map((oldVariable, i) => i !== index ? oldVariable : newVariable)
  ));
  return <div style={{ borderTop: "1px solid #ccc", borderBottom: "1px solid #ccc", padding: "0.5rem 0" }}>
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
    />
    <button
      onClick={()=> setVariableList(variableList.filter((_, i) => i !== index))}
    >Remove</button>
  </div>;
}
