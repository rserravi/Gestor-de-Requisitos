// services/state-machine-service.ts
import { api } from "./api";

export type StateMachineState =
  | "init"
  | "software_questions"
  | "new_requisites"
  | "analyze_requisites"
  | "stall";

export async function addStateMachineEntry(
  projectId: number,
  state: StateMachineState,
  extra?: Record<string, any> | null
) {
  const { data } = await api.post(
    `/state_machine/project/${projectId}`,
    { state, extra: extra ?? null },
    { headers: { "Content-Type": "application/json" } }
  );
  return data; // StateMachineRead
}
