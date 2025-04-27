// src/types/index.ts

export interface Workflow {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateWorkflowInput {
  name: string;
  description: string;
}

export interface UpdateWorkflowInput {
  id: string;
  name?: string;
  description?: string;
}