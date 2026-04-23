import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Sparkles, ExternalLink, ArrowLeft, Loader2, CheckCircle2, Circle, AlertCircle, Code, Eye, Database, BarChart3, Bot } from 'lucide-react'
import { plgService, AnonymousGenerateResponse } from '../services/plg'
import { saveAuthReturnUrl } from '../services/auth'
import { normalizePreviewUrl } from '../utils/previewUrl'
import { useI18n } from '../i18n'
import { useAppSelector } from '../store/hooks'
import { billingApi, type BillingStatus } from '../services/billing'
import { VerticalSelectorModal, type SelectableVertical } from '../components/VerticalSelectorModal'
import { readSelectedVertical } from '../utils/verticalStorage'

const PROMPT_SOFT_LIMIT = 3500
const PROMPT_HARD_LIMIT = 4000
const POLL_TIMEOUT_MS = 10 * 60 * 1000
const MAX_POLL_FAILURES = 5
const TRY_PAGE_STORAGE_KEY = 'try_page_state'

type PersistedTryState = {
  prompt?: string
  anonSessionId?: string | null
  status?: AnonymousGenerateResponse['status'] | null
  templateId?: string | null
  generationStartedAt?: number | null
  result?: AnonymousGenerateResponse | null
  updatedAt?: number
}

function readPersistedTryState(): PersistedTryState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.sessionStorage.getItem(TRY_PAGE_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed as PersistedTryState : null
  } catch {
    return null
  }
}

function writePersistedTryState(state: PersistedTryState): void {
  if (typeof window === 'undefined') return
  window.sessionStorage.setItem(TRY_PAGE_STORAGE_KEY, JSON.stringify(state))
}

export default function TryPage() {
  const navigate = useNavigate()
  const { t, language } = useI18n()
  const userData = useAppSelector((state) => state.user.user)
  const [billingStatus, setBillingStatus] = useState<BillingStatus | null>(null)
  const [searchParams] = useSearchParams()
  const templateId = searchParams.get('template')
  const initialPersistedStateRef = useRef<PersistedTryState | null>((() => {
    const saved = readPersistedTryState()
    if (!saved) return null
    // Only restore if there's an active generation in progress
    if (saved.status === 'generating') return saved
    // Stale state (finished, failed, or idle) — clear it
    window.sessionStorage.removeItem(TRY_PAGE_STORAGE_KEY)
    return null
  })())
  const initialPersistedState = initialPersistedStateRef.current

  // Auth guard: redirect to login if not authenticated
  useEffect(() => {
    if (!userData) {
      saveAuthReturnUrl()
      navigate('/login', { replace: true })
    }
  }, [userData, navigate])

  // Fetch billing status for PoC counter
  useEffect(() => {
    if (userData) {
      billingApi.getBillingStatus().then(setBillingStatus).catch(() => setBillingStatus(null))
    }
  }, [userData])

  const [prompt, setPrompt] = useState(() => {
    if (initialPersistedState?.prompt && (!templateId || initialPersistedState.templateId === templateId)) {
      return initialPersistedState.prompt
    }
    return templateId ? t('try.templatePrompt', { templateId }) : ''
  })
  const [isGenerating, setIsGenerating] = useState(
    () => initialPersistedState?.status === 'generating'
  )
  const [result, setResult] = useState<AnonymousGenerateResponse | null>(
    () => initialPersistedState?.status === 'ready' ? initialPersistedState.result ?? null : null
  )
  const [error, setError] = useState('')
  const [stepIndex, setStepIndex] = useState(0)
  const [isVerticalModalOpen, setIsVerticalModalOpen] = useState(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const EXAMPLE_PROMPTS: Array<{ label: string; prompt: string; icon: typeof Code }> = [
    { label: t('try.exCodeGen'), prompt: t('try.exCodeGenPrompt'), icon: Code },
    { label: t('try.exVision'), prompt: t('try.exVisionPrompt'), icon: Eye },
    { label: t('try.exRAG'), prompt: t('try.exRAGPrompt'), icon: Database },
    { label: t('try.exML'), prompt: t('try.exMLPrompt'), icon: BarChart3 },
    { label: t('try.exAgents'), prompt: t('try.exAgentsPrompt'), icon: Bot },
  ]

  const STEPS = [t('try.step1'), t('try.step2'), t('try.step3'), t('try.step4')]
  const promptLength = prompt.length
  const isNearPromptLimit = promptLength > PROMPT_SOFT_LIMIT && promptLength <= PROMPT_HARD_LIMIT
  const isOverPromptLimit = promptLength > PROMPT_HARD_LIMIT

  const persistTryState = useCallback((patch: Partial<PersistedTryState>) => {
    const current = readPersistedTryState() ?? {}
    writePersistedTryState({
      ...current,
      prompt,
      templateId,
      ...patch,
      updatedAt: Date.now(),
    })
  }, [prompt, templateId])

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!templateId) return
    if (initialPersistedState?.prompt && initialPersistedState.templateId === templateId) return
    setPrompt((currentPrompt) => currentPrompt.trim() ? currentPrompt : t('try.templatePrompt', { templateId }))
  }, [initialPersistedState?.prompt, initialPersistedState?.templateId, templateId, t])

  useEffect(() => {
    persistTryState({})
  }, [persistTryState])

  useEffect(() => () => stopPolling(), [stopPolling])

  useEffect(() => {
    if (!isGenerating) return
    const timer = setInterval(() => {
      setStepIndex((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev))
    }, 8000)
    return () => clearInterval(timer)
  }, [isGenerating, STEPS.length])

  const startPolling = useCallback((
    anonSessionId: string,
    generationStartedAt: number,
    options?: { trackPreviewLoaded?: boolean }
  ) => {
    stopPolling()
    sessionStorage.setItem('anon_session_id', anonSessionId)
    persistTryState({
      anonSessionId,
      status: 'generating',
      generationStartedAt,
      result: null,
    })
    setResult(null)
    setError('')
    setIsGenerating(true)

    let consecutiveFailures = 0

    pollRef.current = setInterval(async () => {
      if (Date.now() - generationStartedAt > POLL_TIMEOUT_MS) {
        stopPolling()
        setIsGenerating(false)
        setError(t('try.timeoutGeneration') || 'La generación está tardando más de lo esperado. Por favor, intenta de nuevo.')
        return
      }

      try {
        const status = await plgService.anonymousStatus(anonSessionId)
        consecutiveFailures = 0

        if (status.status === 'ready') {
          stopPolling()
          setResult(status)
          setIsGenerating(false)
          setError('')
          persistTryState({
            anonSessionId: status.anon_session_id,
            status: 'ready',
            generationStartedAt: null,
            result: status,
          })
          if (options?.trackPreviewLoaded) {
            plgService.trackFunnelEvent('preview_loaded', anonSessionId)
          }
        } else if (status.status === 'failed') {
          stopPolling()
          setIsGenerating(false)
          setError(status.message || t('try.failedGeneration'))
          persistTryState({
            anonSessionId: status.anon_session_id,
            status: 'failed',
            generationStartedAt: null,
            result: null,
          })
        } else {
          persistTryState({
            anonSessionId: status.anon_session_id,
            status: 'generating',
            generationStartedAt,
            result: null,
          })
        }
      } catch {
        consecutiveFailures++
        if (consecutiveFailures >= MAX_POLL_FAILURES) {
          stopPolling()
          setIsGenerating(false)
          setError(t('try.connectionLost') || 'Se perdió la conexión con el servidor. Verifica tu red e intenta de nuevo.')
        }
      }
    }, 3000)
  }, [persistTryState, stopPolling, t])

  useEffect(() => {
    const stored = initialPersistedStateRef.current
    if (!stored?.anonSessionId) return

    let cancelled = false

    const restoreSession = async () => {
      try {
        const status = await plgService.anonymousStatus(stored.anonSessionId as string)
        if (cancelled) return

        sessionStorage.setItem('anon_session_id', status.anon_session_id)

        if (status.status === 'ready') {
          setResult(status)
          setIsGenerating(false)
          setError('')
          persistTryState({
            anonSessionId: status.anon_session_id,
            status: 'ready',
            generationStartedAt: null,
            result: status,
          })
          return
        }

        if (status.status === 'failed') {
          setResult(null)
          setIsGenerating(false)
          setError(status.message || t('try.failedGeneration'))
          persistTryState({
            anonSessionId: status.anon_session_id,
            status: 'failed',
            generationStartedAt: null,
            result: null,
          })
          return
        }

        setStepIndex(0)
        startPolling(
          status.anon_session_id,
          stored.generationStartedAt || Date.now(),
        )
      } catch (err: unknown) {
        if (cancelled) return

        const responseStatus = (err as { response?: { status?: number } })?.response?.status
        if (responseStatus === 404) {
          sessionStorage.removeItem('anon_session_id')
          persistTryState({
            anonSessionId: null,
            status: null,
            generationStartedAt: null,
            result: null,
          })
        }
        setIsGenerating(false)
      }
    }

    void restoreSession()

    return () => {
      cancelled = true
    }
  }, [persistTryState, startPolling, t])

  const handleGenerateClick = useCallback(() => {
    if (!prompt.trim() || prompt.trim().length < 10) {
      setError(t('try.minChars'))
      return
    }
    if (prompt.length > PROMPT_HARD_LIMIT) {
      setError(t('try.maxChars', { max: String(PROMPT_HARD_LIMIT), count: String(prompt.length) }))
      return
    }
    setError('')
    // Opción B: si ya hay vertical persistida, saltamos el modal legacy.
    const persisted = readSelectedVertical()
    if (persisted) {
      void runGenerationWithVertical(persisted)
      return
    }
    setIsVerticalModalOpen(true)
    // runGenerationWithVertical se referencia por closure (está declarada más
    // abajo en el archivo; agregarla a deps dispararía TDZ). El lint del
    // proyecto no fuerza exhaustive-deps, así que no hace falta disable.
  }, [prompt, t])

  const runGenerationWithVertical = useCallback(async (vertical: SelectableVertical) => {
    setIsVerticalModalOpen(false)
    stopPolling()

    setError('')
    setIsGenerating(true)
    setStepIndex(0)
    setResult(null)

    try {
      plgService.trackFunnelEvent('prompt_submitted')
      const res = await plgService.anonymousGenerate({
        prompt: prompt.trim(),
        language,
        template_id: templateId || undefined,
        generation_mode: 'poc',
        vertical,
      })

      if (res.status === 'ready') {
        setResult(res)
        setIsGenerating(false)
        setError('')
        sessionStorage.setItem('anon_session_id', res.anon_session_id)
        persistTryState({
          anonSessionId: res.anon_session_id,
          status: 'ready',
          generationStartedAt: null,
          result: res,
        })
        plgService.trackFunnelEvent('preview_loaded', res.anon_session_id)
        return
      }

      startPolling(res.anon_session_id, Date.now(), { trackPreviewLoaded: true })
    } catch (err: unknown) {
      setIsGenerating(false)
      persistTryState({
        anonSessionId: null,
        status: null,
        generationStartedAt: null,
        result: null,
      })
      let detail = t('try.errorGeneric')
      const errorCode = (err as { code?: string } | null)?.code
      if (errorCode === 'ECONNABORTED') {
        detail = t('try.connectionLost') || 'No pudimos iniciar la generación a tiempo. Intenta de nuevo.'
      }
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const responseData = (err as { response?: { data?: { detail?: unknown } } }).response?.data
        const responseDetail = responseData?.detail
        if (typeof responseDetail === 'string' && responseDetail.trim()) {
          detail = responseDetail
        } else if (
          typeof responseDetail === 'object'
          && responseDetail !== null
          && 'message' in responseDetail
          && typeof (responseDetail as { message?: unknown }).message === 'string'
        ) {
          detail = (responseDetail as { message: string }).message
        }
      }
      setError(detail)
    }
  }, [persistTryState, prompt, startPolling, stopPolling, templateId, t])

  const handleVerticalSelect = useCallback((vertical: SelectableVertical) => {
    void runGenerationWithVertical(vertical)
  }, [runGenerationWithVertical])

  const previewUrl = result?.preview_url ? normalizePreviewUrl(result.preview_url) : ''
  const previewEmbedUrl = previewUrl
  const progressPercent = Math.min(((stepIndex + 1) / STEPS.length) * 100, 95)

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-gray-50/70 backdrop-blur-xl shadow-[0_20px_40px_rgba(88,68,237,0.08)]">
        <div className="flex justify-between items-center px-6 md:px-8 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-gray-600 transition-colors mr-2">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <Link to="/" className="text-xl font-bold text-indigo-600 tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>
              CodlyLabs
            </Link>
            <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider uppercase">
              {t('try.free')}
            </span>
          </div>
          {userData ? (
            <div className="flex items-center gap-3">
              {userData.profile_picture ? (
                <img src={userData.profile_picture} alt="" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                  {(userData.full_name || userData.email || '?').charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-sm font-medium text-gray-700 hidden md:block">
                {userData.full_name || userData.email}
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => { saveAuthReturnUrl(); navigate('/login') }}
              className="text-slate-500 hover:text-indigo-600 font-medium transition-colors text-sm"
            >
              {t('try.login')}
            </button>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col pt-24 pb-12 px-6">
        <div className="max-w-5xl w-full mx-auto">
          {!result && (
            <div className="space-y-8">
              {/* Title - centered hero style */}
              <div className="text-center pt-4 md:pt-8">
                <h1
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-4"
                  style={{ fontFamily: 'Manrope, sans-serif' }}
                >
                  {t('try.title')}
                </h1>
                <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto">
                  {t('try.subtitle')}
                </p>
              </div>

              {/* Prompt input - the star of the page */}
              <div className="bg-white p-6 rounded-xl shadow-[0_20px_40px_rgba(88,68,237,0.08)] transition-all duration-500 hover:shadow-[0_30px_60px_rgba(88,68,237,0.12)]">
                <div className="relative">
                  <label htmlFor="poc-prompt" className="sr-only">{t('try.placeholder')}</label>
                  <textarea
                    id="poc-prompt"
                    rows={8}
                    placeholder={t('try.placeholder')}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    disabled={isGenerating}
                    className="w-full bg-gray-50 border-none rounded-xl p-6 text-gray-900 focus:ring-2 focus:ring-indigo-500/20 placeholder:text-slate-400 resize-none text-lg leading-relaxed disabled:opacity-60"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  />
                  <div className="flex items-center justify-between mt-3">
                    <div>
                      {isNearPromptLimit && (
                        <p className="text-xs text-amber-600">
                          {t('try.nearMaxChars', { soft: String(PROMPT_SOFT_LIMIT), max: String(PROMPT_HARD_LIMIT) })}
                        </p>
                      )}
                      {isOverPromptLimit && (
                        <p className="text-xs text-red-600">
                          {t('try.maxChars', { max: String(PROMPT_HARD_LIMIT), count: String(promptLength) })}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      {/* PoC usage counter */}
                      {billingStatus?.usage && (() => {
                        const { pocs_generated: used, pocs_limit: limit } = billingStatus.usage
                        const isUnlimited = limit === 'unlimited' || limit === -1
                        if (isUnlimited) return null
                        const numLimit = Number(limit)
                        const remaining = Math.max(0, numLimit - used)
                        return (
                          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${remaining <= 0 ? 'bg-red-100 text-red-700' : remaining === 1 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                            {remaining <= 0 ? 'Límite alcanzado' : `${used}/${numLimit} PoCs`}
                          </span>
                        )
                      })()}
                      <span className={`text-sm font-medium tracking-wide ${
                        isOverPromptLimit ? 'text-red-500' : isNearPromptLimit ? 'text-amber-500' : 'text-slate-400'
                      }`}>
                        {promptLength}/{PROMPT_HARD_LIMIT}
                      </span>
                      <button
                        type="button"
                        disabled={isGenerating || prompt.trim().length < 10 || isOverPromptLimit || (billingStatus?.usage != null && billingStatus.usage.pocs_limit !== 'unlimited' && billingStatus.usage.pocs_limit !== -1 && billingStatus.usage.pocs_generated >= Number(billingStatus.usage.pocs_limit))}
                        onClick={handleGenerateClick}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl flex items-center gap-2 font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isGenerating ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Sparkles className="w-5 h-5" />
                        )}
                        {isGenerating ? t('try.generating') : t('try.generateBtn')}
                      </button>
                    </div>
                    {billingStatus?.usage && billingStatus.usage.pocs_limit !== 'unlimited' && billingStatus.usage.pocs_limit !== -1 && billingStatus.usage.pocs_generated >= Number(billingStatus.usage.pocs_limit) && (
                      <div className="mt-2 flex justify-end">
                        <button type="button" onClick={() => navigate('/pricing')} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline">
                          Mejorar plan para generar más PoCs
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Example chips */}
              <div className="flex flex-wrap justify-center gap-3">
                {EXAMPLE_PROMPTS.map((ex) => (
                  <button
                    key={ex.label}
                    type="button"
                    onClick={() => setPrompt(ex.prompt)}
                    disabled={isGenerating}
                    className="px-4 py-2 rounded-full bg-gray-100 text-slate-600 text-sm font-medium cursor-pointer hover:bg-indigo-600 hover:text-white transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <ex.icon className="w-3.5 h-3.5" />
                    {ex.label}
                  </button>
                ))}
              </div>

              {/* Progress stepper */}
              {isGenerating && (
                <div className="max-w-2xl mx-auto">
                  <div className="bg-gray-50 p-8 rounded-xl space-y-8">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm font-bold text-indigo-600 mb-2">
                        <span>{STEPS[stepIndex]}</span>
                        <span>{Math.round(progressPercent)}%</span>
                      </div>
                      <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full transition-all duration-1000"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                    <ul className="space-y-4" role="status" aria-live="polite">
                      {STEPS.map((step, idx) => (
                        <li key={step} className="flex items-center gap-4">
                          {idx < stepIndex ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                          ) : idx === stepIndex ? (
                            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-300 flex-shrink-0" />
                          )}
                          <span className={`text-sm font-medium ${
                            idx < stepIndex ? 'text-slate-500' :
                            idx === stepIndex ? 'text-gray-900 font-bold' :
                            'text-slate-400 opacity-50'
                          }`}>
                            {step}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="max-w-2xl mx-auto flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl" role="alert">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
            </div>
          )}

          {/* Result: Preview */}
          {result && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
                      {t('try.resultTitle')}
                    </h2>
                    <p className="text-slate-500 text-sm font-medium">
                      {t('try.resultSubtitle')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {result.anon_session_id && (
                    <button
                      type="button"
                      onClick={() => navigate(`/try/editor/${result.anon_session_id}`)}
                      className="bg-indigo-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20"
                    >
                      <Sparkles className="w-4 h-4" />
                      {t('try.editWithAI')}
                    </button>
                  )}
                  {previewUrl && (
                    <button
                      type="button"
                      onClick={() => window.open(previewUrl, '_blank')}
                      className="bg-gray-100 text-indigo-600 font-bold px-6 py-3 rounded-xl hover:bg-gray-200 transition-all flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {t('try.openNewTab')}
                    </button>
                  )}
                </div>
              </div>

              {previewEmbedUrl ? (
                <div className="w-full bg-white rounded-xl overflow-hidden shadow-2xl border border-slate-200/50">
                  <iframe
                    src={previewEmbedUrl}
                    title="Preview"
                    className="w-full border-none"
                    style={{ height: 'calc(100vh - 200px)', minHeight: 700 }}
                    allow="camera; microphone; fullscreen; autoplay; display-capture; clipboard-read; clipboard-write; geolocation"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <p className="text-sm text-blue-800">
                    {t('try.previewUnavailable')}
                    {result.share_url && (
                      <>
                        {' '}
                        <a href={result.share_url} className="text-indigo-600 font-medium hover:underline">
                          {t('try.sharedLink')}
                        </a>
                      </>
                    )}
                  </p>
                </div>
              )}

              {/* CTA Banner */}
              <div className="bg-indigo-600 rounded-2xl p-12 text-center text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/20 rounded-full blur-2xl -ml-24 -mb-24" />
                <div className="relative z-10 space-y-6">
                  <h3 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: 'Manrope, sans-serif' }}>
                    {t('try.ctaTitle')}
                  </h3>
                  <p className="text-indigo-100 text-lg max-w-lg mx-auto">
                    {t('try.ctaSubtitle')}
                  </p>
                  <button
                    type="button"
                    onClick={() => { saveAuthReturnUrl(); navigate('/login') }}
                    className="bg-white text-indigo-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-indigo-50 transition-all shadow-xl active:scale-95"
                  >
                    {t('try.ctaBtn')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 border-t border-slate-200/50 bg-gray-50">
        <div className="flex flex-col items-center justify-center px-4 gap-4">
          <div className="flex gap-6 text-slate-400 text-sm">
            <Link to="/policies" className="hover:text-indigo-500 transition-colors">{t('footer.terms')}</Link>
            <Link to="/policies" className="hover:text-indigo-500 transition-colors">{t('footer.privacy')}</Link>
            <Link to="/contact" className="hover:text-indigo-500 transition-colors">{t('footer.contact')}</Link>
          </div>
          <p className="text-sm text-slate-400">
            {t('footer.copyright', { year: new Date().getFullYear() })}
          </p>
        </div>
      </footer>

      <VerticalSelectorModal
        isOpen={isVerticalModalOpen}
        onClose={() => setIsVerticalModalOpen(false)}
        onSelect={handleVerticalSelect}
      />
    </div>
  )
}
