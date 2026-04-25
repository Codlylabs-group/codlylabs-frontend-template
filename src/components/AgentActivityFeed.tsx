// Fase 7: Feed de actividad del agente del editor.
// Plan pinneado arriba, eventos scrolleables, card de clarification bloqueante.

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  AlertTriangle,
  Brain,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FileEdit,
  Loader2,
  MessageSquare,
  Search,
  Sparkles,
  Terminal,
  Wrench,
  XCircle,
} from 'lucide-react'
import type { AgentTurn, EditorEvent } from '@/types/editorEvents'
import { api } from '@/services/api'

interface AgentActivityFeedProps {
  pocId: string
  turn: AgentTurn | null
  onClarificationSent?: () => void
}

const EVENT_ORDER: Record<string, number> = {
  editor_plan: 0,
  editor_thinking: 1,
  editor_discovery: 2,
  editor_tool_use: 3,
  editor_tool_result: 4,
  editor_executing: 5,
  editor_message: 6,
  editor_validating: 7,
  editor_clarification_needed: 8,
  editor_completed: 9,
  editor_failed: 10,
}

const TOOL_ICONS: Record<string, JSX.Element> = {
  read_file: <Search className="mt-0.5 h-3 w-3 text-blue-500" />,
  list_files: <Search className="mt-0.5 h-3 w-3 text-blue-500" />,
  edit_file: <FileEdit className="mt-0.5 h-3 w-3 text-indigo-500" />,
  create_file: <FileEdit className="mt-0.5 h-3 w-3 text-emerald-500" />,
  run_command: <Terminal className="mt-0.5 h-3 w-3 text-amber-500" />,
  ask_user: <AlertTriangle className="mt-0.5 h-3 w-3 text-amber-500" />,
}

export default function AgentActivityFeed({ pocId, turn, onClarificationSent }: AgentActivityFeedProps) {
  const [answer, setAnswer] = useState('')
  const [sending, setSending] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const feedEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [turn?.events.length])

  const submitClarification = useCallback(async (value: string) => {
    setLocalError(null)
    if (!value.trim()) return
    setSending(true)
    try {
      await api.post(`/api/v1/editor/${pocId}/clarify`, { answer: value })
      setAnswer('')
      onClarificationSent?.()
    } catch (err: any) {
      setLocalError(err?.response?.data?.detail || err?.message || 'No se pudo enviar la respuesta')
    } finally {
      setSending(false)
    }
  }, [pocId, onClarificationSent])

  if (!turn || (turn.events.length === 0 && !turn.plan)) {
    return null
  }

  const planDone = new Set<string>()
  if (turn.plan) {
    for (const ev of turn.events) {
      if (ev.type === 'editor_executing' && ev.content) {
        planDone.add(ev.content)
      }
    }
  }

  const isClarifying = turn.clarification != null && !turn.completed && !turn.failed

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm dark:border-slate-700 dark:bg-slate-900">
      {/* Plan pinneado */}
      {turn.plan && turn.plan.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Plan del turno
          </div>
          <ol className="space-y-1">
            {turn.plan.map((step, idx) => {
              const done = planDone.has(step) || (turn.completed && idx < turn.plan!.length)
              return (
                <li key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                  {done ? (
                    <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-green-600" />
                  ) : (
                    <span className="mt-1 inline-block h-2 w-2 flex-shrink-0 rounded-full border border-slate-400" />
                  )}
                  <span className={done ? 'line-through opacity-60' : ''}>{step}</span>
                </li>
              )
            })}
          </ol>
        </div>
      )}

      {/* Feed de eventos */}
      <div className="space-y-2">
        {turn.events.map((evt, idx) => (
          <EventRow key={idx} evt={evt} />
        ))}
        <div ref={feedEndRef} />
      </div>

      {/* Clarification card bloqueante */}
      {isClarifying && turn.clarification && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-950/40">
          <div className="mb-2 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 flex-shrink-0 text-amber-700 dark:text-amber-500" />
            <div className="text-sm font-medium text-amber-900 dark:text-amber-300">
              Necesito confirmar antes de seguir
            </div>
          </div>
          <p className="text-sm text-amber-900 dark:text-amber-200">{turn.clarification.question}</p>

          {/* Botones de respuesta rápida */}
          {turn.clarification.options && turn.clarification.options.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {turn.clarification.options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  disabled={sending}
                  onClick={() => submitClarification(opt)}
                  className="rounded border border-amber-400 bg-white px-3 py-1 text-xs font-medium text-amber-800 hover:bg-amber-100 disabled:opacity-60 dark:bg-amber-900/30 dark:text-amber-200"
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {/* Input libre */}
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={answer}
              disabled={sending}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !sending) submitClarification(answer)
              }}
              placeholder="Tu respuesta..."
              className="flex-1 rounded border border-amber-300 bg-white px-3 py-1.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-amber-500 dark:border-amber-700 dark:bg-slate-900 dark:text-slate-100"
            />
            <button
              type="button"
              disabled={sending || !answer.trim()}
              onClick={() => submitClarification(answer)}
              className="rounded bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {sending ? 'Enviando...' : 'Enviar'}
            </button>
          </div>

          {localError && (
            <p className="mt-2 text-xs text-red-700 dark:text-red-400">{localError}</p>
          )}
        </div>
      )}

      {/* Resumen al cerrar */}
      {turn.completed && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm dark:border-green-900 dark:bg-green-950/30">
          <div className="mb-1 flex items-center gap-2 text-green-800 dark:text-green-300">
            <CheckCircle2 className="h-4 w-4" />
            <span className="font-medium">Turno completado</span>
          </div>
          {turn.summary && (
            <pre className="mt-2 max-h-32 overflow-auto whitespace-pre-wrap break-words text-xs text-green-900 dark:text-green-200">
              {JSON.stringify(turn.summary, null, 2)}
            </pre>
          )}
        </div>
      )}
      {turn.failed && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm dark:border-red-900 dark:bg-red-950/30">
          <div className="flex items-center gap-2 text-red-800 dark:text-red-300">
            <XCircle className="h-4 w-4" />
            <span className="font-medium">Turno falló</span>
          </div>
          {turn.summary && (
            <pre className="mt-2 max-h-32 overflow-auto whitespace-pre-wrap break-words text-xs text-red-900 dark:text-red-200">
              {JSON.stringify(turn.summary, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  )
}

function EventRow({ evt }: { evt: EditorEvent }) {
  const order = EVENT_ORDER[evt.type] ?? 99
  // Descarta `plan` y `clarification_needed` del feed (se renderizan en otros lados)
  if (evt.type === 'editor_plan' || evt.type === 'editor_clarification_needed') {
    return null
  }
  if (evt.type === 'editor_completed' || evt.type === 'editor_failed') {
    return null
  }

  const baseClass = 'flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300'

  if (evt.type === 'editor_thinking') {
    return <ThinkingRow content={evt.content || ''} />
  }
  if (evt.type === 'editor_message') {
    return (
      <div className="flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-800 dark:bg-slate-800/60 dark:text-slate-200">
        <MessageSquare className="mt-0.5 h-3 w-3 flex-shrink-0 text-indigo-500" />
        <span className="whitespace-pre-wrap leading-5">{evt.content}</span>
      </div>
    )
  }
  if (evt.type === 'editor_tool_use') {
    const icon = (evt.tool_name && TOOL_ICONS[evt.tool_name]) || <Wrench className="mt-0.5 h-3 w-3 text-slate-400" />
    return (
      <div className={baseClass}>
        {icon}
        <span>
          <span className="font-medium text-slate-700 dark:text-slate-200">{evt.tool_name}</span>
          {evt.content && (
            <>
              {' '}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-[11px] dark:bg-slate-800">{evt.content}</code>
            </>
          )}
        </span>
      </div>
    )
  }
  if (evt.type === 'editor_tool_result') {
    const ok = evt.status !== 'error'
    return (
      <div className={baseClass}>
        {ok
          ? <Check className="mt-0.5 h-3 w-3 text-green-600" />
          : <XCircle className="mt-0.5 h-3 w-3 text-red-600" />}
        <span className="text-[11px] opacity-80">
          {evt.tool_name}
          {evt.tool_result ? ` · ${evt.tool_result}` : ''}
        </span>
      </div>
    )
  }
  if (evt.type === 'editor_discovery') {
    return (
      <div className={baseClass}>
        <Search className="mt-0.5 h-3 w-3 text-blue-500" />
        <span>{evt.content}</span>
      </div>
    )
  }
  if (evt.type === 'editor_executing') {
    return (
      <div className={baseClass}>
        <FileEdit className="mt-0.5 h-3 w-3 text-indigo-500" />
        <span>
          Editando <code className="rounded bg-slate-100 px-1 py-0.5 text-[11px] dark:bg-slate-800">{evt.file || evt.content}</code>
        </span>
      </div>
    )
  }
  if (evt.type === 'editor_validating') {
    const statusIcon =
      evt.status === 'ok' ? <Check className="mt-0.5 h-3 w-3 text-green-600" />
        : evt.status === 'error' ? <XCircle className="mt-0.5 h-3 w-3 text-red-600" />
        : <Loader2 className="mt-0.5 h-3 w-3 animate-spin text-slate-400" />
    return (
      <div className={baseClass}>
        {statusIcon}
        <span>{evt.check || 'Validando'}{evt.content ? `: ${evt.content}` : ''}</span>
      </div>
    )
  }
  return (
    <div className={baseClass} data-order={order}>
      <Sparkles className="mt-0.5 h-3 w-3 text-slate-400" />
      <span>{evt.content || evt.type}</span>
    </div>
  )
}

function ThinkingRow({ content }: { content: string }) {
  const [open, setOpen] = useState(false)
  const isLong = content.length > 160
  const preview = isLong ? content.slice(0, 160) + '…' : content
  return (
    <div className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
      <Brain className="mt-0.5 h-3 w-3 flex-shrink-0 text-purple-400" />
      <div className="flex-1">
        {isLong ? (
          <button
            type="button"
            onClick={() => setOpen(o => !o)}
            className="flex items-start gap-1 text-left italic hover:text-slate-700 dark:hover:text-slate-200"
          >
            {open
              ? <ChevronDown className="mt-0.5 h-3 w-3 flex-shrink-0" />
              : <ChevronRight className="mt-0.5 h-3 w-3 flex-shrink-0" />}
            <span className="whitespace-pre-wrap leading-5">{open ? content : preview}</span>
          </button>
        ) : (
          <span className="italic leading-5 whitespace-pre-wrap">{content}</span>
        )}
      </div>
    </div>
  )
}
