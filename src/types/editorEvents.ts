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
  | 'editor_file_changed'
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
  duration_ms?: number
  action?: 'created' | 'modified' | 'deleted'
  path?: string
  summary?: Record<string, unknown>
}

export interface FileChangeEntry {
  path: string
  action: 'created' | 'modified' | 'deleted'
  summary?: string
  ts: number
}

export interface AgentTurn {
  id: string
  // Id del mensaje del usuario que originó este turno. Permite renderizarlo
  // intercalado en orden cronológico: msg user → turn → msg user → turn → ...
  userMessageId?: string
  plan: string[] | null
  events: EditorEvent[]
  fileChanges: FileChangeEntry[]
  clarification: { question: string; options?: string[] } | null
  completed: boolean
  failed: boolean
  summary?: Record<string, unknown>
}
