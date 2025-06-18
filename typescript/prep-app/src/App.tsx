import { Router } from "./Router";
import { Tooltip } from "react-tooltip";
import ReactMarkdown from "react-markdown";

function App() {
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
