import { api } from './api'

export interface RoadmapPhase {
  name: string
  description: string
  duration: string
  objective: string
  key_activities: string[]
  deliverables: string[]
  risks: string[]
  dependencies?: string[]
}

export interface RoadmapResponse {
  session_id: string
  phases: RoadmapPhase[]
}

export const roadmapApi = {
  async generate(sessionId: string): Promise<RoadmapResponse> {
    const response = await api.post('/api/v1/roadmap/generate', {
      session_id: sessionId,
    })
    return response.data
  },

  async downloadProject(sessionId: string): Promise<Blob> {
    const response = await api.get(`/api/v1/roadmap/export/project/${sessionId}`, {
      responseType: 'blob',
    })
    return response.data
  },

  async downloadGantt(sessionId: string): Promise<Blob> {
    const response = await api.get(`/api/v1/roadmap/export/gantt/${sessionId}`, {
      responseType: 'blob',
    })
    return response.data
  },
}
