import { useEffect, useRef } from "react";
import { Router } from "./Router";
import { Tooltip } from "react-tooltip";
import ReactMarkdown from "react-markdown";

function App() {
  const initializationCalled = useRef(false);

  useEffect(() => {
    // Initialize user directories when the React app is ready
    // Use ref to prevent duplicate calls in StrictMode
    if (window.electronAPI && !initializationCalled.current) {
      initializationCalled.current = true;
      // Add a small delay to ensure the UI is fully rendered
      setTimeout(() => {
        window.electronAPI.initializeUserDirectories();
      }, 500);
    }
  }, []);

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
