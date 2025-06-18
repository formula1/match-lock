import { Outlet, Route } from "react-router";
import { LinkTabs } from "../../components/Tabs";
import { EngineConfigPaths } from "./paths";

import { EngineRoot } from "./Root";
import { NewEngineConfig } from "./New";
import { EditEngineConfig } from "./Edit";

function EngineOutlet(){
  return <>
    <LinkTabs
      pages={[
        { title: 'Home', href: EngineConfigPaths.root },
        { title: 'New', href: EngineConfigPaths.new },
        { title: 'Edit', href: EngineConfigPaths.edit, isActive: (location) => location.pathname.startsWith(EngineConfigPaths.edit) },
      ]}
    />
    <Outlet />
  </>

}

export const EngineRoute = (
  <Route path={EngineConfigPaths.root} element={<EngineOutlet />}>
    <Route index element={<EngineRoot />} />
    <Route path={EngineConfigPaths.new} element={<NewEngineConfig />} />
    <Route path={EngineConfigPaths.edit} element={<EditEngineConfig />} />
  </Route>
)