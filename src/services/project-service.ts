// services/project-service.ts

import type { ProjectModel } from "../models/project-model";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function getToken() {
  const token = localStorage.getItem("access_token");
  if (!token) throw new Error("No autenticado");
  return token;
}

// Listar proyectos del usuario
export async function listProjects(): Promise<ProjectModel[]> {
  const response = await fetch(`${API_URL}/projects/`, {
    headers: { "Authorization": `Bearer ${getToken()}` },
  });
  if (!response.ok) throw new Error("Error al listar proyectos");
  return response.json();
}

// Crear un proyecto nuevo
export async function createProject({ name, description }: {
  name: string;
  description: string;
}): Promise<ProjectModel> {
  const response = await fetch(`${API_URL}/projects/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getToken()}`
    },
    body: JSON.stringify({ name, description }),
  });
  if (!response.ok) throw new Error("No se pudo crear el proyecto");
  return response.json();
}

// Obtener un proyecto concreto
export async function getProject(projectId: number): Promise<ProjectModel> {
  const response = await fetch(`${API_URL}/projects/${projectId}`, {
    headers: { "Authorization": `Bearer ${getToken()}` },
  });
  if (!response.ok) throw new Error("No se pudo recuperar el proyecto");
  return response.json();
}

// Actualizar un proyecto
export async function updateProject(projectId: number, { name, description }: {
  name?: string;
  description?: string;
}): Promise<ProjectModel> {
  const response = await fetch(`${API_URL}/projects/${projectId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getToken()}`
    },
    body: JSON.stringify({ name, description }),
  });
  if (!response.ok) throw new Error("No se pudo actualizar el proyecto");
  return response.json();
}

// Borrar un proyecto
export async function deleteProject(projectId: number): Promise<void> {
  const response = await fetch(`${API_URL}/projects/${projectId}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${getToken()}` },
  });
  if (!response.ok) throw new Error("No se pudo eliminar el proyecto");
  // 204 No Content → OK
}
