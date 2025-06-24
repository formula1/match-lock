
import { Outlet } from "react-router";
import { LinkTabs } from "../components/Tabs";
import { EngineConfigPaths } from "../pages/engine-config/paths";

export function GlobalOutlet(){
  return (
    <>
    <LinkTabs
      pages={[
        { title: 'Home', href: '/' },
        {
          title: 'Engine',
          href: EngineConfigPaths.root,
          isActive: (location) => location.pathname.startsWith(EngineConfigPaths.root),
        },
      ]}
    />
    <Outlet />
    </>
  )
}
