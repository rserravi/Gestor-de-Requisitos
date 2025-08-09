// services/project-service.ts
import { api } from "./api";
import type { ProjectModel } from "../models/project-model";

// Listar proyectos del usuario
export async function listProjects(): Promise<ProjectModel[]> {
  const { data } = await api.get<ProjectModel[]>("/projects/");
  return data;
}

// Crear un proyecto nuevo
export async function createProject({
  name,
  description,
}: {
  name: string;
  description: string;
}): Promise<ProjectModel> {
  const { data } = await api.post<ProjectModel>("/projects/", {
    name,
    description,
  });
  return data;
}

// Obtener un proyecto concreto
export async function getProject(projectId: number): Promise<ProjectModel> {
  const { data } = await api.get<ProjectModel>(`/projects/${projectId}`);
  return data;
}

// Actualizar un proyecto
export async function updateProject(
  projectId: number,
  { name, description }: { name?: string; description?: string }
): Promise<ProjectModel> {
  const { data } = await api.put<ProjectModel>(`/projects/${projectId}`, {
    name,
    description,
  });
  return data;
}

// Borrar un proyecto
export async function deleteProject(projectId: number): Promise<void> {
  await api.delete(`/projects/${projectId}`);
}
