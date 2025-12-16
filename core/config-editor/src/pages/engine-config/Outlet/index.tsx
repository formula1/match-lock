import { Outlet } from "react-router";
import { LinkTabs } from "../../../components/Tabs";
import { EngineConfigPaths } from "../paths";
import { replaceParams } from "../../../utils/router";
import { CurrentFileProvider, useCurrentFile } from "./CurrentFile";

export function EngineOutlet(){
  return <CurrentFileProvider>
    <EngineTabs />
    <FileErrorOrOutlet />
  </CurrentFileProvider>
}

function EngineTabs(){
  const currentFile = useCurrentFile();
  const fileReady = currentFile.activeFile && currentFile.state === "ready";
  return (
    <LinkTabs
      className="secondary"
      pages={[
        { title: 'Engine', href: EngineConfigPaths.root },
        { title: 'New', href: EngineConfigPaths.new },
        !fileReady ? null :
        {
          title: 'Edit', href: replaceParams(
            EngineConfigPaths.edit, { enginePath: encodeURIComponent(currentFile.activeFile) }
          ),
        },
        !fileReady ? null :
        {
          title: 'Test', href: replaceParams(
            EngineConfigPaths.test, { enginePath: encodeURIComponent(currentFile.activeFile) }
          ),
        },
      ]}
    />
  )
}

function FileErrorOrOutlet(){
  const currentFile = useCurrentFile();

  if(!currentFile.activeFile) return <Outlet />;
  if(currentFile.state !== "failed") return <Outlet />;

  return <div>
    <h1>Failed to load file</h1>
    <pre>{JSON.stringify(currentFile.error, null, 2)}</pre>
  </div>
}
