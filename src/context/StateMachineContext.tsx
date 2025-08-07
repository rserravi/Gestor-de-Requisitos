import { createContext, useContext, useEffect, useState } from "react";

// Define los estados posibles
type StateMachineState = "init" | "software_questions" | "new_requisites" | "analyze_requisites" | "stall";
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
  if (!ctx) throw new Error("useStateMachine debe usarse dentro de StateMachineProvider");
  return ctx;
}
