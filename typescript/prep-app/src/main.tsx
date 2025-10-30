import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './tauri' // Initialize Tauri API compatibility layer

console.log("Hello World!")

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

