import { createContext, useContext, useMemo, type PropsWithChildren } from "react";
import { useParams } from "react-router";

type CurrentFileContextType = { activeFile: null | string };

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

  return (
    <CurrentFileContext.Provider value={{ activeFile }}>
      { children }
    </CurrentFileContext.Provider>
  );
}
