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
  const token = localStorage.getItem("access_token");
  const res = await fetch(
    `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/chat_messages/project/${projectId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) throw new Error("No se pudieron cargar los mensajes.");
  const data = await res.json();
  const messages = data.map(mapBackendToMessage);

  // Si hay callback, sincroniza el estado machine al último mensaje
  if (messages.length > 0 && typeof onStateDetected === "function") {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.state) {
      onStateDetected(lastMsg.state);
    }
  }

  return messages;
}

// Enviar mensaje
export async function sendMessage(msg: Omit<MessageModel, "id" | "timestamp">): Promise<MessageModel> {
  const token = localStorage.getItem("access_token");
  const res = await fetch(
    `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/chat_messages/`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(msg),
    }
  );
  if (!res.ok) throw new Error("No se pudo enviar el mensaje.");
  const data = await res.json();
  return mapBackendToMessage(data);
}
