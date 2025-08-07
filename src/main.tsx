import { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { BrowserRouter } from "react-router-dom";
import { StateMachineProvider } from "./context/StateMachineContext";
import { RootRouter } from "./router/RootRouter";

// --- Hook para dark mode persistente ---
function useDarkMode() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Lee de localStorage, o por defecto detecta preferencia del SO
    const saved = localStorage.getItem("darkMode");
    if (saved === "true" || saved === "false") return saved === "true";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    localStorage.setItem("darkMode", isDarkMode ? "true" : "false");
  }, [isDarkMode]);

  return [isDarkMode, setIsDarkMode] as const;
}

function MainWrapper() {
  const [isDarkMode, setIsDarkMode] = useDarkMode();

  const theme = createTheme({
    palette: {
      mode: isDarkMode ? "dark" : "light",
      // Personaliza aquí tus colores si quieres
    },
    // Puedes personalizar tipografía, etc.
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <StateMachineProvider>
        {/* Aquí metemos el enrutador global */}
        <RootRouter
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode((d) => !d)}
        />
      </StateMachineProvider>
    </ThemeProvider>
  );
}

// -- Render --
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <MainWrapper />
    </BrowserRouter>
  </StrictMode>
);
