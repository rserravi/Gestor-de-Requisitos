// services/chat-service.ts
import { api } from "./api";
import type { MessageModel } from "../models/message-model";
import type { StateMachineState } from "../context/StateMachineContext";

// Adaptador entre backend (ISO string) y frontend (Date)
function mapBackendToMessage(data: any): MessageModel {
  return {
    id: String(data.id),
    content: data.content,
    sender: data.sender,
    timestamp: new Date(data.timestamp),
    project_id: data.project_id,
    state: data.state,
  };
}

// Cargar mensajes de un proyecto y opcionalmente sincronizar state machine
export async function fetchProjectMessages(
  projectId: number,
  onStateDetected?: (state: StateMachineState) => void
): Promise<MessageModel[]> {
  const { data } = await api.get(`/chat_messages/project/${projectId}`);
  const messages: MessageModel[] = data.map(mapBackendToMessage);

  if (messages.length > 0 && typeof onStateDetected === "function") {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.state) onStateDetected(lastMsg.state);
  }
  return messages;
}

// Enviar mensaje (añadimos language automáticamente)
export async function sendMessage(
  msg: Omit<MessageModel, "id" | "timestamp">
): Promise<MessageModel> {
  const language = typeof navigator !== "undefined" && navigator.language
    ? navigator.language
    : "es-ES";

  const payload = { ...msg, language };

  const { data } = await api.post("/chat_messages/", payload, {
    headers: { "Content-Type": "application/json" },
  });
  return mapBackendToMessage(data);
}
