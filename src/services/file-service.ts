// services/file-service.ts
import { api } from "./api";
import type { ExampleFile } from "../models/user-model";

// Upload configuration/example file to the backend
export async function uploadConfigFile(file: File): Promise<ExampleFile> {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await api.post<ExampleFile>("/files/config", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });

    return data;
}
