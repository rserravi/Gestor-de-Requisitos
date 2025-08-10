import { api } from "./api";

export interface ConfigFile {
  id: number;
  name: string;
}

// Obtener archivos de configuración subidos para un proyecto
export async function fetchConfigFiles(projectId: number): Promise<ConfigFile[]> {
  const { data } = await api.get<ConfigFile[]>(`/config_files/project/${projectId}`);
  return data;
}

// Obtener los requisitos de un archivo de configuración
export async function fetchFileRequirements(fileId: number): Promise<string> {
  const { data } = await api.get<{ content: string }>(`/config_files/${fileId}/requirements`);
  if (typeof data === "string") return data;
  return data.content;
}
