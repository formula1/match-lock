
import { Outlet } from "react-router";
import { LinkTabs } from "../components/Tabs";
import { EngineConfigPaths } from "../pages/engine-config/paths";

export function GlobalOutlet(){
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
    <LinkTabs
      className="primary"
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
    </div>
  )
}
