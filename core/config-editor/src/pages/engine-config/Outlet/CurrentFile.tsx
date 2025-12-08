import {
  createContext, useContext, useMemo, type PropsWithChildren,
  useEffect, useState, useCallback
} from "react";
import { useParams } from "react-router";
import { FS } from "../../../globals/fs";
import { usePromisedMemo } from "../../../utils/react/promised-memo";
import { MatchLockEngineCaster, MatchLockEngineConfig } from "@match-lock/shared";

type CurrentFileContextType = (
  | {
    activeFile: null
  }
  | {
    activeFile: string;
    state: "loading",
  }
  | {
    activeFile: string;
    state: "failed",
    error: any,
  }
  | {
    activeFile: string;
    state: "ready",
    config: MatchLockEngineConfig;
    update: (config: MatchLockEngineConfig) => void;
    save: () => Promise<void>;
    saveAs: (newPath: string) => Promise<void>;
  }
);

const CurrentFileContext = createContext<CurrentFileContextType>({ activeFile: null });

export function useCurrentFile(){
  return useContext(CurrentFileContext);
}

export function CurrentFileProvider({ children }: PropsWithChildren) {
  const params = useParams();

  const activeFile = useMemo(() => {
    if(!params.enginePath) return null;
    return decodeURIComponent(params.enginePath);
  }, [params.enginePath]);

  const loadFile = useCallback(async (filePath: string) => {
    const contents = await FS.readFile(filePath);
    const str = new TextDecoder().decode(contents);
    const json = JSON.parse(str);
    const engine = MatchLockEngineCaster.check(json);
    return engine;
  }, [])

  const memoResult = usePromisedMemo(async ()=>{
    if(!activeFile) throw new Error("No active file");
    const engine = await loadFile(activeFile);
    return engine;
  }, [activeFile])

  const [config, setConfig] = useState<null | MatchLockEngineConfig>(null);
  useEffect(()=>{
    if(memoResult.status === "success"){
      setConfig(memoResult.value);
    }
  }, [memoResult])

  const props = useMemo<CurrentFileContextType>(() => {
    if(!config || !activeFile) return { activeFile: null };
    if(memoResult.status === "pending") return { activeFile, state: "loading" };
    if(memoResult.status === "failed") return { activeFile, state: "failed", error: memoResult.error };
    return {
      activeFile,
      state: "ready",
      config: config,
      update: (config: MatchLockEngineConfig) => {
        setConfig(config);
      },
      save: async () => {
        if(!activeFile) return;
        await FS.writeFile(activeFile, new TextEncoder().encode(JSON.stringify(config, null, 2)));
      },
      saveAs: async (newPath: string) => {
        if(!activeFile) return;
        await FS.writeFile(newPath, new TextEncoder().encode(JSON.stringify(config, null, 2)));
      }
    };
  }, [activeFile, memoResult]);
  return (
    <CurrentFileContext.Provider value={props} >
      { children }
    </CurrentFileContext.Provider>
  );
}
