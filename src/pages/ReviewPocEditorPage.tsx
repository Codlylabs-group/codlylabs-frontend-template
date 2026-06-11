import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  CheckCircle2,
  ExternalLink,
  Loader2,
  Monitor,
  RefreshCw,
  Send,
  Smartphone,
  Sparkles,
  Wrench,
  XCircle,
} from 'lucide-react'
import { plgService, type ReviewEditorInfo } from '../services/plg'
import { authStorage } from '../services/authStorage'
import { normalizePreviewUrl } from '../utils/previewUrl'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  filesModified?: string[]
  filesCreated?: string[]
  errors?: string[]
}

const MANROPE = { fontFamily: 'Manrope, sans-serif' } as const

function statusLabel(status: string) {
  if (status === 'approved') return 'Aprobada'
  if (status === 'rejected') return 'Rechazada'
  if (status === 'pending_review') return 'En revisión'
  if (status === 'failed') return 'Fallida'
  if (status === 'generating') return 'Generando'
  return status || 'Sin estado'
}

function statusPillClass(status: string) {
  if (status === 'approved') return 'bg-emerald-50 text-emerald-700 ring-emerald-200'
  if (status === 'rejected' || status === 'failed') return 'bg-red-50 text-red-700 ring-red-200'
  if (status === 'generating') return 'bg-indigo-50 text-indigo-700 ring-indigo-200'
  return 'bg-amber-50 text-amber-700 ring-amber-200'
}

function buildWsUrl(token: string, adminToken: string) {
  const apiBase = import.meta.env.VITE_API_URL || import.meta.env.VITE_DEV_API_URL || ''
  let wsBase = apiBase || (typeof window !== 'undefined' ? window.location.origin : '')
  if (wsBase.startsWith('http')) wsBase = wsBase.replace(/^http/, 'ws')
  wsBase = wsBase.replace(/\/$/, '')
  return `${wsBase}/api/v1/plg/validation-review/editor/ws?token=${encodeURIComponent(token)}&admin_token=${encodeURIComponent(adminToken)}`
}

export default function ReviewPocEditorPage() {
  const { token } = useParams<{ token: string }>()
  const decodedToken = useMemo(() => (token ? decodeURIComponent(token) : ''), [token])

  const [info, setInfo] = useState<ReviewEditorInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isActing, setIsActing] = useState<'approve' | 'reject' | null>(null)
  const [notice, setNotice] = useState('')
  const [viewportSize, setViewportSize] = useState<'desktop' | 'mobile'>('desktop')
  const [thinkingMessage, setThinkingMessage] = useState<string | null>(null)

  const iframeRef = useRef<HTMLIFrameElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const previewUrl = info?.preview_url ? normalizePreviewUrl(info.preview_url) : ''
  const reviewLocked = info?.review_status === 'approved' || info?.review_status === 'rejected'

  const loadInfo = useCallback(async () => {
    if (!decodedToken) {
      setError('Token de revision faltante.')
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')
    try {
      const data = await plgService.reviewEditorInfo(decodedToken)
      setInfo(data)
    } catch {
      setError('No se pudo abrir esta revision. El link puede estar vencido o ser invalido.')
    } finally {
      setLoading(false)
    }
  }, [decodedToken])

  useEffect(() => {
    loadInfo()
  }, [loadInfo])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, thinkingMessage])

  useEffect(() => {
    if (!decodedToken || !info?.poc_id) return
    let ws: WebSocket | null = null
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null
    let closing = false

    const connect = () => {
      if (closing) return
      const adminToken = authStorage.getAccessToken()
      if (!adminToken) return
      ws = new WebSocket(buildWsUrl(decodedToken, adminToken))
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'agent_thinking') setThinkingMessage(data.message)
        } catch {
          /* ignore invalid progress frame */
        }
      }
      ws.onclose = () => {
        if (!closing) reconnectTimer = setTimeout(connect, 5000)
      }
    }

    connect()
    return () => {
      closing = true
      if (reconnectTimer) clearTimeout(reconnectTimer)
      if (ws) ws.close()
    }
  }, [decodedToken, info?.poc_id])

  const refreshPreview = useCallback(() => {
    if (iframeRef.current) iframeRef.current.src = iframeRef.current.src
  }, [])

  const openPreview = useCallback(() => {
    if (previewUrl) window.open(previewUrl, '_blank', 'noopener,noreferrer')
  }, [previewUrl])

  const sendRepair = useCallback(async () => {
    if (!decodedToken || !input.trim() || isSending || reviewLocked) return
    const userMessage = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setIsSending(true)
    setThinkingMessage(null)
    setNotice('')

    try {
      const history = messages.map((msg) => ({ role: msg.role, content: msg.content }))
      const res = await plgService.reviewEditorChat(decodedToken, userMessage, history)
      setThinkingMessage(null)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: res.message,
          filesModified: res.files_modified,
          filesCreated: res.files_created,
          errors: res.errors,
        },
      ])
      if (res.files_modified.length || res.files_created.length) {
        setTimeout(refreshPreview, 1400)
      }
    } catch (err: unknown) {
      const response = (err as { response?: { data?: { detail?: string } } })?.response
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response?.data?.detail || 'No se pudo aplicar el cambio. Revisa logs del backend y reintenta con una instruccion mas concreta.',
        },
      ])
    } finally {
      setIsSending(false)
    }
  }, [decodedToken, input, isSending, messages, refreshPreview, reviewLocked])

  const runAction = useCallback(async (action: 'approve' | 'reject') => {
    if (!decodedToken || isActing) return
    const ok = window.confirm(
      action === 'approve'
        ? 'Aprobar esta PoC y enviar el email al usuario?'
        : 'Rechazar esta PoC sin enviar email al usuario?'
    )
    if (!ok) return
    setIsActing(action)
    setNotice('')
    try {
      const res = await plgService.reviewEditorAction(decodedToken, action)
      setNotice(res.message)
      await loadInfo()
    } catch (err: unknown) {
      const response = (err as { response?: { data?: { detail?: string } } })?.response
      setNotice(response?.data?.detail || 'No se pudo completar la accion.')
    } finally {
      setIsActing(null)
    }
  }, [decodedToken, isActing, loadInfo])

  if (loading) {
    return (
      <div className="h-screen bg-gradient-to-br from-indigo-50 via-white to-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm shadow-indigo-100 ring-1 ring-gray-100">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
          </div>
          <p className="text-sm text-gray-500">Cargando revisión…</p>
        </div>
      </div>
    )
  }

  if (error || !info) {
    return (
      <div className="h-screen bg-gradient-to-br from-indigo-50 via-white to-gray-50 flex items-center justify-center px-6">
        <div className="max-w-md rounded-2xl bg-white border border-gray-200 shadow-sm p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50">
            <XCircle className="h-6 w-6 text-red-500" />
          </div>
          <p className="text-sm text-gray-600">{error || 'No se encontró la revisión.'}</p>
        </div>
      </div>
    )
  }

  const reviewState = info.review_status || info.status

  return (
    <div className="h-screen bg-gray-50 text-gray-900 flex flex-col overflow-hidden">
      <header className="h-[68px] bg-white border-b border-gray-200 flex items-center justify-between px-5 flex-shrink-0">
        <div className="min-w-0 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-sm shadow-indigo-200">
            <Wrench className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <h1 className="text-base font-bold truncate text-gray-900" style={MANROPE}>Reparación de PoC</h1>
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ring-1 ${statusPillClass(reviewState)}`}>
                {statusLabel(reviewState)}
              </span>
            </div>
            <p className="text-xs text-gray-500 truncate mt-0.5">
              {info.company_name || 'Sin empresa'} <span className="text-gray-300">·</span> {info.email || 'sin email'} <span className="text-gray-300">·</span> <span className="font-mono text-gray-400">{info.poc_id}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={refreshPreview}
            className="h-9 w-9 inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
            title="Refrescar preview"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={openPreview}
            disabled={!previewUrl}
            className="h-9 w-9 inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-gray-500"
            title="Abrir preview en pestaña nueva"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
          <div className="mx-1 h-6 w-px bg-gray-200" />
          <button
            type="button"
            onClick={() => runAction('reject')}
            disabled={reviewLocked || Boolean(isActing)}
            className="h-9 inline-flex items-center gap-2 px-3.5 rounded-xl border border-red-200 bg-white text-red-600 text-sm font-semibold transition-colors hover:bg-red-50 disabled:opacity-40 disabled:hover:bg-white"
          >
            {isActing === 'reject' ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
            Rechazar
          </button>
          <button
            type="button"
            onClick={() => runAction('approve')}
            disabled={reviewLocked || Boolean(isActing)}
            className="h-9 inline-flex items-center gap-2 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold shadow-sm shadow-indigo-200 transition-all hover:from-indigo-500 hover:to-violet-500 disabled:opacity-40"
          >
            {isActing === 'approve' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Aprobar y enviar
          </button>
        </div>
      </header>

      {notice && (
        <div className="px-5 py-2.5 bg-indigo-50 border-b border-indigo-100 text-sm text-indigo-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />
          {notice}
        </div>
      )}

      <div className="flex-1 min-h-0 flex">
        <aside className="w-[410px] min-w-[360px] max-w-[460px] bg-white border-r border-gray-200 flex flex-col">
          <section className="p-4 border-b border-gray-100">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-gray-100 bg-gray-50/70 px-3 py-2.5">
                <div className="text-[10px] font-bold uppercase tracking-wide text-gray-400">Vertical</div>
                <div className="mt-0.5 text-sm font-semibold text-gray-900 capitalize truncate">{info.vertical || '-'}</div>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50/70 px-3 py-2.5">
                <div className="text-[10px] font-bold uppercase tracking-wide text-gray-400">Email enviado</div>
                <div className={`mt-0.5 text-sm font-semibold ${info.email_sent ? 'text-emerald-600' : 'text-gray-900'}`}>{info.email_sent ? 'Sí' : 'No'}</div>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-[10px] font-bold uppercase tracking-wide text-gray-400">Prompt original</div>
              <div className="mt-2 max-h-32 overflow-y-auto rounded-xl border border-gray-100 bg-gray-50/70 p-3 text-sm leading-5 text-gray-600">
                {info.prompt || '-'}
              </div>
            </div>
          </section>

          <section className="flex-1 min-h-0 flex flex-col">
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <div className="text-sm font-bold text-gray-900" style={MANROPE}>Editor IA interno</div>
              </div>
              <div className="text-xs text-gray-500 mt-1">Describe el problema visible y el resultado esperado en la PoC.</div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && !thinkingMessage && (
                <div className="text-sm text-gray-500 rounded-xl border border-dashed border-gray-300 bg-gray-50/50 p-4 leading-5">
                  <span className="font-semibold text-gray-600">Ejemplo:</span> reemplazá los guiones por datos sintéticos realistas, alineá endpoints con la UI y asegurá que los botones visibles actualicen estado.
                </div>
              )}
              {messages.map((msg, idx) => (
                <div key={`${msg.role}-${idx}`} className={msg.role === 'user' ? 'text-right' : 'text-left'}>
                  <div className={`inline-block max-w-[92%] px-3.5 py-2.5 text-sm leading-5 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-2xl rounded-br-md shadow-sm shadow-indigo-200'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-2xl rounded-bl-md shadow-sm'
                  }`}>
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                    {Boolean(msg.filesModified?.length || msg.filesCreated?.length) && (
                      <div className={`mt-2 pt-2 border-t text-xs text-left ${msg.role === 'user' ? 'border-white/25 text-indigo-100' : 'border-gray-100 text-gray-500'}`}>
                        {msg.filesModified?.length ? <div>Modificados: {msg.filesModified.join(', ')}</div> : null}
                        {msg.filesCreated?.length ? <div>Creados: {msg.filesCreated.join(', ')}</div> : null}
                      </div>
                    )}
                    {msg.errors?.length ? (
                      <div className={`mt-2 pt-2 border-t text-xs text-left ${msg.role === 'user' ? 'border-white/25 text-red-100' : 'border-red-100 text-red-600'}`}>
                        {msg.errors.join(' · ')}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
              {thinkingMessage && (
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-indigo-100 bg-indigo-50 px-3.5 py-2.5 text-sm text-indigo-700">
                  <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                  {thinkingMessage}
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50/40">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                    event.preventDefault()
                    sendRepair()
                  }
                }}
                disabled={reviewLocked || isSending}
                rows={4}
                className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-shadow focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 disabled:bg-gray-100"
                placeholder={reviewLocked ? 'Esta PoC ya fue procesada.' : 'Indicá qué hay que corregir en el preview…'}
              />
              <button
                type="button"
                onClick={sendRepair}
                disabled={!input.trim() || isSending || reviewLocked}
                className="mt-2 h-10 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold shadow-sm shadow-indigo-200 transition-all hover:from-indigo-500 hover:to-violet-500 disabled:opacity-40"
              >
                {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {isSending ? 'Aplicando…' : 'Aplicar reparación'}
              </button>
              <p className="mt-2 text-center text-[11px] text-gray-400">Enter para enviar · Shift + Enter para salto de línea</p>
            </div>
          </section>
        </aside>

        <main className="flex-1 min-w-0 flex flex-col">
          <div className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4">
            <div className="text-sm font-bold text-gray-900" style={MANROPE}>Preview</div>
            <div className="inline-flex rounded-xl border border-gray-200 overflow-hidden bg-gray-50 p-0.5">
              <button
                type="button"
                onClick={() => setViewportSize('desktop')}
                className={`h-7 w-9 inline-flex items-center justify-center rounded-lg transition-colors ${viewportSize === 'desktop' ? 'bg-white text-indigo-600 shadow-sm' : 'bg-transparent text-gray-400 hover:text-gray-600'}`}
                title="Desktop"
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewportSize('mobile')}
                className={`h-7 w-9 inline-flex items-center justify-center rounded-lg transition-colors ${viewportSize === 'mobile' ? 'bg-white text-indigo-600 shadow-sm' : 'bg-transparent text-gray-400 hover:text-gray-600'}`}
                title="Mobile"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-100 to-gray-200/70 p-5">
            {previewUrl ? (
              <div className={`mx-auto h-full overflow-hidden rounded-2xl bg-white shadow-lg shadow-gray-300/50 ring-1 ring-gray-200/80 transition-all ${
                viewportSize === 'mobile' ? 'w-[390px]' : 'w-full'
              }`}>
                <iframe
                  ref={iframeRef}
                  title="PoC preview"
                  src={previewUrl}
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
                />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-gray-500">
                Esta revisión no tiene preview_url.
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
