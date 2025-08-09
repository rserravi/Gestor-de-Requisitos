// services/state-machine-service.ts
export type StateMachineState =
  | "init"
  | "software_questions"
  | "new_requisites"
  | "analyze_requisites"
  | "stall";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function getToken() {
  const token = localStorage.getItem("access_token");
  if (!token) throw new Error("No autenticado");
  return token;
}

export async function addStateMachineEntry(
  projectId: number,
  state: StateMachineState,
  extra?: Record<string, any> | null
) {
  const res = await fetch(`${API_URL}/state_machine/project/${projectId}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ state, extra: extra ?? null }),
  });
  if (!res.ok) throw new Error("No se pudo actualizar la máquina de estados");
  return await res.json(); // opcional: devolver StateMachineRead
}
