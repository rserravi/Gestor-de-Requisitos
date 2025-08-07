import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../styles/globals.css'
import App from './App.tsx'
import { BrowserRouter } from "react-router-dom";
import { StateMachineProvider } from "./context/StateMachineContext"; // o la ruta que elijas

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <StateMachineProvider>
        <App />
      </StateMachineProvider>
    </BrowserRouter>
  </StrictMode>,
)