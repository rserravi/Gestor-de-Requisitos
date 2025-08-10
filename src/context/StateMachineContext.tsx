import { createContext, useContext, useEffect, useState } from "react";
import { getTranslations, type Language } from "../i18n";

// Define los estados posibles
export type StateMachineState = "init" | "software_questions" | "new_requisites" | "analyze_requisites" | "stall";
// Puedes ampliar la interface según la lógica real
interface StateMachineContextType {
  state: StateMachineState;
  setState: (newState: StateMachineState) => void;
  // ...otros métodos o datos que necesites
}

const IS_DEBUG = import.meta.env.VITE_ENV === "debug";
const STORAGE_KEY = "app.statemachine";

const StateMachineContext = createContext<StateMachineContextType | undefined>(undefined);

export function StateMachineProvider({ children }: { children: React.ReactNode }) {
  // Lee de localStorage SOLO si debug
  const [state, setState] = useState<StateMachineState>(() => {
    if (IS_DEBUG) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return stored as StateMachineState;
    }
    return "new_requisites";
  });

  // Guarda en localStorage SOLO si debug
  useEffect(() => {
    if (IS_DEBUG) {
      localStorage.setItem(STORAGE_KEY, state);
    }
  }, [state]);

  // Debug log helper
  function debugLog(...args: any[]) {
    if (IS_DEBUG) console.log("[StateMachine]", ...args);
  }

  const setStateWithLog = (newState: StateMachineState) => {
    debugLog(`State changed: ${state} → ${newState}`);
    setState(newState);
  };

  return (
    <StateMachineContext.Provider value={{ state, setState: setStateWithLog }}>
      {children}
    </StateMachineContext.Provider>
  );
}

// Hook para acceder al contexto
export function useStateMachine() {
  const ctx = useContext(StateMachineContext);
  if (!ctx) {
    const language: Language =
      typeof navigator !== "undefined" && navigator.language
        ? (navigator.language.split("-")[0] as Language)
        : "es";
    const t = getTranslations(language);
    throw new Error(t.errorUseStateMachine);
  }
  return ctx;
}
