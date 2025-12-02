import { useState } from "react";
import { Router } from "./Router";
import { Tooltip } from "react-tooltip";
import "./common.css";
import { UserSettingsDialog } from "../pages/user-settings";
import { Markdown } from "../components/Markdown";

function App() {
  const [isReady, setIsReady] = useState(false);

  if(!isReady){
    return <UserSettingsDialog onSelect={()=>(setIsReady(true))} />
  };

  return <>
    <Router />
    <Tooltip
      id="global-tooltip"
      clickable={true}
      render={({ content })=>(<Markdown>{content}</Markdown>)}
    />
  </>
}

export default App
