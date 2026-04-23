import { api } from './api'

// ── Interfaces ────────────────────────────────────────────────

export interface CuratedBlueprintSummary {
  id: string
  name: string
  slug: string
  short_description: string | null
  poc_type: string
  poc_category: string
  layout_hint: string
  complexity: string | null
  is_featured: boolean
  is_new?: boolean
  icon: string | null
  preview_image_url: string | null
  compliance_tags: string[]
  tech_stack: string[]
  kpis_expected: Array<{ name: string; value: string; unit?: string }>
  estimated_build_time_minutes?: number
  sort_order: number
}

export interface CuratedBlueprintDetail extends CuratedBlueprintSummary {
  description: string
  data_types: string[]
  keywords: string[]
  catalog_poc_id: string | null
  estimated_build_time_minutes: number
  times_generated: number
  success_rate: number | null
  created_at: string | null
}

export interface VerticalPackSummary {
  id: string
  name: string
  slug: string
  vertical: string
  short_description: string | null
  badge: string | null
  icon: string | null
  status: string
  total_blueprints: number
  total_pocs_generated: number
  compliance_modules: string[]
  sort_order: number
}

export interface VerticalPackDetail extends VerticalPackSummary {
  description: string
  price_yearly_usd: number | null
  roi_metrics: Record<string, unknown>
  connectors: Array<{ name: string; system: string; status: string }>
  timeline: Array<{ phase: string; focus: string; deliverables: string[] }>
  blueprints: CuratedBlueprintSummary[]
  created_at: string | null
}

export interface VerticalPackSubscriptionInfo {
  id: string
  vertical_pack_id: string
  vertical_pack_slug: string | null
  vertical_pack_name: string | null
  status: string
  started_at: string | null
  expires_at: string | null
  pocs_generated: number
}

export interface GenerateFromBlueprintResponse {
  poc_id: string | null
  session_id: string
  status: string
  message: string
}

export type VerticalPackLanguage = 'en' | 'es'

export interface ActiveVerticalsInfo {
  active_verticals: string[]
  max_verticals: number | 'unlimited'
  available_verticals: string[]
}

export interface SetActiveVerticalsResponse {
  active_verticals: string[]
  message: string
}

// ── API Client ────────────────────────────────────────────────

export const verticalPacksApi = {
  async listPacks(language?: VerticalPackLanguage): Promise<VerticalPackSummary[]> {
    const res = await api.get('/api/v1/vertical-packs/', {
      params: language ? { language } : undefined,
    })
    return res.data
  },

  async getPackDetail(slug: string, language?: VerticalPackLanguage): Promise<VerticalPackDetail> {
    const res = await api.get(`/api/v1/vertical-packs/${slug}`, {
      params: language ? { language } : undefined,
    })
    return res.data
  },

  async listBlueprints(slug: string, language?: VerticalPackLanguage): Promise<CuratedBlueprintSummary[]> {
    const res = await api.get(`/api/v1/vertical-packs/${slug}/blueprints`, {
      params: language ? { language } : undefined,
    })
    return res.data
  },

  async getBlueprintDetail(
    packSlug: string,
    bpSlug: string,
    language?: VerticalPackLanguage,
  ): Promise<CuratedBlueprintDetail> {
    const res = await api.get(
      `/api/v1/vertical-packs/${packSlug}/blueprints/${bpSlug}`,
      {
        params: language ? { language } : undefined,
      },
    )
    return res.data
  },

  async generateFromBlueprint(
    blueprintId: string,
    customization?: Record<string, unknown>,
    language?: VerticalPackLanguage,
  ): Promise<GenerateFromBlueprintResponse> {
    const res = await api.post('/api/v1/vertical-packs/generate', {
      blueprint_id: blueprintId,
      customization,
      language,
    })
    return res.data
  },

  async getMySubscriptions(): Promise<VerticalPackSubscriptionInfo[]> {
    const res = await api.get('/api/v1/vertical-packs/my/subscriptions')
    return res.data
  },

  async getActiveVerticals(): Promise<ActiveVerticalsInfo> {
    const res = await api.get('/api/v1/vertical-packs/my/active-verticals')
    return res.data
  },

  async setActiveVerticals(verticals: string[]): Promise<SetActiveVerticalsResponse> {
    const res = await api.put('/api/v1/vertical-packs/my/active-verticals', {
      verticals,
    })
    return res.data
  },
}
