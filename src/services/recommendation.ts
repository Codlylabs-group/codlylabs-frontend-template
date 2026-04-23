import { api } from './api'

export interface RecommendationResponse {
  executive_summary: string
  business_context: string
  value_proposition: string
  technical_details: string
  use_cases_specific: string
  implementation_roadmap: string
  impact_matrix: Record<string, string>
  comparison_before_after: {
    title: string
    before: string[]
    after: string[]
    improvements: string[]
  }
  risks: string[]
  mitigation: string[]
  next_steps: string
  download_links: Record<string, string>
}

export interface ComparisonMetric {
  dimension: string
  baseline: number
  with_ai: number
  delta_percent: number
}

export interface ComparisonScenario {
  label: string
  metrics: ComparisonMetric[]
}

export interface ComparisonResponse {
  use_case: string
  objective: string | null
  dimensions: string[]
  scenarios: Record<string, ComparisonScenario>
  summary?: {
    headline?: string
    use_case?: string
  }
}

export const recommendationApi = {
  async generate(sessionId: string, language?: string): Promise<RecommendationResponse> {
    const response = await api.post('/api/v1/recommendation/generate', {
      session_id: sessionId,
      language,
    })
    return response.data
  },

  async downloadPdf(sessionId: string): Promise<Blob> {
    const response = await api.get(`/api/v1/recommendation/download/pdf/${sessionId}`, {
      responseType: 'blob',
    })
    return response.data
  },

  async downloadWord(sessionId: string): Promise<Blob> {
    const response = await api.get(`/api/v1/recommendation/download/word/${sessionId}`, {
      responseType: 'blob',
    })
    return response.data
  },

  async downloadMarkdown(sessionId: string): Promise<Blob> {
    const response = await api.get(`/api/v1/recommendation/download/markdown/${sessionId}`, {
      responseType: 'blob',
    })
    return response.data
  },

  async fetchMarkdownPreview(sessionId: string): Promise<string> {
    const response = await api.get(`/api/v1/recommendation/download/markdown/${sessionId}`, {
      responseType: 'text',
      transformResponse: [(data) => data],
    })
    return response.data as string
  },

  async getComparison(sessionId: string): Promise<ComparisonResponse> {
    const response = await api.get(`/api/v1/recommendation/comparison/${sessionId}`)
    return response.data
  },
}
