// Fase 6: Preview Persistente — types del frontend.

export type PublishedPocStatus = 'active' | 'suspended' | 'failed'

export interface PublishedPocResponse {
  id: string
  poc_id: string
  owner_org_id: string
  port: number
  status: PublishedPocStatus
  public_url: string
  created_at: string
  updated_at?: string | null
  expires_at?: string | null
  last_health_check?: string | null
}

export interface PublishQuotaStatus {
  used: number
  limit: number // -1 = ilimitado
  plan_tier: string
}

export interface PublishStatusResponse {
  published: boolean
  data: PublishedPocResponse | null
}

export interface PublishedListResponse {
  items: PublishedPocResponse[]
  quota: PublishQuotaStatus
}

export interface UnpublishResponse {
  poc_id: string
  status: 'unpublished' | 'already_unpublished'
}

export interface QuotaExceededDetail {
  error: 'quota_exceeded'
  message: string
  quota: PublishQuotaStatus
}
