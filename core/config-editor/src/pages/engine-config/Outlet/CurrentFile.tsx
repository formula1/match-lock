import {
  createContext, useContext, useMemo, type PropsWithChildren,
  useEffect, useState, useCallback,
  SetStateAction
} from "react";
import { useParams } from "react-router";
import { FS } from "../../../globals/fs";
import { usePromisedMemo } from "../../../utils/react/promised-memo";
import { cloneJSON, ROSTERLOCK_ENGINE_CASTER_JSONSCHEMA, MatchLockEngineConfig } from "@match-lock/shared";

import { diff } from 'json-diff-ts';

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
    isDirty: boolean,
    config: MatchLockEngineConfig;
    update: (config: SetStateAction<MatchLockEngineConfig>) => void;
    reset: () => void;
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
    const json = await FS.readJSON(filePath);
    const engine = ROSTERLOCK_ENGINE_CASTER_JSONSCHEMA.cast(json);
    return engine;
  }, [])

  const memoResult = usePromisedMemo(async ()=>{
    if(!activeFile) throw new Error("No active file");
    const engine = await loadFile(activeFile);
    return engine;
  }, [activeFile])

  const [originalConfig, setOriginalConfig] = useState<MatchLockEngineConfig>({
    name: "",
    version: "",
    pieceDefinitions: {},
  });

  const [config, setConfig] = useState<MatchLockEngineConfig>({
    name: "",
    version: "",
    pieceDefinitions: {},
  });

  useEffect(()=>{
    if(memoResult.status === "success"){
      setOriginalConfig(cloneJSON(memoResult.value));
      setConfig(cloneJSON(memoResult.value));
    }
  }, [memoResult])

  const props: CurrentFileContextType = (() => {
    if(!config || !activeFile) return { activeFile: null };
    if(memoResult.status === "pending") return { activeFile, state: "loading" };
    if(memoResult.status === "failed") return { activeFile, state: "failed", error: memoResult.error };
    return {
      activeFile,
      state: "ready",
      config: config,
      update: setConfig,
      isDirty: diff(originalConfig, config).length > 0,
      reset: () => setConfig(cloneJSON(originalConfig)),
      save: async () => {
        if(!activeFile) return;
        await FS.writeJSON(activeFile, config);
        setOriginalConfig(cloneJSON(config));
      },
      saveAs: async (newPath: string) => {
        await FS.writeJSON(newPath, config);
        setOriginalConfig(cloneJSON(config));
      }
    };
  })();
  return (
    <CurrentFileContext.Provider value={props} >
      { children }
    </CurrentFileContext.Provider>
  );
}
