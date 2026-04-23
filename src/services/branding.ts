import { api } from './api'

export interface BrandingColors {
  primary: string
  primaryDark: string
  accent: string
  surface: string
  textPrimary: string
  textSecondary: string
}

export interface BadgeConfig {
  position: 'sidebar_footer' | 'login' | 'both'
  style: 'full' | 'compact' | 'icon_only'
}

export interface BrandingLinks {
  support_url?: string | null
  privacy_url?: string | null
  terms_url?: string | null
}

export interface ReadinessItem {
  key: string
  label: string
  done: boolean
}

export interface BrandingReadiness {
  score: number
  items: ReadinessItem[]
}

export interface VercelVerificationRecord {
  type?: string
  domain?: string
  value?: string
  reason?: string
}

export interface VercelStatus {
  ok: boolean
  domain: string
  verified: boolean
  error: string | null
  checked_at: string
  verification?: VercelVerificationRecord[] | null
}

export type ProvisioningStatus =
  | 'idle'
  | 'building'
  | 'pushing_repo'
  | 'creating_project'
  | 'deploying'
  | 'ready'
  | 'failed'

export interface ProvisioningLogEntry {
  step: string
  status: string
  timestamp: string
  detail?: Record<string, unknown>
}

export interface BrandingConfig {
  id: string
  organization_id: string
  brand_name?: string | null
  tagline?: string | null
  subdomain_slug?: string | null
  logo_url?: string | null
  favicon_url?: string | null
  initials?: string | null
  colors: BrandingColors
  border_radius: string
  font_family?: string | null
  login_title?: string | null
  login_subtitle?: string | null
  login_hero_title?: string | null
  login_hero_description?: string | null
  badge_config: BadgeConfig
  links: BrandingLinks
  status: 'draft' | 'published'
  published_at?: string | null
  change_history: Array<{
    timestamp: string
    action: string
    fields?: string[]
    domain?: string
    verified?: boolean
    github_repo?: string | null
    vercel_project_id?: string | null
    deployment_url?: string | null
  }>
  vercel_status?: VercelStatus | null
  readiness?: BrandingReadiness | null
  // Dedicated tenant-frontend provisioning (GitHub repo + Vercel project)
  github_repo_url?: string | null
  vercel_project_id?: string | null
  vercel_deployment_url?: string | null
  provisioning_status?: ProvisioningStatus
  provisioning_error?: string | null
  provisioning_log?: ProvisioningLogEntry[]
  created_at?: string | null
  updated_at?: string | null
}

export interface BrandingConfigPayload {
  brand_name?: string
  tagline?: string
  subdomain_slug?: string
  logo_url?: string
  favicon_url?: string
  initials?: string
  colors?: Partial<BrandingColors>
  border_radius?: string
  font_family?: string
  login_title?: string
  login_subtitle?: string
  login_hero_title?: string
  login_hero_description?: string
  badge_config?: Partial<BadgeConfig>
  links?: Partial<BrandingLinks>
}

export interface ContrastResult {
  ratio: number
  aa_normal: boolean
  aa_large: boolean
  aaa_normal: boolean
}

export const brandingApi = {
  async get(): Promise<BrandingConfig | null> {
    const { data } = await api.get('/api/v1/branding')
    return data.branding ?? null
  },

  async create(payload: BrandingConfigPayload): Promise<BrandingConfig> {
    const { data } = await api.post('/api/v1/branding', payload)
    return data.branding
  },

  async update(payload: BrandingConfigPayload): Promise<BrandingConfig> {
    const { data } = await api.put('/api/v1/branding', payload)
    return data.branding
  },

  async publish(): Promise<BrandingConfig> {
    const { data } = await api.post('/api/v1/branding/publish')
    return data.branding
  },

  async revert(): Promise<BrandingConfig> {
    const { data } = await api.post('/api/v1/branding/revert')
    return data.branding
  },

  async remove(): Promise<void> {
    await api.delete('/api/v1/branding')
  },

  async getReadiness(): Promise<BrandingReadiness> {
    const { data } = await api.get('/api/v1/branding/readiness')
    return data
  },

  async checkContrast(bg: string, fg: string): Promise<ContrastResult> {
    const { data } = await api.get('/api/v1/branding/contrast', { params: { bg, fg } })
    return data
  },

  async resolve(slug: string): Promise<any> {
    const { data } = await api.get(`/api/v1/branding/resolve/${slug}`)
    return data.tenant
  },

  async extractBranding(file: File): Promise<BrandingConfigPayload> {
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await api.post('/api/v1/branding/extract', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000,
    })
    return data.suggestion
  },
}
