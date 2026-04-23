import { api } from './api'

export type PocType =
  | 'generative'
  | 'nlp_documental'
  | 'audio'
  | 'ml_predictive'
  | 'computer_vision'
  | 'multimodal'
  | 'ecommerce'
  | 'crm_copilot'
  | 'autonomous_agents'

export type DeploymentMode = 'cloud' | 'data_free' | 'on_prem'

export type TargetTier = 'poc' | 'mvp' | 'app'

export interface PocDesignInput {
  primary_color?: string
  secondary_color?: string
  brand_image_url?: string
  brand_file_path?: string
  company_name?: string
}

export interface PocGenerationRequest {
  session_id: string
  poc_type?: PocType  // Ahora es opcional - se decide automáticamente en el backend
  deployment_mode: DeploymentMode
  custom_requirements?: Record<string, unknown>
  user_id?: string
  description?: string
  target_tier?: TargetTier
  poc_design_input?: PocDesignInput
}

export interface TierUpgradeResponse {
  new_poc_id: string
  parent_poc_id: string
  from_tier: string
  to_tier: string
  workspace_dir?: string
  delta_reports: Record<string, unknown>
}

export interface PocGenerationResponse {
  poc_id: string
  status: string
  estimated_completion: string
  preview_url?: string | null
  download_url?: string | null
  tech_stack: string[]
  blueprint: Record<string, string | string[] | null>
}

export interface PocStatusResponse {
  poc_id: string
  status: string
  progress: number
  download_url?: string | null
}

export interface PreviewResponse {
  poc_id: string
  preview_url: string
  status: string
  expires_at: string
  ports?: {
    frontend: number
    backend: number
    db: number
  }
}

export interface PreviewReadinessResponse {
  status: 'ready' | 'starting' | 'not_found'
  ready: boolean
  frontend_ready: boolean
  backend_ready: boolean
  preview_url?: string
  ports?: {
    frontend: number
    backend: number
  }
  expires_at?: string
}

export interface GenerationProgressStep {
  timestamp?: string
  source?: 'model' | 'system' | string
  title?: string | null
  message: string
  // Optional i18n fields emitted by backend when a translated message is available.
  // When `key` is present the frontend should render t(key, params) and fall back
  // to `message` otherwise. Same pattern for `title_key` vs `title`, with optional
  // `title_params` for titles that interpolate values (e.g. "Reasoning {n}").
  key?: string
  params?: Record<string, string | number>
  title_key?: string
  title_params?: Record<string, string | number>
}

export interface GenerationProgressResponse {
  status: string
  steps: GenerationProgressStep[]
  started_at?: string
  updated_at?: string
}

export interface ExistingPocResponse {
  exists: boolean
  poc_id?: string
  status?: string
  download_url?: string | null
  file_path?: string | null
  poc_type?: string
  deployment_mode?: string
  created_at?: string
  // Campos adicionales para restaurar el estado completo
  tech_stack?: string[]
  blueprint?: Record<string, string | string[] | null>
  deployment_instructions?: string
  kpis?: Array<Record<string, unknown>>
  complexity?: Record<string, unknown>
}

export const pocGeneratorApi = {
  async generateQueued(data: PocGenerationRequest): Promise<PocGenerationResponse> {
    const response = await api.post('/api/v1/poc-generator/generate-queued', data)
    return response.data
  },

  async generate(data: PocGenerationRequest): Promise<PocGenerationResponse> {
    const response = await api.post('/api/v1/poc-generator/generate', data)
    return response.data
  },

  async getStatus(pocId: string): Promise<PocStatusResponse> {
    const response = await api.get(`/api/v1/poc-generator/status/${pocId}`)
    return response.data
  },

  async getProgress(sessionId: string): Promise<GenerationProgressResponse> {
    const response = await api.get(`/api/v1/poc-generator/progress/${sessionId}`)
    return response.data
  },

  /**
   * Dispara el pre-gen de forma idempotente. Se llama al entrar a la
   * pantalla de resumen para arrancar la generación mientras el user
   * lee la recomendación. El backend deduplica (no-op si ya hay task
   * corriendo o PoC completada). Safe to call múltiples veces.
   */
  async triggerPregeneration(
    sessionId: string,
  ): Promise<{ status: string; session_id: string; vertical?: string; poc_id?: string; reason?: string }> {
    const response = await api.post(`/api/v1/poc-generator/pregenerate/${sessionId}`)
    return response.data
  },

  async getPocBySession(sessionId: string): Promise<ExistingPocResponse> {
    const response = await api.get(`/api/v1/poc-generator/poc/by-session/${sessionId}`)
    return response.data
  },

  async upgradeTier(pocId: string, targetTier: TargetTier): Promise<TierUpgradeResponse> {
    const response = await api.post(`/api/v1/poc-generator/pocs/${pocId}/upgrade`, {
      target_tier: targetTier,
    })
    return response.data
  },

  async createPreview(pocId: string): Promise<PreviewResponse> {
    // Timeout ampliado porque construir las imágenes puede tardar varios minutos
    const response = await api.post(`/api/v1/poc-preview/preview/${pocId}`, {}, {
      timeout: 900000  // 15 minutos
    })
    return response.data
  },

  async destroyPreview(pocId: string): Promise<{ status: string }> {
    const response = await api.delete(`/api/v1/poc-preview/preview/${pocId}`)
    return response.data
  },

  async getPreviewStatus(pocId: string): Promise<PreviewResponse> {
    const response = await api.get(`/api/v1/poc-preview/preview/${pocId}`)
    return response.data
  },

  async checkPreviewReadiness(pocId: string): Promise<PreviewReadinessResponse> {
    const response = await api.get(`/api/v1/poc-preview/preview/${pocId}/ready`)
    return response.data
  },

}
