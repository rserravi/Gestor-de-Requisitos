export type RequirementStatusModel = 'draft' | 'approved' | 'rejected' | 'in-review';
export type RequirementPriorityModel = 'must' | 'should' | 'could' | 'wont';
export type RequirementCategoryModel = 'functional' | 'performance' | 'usability' | 'security' | 'technical';

export interface RequirementModel {
  id: string;
  description: string;
  status: RequirementStatusModel;
  category: RequirementCategoryModel;
  priority: RequirementPriorityModel;
  visualReference?: string;
  number: number;
  projectId: number; // ID del proyecto al que pertenece el requerimiento
  createdAt: Date;
  updatedAt: Date;
  ownerId: number; // ID del usuario que creó el requerimiento
}