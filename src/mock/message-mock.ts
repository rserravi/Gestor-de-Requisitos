import type { MessageModel } from "../models/message-model";

export const messageMock: MessageModel[] = [
    {
        id: "1",
        content: "Hello, how can I assist you today?",
        sender: "ai",
        timestamp: new Date(),
        project_id: 1,
        state: "init"
    },
    {
        id: "2",
        content: "I need help with my project requirements.",
        sender: "user",
        timestamp: new Date(),
        project_id: 1,
        state: "init"
    },
    {
        id: "3",
        content: "Sure! What specific requirements do you have in mind?",
        sender: "ai",
        timestamp: new Date(),
        project_id: 1,
        state: "init"
    },
]