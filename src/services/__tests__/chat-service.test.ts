import { describe, it, expect, vi, afterEach } from "vitest";
import { fetchProjectMessages, sendMessage } from "../chat-service";
import { api } from "../api";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("chat-service", () => {
  it("fetchProjectMessages invokes onStateDetected with last message state", async () => {
    const backendMessages = [
      {
        id: 1,
        content: "hello",
        sender: "user",
        timestamp: "2024-01-01T00:00:00Z",
        project_id: 1,
        state: "first",
      },
      {
        id: 2,
        content: "hi",
        sender: "ai",
        timestamp: "2024-01-02T00:00:00Z",
        project_id: 1,
        state: "second",
      },
    ];

    vi.spyOn(api, "get").mockResolvedValue({ data: backendMessages });
    const callback = vi.fn();

    const result = await fetchProjectMessages(1, callback);

    expect(api.get).toHaveBeenCalledWith("/chat_messages/project/1");
    expect(result).toHaveLength(2);
    expect(callback).toHaveBeenCalledWith("second");
  });

  it("sendMessage adds language from navigator when missing", async () => {
    vi.spyOn(api, "post").mockResolvedValue({
      data: {
        id: 1,
        content: "hello",
        sender: "user",
        timestamp: "2024-01-01T00:00:00Z",
        project_id: 1,
        state: "first",
      },
    });

    vi.spyOn(window.navigator, "language", "get").mockReturnValue("en-US");

    await sendMessage({
      content: "hi",
      sender: "user",
      project_id: 1,
      state: "first",
    });

    expect(api.post).toHaveBeenCalled();
    const [, body] = (api.post as any).mock.calls[0];
    expect(body.language).toBe("en");
  });
});
