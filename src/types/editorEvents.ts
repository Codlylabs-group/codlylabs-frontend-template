// Fase 7: eventos tipados del editor que emite el agente al WebSocket.
// Espejo de backend/app/schemas/editor_events.py

export type EditorEventType =
  | 'editor_plan'
  | 'editor_thinking'
  | 'editor_thinking_delta'
  | 'editor_discovery'
  | 'editor_clarification_needed'
  | 'editor_executing'
  | 'editor_tool_use'
  | 'editor_tool_result'
  | 'editor_message'
  | 'editor_message_delta'
  | 'editor_validating'
  | 'editor_completed'
  | 'editor_failed'

export interface EditorEvent {
  type: EditorEventType
  timestamp?: string
  content?: string
  steps?: string[]
  question?: string
  options?: string[]
  file?: string
  check?: string
  status?: 'ok' | 'error' | 'pending'
  tool_name?: string
  tool_input?: Record<string, unknown>
  tool_result?: string
  summary?: Record<string, unknown>
}

export interface AgentTurn {
  id: string
  plan: string[] | null
  events: EditorEvent[]
  clarification: { question: string; options?: string[] } | null
  completed: boolean
  failed: boolean
  summary?: Record<string, unknown>
}
