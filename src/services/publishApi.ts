// Fase 6: cliente REST para publish/unpublish/status del preview persistente.

import { api } from './api'
import type {
  PublishStatusResponse,
  PublishedPocResponse,
  PublishedListResponse,
  UnpublishResponse,
} from '@/types/publishing'

export async function publishPreview(pocId: string): Promise<PublishedPocResponse> {
  const response = await api.post<PublishedPocResponse>(`/api/v1/preview/${pocId}/publish`)
  return response.data
}

export async function unpublishPreview(pocId: string): Promise<UnpublishResponse> {
  const response = await api.delete<UnpublishResponse>(`/api/v1/preview/${pocId}/publish`)
  return response.data
}

export async function getPublishStatus(pocId: string): Promise<PublishStatusResponse> {
  const response = await api.get<PublishStatusResponse>(`/api/v1/preview/${pocId}/publish/status`)
  return response.data
}

export async function listOrgPublished(orgId: string): Promise<PublishedListResponse> {
  const response = await api.get<PublishedListResponse>(`/api/v1/organizations/${orgId}/published`)
  return response.data
}
