import { useEffect, useRef, useState } from "react";

type ProcessResult<T> = (
  | { status: "pending", previous: T | null }
  | { status: "failed", error: unknown, previous: T | null }
  | { status: "success", value: T }
);

export function usePromisedMemo<Deps extends readonly unknown[], T>(
  getValue: ()=>Promise<T>, deps: Deps
){
  const activeProcess = useRef(-1);
  const [shouldRun, setShouldRun] = useState(Date.now());
  const [result, setResult] = useState<ProcessResult<T>>({
    status: "pending", previous: null
  });
  useEffect(()=>{
    const active = Date.now();
    activeProcess.current = active;
    setResult({
      status: "pending",
      previous: extractValue(result)
    });
    Promise.resolve().then(async function(){
      try {
        const value = await getValue();
        if(activeProcess.current !== active) return;
        setResult({ status: "success", value });
      }catch(e){
        if(activeProcess.current !== active) return;
        setResult({
          status: "failed",
          error: e,
          previous: extractValue(result)
        });
      }
    });
  }, [shouldRun, ...deps]);

  return { ...result, update: ()=>(setShouldRun(Date.now())) };
}

function extractValue<T>(value: ProcessResult<T>){
  if(value.status === "success") return value.value;
  return value.previous;
}

export function promisedValueOrUndefined<T>(value: ProcessResult<T>){
  if(value.status === "success") return value.value;
}