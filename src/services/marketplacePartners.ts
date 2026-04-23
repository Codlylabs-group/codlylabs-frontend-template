import { api } from './api'
import type { MarketplaceTrustSummary } from './marketplace'

export interface DeveloperProfile {
  id: string
  user_id: string
  organization_id: string
  display_name: string
  company_name: string | null
  website_url: string | null
  contact_email: string
  bio: string | null
  target_verticals: string[]
  onboarding_answers: Record<string, unknown>
  status: string
  tier: string
  review_notes: string | null
  partner_program: string
  certification_status: string
  co_sell_ready: boolean
  embed_enabled: boolean
  public_badges: string[]
  featured_case_study: Record<string, unknown>
  referral_code: string
  approved_at: string | null
  created_at: string | null
}

export interface ValidationCheck {
  code: string
  label: string
  passed: boolean
  detail?: string
}

export interface ValidationReport {
  hard_gate_passed: boolean
  soft_score: number
  quality_score: number
  quality_badge: string
  preview_supported: boolean
  hard_checks: ValidationCheck[]
  soft_checks: ValidationCheck[]
  files_detected: number
}

export interface PartnerListing {
  id: string
  developer_profile_id: string
  organization_id: string
  name: string
  slug: string
  title: string
  subtitle: string | null
  short_description: string | null
  description: string | null
  vertical: string
  poc_type: string
  interface: string
  tags: string[]
  tech_stack: string[]
  dependencies: string[]
  buyer_fit: Record<string, unknown>
  deployment_meta: Record<string, unknown>
  trust_meta: Record<string, unknown>
  price_trial: number
  price_license: number
  price_enterprise: number
  quality_score: number
  quality_badge: string
  setup_estimate_hours: number
  integration_complexity: string
  preview_supported: boolean
  status: string
  submission_notes: string | null
  review_notes: string | null
  uploaded_zip_path: string | null
  preview_poc_id: string
  submitted_at: string | null
  reviewed_at: string | null
  published_at: string | null
  created_at: string | null
  validation_report?: ValidationReport
  trust_summary?: MarketplaceTrustSummary
  seo_meta?: {
    meta_title: string
    meta_description: string
  }
  embed_enabled?: boolean
  success_story?: Record<string, unknown>
  cloud_templates?: string[]
  private_marketplace_ready?: boolean
  white_label_ready?: boolean
}

export interface PartnerDashboardResponse {
  profile: DeveloperProfile
  listings: PartnerListing[]
  vertical_options: string[]
  poc_type_options: string[]
  status_options: string[]
}

export interface PrivatePreviewStatus {
  listing_id: string
  slug: string
  preview_available: boolean
  preview_url: string | null
  status: string
  expires_at: string | null
  ports: Record<string, number> | null
}

export interface MarketplaceAdminQueueResponse {
  pending_profiles: DeveloperProfile[]
  pending_listings: PartnerListing[]
  generated_at: string
}

export interface MarketplaceAdminStatsResponse {
  profiles: Record<string, number>
  listings: Record<string, number>
  generated_at: string
}

export interface PartnerRevenueLine {
  transaction_type: string
  line_label: string
  gross_amount_cents: number
  platform_fee_cents: number
  net_amount_cents: number
  transaction_count: number
}

export interface PartnerTransaction {
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

export interface PartnerEarningsResponse {
  profile_id: string
  summary: {
    gross_amount_cents: number
    gross_amount_usd: number
    platform_fee_cents: number
    platform_fee_usd: number
    net_amount_cents: number
    net_amount_usd: number
    transaction_count: number
    pending_payout_cents: number
    pending_payout_usd: number
    paid_out_cents: number
    paid_out_usd: number
  }
  revenue_lines: PartnerRevenueLine[]
  recent_transactions: PartnerTransaction[]
}

export interface PartnerPayout {
  id: string
  developer_profile_id: string
  period_start: string | null
  period_end: string | null
  gross_amount_cents: number
  platform_fee_cents: number
  net_amount_cents: number
  gross_amount_usd: number
  net_amount_usd: number
  transaction_count: number
  currency: string
  payout_provider: string
  status: string
  paid_at: string | null
  created_at: string | null
}

export interface PartnerPayoutsResponse {
  profile_id: string
  items: PartnerPayout[]
}

export interface PartnerAnalyticsEvent {
  id: string
  listing_slug: string | null
  developer_profile_id: string | null
  event_type: string
  source: string
  referral_code: string | null
  metadata: Record<string, unknown>
  created_at: string | null
}

export interface PartnerReferralLead {
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

export interface PartnerAnalyticsResponse {
  profile: DeveloperProfile
  summary: {
    listing_views: number
    trials_started: number
    pilot_requests: number
    purchases: number
    deploy_requests: number
    referral_leads: number
    view_to_trial_rate: number
    trial_to_pilot_rate: number
    pilot_to_purchase_rate: number
  }
  listing_funnel: Array<{
    listing_slug: string
    listing_title: string
    vertical: string
    views: number
    trials: number
    pilots: number
    purchases: number
    deploy_requests: number
    view_to_trial_rate: number
    trial_to_pilot_rate: number
    pilot_to_purchase_rate: number
  }>
  sector_mix: Array<{
    vertical: string
    activity_count: number
  }>
  recent_events: PartnerAnalyticsEvent[]
  recent_referrals: PartnerReferralLead[]
}

export interface PartnerReferralsResponse {
  profile: DeveloperProfile
  items: PartnerReferralLead[]
}

export interface PartnerEmbedResponse {
  slug: string
  iframe_url: string
  listing_url: string
  title: string
  subtitle: string
  iframe_snippet: string
  link_snippet: string
}

export interface MarketplaceAdminBundle {
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
  items: Array<{
    slug: string
    title: string
    vertical: string
  }>
  created_at?: string | null
  source?: string
}

export interface MarketplaceAdminBundlesResponse {
  items: MarketplaceAdminBundle[]
}

export interface PartnerApplyPayload {
  display_name: string
  company_name?: string
  website_url?: string
  contact_email: string
  bio?: string
  target_verticals: string[]
  onboarding_answers: Record<string, unknown>
}

export interface ListingPayload {
  name?: string
  slug?: string
  title?: string
  subtitle?: string
  short_description?: string
  description?: string
  vertical?: string
  poc_type?: string
  interface?: string
  tags?: string[]
  tech_stack?: string[]
  dependencies?: string[]
  buyer_fit?: Record<string, unknown>
  deployment_meta?: Record<string, unknown>
  trust_meta?: Record<string, unknown>
  submission_notes?: string
  price_trial?: number
  price_license?: number
  price_enterprise?: number
  setup_estimate_hours?: number
  integration_complexity?: string
}

export interface PartnerProgramPayload {
  partner_program?: 'builder' | 'consultancy' | 'integrator' | 'operator'
  certification_status?: 'none' | 'certified' | 'premier'
  co_sell_ready?: boolean
  embed_enabled?: boolean
  public_badges?: string[]
  featured_case_study?: Record<string, unknown>
}

export interface BundlePayload {
  slug?: string
  title: string
  subtitle?: string
  description?: string
  vertical?: string
  use_case?: string
  listing_slugs?: string[]
  bundle_meta?: Record<string, unknown>
  featured?: boolean
  is_public?: boolean
  sort_order?: number
}

export const marketplacePartnersApi = {
  async getDashboard(): Promise<PartnerDashboardResponse> {
    const res = await api.get('/api/v1/marketplace-partners/me/dashboard')
    return res.data
  },

  async apply(body: PartnerApplyPayload): Promise<{ profile: DeveloperProfile; message: string }> {
    const res = await api.post('/api/v1/marketplace-partners/apply', body)
    return res.data
  },

  async createListing(body: ListingPayload): Promise<PartnerListing> {
    const res = await api.post('/api/v1/marketplace-partners/me/listings', body)
    return res.data
  },

  async updateListing(listingId: string, body: ListingPayload): Promise<PartnerListing> {
    const res = await api.put(`/api/v1/marketplace-partners/me/listings/${listingId}`, body)
    return res.data
  },

  async uploadZip(listingId: string, file: File): Promise<PartnerListing> {
    const formData = new FormData()
    formData.append('file', file)
    const res = await api.post(`/api/v1/marketplace-partners/me/listings/${listingId}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  },

  async submitListing(listingId: string): Promise<PartnerListing> {
    const res = await api.post(`/api/v1/marketplace-partners/me/listings/${listingId}/submit`)
    return res.data
  },

  async createPrivatePreview(listingId: string): Promise<PrivatePreviewStatus> {
    const res = await api.post(`/api/v1/marketplace-partners/me/listings/${listingId}/preview`)
    return res.data
  },

  async getPrivatePreviewStatus(listingId: string): Promise<PrivatePreviewStatus> {
    const res = await api.get(`/api/v1/marketplace-partners/me/listings/${listingId}/preview/status`)
    return res.data
  },

  async getEarnings(): Promise<PartnerEarningsResponse> {
    const res = await api.get('/api/v1/marketplace-partners/me/earnings')
    return res.data
  },

  async getPayouts(): Promise<PartnerPayoutsResponse> {
    const res = await api.get('/api/v1/marketplace-partners/me/payouts')
    return res.data
  },

  async getAnalytics(): Promise<PartnerAnalyticsResponse> {
    const res = await api.get('/api/v1/marketplace-partners/me/analytics')
    return res.data
  },

  async getReferrals(): Promise<PartnerReferralsResponse> {
    const res = await api.get('/api/v1/marketplace-partners/me/referrals')
    return res.data
  },

  async getEmbed(listingId: string): Promise<PartnerEmbedResponse> {
    const res = await api.get(`/api/v1/marketplace-partners/me/listings/${listingId}/embed`)
    return res.data
  },

  async getAdminQueue(): Promise<MarketplaceAdminQueueResponse> {
    const res = await api.get('/api/v1/admin/marketplace/queue')
    return res.data
  },

  async getAdminStats(): Promise<MarketplaceAdminStatsResponse> {
    const res = await api.get('/api/v1/admin/marketplace/stats')
    return res.data
  },

  async approvePartner(profileId: string, notes?: string): Promise<DeveloperProfile> {
    const res = await api.post(`/api/v1/admin/marketplace/partners/${profileId}/approve`, { notes })
    return res.data
  },

  async rejectPartner(profileId: string, notes?: string): Promise<DeveloperProfile> {
    const res = await api.post(`/api/v1/admin/marketplace/partners/${profileId}/reject`, { notes })
    return res.data
  },

  async updatePartnerProgram(profileId: string, body: PartnerProgramPayload): Promise<DeveloperProfile> {
    const res = await api.post(`/api/v1/admin/marketplace/partners/${profileId}/program`, body)
    return res.data
  },

  async approveListing(listingId: string, notes?: string): Promise<PartnerListing> {
    const res = await api.post(`/api/v1/admin/marketplace/listings/${listingId}/approve`, { notes })
    return res.data
  },

  async markPilotOnly(listingId: string, notes?: string): Promise<PartnerListing> {
    const res = await api.post(`/api/v1/admin/marketplace/listings/${listingId}/pilot-only`, { notes })
    return res.data
  },

  async setSecurityReviewStatus(
    listingId: string,
    status: 'pending' | 'passed' | 'not_required',
    notes?: string,
  ): Promise<PartnerListing> {
    const res = await api.post(`/api/v1/admin/marketplace/listings/${listingId}/security-review`, {
      status,
      notes,
    })
    return res.data
  },

  async rejectListing(listingId: string, notes?: string): Promise<PartnerListing> {
    const res = await api.post(`/api/v1/admin/marketplace/listings/${listingId}/reject`, { notes })
    return res.data
  },

  async getAdminBundles(): Promise<MarketplaceAdminBundlesResponse> {
    const res = await api.get('/api/v1/admin/marketplace/bundles')
    return res.data
  },

  async createBundle(body: BundlePayload): Promise<MarketplaceAdminBundle> {
    const res = await api.post('/api/v1/admin/marketplace/bundles', body)
    return res.data
  },

  async updateBundle(bundleId: string, body: BundlePayload): Promise<MarketplaceAdminBundle> {
    const res = await api.put(`/api/v1/admin/marketplace/bundles/${bundleId}`, body)
    return res.data
  },
}
