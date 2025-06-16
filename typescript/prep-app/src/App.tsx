import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  const toggleDevTools = () => {
    try {
      // Check if we're running in NW.js environment
      if (typeof window !== 'undefined' && window.nw) {
        alert("NW.js detected, getting window...")
        const win = window.nw.Window.get();
        alert("Window obtained, opening directory dialog...")
        win.showDevTools();
        win.showOpenDialog({
          properties: ['openDirectory']
        }, (dirs: string[]) => {
          console.log('Selected directories:', dirs)
          alert(`Selected: ${dirs.join(', ')}`)
        })
      } else {
        console.warn("Not running in NW.js environment");
        alert("NW.js not detected - are you running in the browser?");
        alert(Object.keys(window).sort().join(', '))
      }
    } catch (error) {
      console.error("Failed to access NW.js:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert(`Error: ${errorMessage}`);
    }
  }

  return (
    <>
      <div>Hello World!</div>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>MatchLock Prep App</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <button onClick={toggleDevTools} style={{ marginLeft: '10px' }}>
          Toggle DevTools
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
        <p>
          Press <kbd>F12</kbd> or click "Toggle DevTools" to open/close developer tools
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
