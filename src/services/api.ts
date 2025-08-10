// services/api.ts
import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL;
if (!baseURL) {
  throw new Error("VITE_API_BASE_URL is not defined");
}

export const api = axios.create({
  baseURL,
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
      try {
        localStorage.removeItem("access_token");
      } catch {}
      window.dispatchEvent(new CustomEvent("auth:expired"));
      window.dispatchEvent(new CustomEvent("auth:changed"));
    }
    return Promise.reject(error);
  }
);
