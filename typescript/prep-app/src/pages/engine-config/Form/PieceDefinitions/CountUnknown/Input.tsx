import { useState, useEffect } from "react";
import type { InputProps } from "../../../../../utils/react";

import { ToolTipSpan } from "../../../../../components/ToolTip";
import { InputError } from "../../../../../components/InputError";
import ValueTT from "./ValueTT.md";
import RangeTT from "./RangeTT.md";

type Count = number | "*" | [number, number | "*"];

export function CountUnknownInput({ value, onChange }: InputProps<Count>){
  const [valueOrRange, setValueOrRange] = useState<"value" | "range">("value");
  return <>
    <div>
      <h3>Count</h3>
      <div>
        <label><ToolTipSpan tip={ValueTT}>Value</ToolTipSpan></label>
        <input type="radio" checked={valueOrRange === "value"} onChange={()=> setValueOrRange("value")} />
      </div>
      <div>
        <label><ToolTipSpan tip={RangeTT}>Range</ToolTipSpan></label>
        <input type="radio" checked={valueOrRange === "range"} onChange={()=> setValueOrRange("range")} />
      </div>
      {valueOrRange === "value" ? (
        <ValueInput value={value} onChange={onChange} />
      ) : (
        <RangeInput value={value} onChange={onChange} />
      )}

    </div>
  </>
}

function ValueInput({ value: countValue, onChange }: InputProps<Count>){
  const [invalidValue, setInvalidValue] = useState("");
  const [error, setError] = useState<null | string>(null);
  useEffect(()=>{
    if(Array.isArray(countValue)) onChange(valueToNumber(countValue));
  },[countValue])

  const value = valueToNumber(countValue);

  return <>
    <div>
      <input
        type="text"
        value={error !== null ? invalidValue : Array.isArray(value) ? value[0] : value}
        onChange={(e)=>{
          try {
            setError(null);
            onChange(validateNumberOrStar(e.target.value));
          }catch(error){
            setError((error as Error).message);
            setInvalidValue(e.target.value);
          }
        }}
      />
    </div>
    {error !== null && <InputError>{error}</InputError>}
  </>
}

function RangeInput({ value: countValue, onChange }: InputProps<Count>){
  const [minInvalidValue, setMinInvalidValue] = useState("");
  const [minError, setMinError] = useState<null | string>(null);
  const [maxInvalidValue, setMaxInvalidValue] = useState("");
  const [maxError, setMaxError] = useState<null | string>(null);

  useEffect(()=>{
    if(!Array.isArray(countValue)) onChange(valueToArray(countValue))
  },[countValue])

  const value = valueToArray(countValue);

  return <>
    <div>
      <div>
        <span>Min: </span>
        <input
          type="text"
          value={minError !== null ? minInvalidValue : value[0]}
          onChange={(e)=>{
            try {
              setMinError(null);
              onChange([validateCount(e.target.value), value[1]]);
            }catch(error){
              setMinError((error as Error).message);
              setMinInvalidValue(e.target.value);
            }
          }}
        />
      </div>
      {minError !== null && <InputError>{minError}</InputError>}
      <div>
        <span>Max: </span>
        <input
          type="text"
          value={maxError !== null ? maxInvalidValue : value[1]}
          onChange={(e)=>{
            try {
              setMaxError(null);
              const newMax = validateNumberOrStar(e.target.value);
              if(newMax !== "*" && newMax < value[0]){
                throw new Error("Max must be greater than or equal to min");
              }
              onChange([value[0], newMax]);
            }catch(error){
              setMaxError((error as Error).message);
              setMaxInvalidValue(e.target.value);
            }
          }}
        />
      </div>
      {maxError !== null && <InputError>{maxError}</InputError>}
    </div>
  </>

}

function valueToNumber(value: Count): number | "*" {
  if(Array.isArray(value)) return value[0];
  return value;
}

function valueToArray(value: Count): [number, number | "*"]{
  if(Array.isArray(value)) return value;
  if(value === "*" ) return [0, 1];
  return [value, value];
}

function validateCount(value: string): number {
  const num = Number.parseInt(value);
  if(Number.isNaN(num)){
    throw new Error("Exepcting a number");
  }
  if(num <= 0){
    throw new Error("Exepcting a number greater than or equal to 0");
  }
  if(Math.round(num) !== num){
    throw new Error("Exepcting a whole number");
  }
  return num;
}

function validateNumberOrStar(value: string): number | "*"{
  if(value === "*") return value;
  return validateCount(value);
}
