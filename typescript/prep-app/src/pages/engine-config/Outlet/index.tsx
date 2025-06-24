import { Outlet } from "react-router";
import { LinkTabs } from "../../../components/Tabs";
import { EngineConfigPaths } from "../paths";
import { replaceParams } from "../../../utils/router";
import { CurrentFileProvider, useCurrentFile } from "./CurrentFile";

export function EngineOutlet(){
  return <CurrentFileProvider>
    <EngineTabs />
    <Outlet />
  </CurrentFileProvider>
}

function EngineTabs(){
  const { activeFile } = useCurrentFile();
  const activeFileLocation = (
    !activeFile ? null : replaceParams(EngineConfigPaths.edit, { enginePath: encodeURIComponent(activeFile) })
  )
  return (
    <LinkTabs
      pages={[
        { title: 'Engine', href: EngineConfigPaths.root },
        { title: 'New', href: EngineConfigPaths.new },
        !activeFileLocation ? null :
        {
          title: 'Edit', href: activeFileLocation,
        },
      ]}
    />
  )
}