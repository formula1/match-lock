
import { Outlet } from "react-router";
import { LinkTabs } from "../components/Tabs";
import { RosterLockConfigPaths } from "../pages/config-editor/paths";

export function GlobalOutlet(){
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
    <LinkTabs
      className="primary"
      pages={[
        { title: 'Home', href: '/' },
        { title: 'About', href: '/about' },
        {
          title: "New Config",
          href: RosterLockConfigPaths.newRoot,
          isActive: (location) => location.pathname.startsWith(RosterLockConfigPaths.newRoot),
        }
      ]}
    />
    <Outlet />
    </div>
  )
}
