import { api } from './api'

export interface PlanInfo {
  tier: string
  display_name: string
  price_monthly_usd: number
  pocs_per_month: number | 'unlimited'
  extra_poc_price_usd: number
  iterations_per_poc: number | 'unlimited'
  preview_ttl_hours: number | 'permanent'
  max_concurrent_previews: number
  deploy_staging: boolean
  deploy_production: boolean
  max_users_per_org: number | 'unlimited'
  llm_budget_monthly_usd: number
  support_level: string
  trial_days: number
  max_verticals: number | 'unlimited'
  can_download_zip: boolean
  can_custom_branding: boolean
  can_api_access: boolean
}

export interface BillingStatus {
  organization_id: string
  organization_name: string
  plan: string
  plan_config: PlanInfo
  subscription_status: string
  trial_end: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  usage: {
    pocs_generated: number
    pocs_limit: number | 'unlimited'
    llm_spent_usd: number
    llm_budget_usd: number
    users_used: number
    users_limit: number | 'unlimited'
  }
  verticals: {
    active: string[]
    max: number | 'unlimited'
  }
}

export interface BrandingInfo {
  can_custom_branding: boolean
  logo_url: string | null
  brand_colors: Record<string, string>
  brand_name: string | null
}

export interface BrandingUpdate {
  logo_url?: string | null
  brand_colors?: Record<string, string>
  brand_name?: string | null
}

export interface ApiKeySummary {
  id: string
  key_prefix: string
  name: string
  is_active: boolean
  last_used_at: string | null
  total_requests: number
  created_at: string
}

export interface ApiKeyCreated {
  id: string
  key: string
  prefix: string
  name: string
}

export interface BillingOverview {
  mrr_usd: number
  arr_usd: number
  active_subscribers: number
  total_organizations: number
  plan_distribution: Record<string, number>
}

export const billingApi = {
  async getPlans(): Promise<PlanInfo[]> {
    const res = await api.get('/api/v1/billing/plans')
    return res.data.plans
  },

  async getBillingStatus(): Promise<BillingStatus> {
    const res = await api.get('/api/v1/billing/status')
    return res.data
  },

  async createCheckout(plan: string, successUrl: string, cancelUrl: string, annual: boolean = false): Promise<string> {
    const res = await api.post('/api/v1/billing/checkout', {
      plan,
      annual,
      success_url: successUrl,
      cancel_url: cancelUrl,
    })
    return res.data.checkout_url
  },

  async createPortal(returnUrl: string): Promise<string> {
    const res = await api.post('/api/v1/billing/portal', {
      return_url: returnUrl,
    })
    return res.data.portal_url
  },

  async getAdminOverview(): Promise<BillingOverview> {
    const res = await api.get('/api/v1/billing/admin/overview')
    return res.data
  },

  async getBranding(): Promise<BrandingInfo> {
    const res = await api.get('/api/v1/billing/branding')
    return res.data
  },

  async updateBranding(data: BrandingUpdate): Promise<BrandingInfo> {
    const res = await api.put('/api/v1/billing/branding', data)
    return res.data
  },

  async listApiKeys(): Promise<ApiKeySummary[]> {
    const res = await api.get('/api/v1/billing/api-keys')
    return res.data
  },

  async createApiKey(name: string): Promise<ApiKeyCreated> {
    const res = await api.post('/api/v1/billing/api-keys', { name })
    return res.data
  },

  async revokeApiKey(keyId: string): Promise<void> {
    await api.delete(`/api/v1/billing/api-keys/${keyId}`)
  },
}
