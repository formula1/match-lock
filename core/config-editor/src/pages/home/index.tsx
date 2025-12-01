import { LinkTabs } from "../../components/Tabs"
import { EngineConfigPaths } from "../engine-config/paths";
import Markdown from "react-markdown";

export function HomePage(){
  return <>
    <h1>Hello World!</h1>
    <LinkTabs
      pages={[
        { title: 'Engine Config', href: EngineConfigPaths.root },
      ]}
    />
    <Markdown></Markdown>

  </>
}
