// services/auth-service.ts
import { api } from "./api";

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
  const { data } = await api.post("/auth/register", {
    username,
    email,
    password,
    avatar
  });
  return data;
}

// Login (OAuth2 password flow)
export async function login({
  username,
  password
}: {
  username: string;
  password: string;
}) {
  const params = new URLSearchParams();
  params.append("username", username);
  params.append("password", password);

  // grant_type, client_id y scope pueden omitirse si no los requiere FastAPI
  const { data } = await api.post("/auth/login", params.toString(), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" }
  });

  localStorage.setItem("access_token", data.access_token);
  return data;
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
  } catch {
    // ignorar si no existe
  }
}
