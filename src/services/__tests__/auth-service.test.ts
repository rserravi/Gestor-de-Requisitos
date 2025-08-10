import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("../api", () => ({
  api: {
    post: vi.fn(),
    get: vi.fn()
  }
}));

import { api } from "../api";
import * as auth from "../auth-service";

describe("auth-service", () => {
  let store: Record<string, string>;

  beforeEach(() => {
    store = {};
    const localStorageMock = {
      getItem: vi.fn((key: string) => store[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        store = {};
      })
    };
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
      configurable: true
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("register realiza llamada a /auth/register y posteriormente a login, propagando mensaje de éxito", async () => {
    vi.mocked(api.post)
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ data: { access_token: "token" } });

    const result = await auth.register({ username: "user", email: "user@example.com", password: "pass" });

    expect(api.post).toHaveBeenNthCalledWith(1, "/auth/register", {
      username: "user",
      email: "user@example.com",
      password: "pass",
      avatar: null
    });
    expect(api.post).toHaveBeenNthCalledWith(
      2,
      "/auth/login",
      expect.any(String),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );
    expect(result).toEqual({ message: "Registro exitoso", access_token: "token" });
  });

  it("login guarda el token en localStorage y emite auth:changed", async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ data: { access_token: " token123 " } });
    const dispatchSpy = vi.spyOn(window, "dispatchEvent");

    const result = await auth.login({ username: "user", password: "pass" });

    expect(localStorage.setItem).toHaveBeenCalledWith("access_token", "token123");
    expect(dispatchSpy).toHaveBeenCalledTimes(1);
    const event = dispatchSpy.mock.calls[0][0] as CustomEvent;
    expect(event.type).toBe("auth:changed");
    expect(result.access_token).toBe("token123");
  });

  it("login maneja errores de token vacío", async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ data: { access_token: "   " } });
    const dispatchSpy = vi.spyOn(window, "dispatchEvent");

    await expect(auth.login({ username: "user", password: "pass" })).rejects.toThrow("Token no recibido");
    expect(localStorage.setItem).not.toHaveBeenCalled();
    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it("logout elimina el token y dispara auth:changed", () => {
    const dispatchSpy = vi.spyOn(window, "dispatchEvent");

    auth.logout();

    expect(localStorage.removeItem).toHaveBeenCalledWith("access_token");
    const event = dispatchSpy.mock.calls[0][0] as CustomEvent;
    expect(event.type).toBe("auth:changed");
  });

  it("getMe utiliza api.get", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { id: 1 } });

    const data = await auth.getMe();

    expect(api.get).toHaveBeenCalledWith("/auth/me");
    expect(data).toEqual({ id: 1 });
  });
});

