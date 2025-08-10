// services/file-service.ts
import { api } from "./api";
import type { ExampleFile } from "../models/user-model";

export interface ConfigFile {
  id: number;
  filename: string;
  [key: string]: unknown;
}

// Upload a configuration file via FormData
export async function uploadConfigFile(file: File): Promise<ConfigFile> {
  const formData = new FormData();
  formData.append("uploaded_file", file);

  const { data } = await api.post<ConfigFile>("/files/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

// Fetch list of configuration files
export async function fetchConfigFiles(): Promise<ConfigFile[]> {
  const { data } = await api.get<ConfigFile[]>("/files/");
  return data;
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