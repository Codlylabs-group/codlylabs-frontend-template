import { api } from './api'

export type SimulationStatus = 'pending' | 'running' | 'completed' | 'failed'
export type DataSource = 'synthetic' | 'historical' | 'sample'

export interface SimulationConfig {
  poc_type: string
  data_source: DataSource
  volume: number
  duration_minutes?: number
  use_real_models: boolean
  include_optimization: boolean
}

export interface SimulationSummary {
  simulation_id: string
  poc_type: string
  status: SimulationStatus
  total_cost?: number
  avg_latency_ms?: number
  roi_percent?: number
  started_at: string
  completed_at?: string | null
}

export interface CostBreakdown {
  llm_api_cost: number
  compute_cost: number
  storage_cost: number
  data_processing_cost: number
  total_cost: number
}

export interface PerformanceMetrics {
  avg_latency_ms: number
  p50_latency_ms: number
  p95_latency_ms: number
  p99_latency_ms: number
  throughput_rps: number
  error_rate_percent: number
}

export interface QualityMetrics {
  accuracy?: number | null
  precision?: number | null
  recall?: number | null
  f1_score?: number | null
  confidence_score: number
}

export interface ROIProjection {
  monthly_cost: number
  annual_cost: number
  estimated_savings: number
  estimated_revenue_gain: number
  roi_percent: number
  payback_months: number
  confidence_level: number
}

export interface SimulationResult {
  simulation_id: string
  poc_type: string
  status: SimulationStatus
  config: SimulationConfig
  cost_breakdown?: CostBreakdown | null
  performance_metrics?: PerformanceMetrics | null
  quality_metrics?: QualityMetrics | null
  roi_projection?: ROIProjection | null
  started_at: string
  completed_at?: string | null
  duration_seconds?: number | null
  warnings?: string[]
  recommendations?: string[]
}

export interface PocTypeOption {
  type: string
  name: string
  description: string
  typical_volume: number
  typical_cost_range: string
}

class SimulationsService {
  async getPocTypes(): Promise<PocTypeOption[]> {
    const response = await api.get<{ supported_poc_types: PocTypeOption[] }>(
      '/api/v1/simulations/templates/poc-types'
    )
    return response.data.supported_poc_types
  }

  async runSimulation(payload: SimulationConfig): Promise<SimulationSummary> {
    const response = await api.post<SimulationSummary>('/api/v1/simulations/run', payload)
    return response.data
  }

  async getSimulation(simulationId: string): Promise<SimulationResult> {
    const response = await api.get<SimulationResult>(`/api/v1/simulations/${simulationId}`)
    return response.data
  }

  async listSimulations(status?: SimulationStatus, limit: number = 20): Promise<SimulationSummary[]> {
    const response = await api.get<SimulationSummary[]>('/api/v1/simulations/', {
      params: { status, limit },
    })
    return response.data
  }

  async deleteSimulation(simulationId: string): Promise<void> {
    await api.delete(`/api/v1/simulations/${simulationId}`)
  }
}

export const simulationsService = new SimulationsService()
export default simulationsService
