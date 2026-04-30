import { useState, useMemo, FormEvent, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { Sparkles, Loader2, CheckCircle2, Download, Rocket, XCircle, Lock, ArrowLeft, Cloud, Database, Server } from 'lucide-react'

import {
  pocGeneratorApi,
  type DeploymentMode,
  type PreviewResponse,
  type GenerationProgressStep,
  type PreviewReadinessResponse,
  type PocGenerationResponse,
  type ExistingPocResponse,
} from '../services/pocGenerator'
import { api } from '../services/api'
import { billingApi, type BillingStatus } from '../services/billing'
import { discoveryService } from '../services/discovery'
import type { DiscoverySummary } from '../types/discovery'
import { useI18n } from '../i18n'
import { ONBOARDING_STORAGE_KEY } from '../utils/onboardingStorage'
import { useFinishWithPreview } from '../hooks/useLogout'
import { getSessionDisplayName } from '../utils/sessionName'
import { SimulatedThoughts } from '../components/SimulatedThoughts'
import { VerticalSelectorModal, type SelectableVertical } from '../components/VerticalSelectorModal'
import { readSelectedVertical } from '../utils/verticalStorage'
import { useAppSelector } from '../store/hooks'
import { logger } from '../utils/logger'

const MAX_POC_GENERATION_WAIT_MS = 15 * 60 * 1000
const DISPLAY_FALLBACK_FIELDS = ['name', 'label', 'title', 'description', 'id', 'url', 'source'] as const

type DisplayObject = Record<string, unknown>

function toDisplayString(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') return String(value)
  if (Array.isArray(value)) return value.map((item) => toDisplayString(item).trim()).filter((item) => item.length > 0).join(', ')
  if (typeof value === 'object') {
    const obj = value as DisplayObject
    for (const field of DISPLAY_FALLBACK_FIELDS) {
      const candidate = obj[field]
      if (candidate === null || candidate === undefined) continue
      const rendered = typeof candidate === 'string' ? candidate : String(candidate)
      if (rendered.trim().length > 0) return rendered
    }
    const compactEntries = Object.entries(obj).filter(([, v]) => v !== null && v !== undefined && !Array.isArray(v) && typeof v !== 'object').slice(0, 6).map(([k, v]) => `${k}: ${String(v)}`)
    if (compactEntries.length > 0) return compactEntries.join(', ')
    try { return JSON.stringify(obj) } catch { return String(obj) }
  }
  return String(value)
}

function toDisplayList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((item) => toDisplayString(item).trim()).filter((item) => item.length > 0)
  const item = toDisplayString(value).trim()
  return item.length > 0 ? [item] : []
}

function mapExistingPocToGenerationResponse(response: ExistingPocResponse): PocGenerationResponse {
  return { poc_id: response.poc_id || '', status: response.status || 'ready', estimated_completion: '', preview_url: (response as any).preview_url ?? null, download_url: response.download_url ?? null, tech_stack: toDisplayList(response.tech_stack), blueprint: response.blueprint || {} }
}

function isGatewayTimeoutError(err: unknown): boolean {
  const error = err as AxiosError<{ detail?: string }>
  const status = error?.response?.status
  const detail = String(error?.response?.data?.detail || '').toLowerCase()
  const message = String(error?.message || '').toLowerCase()
  return status === 502 || status === 503 || status === 504 || detail.includes('timeout') || detail.includes('gateway') || message.includes('timeout') || message.includes('gateway')
}

const DEPLOYMENT_OPTIONS: { value: DeploymentMode; icon: typeof Cloud; label: string; desc: string }[] = [
  { value: 'cloud', icon: Cloud, label: 'Cloud', desc: 'SaaS gestionado' },
  { value: 'data_free', icon: Database, label: 'Data-Free', desc: 'Blueprint sin datos' },
  { value: 'on_prem', icon: Server, label: 'On-Prem', desc: 'Infra de cliente' },
]

export default function PocGeneratorPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { t } = useI18n()
  const logout = useFinishWithPreview()
  const sessionId = searchParams.get('session') || ''
  const userData = useAppSelector((state) => state.user.user)

  const [deploymentMode, setDeploymentMode] = useState<DeploymentMode>('cloud')
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const [billingStatus, setBillingStatus] = useState<BillingStatus | null>(null)
  const [isTestingPoc, _setIsTestingPoc] = useState(false)
  const [previewData, setPreviewData] = useState<PreviewResponse | null>(null)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [previewReadiness, _setPreviewReadiness] = useState<PreviewReadinessResponse | null>(null)
  const [isWaitingForReady, _setIsWaitingForReady] = useState(false)
  const [generationThoughts, setGenerationThoughts] = useState<GenerationProgressStep[]>([])
  const [generationProgressStatus, setGenerationProgressStatus] = useState<string>('in_progress')
  const [progressError, setProgressError] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationStartedAt, setGenerationStartedAt] = useState<number | null>(null)
  const [existingPoc, setExistingPoc] = useState<PocGenerationResponse | null>(null)
  const [isCheckingExisting, setIsCheckingExisting] = useState(true)
  const [isVerticalModalOpen, setIsVerticalModalOpen] = useState(false)
  const [discoverySnapshot, setDiscoverySnapshot] = useState<DiscoverySummary | null>(null)

  const { mutateAsync, data, error } = useMutation({
    mutationFn: async (payload: Parameters<typeof pocGeneratorApi.generate>[0]) => {
      try { return await pocGeneratorApi.generateQueued(payload) }
      catch (err) { const e = err as AxiosError; if (e.response?.status === 404) return pocGeneratorApi.generate(payload); throw err }
    },
  })

  useEffect(() => { billingApi.getBillingStatus().then(setBillingStatus).catch(() => setBillingStatus(null)) }, [])

  useEffect(() => {
    if (!sessionId) { setIsCheckingExisting(false); return }
    const check = async () => {
      try {
        const response = await pocGeneratorApi.getPocBySession(sessionId)
        if (response.exists && response.poc_id) { setExistingPoc(mapExistingPocToGenerationResponse(response)); setIsGenerating(false); logger.info('Found existing POC', { poc_id: response.poc_id }); return }
      } catch { logger.debug('No existing POC', { sessionId }) }
      try {
        const progress = await pocGeneratorApi.getProgress(sessionId)
        setGenerationThoughts(prev => {
          const incoming = progress.steps || []
          // Guard against spurious empty responses (multi-worker backend, restart
          // between polls). Explicit reset happens in runGenerationWithVertical.
          return incoming.length === 0 && prev.length > 0 ? prev : incoming
        })
        setGenerationProgressStatus(progress.status || 'in_progress')
        if (String(progress.status || '').toLowerCase() === 'in_progress') { setIsGenerating(true); setGenerationStartedAt(Date.now()) }
      } catch { logger.debug('No progress', { sessionId }) }
      finally { setIsCheckingExisting(false) }
    }
    check()
  }, [sessionId])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try { const raw = window.localStorage.getItem(ONBOARDING_STORAGE_KEY); if (!raw) return; const parsed = JSON.parse(raw); if (parsed.discoverySummary) setDiscoverySnapshot(parsed.discoverySummary) } catch { /* ignore parse errors */ }
  }, [])

  useEffect(() => {
    if (!sessionId || discoverySnapshot) return
    discoveryService.getSession(sessionId).then(s => { if (s?.discovery_summary) setDiscoverySnapshot(s.discovery_summary) }).catch(() => {})
  }, [sessionId, discoverySnapshot])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!sessionId) return
    // Opción B: si el user ya eligió vertical al inicio del flujo (via modal en
    // WorkspaceDiscoveryView), saltamos el modal legacy y arrancamos directo.
    const persisted = readSelectedVertical()
    if (persisted) {
      void runGenerationWithVertical(persisted)
      return
    }
    setIsVerticalModalOpen(true)
  }

  const runGenerationWithVertical = async (vertical: SelectableVertical) => {
    setIsVerticalModalOpen(false)
    if (!sessionId) return
    setDownloadError(null); setGenerationThoughts([]); setGenerationProgressStatus('in_progress'); setProgressError(null); setExistingPoc(null); setIsGenerating(true); setGenerationStartedAt(Date.now())
    const summary = discoverySnapshot
    const customRequirements: Record<string, unknown> = { selected_vertical: vertical }
    if (summary) {
      customRequirements.discovery_summary = summary
      customRequirements.industry = summary.organization_context?.industry
      customRequirements.data_type = summary.data_type
    }
    try {
      const response = await mutateAsync({ session_id: sessionId, deployment_mode: deploymentMode, description: summary?.business_problem || summary?.narrative || summary?.business_objective || undefined, custom_requirements: customRequirements, user_id: userData?.id })
      if (String(response?.status || '').toLowerCase() !== 'in_progress') { setIsGenerating(false); setGenerationStartedAt(null) }
    } catch (err) {
      if (isGatewayTimeoutError(err)) { setProgressError('El servidor tardó en responder, pero la generación sigue en segundo plano.'); setGenerationProgressStatus('in_progress') }
      else { setIsGenerating(false); setGenerationStartedAt(null) }
    }
  }

  useEffect(() => {
    if (!sessionId || !isGenerating) return
    let isActive = true
    const poll = async () => {
      try {
        const progress = await pocGeneratorApi.getProgress(sessionId); if (!isActive) return
        const s = String(progress.status || 'in_progress').toLowerCase()
        setGenerationThoughts(prev => {
          const incoming = progress.steps || []
          // Guard against spurious empty responses (multi-worker backend, restart
          // between polls). Explicit reset happens in runGenerationWithVertical.
          return incoming.length === 0 && prev.length > 0 ? prev : incoming
        })
        setGenerationProgressStatus(s); setProgressError(null)
        if (s === 'completed') {
          const r = await pocGeneratorApi.getPocBySession(sessionId); if (!isActive) return
          if (r.exists && r.poc_id) { setExistingPoc(mapExistingPocToGenerationResponse(r)); setIsGenerating(false); setGenerationStartedAt(null); return }
          if (generationStartedAt && Date.now() - generationStartedAt > MAX_POC_GENERATION_WAIT_MS) { setProgressError('La generación terminó pero no se encontró una PoC descargable.'); setIsGenerating(false); setGenerationStartedAt(null) }
          return
        }
        if (s === 'failed' || s === 'error') {
          const r = await pocGeneratorApi.getPocBySession(sessionId).catch(() => null); if (!isActive) return
          if (r?.exists && r?.poc_id) { setExistingPoc(mapExistingPocToGenerationResponse(r)) }
          else { setProgressError([...(progress.steps || [])].reverse().find(st => st?.message)?.message || 'La generación falló.') }
          setIsGenerating(false); setGenerationStartedAt(null); return
        }
        if (s === 'idle' && generationStartedAt && Date.now() - generationStartedAt > MAX_POC_GENERATION_WAIT_MS) { setProgressError('Excedió el tiempo máximo.'); setIsGenerating(false); setGenerationStartedAt(null) }
      } catch { if (!isActive) return; setProgressError('No se pudo obtener el progreso.') }
    }
    poll(); const id = window.setInterval(poll, 2000)
    return () => { isActive = false; window.clearInterval(id) }
  }, [generationStartedAt, isGenerating, sessionId])

  const generatedData = data && data.status !== 'in_progress' ? data : null
  const effectiveData = generatedData || existingPoc
  const safeTechStack = useMemo(() => toDisplayList(effectiveData?.tech_stack), [effectiveData?.tech_stack])
  const blueprintDescription = useMemo(() => { const bp = (effectiveData?.blueprint || {}) as Record<string, unknown>; return toDisplayString(bp.description).trim() || 'PoC generada' }, [effectiveData?.blueprint])

  const handleDownload = async () => {
    if (!effectiveData?.download_url) return
    try { setDownloadError(null); setIsDownloading(true); const r = await api.get(effectiveData.download_url, { responseType: 'blob' }); const url = window.URL.createObjectURL(new Blob([r.data])); const link = document.createElement('a'); link.href = url; link.download = `${effectiveData.poc_id || 'poc'}.zip`; document.body.appendChild(link); link.click(); link.remove(); window.URL.revokeObjectURL(url) }
    catch (err: unknown) { const e = err as { response?: { status?: number } }; setDownloadError(e.response?.status === 402 ? (t('billing.downloadGated') || 'Requiere plan Pro o superior.') : 'Error al descargar.') }
    finally { setIsDownloading(false) }
  }

  const handleTestPoc = async () => {
    if (!effectiveData?.poc_id) { setPreviewError('No se encontró el ID'); return }
    if (!effectiveData?.download_url) { setPreviewError(effectiveData?.status === 'blueprint_only' ? 'Modo blueprint_only, sin paquete.' : 'Aún no empaquetado.'); return }
    navigate(`/preview/${effectiveData.poc_id}`)
  }

  const handleStopPreview = async () => {
    if (!effectiveData?.poc_id || !previewData) return
    try { await pocGeneratorApi.destroyPreview(effectiveData.poc_id); setPreviewData(null) } catch (e) { console.error('Error destroying preview:', e) }
  }

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">{t('pocGenerator.noSession')}</p>
          <Link to="/" className="text-indigo-600 font-semibold hover:underline">{t('onboarding.back')}</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-indigo-500/10 shadow-sm shadow-indigo-500/5">
        <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(`/discovery-progress?session=${sessionId}`)} className="p-2 hover:bg-slate-100 transition-colors rounded-full active:scale-95">
              <ArrowLeft className="w-5 h-5 text-slate-500" />
            </button>
            <Link to="/" className="text-xl font-bold text-indigo-600 tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>CodlyLabs</Link>
            <span className="text-xs text-gray-400 hidden md:block">{getSessionDisplayName(sessionId)}</span>
          </div>
          <button type="button" onClick={() => logout(effectiveData?.poc_id ?? undefined)} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-semibold active:scale-95 transition-all shadow-lg shadow-indigo-500/10 text-sm">
            {t('app.finish')}
          </button>
        </div>
      </header>

      <main className="flex-grow pt-28 pb-20 px-6 max-w-7xl mx-auto w-full space-y-12">
        {/* Title */}
        <section className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            {t('pocGenerator.aiDecision')}
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
            {t('pocGenerator.title')}
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">{t('pocGenerator.subtitle')}</p>
        </section>

        {/* Checking */}
        {isCheckingExisting && (
          <div className="bg-white rounded-xl p-8 flex items-center justify-center gap-3 shadow-sm">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            <span className="text-gray-500">Verificando estado...</span>
          </div>
        )}

        {/* Form */}
        {!effectiveData && !isCheckingExisting && (
          <section className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-[0_20px_40px_rgba(88,68,237,0.08)] relative overflow-hidden space-y-8">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl" />
              <div className="relative z-10 space-y-6">
                <div>
                  <label className="block font-bold text-gray-500 mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>Modo de Despliegue</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {DEPLOYMENT_OPTIONS.map(opt => (
                      <button key={opt.value} type="button" onClick={() => setDeploymentMode(opt.value)}
                        className={`flex flex-col items-start p-4 rounded-xl border-2 transition-all text-left ${deploymentMode === opt.value ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 bg-gray-50 hover:border-indigo-300'}`}>
                        <opt.icon className={`w-5 h-5 mb-2 ${deploymentMode === opt.value ? 'text-indigo-600' : 'text-gray-400'}`} />
                        <span className="font-bold text-gray-900">{opt.label}</span>
                        <span className="text-xs text-gray-500">{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                  <p className="mt-3 text-sm text-indigo-500 italic flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5" /> Nota: El tipo se selecciona automáticamente por IA.
                  </p>
                </div>
                {/* PoC usage counter */}
                {billingStatus?.usage && (() => {
                  const { pocs_generated: used, pocs_limit: limit } = billingStatus.usage
                  const isUnlimited = limit === 'unlimited' || limit === -1
                  if (isUnlimited) return null
                  const numLimit = Number(limit)
                  const remaining = Math.max(0, numLimit - used)
                  const pct = numLimit > 0 ? (used / numLimit) * 100 : 0
                  return (
                    <div className={`rounded-xl p-4 ${remaining <= 0 ? 'bg-red-50 border border-red-200' : remaining === 1 ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50 border border-gray-200'}`}>
                      <div className="flex justify-between items-center text-sm">
                        <span className={`font-semibold ${remaining <= 0 ? 'text-red-700' : 'text-gray-700'}`}>
                          {remaining <= 0 ? 'Límite mensual alcanzado' : `${used} de ${numLimit} PoCs generadas este mes`}
                        </span>
                        <span className={`text-xs font-bold ${remaining <= 0 ? 'text-red-500' : remaining === 1 ? 'text-amber-600' : 'text-gray-400'}`}>
                          {remaining <= 0 ? '0 restantes' : `${remaining} restante${remaining !== 1 ? 's' : ''}`}
                        </span>
                      </div>
                      <div className="mt-2 w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${remaining <= 0 ? 'bg-red-500' : remaining === 1 ? 'bg-amber-500' : 'bg-indigo-600'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                      </div>
                    </div>
                  )
                })()}

                <button type="submit" disabled={isGenerating || (billingStatus?.usage && billingStatus.usage.pocs_limit !== 'unlimited' && billingStatus.usage.pocs_limit !== -1 && billingStatus.usage.pocs_generated >= Number(billingStatus.usage.pocs_limit))}
                  className="w-full py-5 bg-indigo-600 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-60">
                  <Sparkles className="w-5 h-5" />
                  {isGenerating ? t('pocGenerator.generating') : 'Generar PoC'}
                </button>

                {billingStatus?.usage && billingStatus.usage.pocs_limit !== 'unlimited' && billingStatus.usage.pocs_limit !== -1 && billingStatus.usage.pocs_generated >= Number(billingStatus.usage.pocs_limit) && (
                  <button type="button" onClick={() => navigate('/pricing')} className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all">
                    Mejorar plan para generar más PoCs
                  </button>
                )}
              </div>
              {error && !isGenerating && <p className="text-sm text-red-600 text-center">{t('pocGenerator.error')}</p>}
            </form>
          </section>
        )}

        {/* Success Banner */}
        {(generatedData || existingPoc) && (
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-6 rounded-2xl flex items-center gap-6 shadow-xl shadow-emerald-500/20">
            <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-xl font-bold" style={{ fontFamily: 'Manrope, sans-serif' }}>
                {generatedData ? '¡Tu PoC fue generada exitosamente!' : 'Tu PoC está lista'}
              </h4>
              <p className="text-white/80 text-sm mt-1">
                {generatedData ? 'Solución completa y funcional basada en tu caso de uso.' : 'Podés probarla o descargarla cuando quieras.'}
              </p>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        {effectiveData && (
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Type Card */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-indigo-500/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                    <Cloud className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>{t('pocGenerator.selectedType')}</h3>
                    <p className="text-gray-500 text-sm">{blueprintDescription}</p>
                  </div>
                </div>
              </div>

              {/* Blueprint Card */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-indigo-500/5 space-y-6">
                <h3 className="font-bold text-2xl text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>{t('pocGenerator.blueprint.title')}</h3>
                <dl className="space-y-5 text-sm">
                  {Object.entries((effectiveData.blueprint || {}) as Record<string, unknown>).map(([key, value]) => {
                    if (value === null || value === undefined) return null
                    const label = key.replace(/_/g, ' ')
                    const content = toDisplayString(value).trim()
                    if (!content) return null
                    if (Array.isArray(value) && value.length > 0) {
                      const items = toDisplayList(value)
                      if (items.length === 0) return null
                      return (
                        <div key={key}>
                          <dt className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2">{label}</dt>
                          <dd className="text-gray-600 bg-gray-50 rounded-xl p-4">
                            {key === 'workflow' ? (
                              <ol className="list-decimal list-inside space-y-1">{items.map((item, idx) => <li key={idx} className="text-xs">{item}</li>)}</ol>
                            ) : (
                              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">{items.map((item, idx) => (
                                <li key={idx} className="flex items-center gap-2 text-xs"><span className="w-1.5 h-1.5 bg-indigo-600 rounded-full flex-shrink-0" />{item}</li>
                              ))}</ul>
                            )}
                          </dd>
                        </div>
                      )
                    }
                    return (
                      <div key={key}>
                        <dt className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">{label}</dt>
                        <dd className="text-gray-600">{content}</dd>
                      </div>
                    )
                  })}
                </dl>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="space-y-8">
              {/* Tech Stack */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-500/5">
                <h4 className="font-bold text-gray-900 mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>{t('pocGenerator.techStack.title')}</h4>
                <div className="flex flex-wrap gap-2">
                  {safeTechStack.map((item, idx) => (
                    <span key={idx} className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full">{item}</span>
                  ))}
                  {safeTechStack.length === 0 && <span className="text-xs text-gray-400">No definido</span>}
                </div>
              </div>

              {/* Preview */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-500/5 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>Probar PoC</h4>
                  {previewData && (
                    <span className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full uppercase">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Preview Activo
                    </span>
                  )}
                </div>
                {!previewData ? (
                  <div className="space-y-3">
                    <button type="button" onClick={handleTestPoc} disabled={isTestingPoc || isWaitingForReady || !effectiveData?.download_url}
                      className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-50 transition-all">
                      {isTestingPoc ? <><Loader2 className="w-4 h-4 animate-spin" /> Creando...</> : isWaitingForReady ? <><Loader2 className="w-4 h-4 animate-spin" /> Iniciando...</> : <><Rocket className="w-4 h-4" /> Probar Ahora (2hrs)</>}
                    </button>
                    {isWaitingForReady && previewReadiness && (
                      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 space-y-1 text-xs text-indigo-600">
                        <div className="flex items-center gap-2">{previewReadiness.frontend_ready ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <Loader2 className="w-3 h-3 animate-spin" />} Frontend {previewReadiness.frontend_ready ? 'listo' : 'iniciando...'}</div>
                        <div className="flex items-center gap-2">{previewReadiness.backend_ready ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <Loader2 className="w-3 h-3 animate-spin" />} Backend {previewReadiness.backend_ready ? 'listo' : 'iniciando...'}</div>
                      </div>
                    )}
                    {previewError && <p className="text-xs text-red-600 text-center">{previewError}</p>}
                    {!effectiveData?.download_url && <p className="text-xs text-amber-600 text-center">{effectiveData?.status === 'blueprint_only' ? 'Modo blueprint_only.' : 'Se habilitará al empaquetar.'}</p>}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-xs text-indigo-600 bg-indigo-50 rounded-xl p-3">Expira: {new Date(previewData.expires_at).toLocaleString('es-ES')}</div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => window.open(previewData.preview_url, '_blank')} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700">Abrir PoC</button>
                      <button type="button" onClick={handleStopPreview} className="py-3 px-4 border border-red-200 text-red-600 rounded-xl font-bold flex items-center justify-center gap-1 hover:bg-red-50"><XCircle className="w-4 h-4" /> Detener</button>
                    </div>
                  </div>
                )}
              </div>

              {/* Download */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-500/5 space-y-4">
                <h4 className="font-bold text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>Descargar Código</h4>
                {(() => {
                  const plan = billingStatus?.plan_config; const canDownload = plan?.can_download_zip ?? false; const tier = billingStatus?.plan ?? 'free'; const isUnlimited = plan?.pocs_per_month === 'unlimited'; const usage = billingStatus?.usage
                  if (!canDownload || tier === 'free') return (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-xl p-3"><Lock className="w-4 h-4 text-gray-400" /> No disponible en plan gratuito.</div>
                      <button type="button" onClick={() => navigate('/settings/billing')} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all">Mejorar plan</button>
                    </div>
                  )
                  if (!isUnlimited && usage) {
                    const used = usage.pocs_generated; const numLimit = Number(usage.pocs_limit); const remaining = Math.max(0, numLimit - used)
                    if (remaining <= 0) return (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 rounded-xl p-3"><Lock className="w-4 h-4" /> Límite de {numLimit} descargas alcanzado.</div>
                        <button type="button" onClick={() => navigate('/settings/billing')} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all">Mejorar plan</button>
                      </div>
                    )
                    return (
                      <div className="space-y-3">
                        <div className="flex justify-between text-xs font-bold text-gray-400"><span>Uso</span><span>{used} de {numLimit}</span></div>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-indigo-600" style={{ width: `${(used / numLimit) * 100}%` }} /></div>
                        <button type="button" onClick={handleDownload} disabled={isDownloading} className="w-full py-3 bg-gray-100 text-gray-900 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-all disabled:opacity-60"><Download className="w-4 h-4" /> {isDownloading ? 'Descargando...' : 'Descargar ZIP'}</button>
                        {downloadError && <p className="text-xs text-red-600 text-center">{downloadError}</p>}
                      </div>
                    )
                  }
                  return (
                    <div className="space-y-3">
                      <button type="button" onClick={handleDownload} disabled={isDownloading} className="w-full py-3 bg-gray-100 text-gray-900 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-all disabled:opacity-60"><Download className="w-4 h-4" /> {isDownloading ? 'Descargando...' : 'Descargar ZIP'}</button>
                      {downloadError && <p className="text-xs text-red-600 text-center">{downloadError}</p>}
                    </div>
                  )
                })()}
              </div>
            </aside>
          </div>
        )}
      </main>

      {isGenerating && <SimulatedThoughts t={t} steps={generationThoughts} status={progressError ? 'error' : generationProgressStatus} />}

      {/* Footer */}
      <footer className="w-full py-8 mt-auto bg-gray-50 border-t border-slate-200/50">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 max-w-7xl mx-auto gap-4">
          <span className="text-sm text-slate-400">{t('footer.copyright', { year: new Date().getFullYear() })}</span>
          <nav className="flex gap-6">
            <Link to="/policies" className="text-sm text-slate-400 hover:text-indigo-500 transition-colors">{t('footer.privacy')}</Link>
            <Link to="/policies" className="text-sm text-slate-400 hover:text-indigo-500 transition-colors">{t('footer.terms')}</Link>
            <Link to="/contact" className="text-sm text-slate-400 hover:text-indigo-500 transition-colors">{t('footer.contact')}</Link>
          </nav>
        </div>
      </footer>

      <VerticalSelectorModal
        isOpen={isVerticalModalOpen}
        onClose={() => setIsVerticalModalOpen(false)}
        onSelect={(vertical) => { void runGenerationWithVertical(vertical) }}
      />
    </div>
  )
}
