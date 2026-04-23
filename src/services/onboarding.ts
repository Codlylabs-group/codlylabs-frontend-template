import { api } from './api'

export interface OnboardingStartRequest {
  user_input: string
  industry?: string
  company_size?: string
}

export interface QuestionResponse {
  question_id: string
  answer: string
}

export interface OnboardingContinueRequest {
  session_id: string
  responses: QuestionResponse[]
}

export interface Question {
  id: string
  text: string
  type: string
  options?: string[]
  required: boolean
  reasoning?: string | null
}

export interface AnalysisResult {
  detected_objective?: string
  detected_industry?: string
  detected_data_type?: string
  confidence: number
  key_entities: string[]
  suggested_use_cases: string[]
}

export interface OnboardingResponse {
  session_id: string
  status: string
  progress: number
  next_questions: Question[]
  analysis?: AnalysisResult
  suggested_next_step?: string
}

export interface SessionDetail {
  id: string
  user_input: string
  industry?: string
  company_size?: string
  objective?: string
  data_type?: string
  conversation_history: Array<{
    timestamp: string
    type: string
    content?: string
    question_id?: string
    answer?: string
  }>
  user_responses: Record<string, string>
  analysis_results: Record<string, unknown>
  status: string
  progress: number
  created_at: string
  updated_at: string
  user_name?: string
  user_email?: string
  user_id?: string
}

export const onboardingApi = {
  async startOnboarding(data: OnboardingStartRequest): Promise<OnboardingResponse> {
    const response = await api.post('/api/v1/onboarding/start', data)
    return response.data
  },

  async continueOnboarding(data: OnboardingContinueRequest): Promise<OnboardingResponse> {
    const response = await api.post('/api/v1/onboarding/continue', data)
    return response.data
  },

  async getSession(sessionId: string): Promise<SessionDetail> {
    const response = await api.get(`/api/v1/onboarding/session/${sessionId}`)
    return response.data
  },

  async listSessions(limit: number = 10, status?: string): Promise<SessionDetail[]> {
    const params = new URLSearchParams()
    params.append('limit', limit.toString())
    if (status) {
      params.append('status', status)
    }
    const response = await api.get(`/api/v1/onboarding/sessions?${params.toString()}`)
    return response.data
  },

  async associateUserWithSession(sessionId: string): Promise<{ success: boolean; user_name: string }> {
    const response = await api.post('/api/v1/onboarding/session/associate-user', {
      session_id: sessionId,
    })
    return response.data
  },
}
