// Fase 7: Feed de actividad del agente del editor.
// Plan pinneado arriba, eventos scrolleables, card de clarification bloqueante.

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FileEdit,
  Loader2,
  MessageSquare,
  Search,
  XCircle,
} from 'lucide-react'
import type { AgentTurn, EditorEvent } from '@/types/editorEvents'
import { api } from '@/services/api'

interface AgentActivityFeedProps {
  pocId: string
  turn: AgentTurn | null
  onClarificationSent?: () => void
}

// Mapea el estado del turno a qué pasos del plan ya están hechos. La heurística
// usa palabras-clave del paso (backend, frontend, validar, etc.) cruzadas con
// los eventos del agente y los archivos tocados — no hay un mapping 1:1 entre
// eventos del LLM y pasos, así que esto es lo más cercano a "tildarse en vivo".
function computePlanProgress(turn: AgentTurn): { done: Set<number> } {
  const done = new Set<number>()
  if (!turn.plan) return { done }

  if (turn.failed) {
    return { done }
  }
  if (turn.completed) {
    turn.plan.forEach((_, i) => done.add(i))
    return { done }
  }

  const events = turn.events
  const fileChanges = turn.fileChanges ?? []
  const hasThinking = events.some(
    (e) => e.type === 'editor_thinking' || e.type === 'editor_thinking_delta',
  )
  const hasReadOrList = events.some(
    (e) => e.type === 'editor_tool_use'
      && (e.tool_name === 'read_file' || e.tool_name === 'list_files'),
  )
  const hasBackendFile = fileChanges.some((c) => c.path.startsWith('backend/'))
  const hasFrontendFile = fileChanges.some((c) => c.path.startsWith('frontend/'))
  const hasAnyFile = fileChanges.length > 0
  const hasValidatingOk = events.some(
    (e) => e.type === 'editor_validating' && e.status === 'ok',
  )
  const hasMessage = events.some((e) => e.type === 'editor_message')

  turn.plan.forEach((step, idx) => {
    const lower = step.toLowerCase()

    // "Analizar el pedido" / primer paso → done apenas hay actividad real.
    if (idx === 0 && (hasThinking || hasReadOrList || hasAnyFile || hasMessage)) {
      done.add(idx)
      return
    }

    // Lectura / identificación de archivos.
    if (
      lower.includes('identificar')
      || lower.includes('localizar')
      || lower.includes('leer')
      || lower.includes('relevantes')
      || lower.includes('navegaci')
    ) {
      if (hasReadOrList || hasAnyFile) done.add(idx)
      return
    }

    // Cambios en backend.
    if (
      lower.includes('backend')
      || lower.includes('endpoint')
      || lower.includes('servicio')
      || lower.includes('api')
    ) {
      if (hasBackendFile) done.add(idx)
      return
    }

    // Cambios en frontend (incluye "conectar el frontend al endpoint").
    if (
      lower.includes('frontend')
      || lower.includes(' ui')
      || lower.includes('conectar')
      || lower.includes('aplicar cambios')
      || lower.includes('pantalla')
      || lower.includes('página')
    ) {
      if (hasFrontendFile) done.add(idx)
      return
    }

    // Validación / preview / build.
    if (
      lower.includes('valid')
      || lower.includes('preview')
      || lower.includes('sintaxis')
      || lower.includes('build')
    ) {
      if (hasValidatingOk) done.add(idx)
      return
    }
  })

  return { done }
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

  if (!turn || (turn.events.length === 0 && !turn.plan && (turn.fileChanges?.length ?? 0) === 0)) {
    return null
  }

  const isClarifying = turn.clarification != null && !turn.completed && !turn.failed
  const fileChanges = turn.fileChanges ?? []
  const planProgress = computePlanProgress(turn)
  const currentStepIdx = turn.plan
    ? turn.plan.findIndex((_, i) => !planProgress.done.has(i))
    : -1

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
              const done = planProgress.done.has(idx)
              const active = !done && idx === currentStepIdx && !turn.completed && !turn.failed
              return (
                <li key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                  {done ? (
                    <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-green-600" />
                  ) : active ? (
                    <Loader2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 animate-spin text-indigo-500" />
                  ) : (
                    <span className="mt-1 inline-block h-2 w-2 flex-shrink-0 rounded-full border border-slate-400" />
                  )}
                  <span
                    className={
                      done
                        ? 'line-through opacity-60'
                        : active
                          ? 'font-medium text-indigo-700 dark:text-indigo-300'
                          : ''
                    }
                  >
                    {step}
                  </span>
                </li>
              )
            })}
          </ol>
        </div>
      )}

      {/* Archivos del turno (Lovable-style: lista en vivo) */}
      {fileChanges.length > 0 && (
        <div className="rounded-lg border border-indigo-200 bg-indigo-50/40 p-3 dark:border-indigo-900 dark:bg-indigo-950/30">
          <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
            <span>Archivos del turno</span>
            <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200">
              {fileChanges.length}
            </span>
          </div>
          <ul className="space-y-1">
            {fileChanges.map((c) => (
              <li key={c.path + c.ts} className="flex items-start gap-2 text-xs">
                {c.action === 'created'
                  ? <FileEdit className="mt-0.5 h-3 w-3 flex-shrink-0 text-emerald-500" />
                  : c.action === 'deleted'
                    ? <XCircle className="mt-0.5 h-3 w-3 flex-shrink-0 text-red-500" />
                    : <FileEdit className="mt-0.5 h-3 w-3 flex-shrink-0 text-indigo-500" />}
                <div className="flex-1 min-w-0">
                  <code className="break-all rounded bg-white px-1 py-0.5 text-[11px] text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                    {c.path}
                  </code>
                  <span className="ml-1 text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {c.action}
                  </span>
                  {c.summary && (
                    <span className="ml-2 text-[10px] text-slate-500 dark:text-slate-400">{c.summary}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
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
  // El feed se centra en la NARRATIVA del agente (thinking + message). Las tool
  // calls técnicas (paths, durations) se sirven desde los logs del backend —
  // acá solo se ve lo que ayuda al usuario a entender qué está pasando.
  if (evt.type === 'editor_plan' || evt.type === 'editor_clarification_needed') {
    return null
  }
  if (evt.type === 'editor_completed' || evt.type === 'editor_failed') {
    return null
  }
  if (evt.type === 'editor_tool_use' || evt.type === 'editor_tool_result' || evt.type === 'editor_executing') {
    return null
  }

  if (evt.type === 'editor_thinking') {
    return <ThinkingRow content={evt.content || ''} />
  }
  if (evt.type === 'editor_message') {
    return (
      <div className="flex items-start gap-2 rounded-lg border border-indigo-100 bg-indigo-50/50 px-3 py-2 text-sm leading-6 text-slate-800 dark:border-indigo-900 dark:bg-indigo-950/30 dark:text-slate-200">
        <MessageSquare className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-indigo-500" />
        <span className="whitespace-pre-wrap">{evt.content}</span>
      </div>
    )
  }
  if (evt.type === 'editor_discovery') {
    return (
      <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
        <Search className="mt-0.5 h-3 w-3 text-blue-500" />
        <span>{evt.content}</span>
      </div>
    )
  }
  if (evt.type === 'editor_validating') {
    const statusIcon =
      evt.status === 'ok' ? <Check className="mt-0.5 h-3 w-3 text-green-600" />
        : evt.status === 'error' ? <XCircle className="mt-0.5 h-3 w-3 text-red-600" />
        : <Loader2 className="mt-0.5 h-3 w-3 animate-spin text-slate-400" />
    return (
      <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
        {statusIcon}
        <span>{evt.check || 'Validando'}{evt.content ? `: ${evt.content}` : ''}</span>
      </div>
    )
  }
  return null
}

function ThinkingRow({ content }: { content: string }) {
  // Mostramos el thinking como mensaje principal del agente: prominente,
  // sin italic mini-gris, con borde sutil. Si es muy largo, colapsable.
  const [open, setOpen] = useState(true)
  const isLong = content.length > 480
  const preview = isLong && !open ? content.slice(0, 480).trimEnd() + '…' : content
  return (
    <div className="flex items-start gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm leading-6 text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
      <img
        src="/symbol.svg"
        alt="CodlyLabs"
        className="mt-0.5 h-4 w-4 flex-shrink-0"
        draggable={false}
      />
      <div className="flex-1 min-w-0">
        <span className="whitespace-pre-wrap">{preview}</span>
        {isLong && (
          <button
            type="button"
            onClick={() => setOpen(o => !o)}
            className="ml-2 inline-flex items-center gap-0.5 align-middle text-[11px] font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            {open
              ? <><ChevronDown className="h-3 w-3" />menos</>
              : <><ChevronRight className="h-3 w-3" />ver todo</>}
          </button>
        )}
      </div>
    </div>
  )
}
