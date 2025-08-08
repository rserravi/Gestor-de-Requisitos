import type { RequirementModel } from "../models/requirements-model";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function getToken() {
  const token = localStorage.getItem("access_token");
  if (!token) throw new Error("No autenticado");
  return token;
}

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
export async function fetchProjectRequirements(projectId: number): Promise<RequirementModel[]> {
  const res = await fetch(`${API_URL}/requirements/project/${projectId}`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  if (!res.ok) throw new Error("No se pudieron cargar los requisitos");
  const data = await res.json();
  return data.map(mapBackendToRequirement);
}

// POST crear requisito
export async function createRequirement(projectId: number, req: Partial<RequirementModel>): Promise<RequirementModel> {
  const res = await fetch(`${API_URL}/requirements/?project_id=${projectId}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${getToken()}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      description: req.description,
      status: req.status || "draft",
      category: req.category || "functional",
      priority: req.priority || "must",
      visual_reference: req.visualReference || null,
    })
  });
  if (!res.ok) throw new Error("No se pudo crear el requisito");
  const data = await res.json();
  return mapBackendToRequirement(data);
}

// PUT editar requisito
export async function updateRequirement(requirementId: string, req: Partial<RequirementModel>): Promise<RequirementModel> {
  const res = await fetch(`${API_URL}/requirements/${requirementId}`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${getToken()}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      description: req.description,
      status: req.status,
      category: req.category,
      priority: req.priority,
      visual_reference: req.visualReference,
    })
  });
  if (!res.ok) throw new Error("No se pudo actualizar el requisito");
  const data = await res.json();
  return mapBackendToRequirement(data);
}

// DELETE requisito
export async function deleteRequirement(requirementId: string): Promise<void> {
  const res = await fetch(`${API_URL}/requirements/${requirementId}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${getToken()}` }
  });
  if (!res.ok) throw new Error("No se pudo eliminar el requisito");
}
