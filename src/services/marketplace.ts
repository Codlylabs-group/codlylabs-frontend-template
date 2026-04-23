import { api, API_BASE_URL } from './api'

const isLoopbackHost = (host: string): boolean =>
  host === 'localhost' || host === '127.0.0.1' || host === '::1'

export const normalizeMarketplacePreviewUrl = (rawUrl: string): string => {
  if (!rawUrl) return rawUrl

  if (rawUrl.startsWith('/')) {
    if (API_BASE_URL) {
      try {
        return new URL(rawUrl, API_BASE_URL).toString()
      } catch {
        return rawUrl
      }
    }
    return rawUrl
  }

  try {
    const parsed = new URL(rawUrl)
    if (typeof window === 'undefined') return parsed.toString()

    if (isLoopbackHost(parsed.hostname) && !isLoopbackHost(window.location.hostname)) {
      parsed.hostname = window.location.hostname
      parsed.protocol = window.location.protocol
    }

    return parsed.toString()
  } catch {
    return rawUrl
  }
}

export interface MarketplaceListingSummary {
  slug: string
  snapshot_slug: string
  name: string
  title: string
  subtitle: string
  short_description: string
  vertical: string
  poc_type: string
  poc_type_label: string
  interface: string
  tags: string[]
  quality_score: number
  quality_badge: string
  setup_estimate_hours: number
  integration_complexity: string
  tech_stack: string[]
  trial_duration_hours: number
  price_trial: number
  price_license: number
  price_enterprise: number
  preview_supported: boolean
  catalog_poc_id: string | null
  source: 'curated' | 'partner'
  listing_status: string
  partner_profile_id: string | null
  partner_display_name: string
  trust_score: number
  trust_badges: string[]
  deployment_readiness: string
  regulated_vertical: boolean
  managed_deploy_available: boolean
  cloud_templates: string[]
  private_marketplace_ready: boolean
  white_label_ready: boolean
}

export interface MarketplaceTrustFactor {
  code: string
  label: string
  points: number
  passed: boolean
}

export interface MarketplaceSecurityPacket {
  data_handling: string
  pii_supported: boolean
  audit_logs_available: boolean
  rollback_plan_available: boolean
  runbook_available: boolean
  documentation_complete: boolean
  compliance_notes: string | null
  support_owner_name: string | null
  support_owner_email: string | null
}

export interface MarketplaceTrustSummary {
  trust_score: number
  trust_badges: string[]
  deployment_readiness: string
  security_review_status: string
  regulated_vertical: boolean
  support_sla_hours: number
  data_mode_for_trial: string
  managed_deploy_available: boolean
  pilot_request_count: number
  verified_pilot_count: number
  review_count: number
  avg_rating: number | null
  rating_public: boolean
  rating_label: string
  trust_factors: MarketplaceTrustFactor[]
  security_packet: MarketplaceSecurityPacket
}

export interface MarketplacePartnerProfileSummary {
  id: string | null
  display_name: string
  company_name: string | null
  website_url: string | null
  bio: string | null
  tier: string
  partner_program: string
  certification_status: string
  co_sell_ready: boolean
  public_badges: string[]
  featured_case_study: Record<string, unknown>
  target_verticals: string[]
  support_contact_email: string | null
  public_metrics: {
    published_listings: number
    pilot_ready_listings: number
    deploy_ready_listings: number
    average_trust_score: number
    fastest_setup_hours: number | null
  }
}

export interface MarketplacePartnerProfileResponse extends MarketplacePartnerProfileSummary {
  listings: MarketplaceListingSummary[]
}

export interface MarketplaceManifest {
  name: string
  slug: string
  version: string
  license: string
  vertical: string
  poc_type: string
  tags: string[]
  title: string
  subtitle: string
  description: string
  pricing: {
    trial: boolean
    trial_duration_hours: number
    price_trial: number
    price_license: number
    price_enterprise: number
  }
  stack: {
    frontend: string[]
    backend: string[]
    ai_provider: string
    ai_model: string | null
  }
  buyer_fit: {
    target_company_size: string
    target_team: string
    problem_statement: string
  }
  deployment: {
    modes: string[]
    estimated_setup_hours: number
    integration_complexity: string
    managed_deploy_available: boolean
    data_mode_for_trial: string
  }
  trust: {
    security_review_required: boolean
    regulated_vertical: boolean
    support_sla_hours: number
  }
  integration_kits: Array<Record<string, unknown>>
  env_vars: {
    required: string[]
    optional: string[]
  }
  demo_data: {
    included: boolean
    description: string
    format: string
  }
  author: {
    display_name: string
  }
}

export interface MarketplaceListingDetail extends MarketplaceListingSummary {
  dependencies: string[]
  generated_manifest: MarketplaceManifest
  try_url: string
  snapshot_path: string
  preview_poc_id: string
  trust_summary: MarketplaceTrustSummary
  partner_profile: MarketplacePartnerProfileSummary | null
  seo_meta: {
    meta_title: string
    meta_description: string
  }
  embed_enabled: boolean
  success_story: Record<string, unknown>
}

export interface MarketplaceCatalogResponse {
  items: MarketplaceListingSummary[]
  total: number
  verticals: string[]
  poc_types: string[]
}

export interface MarketplaceFiltersResponse {
  verticals: string[]
  poc_types: string[]
}

export interface MarketplaceCollectionsResponse {
  pilot_ready: MarketplaceListingSummary[]
  fastest_to_deploy: MarketplaceListingSummary[]
  regulated_workflows: MarketplaceListingSummary[]
}

export interface MarketplaceBundle {
  id: string
  slug: string
  title: string
  subtitle: string | null
  description: string | null
  vertical: string | null
  use_case: string | null
  featured: boolean
  is_public: boolean
  sort_order: number
  bundle_meta: Record<string, unknown>
  item_count: number
  items: MarketplaceListingSummary[]
  created_at?: string | null
  source: 'manual' | 'generated'
}

export interface MarketplaceBundlesResponse {
  items: MarketplaceBundle[]
  total: number
}

export interface MarketplacePreviewStatus {
  slug: string
  poc_id: string
  preview_available: boolean
  preview_url: string | null
  preview_embed_url: string | null
  status: string
  expires_at: string | null
  ports: Record<string, number> | null
}

export interface PilotRequestPayload {
  requested_data_mode: string
  requested_use_case: string
  requested_timeline?: string
  contact_email?: string
  notes?: string
}

export interface PilotRequestResponse {
  id: string
  listing_slug: string
  status: string
  requested_data_mode: string
  requested_use_case: string
  requested_timeline: string | null
  contact_email: string | null
  notes: string | null
  created_at: string | null
  message: string
  trust_summary: MarketplaceTrustSummary
}

export interface MarketplacePurchasePayload {
  purchase_type: 'pilot' | 'license' | 'enterprise'
  notes?: string
}

export interface MarketplaceTransaction {
  id: string
  listing_slug: string
  listing_title: string
  listing_source: 'curated' | 'partner'
  developer_profile_id: string | null
  transaction_type: string
  line_label: string
  amount_cents: number
  amount_usd: number
  platform_fee_cents: number
  developer_payout_cents: number
  currency: string
  status: string
  payment_provider: string
  buyer_notes: string | null
  download_available: boolean
  download_url: string | null
  preview_url: string | null
  created_at: string | null
  completed_at: string | null
}

export interface MarketplacePurchaseResponse {
  transaction: MarketplaceTransaction
  message: string
}

export interface MarketplaceDeployRequestPayload {
  deploy_mode: 'partner_handoff' | 'codly_managed' | 'buyer_managed'
  environment_target: 'sandbox' | 'staging' | 'production'
  requested_timeline?: string
  requested_data_mode?: string
  notes?: string
}

export interface MarketplaceDeployRequest {
  id: string
  listing_slug: string
  listing_title: string
  listing_source: 'curated' | 'partner'
  developer_profile_id: string | null
  deploy_mode: string
  environment_target: string
  requested_timeline: string | null
  requested_data_mode: string
  notes: string | null
  status: string
  created_at: string | null
  updated_at: string | null
}

export interface MarketplaceDeployRequestResponse {
  deploy_request: MarketplaceDeployRequest
  message: string
}

export interface MarketplacePilotRequestSummary {
  id: string
  listing_slug: string
  listing_title: string
  status: string
  requested_data_mode: string
  requested_use_case: string
  requested_timeline: string | null
  contact_email: string | null
  notes: string | null
  created_at: string | null
  updated_at: string | null
}

export interface MarketplaceMyPurchasesResponse {
  items: MarketplaceTransaction[]
  summary: {
    transaction_count: number
    total_spent_cents: number
    total_spent_usd: number
  }
}

export interface MarketplaceMyPilotsResponse {
  pilot_requests: MarketplacePilotRequestSummary[]
  deploy_requests: MarketplaceDeployRequest[]
  summary: {
    pilot_count: number
    deploy_request_count: number
  }
}

export interface MarketplaceEmbedConfig {
  slug: string
  iframe_url: string
  listing_url: string
  title: string
  subtitle: string
  iframe_snippet: string
  link_snippet: string
}

export interface MarketplaceReferralLanding {
  profile: MarketplacePartnerProfileSummary
  referral_code: string
  listings: MarketplaceListingSummary[]
}

export interface MarketplaceReferralLeadPayload {
  listing_slug?: string
  company_name?: string
  contact_email: string
  notes?: string
}

export interface MarketplaceReferralLead {
  id: string
  referrer_profile_id: string | null
  listing_slug: string | null
  referral_code: string
  company_name: string | null
  contact_email: string
  notes: string | null
  status: string
  created_at: string | null
}

export interface MarketplaceReferralLeadResponse {
  lead: MarketplaceReferralLead
  message: string
}

export interface MarketplacePrivateWorkspace {
  id: string
  organization_id: string
  slug: string
  name: string
  description: string | null
  industry: string | null
  company_size: string
  adoption_stage: string
  allowed_verticals: string[]
  allowed_listing_slugs: string[]
  branding: Record<string, unknown>
  white_label_enabled: boolean
  default_cloud: 'aws' | 'gcp' | 'azure'
  managed_sla_hours: number
  benchmark_preferences: Record<string, unknown>
  status: string
  catalog_items: MarketplaceListingSummary[]
  created_at: string | null
  updated_at: string | null
}

export interface MarketplacePrivateWorkspacePayload {
  name?: string
  description?: string
  industry?: string
  company_size?: string
  adoption_stage?: string
  allowed_verticals?: string[]
  allowed_listing_slugs?: string[]
  branding?: Record<string, unknown>
  white_label_enabled?: boolean
  default_cloud?: 'aws' | 'gcp' | 'azure'
  managed_sla_hours?: number
  benchmark_preferences?: Record<string, unknown>
}

export interface MarketplaceAdvisorRecommendation {
  listing: MarketplaceListingSummary
  score: number
  reasons: string[]
  recommended_action: string
}

export interface MarketplaceAdvisorResponse {
  workspace_slug: string
  strategy: {
    recommended_cloud: string
    target_vertical: string
    managed_sla_hours: number
    white_label_enabled: boolean
  }
  recommendations: MarketplaceAdvisorRecommendation[]
}

export interface MarketplaceBenchmarkRow {
  vertical: string
  listing_count: number
  pilot_requests: number
  purchases: number
  deploy_requests: number
  gross_revenue_cents: number
  gross_revenue_usd: number
  avg_ticket_usd: number
  avg_setup_hours: number
  avg_trust_score: number
  pilot_to_purchase_rate: number
}

export interface MarketplaceBenchmarkResponse {
  workspace_slug: string
  focus_verticals: string[]
  summary: {
    tracked_verticals: number
    focus_vertical_count: number
  }
  verticals: MarketplaceBenchmarkRow[]
  top_verticals: MarketplaceBenchmarkRow[]
}

export interface MarketplaceDeployPlanPayload {
  cloud_provider: 'aws' | 'gcp' | 'azure'
  environment_target: 'sandbox' | 'staging' | 'production'
}

export interface MarketplaceDeployPlan {
  listing_slug: string
  listing_title: string
  cloud_provider: string
  environment_target: string
  workspace_slug: string
  summary: string
  estimated_setup_hours: number
  managed_sla_hours: number
  white_label_enabled: boolean
  runbook_available: boolean
  deploy_modes: string[]
  required_env_vars: string[]
  optional_env_vars: string[]
  infra_modules: string[]
  command: string
  steps: string[]
}

export interface MarketplaceDeployPlanResponse {
  workspace_slug: string
  plan: MarketplaceDeployPlan
}

export const marketplaceApi = {
  async listCatalog(params?: {
    vertical?: string
    poc_type?: string
    search?: string
    limit?: number
  }): Promise<MarketplaceCatalogResponse> {
    const res = await api.get('/api/v1/marketplace/catalog', { params })
    return res.data
  },

  async getCatalogFilters(): Promise<MarketplaceFiltersResponse> {
    const res = await api.get('/api/v1/marketplace/catalog/verticals')
    return res.data
  },

  async getCollections(): Promise<MarketplaceCollectionsResponse> {
    const res = await api.get('/api/v1/marketplace/collections')
    return res.data
  },

  async getListing(
    slug: string,
    params?: {
      ref?: string
      source?: string
    },
  ): Promise<MarketplaceListingDetail> {
    const res = await api.get(`/api/v1/marketplace/listing/${slug}`, { params })
    return res.data
  },

  async getBundles(): Promise<MarketplaceBundlesResponse> {
    const res = await api.get('/api/v1/marketplace/bundles')
    return res.data
  },

  async getBundle(slug: string): Promise<MarketplaceBundle> {
    const res = await api.get(`/api/v1/marketplace/bundles/${slug}`)
    return res.data
  },

  async getTrustSummary(slug: string): Promise<MarketplaceTrustSummary> {
    const res = await api.get(`/api/v1/marketplace/listing/${slug}/trust-summary`)
    return res.data
  },

  async requestPilot(slug: string, body: PilotRequestPayload): Promise<PilotRequestResponse> {
    const res = await api.post(`/api/v1/marketplace/listing/${slug}/pilot-request`, body)
    return res.data
  },

  async purchaseListing(slug: string, body: MarketplacePurchasePayload): Promise<MarketplacePurchaseResponse> {
    const res = await api.post(`/api/v1/marketplace/listing/${slug}/purchase`, body)
    return res.data
  },

  async requestDeploy(slug: string, body: MarketplaceDeployRequestPayload): Promise<MarketplaceDeployRequestResponse> {
    const res = await api.post(`/api/v1/marketplace/listing/${slug}/deploy-request`, body)
    return res.data
  },

  async getEmbedConfig(slug: string, ref?: string): Promise<MarketplaceEmbedConfig> {
    const res = await api.get(`/api/v1/marketplace/listing/${slug}/embed-config`, {
      params: ref ? { ref } : undefined,
    })
    return res.data
  },

  async getReferralLanding(referralCode: string): Promise<MarketplaceReferralLanding> {
    const res = await api.get(`/api/v1/marketplace/referrals/${referralCode}`)
    return res.data
  },

  async createReferralLead(
    referralCode: string,
    body: MarketplaceReferralLeadPayload,
  ): Promise<MarketplaceReferralLeadResponse> {
    const res = await api.post(`/api/v1/marketplace/referrals/${referralCode}`, body)
    return res.data
  },

  async getMyPurchases(): Promise<MarketplaceMyPurchasesResponse> {
    const res = await api.get('/api/v1/marketplace/me/purchases')
    return res.data
  },

  async getMyPilots(): Promise<MarketplaceMyPilotsResponse> {
    const res = await api.get('/api/v1/marketplace/me/pilots')
    return res.data
  },

  async getPrivateWorkspace(): Promise<MarketplacePrivateWorkspace> {
    const res = await api.get('/api/v1/marketplace/me/private-workspace')
    return res.data
  },

  async updatePrivateWorkspace(body: MarketplacePrivateWorkspacePayload): Promise<MarketplacePrivateWorkspace> {
    const res = await api.put('/api/v1/marketplace/me/private-workspace', body)
    return res.data
  },

  async getPrivateWorkspaceAdvisor(): Promise<MarketplaceAdvisorResponse> {
    const res = await api.get('/api/v1/marketplace/me/private-workspace/advisor')
    return res.data
  },

  async getPrivateWorkspaceBenchmarks(): Promise<MarketplaceBenchmarkResponse> {
    const res = await api.get('/api/v1/marketplace/me/private-workspace/benchmarks')
    return res.data
  },

  async createDeployPlan(
    slug: string,
    body: MarketplaceDeployPlanPayload,
  ): Promise<MarketplaceDeployPlanResponse> {
    const res = await api.post(`/api/v1/marketplace/me/private-workspace/listings/${slug}/deploy-plan`, body)
    return res.data
  },

  async downloadListing(slug: string): Promise<{ blob: Blob; filename: string }> {
    const res = await api.get(`/api/v1/marketplace/listing/${slug}/download`, {
      responseType: 'blob',
    })
    const disposition = String(res.headers['content-disposition'] || '')
    const filenameMatch = disposition.match(/filename=\"?([^"]+)\"?/)
    return {
      blob: res.data,
      filename: filenameMatch?.[1] || `${slug}.zip`,
    }
  },

  async getPartnerProfile(profileId: string): Promise<MarketplacePartnerProfileResponse> {
    const res = await api.get(`/api/v1/marketplace/partners/${profileId}`)
    return res.data
  },

  async getTryStatus(slug: string): Promise<MarketplacePreviewStatus> {
    const res = await api.get(`/api/v1/marketplace/listing/${slug}/try/status`)
    return res.data
  },

  async tryListing(slug: string): Promise<MarketplacePreviewStatus> {
    const res = await api.post(`/api/v1/marketplace/listing/${slug}/try`)
    return res.data
  },
}
