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

function statusLabel(status: string) {
  if (status === 'approved') return 'Aprobada'
  if (status === 'rejected') return 'Rechazada'
  if (status === 'pending_review') return 'En revision'
  if (status === 'failed') return 'Fallida'
  if (status === 'generating') return 'Generando'
  return status || 'Sin estado'
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
      <div className="h-screen bg-slate-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-700" />
      </div>
    )
  }

  if (error || !info) {
    return (
      <div className="h-screen bg-slate-100 flex items-center justify-center px-6">
        <div className="max-w-md rounded-lg bg-white border border-slate-200 shadow-sm p-6 text-center">
          <p className="text-sm text-slate-600">{error || 'No se encontro la revision.'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-slate-100 text-slate-950 flex flex-col overflow-hidden">
      <header className="h-[60px] bg-white border-b border-slate-200 flex items-center justify-between px-5 flex-shrink-0">
        <div className="min-w-0">
          <div className="flex items-center gap-3 min-w-0">
            <Wrench className="w-5 h-5 text-slate-700 flex-shrink-0" />
            <h1 className="text-base font-semibold truncate">Reparacion de PoC</h1>
            <span className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-800 border border-amber-200">
              {statusLabel(info.review_status || info.status)}
            </span>
          </div>
          <p className="text-xs text-slate-500 truncate mt-0.5">
            {info.company_name || 'Sin empresa'} · {info.email || 'sin email'} · {info.poc_id}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={refreshPreview}
            className="h-9 w-9 inline-flex items-center justify-center rounded border border-slate-300 bg-white hover:bg-slate-50"
            title="Refrescar preview"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={openPreview}
            disabled={!previewUrl}
            className="h-9 w-9 inline-flex items-center justify-center rounded border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40"
            title="Abrir preview"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => runAction('reject')}
            disabled={reviewLocked || Boolean(isActing)}
            className="h-9 inline-flex items-center gap-2 px-3 rounded border border-red-300 bg-white text-red-700 text-sm font-semibold hover:bg-red-50 disabled:opacity-40"
          >
            {isActing === 'reject' ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
            Rechazar
          </button>
          <button
            type="button"
            onClick={() => runAction('approve')}
            disabled={reviewLocked || Boolean(isActing)}
            className="h-9 inline-flex items-center gap-2 px-3 rounded bg-slate-950 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-40"
          >
            {isActing === 'approve' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Aprobar y enviar
          </button>
        </div>
      </header>

      {notice && (
        <div className="px-5 py-2 bg-blue-50 border-b border-blue-100 text-sm text-blue-900">
          {notice}
        </div>
      )}

      <div className="flex-1 min-h-0 flex">
        <aside className="w-[410px] min-w-[360px] max-w-[460px] bg-white border-r border-slate-200 flex flex-col">
          <section className="p-4 border-b border-slate-200">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="font-semibold text-slate-500 uppercase">Vertical</div>
                <div className="mt-1 text-slate-900 truncate">{info.vertical || '-'}</div>
              </div>
              <div>
                <div className="font-semibold text-slate-500 uppercase">Email enviado</div>
                <div className="mt-1 text-slate-900">{info.email_sent ? 'Si' : 'No'}</div>
              </div>
            </div>
            <div className="mt-4">
              <div className="font-semibold text-slate-500 uppercase text-xs">Prompt original</div>
              <div className="mt-2 max-h-32 overflow-y-auto rounded border border-slate-200 bg-slate-50 p-3 text-sm leading-5 text-slate-700">
                {info.prompt || '-'}
              </div>
            </div>
          </section>

          <section className="flex-1 min-h-0 flex flex-col">
            <div className="px-4 py-3 border-b border-slate-200">
              <div className="text-sm font-semibold">Editor IA interno</div>
              <div className="text-xs text-slate-500 mt-1">Describe el problema visible y el resultado esperado en la PoC.</div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && !thinkingMessage && (
                <div className="text-sm text-slate-500 rounded border border-dashed border-slate-300 p-3">
                  Ejemplo: reemplaza los guiones por datos sinteticos realistas, alinea endpoints con la UI y asegura que los botones visibles actualicen estado.
                </div>
              )}
              {messages.map((msg, idx) => (
                <div key={`${msg.role}-${idx}`} className={msg.role === 'user' ? 'text-right' : 'text-left'}>
                  <div className={`inline-block max-w-[92%] rounded px-3 py-2 text-sm leading-5 ${
                    msg.role === 'user'
                      ? 'bg-slate-950 text-white'
                      : 'bg-slate-100 text-slate-900 border border-slate-200'
                  }`}>
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                    {Boolean(msg.filesModified?.length || msg.filesCreated?.length) && (
                      <div className="mt-2 pt-2 border-t border-slate-300 text-xs text-left">
                        {msg.filesModified?.length ? <div>Modificados: {msg.filesModified.join(', ')}</div> : null}
                        {msg.filesCreated?.length ? <div>Creados: {msg.filesCreated.join(', ')}</div> : null}
                      </div>
                    )}
                    {msg.errors?.length ? (
                      <div className="mt-2 pt-2 border-t border-red-200 text-xs text-red-700 text-left">
                        {msg.errors.join(' · ')}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
              {thinkingMessage && (
                <div className="rounded border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-900">
                  {thinkingMessage}
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 border-t border-slate-200">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
                    event.preventDefault()
                    sendRepair()
                  }
                }}
                disabled={reviewLocked || isSending}
                rows={4}
                className="w-full resize-none rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-400 disabled:bg-slate-100"
                placeholder={reviewLocked ? 'Esta PoC ya fue procesada.' : 'Indica que hay que corregir en el preview...'}
              />
              <button
                type="button"
                onClick={sendRepair}
                disabled={!input.trim() || isSending || reviewLocked}
                className="mt-2 h-10 w-full inline-flex items-center justify-center gap-2 rounded bg-slate-950 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-40"
              >
                {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Aplicar reparacion
              </button>
            </div>
          </section>
        </aside>

        <main className="flex-1 min-w-0 flex flex-col">
          <div className="h-12 bg-white border-b border-slate-200 flex items-center justify-between px-4">
            <div className="text-sm font-semibold">Preview</div>
            <div className="inline-flex rounded border border-slate-300 overflow-hidden">
              <button
                type="button"
                onClick={() => setViewportSize('desktop')}
                className={`h-8 w-9 inline-flex items-center justify-center ${viewportSize === 'desktop' ? 'bg-slate-950 text-white' : 'bg-white text-slate-700'}`}
                title="Desktop"
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewportSize('mobile')}
                className={`h-8 w-9 inline-flex items-center justify-center border-l border-slate-300 ${viewportSize === 'mobile' ? 'bg-slate-950 text-white' : 'bg-white text-slate-700'}`}
                title="Mobile"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto bg-slate-200 p-4">
            {previewUrl ? (
              <div className={`mx-auto h-full bg-white shadow-sm border border-slate-300 ${
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
              <div className="h-full flex items-center justify-center text-sm text-slate-500">
                Esta revision no tiene preview_url.
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
