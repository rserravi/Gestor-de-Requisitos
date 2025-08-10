// services/file-service.ts
import { api } from "./api";

export interface ConfigFile {
  id: number;
  name: string;
  [key: string]: unknown;
}

// Upload a configuration file via FormData
export async function uploadConfigFile(file: File): Promise<ConfigFile> {
  const formData = new FormData();
  formData.append("uploaded_file", file);

  const { data } = await api.post<{ id: number; name?: string; filename?: string }>(
    "/files/upload",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return { id: data.id, name: data.name ?? data.filename ?? "" };
}

// Fetch list of configuration files
export async function fetchConfigFiles(): Promise<ConfigFile[]> {
  const { data } = await api.get<Array<{ id: number; name?: string; filename?: string }>>(
    "/files/"
  );
  return data.map((f) => ({ id: f.id, name: f.name ?? f.filename ?? "" }));
}

// Fetch requirements text for a specific file
export async function fetchFileRequirements(fileId: number): Promise<string> {
  const { data } = await api.get<string>(`/files/${fileId}/requirements`);
  return data;
}

export default {
  uploadConfigFile,
  fetchConfigFiles,
  fetchFileRequirements,
};