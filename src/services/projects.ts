import { api } from './api'

export interface WorkspaceProject {
  id: string
  name: string
  session_id?: string | null
  user_id?: string | null
  thumbnail_url?: string | null
  poc_type: string
  use_case: string
  vertical: string
  archetype: 'code_generation' | 'vision_realtime' | 'rag_documental' | 'general' | string
  current_poc_id: string
  created_at: string
  updated_at: string
  last_opened_at: string
  metadata?: Record<string, unknown>
}

export interface ProjectIteration {
  id: string
  project_id: string
  poc_id: string
  version: number
  label: string
  summary: string
  source: string
  created_at: string
  metadata?: Record<string, unknown>
}

export interface ProjectDeploymentLog {
  timestamp: string
  level: 'info' | 'warn' | 'error' | string
  message: string
}

export interface ProjectDeployment {
  id: string
  project_id: string
  project_name: string
  deployment_number: number
  poc_id: string
  iteration_id?: string | null
  status: 'deploying' | 'deployed' | 'failed' | string
  share_slug: string
  share_url: string
  preview_url?: string | null
  started_at: string
  completed_at?: string | null
  notes?: string
  logs: ProjectDeploymentLog[]
  metadata?: Record<string, unknown>
}

export interface EnsureProjectResponse {
  created: boolean
  project: WorkspaceProject
  current_iteration: ProjectIteration
  iterations_count: number
  deployments_count: number
  workspace_url: string
}

export interface ProjectDetailsResponse {
  project: WorkspaceProject
  iterations: ProjectIteration[]
  deployments: ProjectDeployment[]
}

export interface SharedDeploymentResponse {
  share_slug: string
  share_url: string
  project: WorkspaceProject
  deployment: ProjectDeployment & {
    preview_live: boolean
  }
}

export interface DeleteProjectResponse {
  status: 'deleted'
  project_id: string
  project_name: string
  deleted_poc_ids: string[]
  deleted_db_pocs: number
  destroyed_previews: string[]
  removed_session_keys: string[]
  removed_discovery_keys: string[]
  removed_artifacts: number
  cleanup_warnings: string[]
}

export const projectsApi = {
  async ensureFromPoc(pocId: string, projectName?: string): Promise<EnsureProjectResponse> {
    const response = await api.post(`/api/v1/projects/from-poc/${pocId}/ensure`, {
      project_name: projectName || null,
      metadata: {},
    })
    return response.data
  },

  async getByPoc(pocId: string): Promise<{
    project: WorkspaceProject
    current_iteration?: ProjectIteration | null
    iterations_count: number
    deployments_count: number
  }> {
    const response = await api.get(`/api/v1/projects/by-poc/${pocId}`)
    return response.data
  },

  async getProject(projectId: string): Promise<ProjectDetailsResponse> {
    const response = await api.get(`/api/v1/projects/${projectId}`)
    return response.data
  },

  async createIteration(
    projectId: string,
    payload: {
      poc_id?: string
      summary: string
      source?: string
      metadata?: Record<string, unknown>
    }
  ): Promise<{ iteration: ProjectIteration; workspace_url: string }> {
    const response = await api.post(`/api/v1/projects/${projectId}/iterations`, {
      poc_id: payload.poc_id,
      summary: payload.summary,
      source: payload.source || 'manual',
      metadata: payload.metadata || {},
    })
    return response.data
  },

  async reopen(projectId: string): Promise<{
    project: WorkspaceProject
    latest_iteration?: ProjectIteration | null
    workspace_url?: string | null
  }> {
    const response = await api.post(`/api/v1/projects/${projectId}/reopen`, {})
    return response.data
  },

  async deploy(
    projectId: string,
    payload?: {
      poc_id?: string
      iteration_id?: string
      notes?: string
    }
  ): Promise<{ deployment: ProjectDeployment; project_id: string }> {
    const response = await api.post(`/api/v1/projects/${projectId}/deploy`, {
      poc_id: payload?.poc_id,
      iteration_id: payload?.iteration_id,
      notes: payload?.notes,
    })
    return response.data
  },

  async listDeployments(projectId: string): Promise<{ deployments: ProjectDeployment[]; total: number }> {
    const response = await api.get(`/api/v1/projects/${projectId}/deployments`)
    return response.data
  },

  async deleteProject(projectId: string): Promise<DeleteProjectResponse> {
    const response = await api.delete(`/api/v1/projects/${projectId}`)
    return response.data
  },

  async getSharedDeployment(shareSlug: string): Promise<SharedDeploymentResponse> {
    const response = await api.get(`/api/v1/projects/shared/${shareSlug}`)
    return response.data
  },
}
