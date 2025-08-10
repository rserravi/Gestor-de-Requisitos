import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { ChatArea } from "../ChatArea";
import { getTranslations } from "../../i18n";

vi.mock("../../context/StateMachineContext", () => ({
  useStateMachine: () => ({ state: "analyze_requisites", setState: vi.fn() }),
}));
vi.mock("../../services/file-service", () => ({
  fetchConfigFiles: vi.fn().mockResolvedValue([]),
  fetchFileRequirements: vi.fn().mockResolvedValue(""),
}));

describe("ChatArea", () => {
  const commonProps = {
    chatMessages: [],
    loading: false,
    error: null,
    onGenerateRequirements: vi.fn(),
    onAddRequirement: vi.fn(),
    showFiles: true,
    collapsed: false,
    onToggleCollapse: vi.fn(),
    language: "es" as const,
    projectId: 1,
  };

  it("cleans example lines and sends payload, clearing input on success", async () => {
    const t = getTranslations("es");
    const onSendMessage = vi.fn().mockResolvedValue(undefined);
    render(<ChatArea {...commonProps} onSendMessage={onSendMessage} />);

    const messageInput = screen.getByPlaceholderText(t.textareaPlaceholder) as HTMLTextAreaElement;
    const examplesInput = screen.getByPlaceholderText(t.exampleRequirementsPlaceholder);

    await userEvent.type(messageInput, "Mensaje de prueba");
    await userEvent.type(examplesInput, "- uno\n2) dos\n* tres");

    const sendButton = screen.getByTestId("SendIcon").closest("button")!;
    await userEvent.click(sendButton);

    await waitFor(() => expect(onSendMessage).toHaveBeenCalledTimes(1));

    expect(onSendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        content: "Mensaje de prueba",
        sender: "user",
        project_id: 1,
        state: "analyze_requisites",
        example_samples: ["uno", "dos", "tres"],
      }),
      1,
    );

    await waitFor(() => expect(messageInput.value).toBe(""));
  });

  it("shows error message when sending fails", async () => {
    const t = getTranslations("es");
    const onSendMessage = vi.fn().mockRejectedValue(new Error("fail"));
    render(<ChatArea {...commonProps} onSendMessage={onSendMessage} />);

    const messageInput = screen.getByPlaceholderText(t.textareaPlaceholder);
    await userEvent.type(messageInput, "Mensaje fallido");

    const sendButton = screen.getByTestId("SendIcon").closest("button")!;
    await userEvent.click(sendButton);

    await waitFor(() => expect(onSendMessage).toHaveBeenCalledTimes(1));

    expect(await screen.findByText(t.sendErrorMessage)).toBeTruthy();
    expect((messageInput as HTMLTextAreaElement).value).toBe("Mensaje fallido");
  });
});
