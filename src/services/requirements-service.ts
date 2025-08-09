// services/requirements-service.ts
import { api } from "./api";
import type { RequirementModel } from "../models/requirements-model";

function mapBackendToRequirement(data: any): RequirementModel {
  return {
    id: String(data.id),
    description: data.description,
    status: data.status,
    category: data.category,
    priority: data.priority,
    visualReference: data.visual_reference || "",
    number: data.number,
    projectId: data.project_id,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
    ownerId: data.owner_id,
  };
}

// GET requisitos de un proyecto
export async function fetchProjectRequirements(
  projectId: number
): Promise<RequirementModel[]> {
  const { data } = await api.get(`/requirements/project/${projectId}`);
  return (data as any[]).map(mapBackendToRequirement);
}

// POST crear requisito
export async function createRequirement(
  projectId: number,
  req: Partial<RequirementModel>
): Promise<RequirementModel> {
  const payload = {
    description: req.description,
    status: req.status || "draft",
    category: req.category || "functional",
    priority: req.priority || "must",
    visual_reference: req.visualReference || null,
  };

  const { data } = await api.post(`/requirements/?project_id=${projectId}`, payload, {
    headers: { "Content-Type": "application/json" },
  });
  return mapBackendToRequirement(data);
}

// PUT editar requisito
export async function updateRequirement(
  requirementId: string,
  req: Partial<RequirementModel>
): Promise<RequirementModel> {
  const payload = {
    description: req.description,
    status: req.status,
    category: req.category,
    priority: req.priority,
    visual_reference: req.visualReference,
  };

  const { data } = await api.put(`/requirements/${requirementId}`, payload, {
    headers: { "Content-Type": "application/json" },
  });
  return mapBackendToRequirement(data);
}

// DELETE requisito
export async function deleteRequirement(requirementId: string): Promise<void> {
  await api.delete(`/requirements/${requirementId}`);
}
