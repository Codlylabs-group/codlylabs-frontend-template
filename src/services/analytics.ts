import { api } from './api'
import type { UseCaseCategory } from '../types/diagnosis'

export interface KPIProjection {
  label: string
  description: string
  dimension: 'cost' | 'time' | 'revenue' | 'risk' | 'other'
}

export interface AnalyticsSummary {
  session_id: string
  category: UseCaseCategory
  objective?: string
  complexity: string
  estimated_time: string
  projections: KPIProjection[]
  reasoning_confidence?: number
  reasoning_quality_score?: number
  reasoning_category?: string
  is_hybrid?: boolean
  out_of_legacy_category?: boolean
}

export interface AggregatedMetrics {
  session_id: string
  metrics: Record<string, { total: number; average: number; count: number }>
}

export interface ROISummary {
  session_id: string
  roi_percent: number
  payback_period_months: number
  estimated_savings_annual: number
  estimated_revenue_annual: number
  investment_cost: number
}

export interface TimeBucket {
  period: string
  total: number
  count: number
}

export interface TimeSeriesMetrics {
  session_id: string
  period: 'day' | 'week' | 'month'
  series: Record<string, TimeBucket[]>
}

export interface MetricAlert {
  level: 'info' | 'warning' | 'critical'
  title: string
  message: string
  dimension?: string
}

export interface AlertsResponse {
  session_id: string
  alerts: MetricAlert[]
}

export const analyticsApi = {
  async summary(sessionId: string): Promise<AnalyticsSummary> {
    const response = await api.post('/api/v1/analytics/summary', {
      session_id: sessionId,
    })
    return response.data
  },

  async metrics(sessionId: string): Promise<AggregatedMetrics> {
    const response = await api.get(`/api/v1/analytics/metrics/${sessionId}`)
    return response.data
  },

  async roi(sessionId: string): Promise<ROISummary> {
    const response = await api.get(`/api/v1/analytics/roi/${sessionId}`)
    return response.data
  },

  async timeSeries(sessionId: string, period: 'day' | 'week' | 'month'): Promise<TimeSeriesMetrics> {
    const response = await api.post('/api/v1/analytics/metrics/timeseries', {
      session_id: sessionId,
      period,
    })
    return response.data
  },

  async alerts(sessionId: string): Promise<AlertsResponse> {
    const response = await api.get(`/api/v1/analytics/alerts/${sessionId}`)
    return response.data
  },

  async downloadReport(sessionId: string): Promise<Blob> {
    const response = await api.get(`/api/v1/analytics/report/${sessionId}`, {
      responseType: 'blob',
    })
    return response.data
  },
}
