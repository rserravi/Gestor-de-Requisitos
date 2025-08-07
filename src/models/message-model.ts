import type { StateMachineState } from "../context/StateMachineContext";

export type MessageSenderType = "user" | "ai";

export interface MessageModel {
  id: string;
  content: string;
  sender: MessageSenderType;
  timestamp: Date;
  project_id?: number; // Optional project association
  state: StateMachineState
}
