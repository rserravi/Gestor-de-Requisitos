// services/auth-service.ts
import { api } from "./api";
import type { AxiosError } from "axios";
import { getTranslations, type Language } from "../i18n";

// Registra un usuario nuevo
export async function register({
  username,
  email,
  password,
  avatar = null
}: {
  username: string;
  email: string;
  password: string;
  avatar?: string | null;
}) {
  const language: Language =
    typeof navigator !== "undefined" && navigator.language
      ? (navigator.language.split("-")[0] as Language)
      : "es";
  const t = getTranslations(language);
  try {
    await api.post("/auth/register", {
      username,
      email,
      password,
      avatar
    });

    const loginData = await login({ username, password });
    return { message: t.registerSuccess, ...loginData };
  } catch (error) {
    const err = error as AxiosError<{ detail?: string }>;
    const message = err.response?.data?.detail ?? err.message ?? t.errorRegisterUser;
    throw new Error(message);
  }
}

// Login (OAuth2 password flow)
export async function login({
  username,
  password
}: {
  username: string;
  password: string;
}) {
  const language: Language =
    typeof navigator !== "undefined" && navigator.language
      ? (navigator.language.split("-")[0] as Language)
      : "es";
  const t = getTranslations(language);
  try {
    const params = new URLSearchParams();
    params.append("username", username);
    params.append("password", password);

    // grant_type, client_id y scope pueden omitirse si no los requiere FastAPI
    const { data } = await api.post("/auth/login", params.toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    });

    const token = typeof data?.access_token === "string" ? data.access_token.trim() : "";
    if (!token) {
      throw new Error(t.tokenNotReceived);
    }

    localStorage.setItem("access_token", token);
    window.dispatchEvent(new CustomEvent("auth:changed"));
    return { ...data, access_token: token };
  } catch (error) {
    const err = error as AxiosError<{ detail?: string }>;
    const message = err.response?.data?.detail ?? err.message ?? t.errorLogin;
    throw new Error(message);
  }
}

// Devuelve el usuario autenticado
export async function getMe() {
  const { data } = await api.get("/auth/me");
  return data;
}

// Logout local (solo borra el token)
export function logout() {
  try {
    localStorage.removeItem("access_token");
    window.dispatchEvent(new CustomEvent("auth:changed"));
  } catch {
    // ignorar si no existe
  }
}
