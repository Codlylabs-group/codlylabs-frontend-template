import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Loader2,
  Send,
  Sparkles,
  Lock,
  Linkedin,
  CheckCircle,
  Monitor,
  Smartphone,
  RefreshCw,
  ExternalLink,
  FileCode,
} from 'lucide-react'
import { plgService } from '../services/plg'
import { authApi, saveAuthReturnUrl } from '../services/auth'
import { normalizePreviewUrl } from '../utils/previewUrl'
import { useI18n } from '../i18n'


interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  filesModified?: string[]
  filesCreated?: string[]
}

interface EditorInfo {
  poc_id: string
  preview_url: string | null
  prompt: string
  interaction_count: number
  max_interactions: number
  status: string
}

export default function TryEditorPage() {
  const navigate = useNavigate()
  const { t } = useI18n()
  const { anonSessionId } = useParams<{ anonSessionId: string }>()

  const [info, setInfo] = useState<EditorInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [interactionCount, setInteractionCount] = useState(0)
  const [maxInteractions, setMaxInteractions] = useState(3)
  const [limitReached, setLimitReached] = useState(false)
  const [isLoadingLinkedIn, setIsLoadingLinkedIn] = useState(false)
  const [viewportSize, setViewportSize] = useState<'desktop' | 'mobile'>('desktop')
  const [thinkingMessage, setThinkingMessage] = useState<string | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const wsRef = useRef<WebSocket | null>(null)

  const previewUrl = info?.preview_url ? normalizePreviewUrl(info.preview_url) : ''
  const previewEmbedUrl = previewUrl
  const remaining = Math.max(0, maxInteractions - interactionCount)

  useEffect(() => {
    if (!anonSessionId) return
    setLoading(true)
    plgService
      .anonymousEditorInfo(anonSessionId)
      .then((data: EditorInfo) => {
        setInfo(data)
        setInteractionCount(data.interaction_count)
        setMaxInteractions(data.max_interactions)
        setLimitReached(data.interaction_count >= data.max_interactions)
      })
      .catch(() => setError(t('tryEditor.sessionExpired')))
      .finally(() => setLoading(false))
  }, [anonSessionId, t])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, thinkingMessage])

  // WebSocket for real-time agent thinking
  useEffect(() => {
    if (!anonSessionId || !info?.poc_id) return

    let ws: WebSocket | null = null
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null
    let isCleaningUp = false

    const connect = () => {
      if (isCleaningUp) return
      const apiBase = import.meta.env.VITE_API_URL || import.meta.env.VITE_DEV_API_URL || ''
      let wsBase = apiBase || (typeof window !== 'undefined' ? window.location.origin : '')
      if (wsBase.startsWith('http')) wsBase = wsBase.replace(/^http/, 'ws')
      wsBase = wsBase.replace(/\/$/, '')

      ws = new WebSocket(`${wsBase}/api/v1/plg/anonymous-editor/${anonSessionId}/ws`)
      wsRef.current = ws

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'agent_thinking') {
            setThinkingMessage(data.message)
          }
        } catch { /* ignore */ }
      }

      ws.onclose = () => {
        if (!isCleaningUp) {
          reconnectTimeout = setTimeout(connect, 5000)
        }
      }
    }

    connect()

    return () => {
      isCleaningUp = true
      if (reconnectTimeout) clearTimeout(reconnectTimeout)
      if (ws) ws.close()
    }
  }, [anonSessionId, info?.poc_id])

  const handleSend = useCallback(async () => {
    if (!input.trim() || isSending || limitReached || !anonSessionId) return
    const userMessage = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setIsSending(true)
    setThinkingMessage(null)
    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }))
      const res = await plgService.anonymousEditorChat(anonSessionId, userMessage, history)
      setThinkingMessage(null)
      setMessages((prev) => [...prev, { role: 'assistant', content: res.message, filesModified: res.files_modified, filesCreated: res.files_created }])
      setInteractionCount(res.interaction_count)
      setMaxInteractions(res.max_interactions)
      if (res.interaction_count >= res.max_interactions) setLimitReached(true)
      if (iframeRef.current && (res.files_modified?.length || res.files_created?.length)) {
        setTimeout(() => { if (iframeRef.current) iframeRef.current.src = iframeRef.current.src }, 1500)
      }
    } catch (err: unknown) {
      const response = (err as { response?: { status?: number; data?: { detail?: { message?: string } | string } } })?.response
      if (response?.status === 402) {
        setLimitReached(true)
        const detail = response.data?.detail
        const msg = typeof detail === 'object' && detail !== null ? (detail as { message?: string }).message : String(detail || '')
        setMessages((prev) => [...prev, { role: 'assistant', content: msg || t('tryEditor.limitReached') }])
      } else if (response?.status === 410 || response?.status === 404) {
        setMessages((prev) => [...prev, { role: 'assistant', content: 'El preview ha expirado. Generá una nueva PoC desde /try para poder editarla.' }])
        setError('preview_expired')
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', content: t('tryEditor.errorGeneric') }])
      }
    } finally {
      setIsSending(false)
    }
  }, [input, isSending, limitReached, anonSessionId, messages, t])

  const handleLinkedIn = async () => {
    setIsLoadingLinkedIn(true)
    saveAuthReturnUrl()
    try { const url = await authApi.getLinkedInAuthUrl(); window.location.href = url }
    catch { navigate('/login') }
    finally { setIsLoadingLinkedIn(false) }
  }

  const refreshPreview = () => { if (iframeRef.current) iframeRef.current.src = iframeRef.current.src }
  const openInNewWindow = () => { if (previewUrl) window.open(previewUrl, '_blank') }

  if (loading) {
    return (
      <div className="h-screen bg-[#f8f9fa] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    )
  }

  if (error || !info) {
    return (
      <div className="h-screen bg-[#f8f9fa] flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">{error || t('tryEditor.sessionExpired')}</p>
        <Link to="/try" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700">
          {t('tryEditor.backToTry')}
        </Link>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-[#f8f9fa] overflow-hidden">
      {/* Header (56px) */}
      <header className="h-[56px] bg-white/70 backdrop-blur-xl border-b border-gray-200/30 flex items-center justify-between px-6 z-50 flex-shrink-0"
        style={{ boxShadow: '0 20px 40px rgba(88,68,237,0.05)' }}>
        <div className="flex items-center gap-4">
          <Link to="/try" className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors">
            <ArrowLeft size={18} className="text-gray-500" />
          </Link>
          <div className="flex flex-col">
            <h1 className="font-bold text-lg tracking-tight leading-none" style={{ fontFamily: 'Manrope, sans-serif' }}>
              {t('editor.title')}
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-emerald-600/80 uppercase tracking-wider">{t('editor.connected')}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-lg border border-gray-200/20">
            <span className="text-sm font-medium text-gray-500">{interactionCount}/{maxInteractions} {t('tryEditor.editsUsed')}</span>
          </div>
          <button type="button" onClick={() => { saveAuthReturnUrl(); navigate('/login') }}
            className="text-base font-medium text-gray-500 hover:text-indigo-600 transition-colors">
            {t('try.login')}
          </button>
        </div>
      </header>

      {/* Main: Chat + Preview */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Panel (30%) - hidden */}
        <div className="w-[32%] min-w-[340px] max-w-[540px] border-r border-gray-200/30 flex-col bg-white hidden">
          {/* Chat header */}
          <div className="p-5 border-b border-gray-100" style={{ background: 'linear-gradient(135deg, rgba(88,68,237,0.04) 0%, rgba(88,68,237,0.08) 100%)' }}>
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-indigo-600" />
              <span className="font-bold text-lg text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>{t('editor.assistant')}</span>
            </div>
            <p className="text-sm md:text-base leading-6 text-gray-500 mt-1.5">
              {limitReached ? t('tryEditor.limitReached') : t('tryEditor.subtitle', { remaining: String(remaining) })}
            </p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5">
            {messages.length === 0 && !limitReached && (
              <div className="text-center text-gray-400 text-sm py-8">{t('tryEditor.emptyChat')}</div>
            )}
            {messages.map((msg, idx) => (
              <div key={`${msg.role}-${idx}`} className={`flex mb-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90%] px-5 py-4 ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-2xl rounded-br-sm'
                    : 'bg-gray-50 text-gray-900 rounded-2xl rounded-bl-sm'
                }`}>
                  <p className="text-base md:text-lg leading-7 whitespace-pre-wrap">{msg.content}</p>
                  {msg.filesModified && msg.filesModified.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200/20">
                      <span className="text-xs font-medium">📝 Modificados:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {msg.filesModified.map((f, i) => (
                          <span key={i} className={`text-xs font-mono px-2 py-0.5 rounded ${msg.role === 'user' ? 'bg-white/20' : 'bg-indigo-50 text-indigo-700'}`}>
                            {f.split('/').pop()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {msg.filesCreated && msg.filesCreated.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200/20">
                      <span className="text-xs font-medium">✨ Creados:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {msg.filesCreated.map((f, i) => (
                          <span key={i} className={`text-xs font-mono px-2 py-0.5 rounded border ${msg.role === 'user' ? 'border-white/30' : 'border-gray-200 text-gray-600'}`}>
                            {f.split('/').pop()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isSending && (
              <div className="flex items-start gap-2 my-2">
                <div className="max-w-[90%] px-5 py-4 bg-gray-50 text-gray-600 rounded-2xl rounded-bl-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1 flex-shrink-0">
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                    </div>
                    <p className="text-sm md:text-base text-gray-500 italic leading-6">
                      {thinkingMessage || t('tryEditor.sending')}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input or Limit CTA */}
          {limitReached ? (
            <div className="px-4 py-4 border-t border-gray-100 bg-amber-50/50">
              <div className="flex items-center gap-2 mb-3">
                <Lock className="w-4 h-4 text-amber-600" />
                <p className="text-base font-bold text-gray-900">{t('tryEditor.limitReached')}</p>
              </div>
              <p className="text-sm text-gray-500 mb-3 leading-6">{t('tryEditor.registerToUnlock')}</p>
              <button type="button" disabled={isLoadingLinkedIn} onClick={handleLinkedIn}
                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-[#0A66C2] text-white text-base font-bold hover:bg-[#0958a7] transition-all disabled:opacity-60 mb-2 shadow-lg shadow-blue-900/10">
                <Linkedin className="w-4 h-4" />
                {isLoadingLinkedIn ? t('cta.linkedInLoading') : t('cta.linkedIn')}
              </button>
              <button type="button" onClick={() => { saveAuthReturnUrl(); navigate('/login') }}
                className="w-full flex items-center justify-center px-4 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:border-gray-300 transition-colors">
                {t('cta.emailRegister')}
              </button>
            </div>
          ) : (
            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <div className="flex gap-3 items-end bg-white rounded-xl border border-gray-200 px-4 py-3 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-300 transition-all">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                  placeholder={t('tryEditor.placeholder')}
                  disabled={isSending}
                  rows={1}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement
                    target.style.height = 'auto'
                    target.style.height = Math.min(target.scrollHeight, 150) + 'px'
                  }}
                  className="flex-1 bg-transparent border-none outline-none text-base md:text-lg leading-7 py-1.5 placeholder:text-gray-400 disabled:opacity-60 resize-none overflow-y-auto"
                  style={{ minHeight: '44px', maxHeight: '150px' }}
                />
                <button onClick={handleSend} disabled={!input.trim() || isSending}
                  className="w-11 h-11 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 transition-all flex-shrink-0">
                  {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
              </div>
              <div className="flex items-center justify-between mt-1 px-1">
                <span className="text-xs text-gray-400">Shift + Enter para nueva línea</span>
                <span className="text-xs text-gray-400">{remaining} {t('tryEditor.remaining')}</span>
              </div>
            </div>
          )}
        </div>

        {/* Preview Panel (70%) */}
        <div className="flex-1 flex flex-col bg-gray-100">
          {/* Preview toolbar (48px) */}
          <nav className="h-[48px] bg-white border-b border-gray-200/20 flex items-center justify-between px-6 flex-shrink-0">
            <div className="flex items-center gap-3">
              <span className="font-bold text-sm text-gray-500" style={{ fontFamily: 'Manrope, sans-serif' }}>{t('editor.previewLabel')}</span>
              {previewUrl ? (
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 rounded-full border border-emerald-100">
                  <CheckCircle size={14} className="text-emerald-500" />
                  <span className="text-[11px] font-bold text-emerald-600">{t('editor.ready')}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-indigo-50 rounded-full border border-indigo-100">
                  <Loader2 size={14} className="text-indigo-500 animate-spin" />
                  <span className="text-[11px] font-bold text-indigo-600">{t('editor.loading')}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setViewportSize('desktop')}
                className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${viewportSize === 'desktop' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-400 hover:bg-gray-100'}`}>
                <Monitor size={18} />
              </button>
              <button onClick={() => setViewportSize('mobile')}
                className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${viewportSize === 'mobile' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-400 hover:bg-gray-100'}`}>
                <Smartphone size={18} />
              </button>
              <div className="w-px h-6 bg-gray-200/30 mx-2" />
              <button onClick={refreshPreview} className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
                <RefreshCw size={18} />
              </button>
              <button onClick={openInNewWindow} className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
                <ExternalLink size={18} />
              </button>
            </div>
          </nav>

          {/* Preview iframe */}
          <div className="flex-1 p-2 flex items-center justify-center">
            <div className="rounded-xl overflow-hidden relative transition-all duration-300 shadow-lg"
              style={viewportSize === 'desktop' ? { width: '100%', height: '100%' } : { width: 375, height: 667 }}>
              {previewEmbedUrl ? (
                <iframe ref={iframeRef} src={previewEmbedUrl} style={{ width: '100%', height: '100%', border: 'none' }} title="Preview"
                  allow="camera; microphone; fullscreen; autoplay; display-capture; clipboard-read; clipboard-write; geolocation" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-50">
                  <div className="text-center text-gray-400">
                    <FileCode size={48} className="mx-auto mb-4 opacity-30" />
                    <p className="text-sm">{t('try.previewUnavailable')}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
