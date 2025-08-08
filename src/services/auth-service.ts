// services/auth-service.ts

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Registra un usuario nuevo
export async function register({ username, email, password, avatar = null }: {
  username: string;
  email: string;
  password: string;
  avatar?: string | null;
}) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password, avatar }),
  });
  if (!response.ok) throw new Error("No se pudo registrar el usuario");
  return response.json();
}

// Login (OAuth2 password flow)
export async function login({ username, password }: {
  username: string;
  password: string;
}) {
  const params = new URLSearchParams();
  params.append("username", username);
  params.append("password", password);
  // grant_type, client_id y scope pueden omitirse si no los requiere FastAPI
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
  if (!response.ok) throw new Error("Credenciales incorrectas");
  const data = await response.json();
  localStorage.setItem("access_token", data.access_token);
  return data;
}

// Devuelve el usuario autenticado
export async function getMe() {
  const token = localStorage.getItem("access_token");
  if (!token) throw new Error("No autenticado");
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: { "Authorization": `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Token inválido");
  return response.json();
}

// Logout local (solo borra el token)
export function logout() {
  localStorage.removeItem("access_token");
}
