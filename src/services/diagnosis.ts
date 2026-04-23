import { api } from './api'
import type { DiagnosisResponse } from '../types/diagnosis'

export const diagnosisApi = {
  async analyze(sessionId: string): Promise<DiagnosisResponse> {
    const response = await api.post('/api/v1/diagnosis/analyze', {
      session_id: sessionId,
    })
    return response.data as DiagnosisResponse
  },
}

