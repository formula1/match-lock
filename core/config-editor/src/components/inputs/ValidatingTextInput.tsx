import { useEffect, useState } from "react";
import { InputProps } from "../../utils/react";
import { ToolTipSpan } from "../ToolTip";

export function ValidatingTextInput({ value, onChange, validate }: (
  & InputProps<string>
  & { validate: (v: string)=>unknown }
)){
  const [unkownValue, setUnkownValue] = useState(value);
  const [error, setError] = useState<null | string>(null);
  useEffect(()=>{
    setUnkownValue(value);
  },[value])
  return (
    <ToolTipSpan tip={error ?? "No Errors!"}>
    <input
      style={{ border: error ? "1px solid #F00" : "1px solid #0F0" }}
      type="text"
      value={unkownValue}
      onChange={(e)=>{
        try {
          setError(null);
          validate(e.target.value);
          onChange(e.target.value);
        }catch(e){
          setError((e as Error).message);
          setUnkownValue(value);
        }
      }}
    />
    </ToolTipSpan>
  );
}
