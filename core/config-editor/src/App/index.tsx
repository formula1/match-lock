import { useState } from "react";
import "./common.css";
import { Router } from "./Router";
import { Tooltip } from "react-tooltip";
import ReactMarkdown from "react-markdown";
import { UserSettingsDialog } from "../pages/user-settings";

function App() {
  const [isReady, setIsReady] = useState(false);

  if(!isReady){
    return <UserSettingsDialog onSelect={()=>(setIsReady(true))} />
  };

  return <>
    <Router />
    <Tooltip
      id="global-tooltip"
      clickable
      render={({ content })=><ReactMarkdown>{content}</ReactMarkdown>}
    />
  </>
}

export default App
