// services/api.ts
import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    // Si el backend devuelve 401/403 => sesión expirada o inválida
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      // Limpia token y avisa a la App
      try { localStorage.removeItem("access_token"); } catch {}
      window.dispatchEvent(new CustomEvent("auth:expired"));
    }
    return Promise.reject(error);
  }
);
