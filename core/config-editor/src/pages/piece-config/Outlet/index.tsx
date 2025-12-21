import { Outlet, useParams } from "react-router";
import { LinkTabs } from "../../../components/Tabs";
import { RosterConfigPaths } from "../paths";
import { replaceParams } from "../../../utils/router";
import { CurrentFileProvider, useCurrentFile } from "./CurrentFile";
import { useMemo } from "react";

export function RosterOutlet(){
  const params = useParams();

  const activeFile = useMemo(() => {
    if(!params.enginePath) return;
    return decodeURIComponent(params.enginePath);
  }, [params.enginePath]);

  return <CurrentFileProvider filePath={activeFile}>
    <RosterTabs />
    <FileErrorOrOutlet />
  </CurrentFileProvider>
}

function RosterTabs(){
  const currentFile = useCurrentFile();
  const fileReady = currentFile.activeFile && currentFile.state === "ready";
  return (
    <LinkTabs
      className="secondary"
      pages={[
        { title: 'Rosters', href: RosterConfigPaths.root },
        { title: 'New', href: RosterConfigPaths.new },
        !fileReady ? null :
        {
          title: 'Edit', href: replaceParams(
            RosterConfigPaths.edit, { rosterPath: encodeURIComponent(currentFile.activeFile) }
          ),
        },
        !fileReady ? null :
        {
          title: 'Test', href: replaceParams(
            RosterConfigPaths.test, { rosterPath: encodeURIComponent(currentFile.activeFile) }
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

  console.log("Failed to load file", currentFile);
  return <div>
    <h1>Failed to load file</h1>
    <pre>{JSON.stringify(currentFile.error, null, 2)}</pre>
  </div>
}
