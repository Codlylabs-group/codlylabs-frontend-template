import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import {
  ArrowUpRight,
  CheckCircle2,
  Cloud,
  Database,
  Download,
  Layers,
  Loader2,
  Lock,
  Rocket,
  Search,
  Server,
  Sparkles,
  XCircle,
} from 'lucide-react'

import { SimulatedThoughts } from '../../components/SimulatedThoughts'
import { VerticalSelectorModal, type SelectableVertical } from '../../components/VerticalSelectorModal'
import { readSelectedVertical } from '../../utils/verticalStorage'
import { api } from '../../services/api'
import { billingApi, type BillingStatus } from '../../services/billing'
import { discoveryService } from '../../services/discovery'
import {
  pocGeneratorApi,
  type DeploymentMode,
  type ExistingPocResponse,
  type GenerationProgressStep,
  type PocGenerationResponse,
  type PreviewResponse,
} from '../../services/pocGenerator'
import { useAppSelector } from '../../store/hooks'
import type { DiscoverySummary } from '../../types/discovery'
import { ONBOARDING_STORAGE_KEY } from '../../utils/onboardingStorage'
import { useWorkspaceOutletContext } from './WorkspaceLayout'
import { useI18n } from '../../i18n'

const MAX_POC_GENERATION_WAIT_MS = 15 * 60 * 1000
const DISPLAY_FALLBACK_FIELDS = ['name', 'label', 'title', 'description', 'id', 'url', 'source'] as const

type DisplayObject = Record<string, unknown>

function buildThoughtsStrings(t: (key: string) => string): Record<string, string> {
  return {
    'pocGenerator.generating': t('ws.generatingPoc'),
    'thoughts.error': t('ws.generationError'),
    'thoughts.subtitle': t('ws.agentBuilding'),
    'thoughts.connecting': t('ws.connectingEngine'),
    'thoughts.waitMessage': t('ws.mayTakeMinutes'),
    'thoughts.source.model': t('ws.model'),
    'thoughts.source.system': t('ws.system'),
  }
}

function buildDeploymentOptions(t: (key: string) => string): Array<{ value: DeploymentMode; icon: typeof Cloud; label: string; desc: string }> {
  return [
    { value: 'cloud', icon: Cloud, label: 'Cloud', desc: t('ws.saasManaged') },
    { value: 'data_free', icon: Database, label: 'Data-Free', desc: t('ws.blueprintOnly') },
    { value: 'on_prem', icon: Server, label: 'On-Prem', desc: t('ws.selfHosted') },
  ]
}

function toDisplayString(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') return String(value)
  if (Array.isArray(value))
    return value
      .map((item) => toDisplayString(item).trim())
      .filter((item) => item.length > 0)
      .join(', ')
  if (typeof value === 'object') {
    const obj = value as DisplayObject
    for (const field of DISPLAY_FALLBACK_FIELDS) {
      const candidate = obj[field]
      if (candidate === null || candidate === undefined) continue
      const rendered = typeof candidate === 'string' ? candidate : String(candidate)
      if (rendered.trim().length > 0) return rendered
    }
    const compactEntries = Object.entries(obj)
      .filter(([, v]) => v !== null && v !== undefined && !Array.isArray(v) && typeof v !== 'object')
      .slice(0, 6)
      .map(([k, v]) => `${k}: ${String(v)}`)
    if (compactEntries.length > 0) return compactEntries.join(', ')
    try {
      return JSON.stringify(obj)
    } catch {
      return String(obj)
    }
  }
  return String(value)
}

function toDisplayList(value: unknown): string[] {
  if (Array.isArray(value))
    return value.map((item) => toDisplayString(item).trim()).filter((item) => item.length > 0)
  const item = toDisplayString(value).trim()
  return item.length > 0 ? [item] : []
}

function mapExistingPocToGenerationResponse(response: ExistingPocResponse): PocGenerationResponse {
  return {
    poc_id: response.poc_id || '',
    status: response.status || 'ready',
    estimated_completion: '',
    preview_url: (response as any).preview_url ?? null,
    download_url: response.download_url ?? null,
    tech_stack: toDisplayList(response.tech_stack),
    blueprint: response.blueprint || {},
  }
}

function isGatewayTimeoutError(err: unknown): boolean {
  const error = err as AxiosError<{ detail?: string }>
  const status = error?.response?.status
  const detail = String(error?.response?.data?.detail || '').toLowerCase()
  const message = String(error?.message || '').toLowerCase()
  return (
    status === 502 ||
    status === 503 ||
    status === 504 ||
    detail.includes('timeout') ||
    detail.includes('gateway') ||
    message.includes('timeout') ||
    message.includes('gateway')
  )
}

function EmptyState({ brandPrimary }: { brandPrimary: string }) {
  const { t } = useI18n()
  return (
    <div className="rounded-xl border border-dashed border-gray-200 bg-white p-10 text-center">
      <div
        className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{ background: `${brandPrimary}15`, color: brandPrimary }}
      >
        <Sparkles size={24} />
      </div>
      <h3 className="mt-4 text-base font-semibold text-gray-900">{t('ws.noDiscoverySession')}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500">
        {t('ws.noDiscoveryDescription')}
      </p>
      <Link
        to="/workspace/discovery"
        className="mt-5 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm transition-shadow hover:shadow-md"
        style={{ background: brandPrimary }}
      >
        <Search size={14} />
        {t('ws.startDiscovery')}
      </Link>
    </div>
  )
}

export default function WorkspacePocGeneratorView() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const userData = useAppSelector((state) => state.user.user)
  const { brand, setHeader, refreshContext } = useWorkspaceOutletContext()
  const { t } = useI18n()
  const sessionId = searchParams.get('session') || ''

  const [deploymentMode, setDeploymentMode] = useState<DeploymentMode>('cloud')
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const [billingStatus, setBillingStatus] = useState<BillingStatus | null>(null)
  const [previewData, setPreviewData] = useState<PreviewResponse | null>(null)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [generationThoughts, setGenerationThoughts] = useState<GenerationProgressStep[]>([])
  const [generationProgressStatus, setGenerationProgressStatus] = useState<string>('in_progress')
  const [progressError, setProgressError] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationStartedAt, setGenerationStartedAt] = useState<number | null>(null)
  const [existingPoc, setExistingPoc] = useState<PocGenerationResponse | null>(null)
  const [isCheckingExisting, setIsCheckingExisting] = useState(true)
  const [isVerticalModalOpen, setIsVerticalModalOpen] = useState(false)
  const [discoverySnapshot, setDiscoverySnapshot] = useState<DiscoverySummary | null>(null)
  const [freshGenerationPocId, setFreshGenerationPocId] = useState<string | null>(null)
  // El tier llega via ?tier= para deep-links desde otros puntos del workspace.
  // El selector UI se removió — siempre se genera PoC salvo que venga un override.
  const tierFromQuery = (searchParams.get('tier') || 'poc').toLowerCase()
  const selectedTier: 'poc' | 'mvp' | 'app' =
    tierFromQuery === 'mvp' ? 'mvp' : tierFromQuery === 'app' ? 'app' : 'poc'

  useEffect(() => {
    setHeader(t('ws.generatePocTitle'), t('ws.generatePocSubtitle'))
  }, [setHeader, t])

  const refreshWorkspaceSignals = async () => {
    await Promise.allSettled([
      refreshContext(),
      billingApi.getBillingStatus().then(setBillingStatus),
    ])
  }

  const { mutateAsync, data, error } = useMutation({
    mutationFn: async (payload: Parameters<typeof pocGeneratorApi.generate>[0]) => {
      try {
        return await pocGeneratorApi.generateQueued(payload)
      } catch (err) {
        const e = err as AxiosError
        if (e.response?.status === 404) return pocGeneratorApi.generate(payload)
        throw err
      }
    },
  })

  // Billing snapshot
  useEffect(() => {
    billingApi
      .getBillingStatus()
      .then(setBillingStatus)
      .catch(() => setBillingStatus(null))
  }, [])

  // Existing PoC + in-progress generation detection
  useEffect(() => {
    if (!sessionId) {
      setIsCheckingExisting(false)
      return
    }
    let cancelled = false
    const run = async () => {
      try {
        const response = await pocGeneratorApi.getPocBySession(sessionId)
        if (!cancelled && response.exists && response.poc_id) {
          setExistingPoc(mapExistingPocToGenerationResponse(response))
          setIsGenerating(false)
          return
        }
      } catch {
        // no-op
      }
      try {
        const progress = await pocGeneratorApi.getProgress(sessionId)
        if (cancelled) return
        setGenerationThoughts(prev => {
          const incoming = progress.steps || []
          // Guard against spurious empty responses (multi-worker backend, restart
          // between polls). Explicit reset happens when a new generation starts.
          return incoming.length === 0 && prev.length > 0 ? prev : incoming
        })
        setGenerationProgressStatus(progress.status || 'in_progress')
        if (String(progress.status || '').toLowerCase() === 'in_progress') {
          setIsGenerating(true)
          setGenerationStartedAt(Date.now())
        }
      } catch {
        // no-op
      } finally {
        if (!cancelled) setIsCheckingExisting(false)
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [sessionId])

  // Discovery snapshot from localStorage — only if we have a session
  useEffect(() => {
    if (typeof window === 'undefined' || !sessionId) return
    try {
      const raw = window.localStorage.getItem(ONBOARDING_STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (parsed?.discoverySummary) setDiscoverySnapshot(parsed.discoverySummary)
    } catch {
      // ignore parse errors
    }
  }, [sessionId])

  // Hydrate discovery snapshot from server if not in storage
  useEffect(() => {
    if (!sessionId || discoverySnapshot) return
    discoveryService
      .getSession(sessionId)
      .then((session) => {
        if (session?.discovery_summary) setDiscoverySnapshot(session.discovery_summary)
      })
      .catch(() => {})
  }, [sessionId, discoverySnapshot])

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!sessionId) return
    // Opción B: si ya hay vertical persistida desde el inicio del flujo,
    // saltamos el modal legacy y arrancamos directo.
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
    setDownloadError(null)
    setGenerationThoughts([])
    setGenerationProgressStatus('in_progress')
    setProgressError(null)
    setExistingPoc(null)
    setIsGenerating(true)
    setGenerationStartedAt(Date.now())

    const customRequirements: Record<string, unknown> = { selected_vertical: vertical }
    if (discoverySnapshot) {
      customRequirements.discovery_summary = discoverySnapshot
      customRequirements.industry = discoverySnapshot.organization_context?.industry
      customRequirements.data_type = discoverySnapshot.data_type
    }

    try {
      const response = await mutateAsync({
        session_id: sessionId,
        deployment_mode: deploymentMode,
        description:
          discoverySnapshot?.business_problem ||
          discoverySnapshot?.narrative ||
          discoverySnapshot?.business_objective ||
          undefined,
        custom_requirements: customRequirements,
        user_id: userData?.id,
        target_tier: selectedTier,
      })
      if (String(response?.status || '').toLowerCase() !== 'in_progress') {
        setIsGenerating(false)
        setGenerationStartedAt(null)
      }
    } catch (err) {
      if (isGatewayTimeoutError(err)) {
        setProgressError(t('ws.serverTimeout'))
        setGenerationProgressStatus('in_progress')
      } else {
        setIsGenerating(false)
        setGenerationStartedAt(null)
      }
    }
  }

  // Polling loop
  useEffect(() => {
    if (!sessionId || !isGenerating) return
    let isActive = true
    const poll = async () => {
      try {
        const progress = await pocGeneratorApi.getProgress(sessionId)
        if (!isActive) return
        const normalized = String(progress.status || 'in_progress').toLowerCase()
        setGenerationThoughts(prev => {
          const incoming = progress.steps || []
          // Guard against spurious empty responses (multi-worker backend, restart
          // between polls). Explicit reset happens when a new generation starts.
          return incoming.length === 0 && prev.length > 0 ? prev : incoming
        })
        setGenerationProgressStatus(normalized)
        setProgressError(null)

        if (normalized === 'completed') {
          const response = await pocGeneratorApi.getPocBySession(sessionId)
          if (!isActive) return
          if (response.exists && response.poc_id) {
            setExistingPoc(mapExistingPocToGenerationResponse(response))
            setFreshGenerationPocId(response.poc_id)
            setIsGenerating(false)
            setGenerationStartedAt(null)
            void refreshWorkspaceSignals()
            return
          }
          if (generationStartedAt && Date.now() - generationStartedAt > MAX_POC_GENERATION_WAIT_MS) {
            setProgressError(t('ws.noPocFound'))
            setIsGenerating(false)
            setGenerationStartedAt(null)
          }
          return
        }

        if (normalized === 'failed' || normalized === 'error') {
          const response = await pocGeneratorApi.getPocBySession(sessionId).catch(() => null)
          if (!isActive) return
          if (response?.exists && response.poc_id) {
            setExistingPoc(mapExistingPocToGenerationResponse(response))
            void refreshWorkspaceSignals()
          } else {
            const lastError = [...(progress.steps || [])].reverse().find((step) => step?.message)?.message
            setProgressError(lastError || t('ws.generationFailed'))
          }
          setIsGenerating(false)
          setGenerationStartedAt(null)
          return
        }

        if (
          normalized === 'idle' &&
          generationStartedAt &&
          Date.now() - generationStartedAt > MAX_POC_GENERATION_WAIT_MS
        ) {
          setProgressError(t('ws.maxTimeExceeded'))
          setIsGenerating(false)
          setGenerationStartedAt(null)
        }
      } catch {
        if (!isActive) return
        setProgressError(t('ws.progressError'))
      }
    }
    void poll()
    const id = window.setInterval(() => void poll(), 2000)
    return () => {
      isActive = false
      window.clearInterval(id)
    }
  }, [generationStartedAt, isGenerating, sessionId])

  const generatedData = data && data.status !== 'in_progress' ? data : null
  const effectiveData = generatedData || existingPoc


  const safeTechStack = useMemo(() => toDisplayList(effectiveData?.tech_stack), [effectiveData?.tech_stack])
  const blueprintDescription = useMemo(() => {
    const bp = (effectiveData?.blueprint || {}) as Record<string, unknown>
    return toDisplayString(bp.description).trim() || 'PoC generada a partir del contexto del Discovery'
  }, [effectiveData?.blueprint])

  const handleDownload = async () => {
    if (!effectiveData?.download_url) return
    try {
      setDownloadError(null)
      setIsDownloading(true)
      const response = await api.get(effectiveData.download_url, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.download = `${effectiveData.poc_id || 'poc'}.zip`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err: unknown) {
      const e = err as { response?: { status?: number } }
      setDownloadError(
        e.response?.status === 402
          ? t('ws.downloadRequiresPro')
          : t('ws.downloadError'),
      )
    } finally {
      setIsDownloading(false)
    }
  }

  const handleTestPoc = () => {
    if (!effectiveData?.poc_id) {
      setPreviewError(t('ws.pocIdNotFound'))
      return
    }
    if (!effectiveData?.download_url) {
      setPreviewError(
        effectiveData?.status === 'blueprint_only'
          ? t('ws.blueprintOnlyNoPackage')
          : t('ws.notPackagedYet'),
      )
      return
    }
    navigate(`/preview/${effectiveData.poc_id}`)
  }

  const handleStopPreview = async () => {
    if (!effectiveData?.poc_id || !previewData) return
    try {
      await pocGeneratorApi.destroyPreview(effectiveData.poc_id)
      setPreviewData(null)
      await refreshContext()
    } catch (err) {
      console.error('Error destroying preview:', err)
    }
  }

  if (!sessionId) {
    return <EmptyState brandPrimary={brand.primary} />
  }

  const usage = billingStatus?.usage
  const numericLimit = usage ? Number(usage.pocs_limit) : 0
  const isUnlimited = usage?.pocs_limit === 'unlimited' || usage?.pocs_limit === -1
  const remaining = usage && !isUnlimited ? Math.max(0, numericLimit - usage.pocs_generated) : null
  const quotaExhausted = remaining !== null && remaining <= 0

  return (
    <>
      <div
        className="relative mb-6 overflow-hidden rounded-xl p-6 text-white"
        style={{ background: `linear-gradient(135deg, ${brand.primary}, ${brand.primaryDark})` }}
      >
        <div className="absolute right-0 top-0 h-40 w-40 opacity-10">
          <svg viewBox="0 0 200 200" className="h-full w-full">
            <circle cx="100" cy="100" r="80" fill="none" stroke="white" strokeWidth="0.5" />
            <circle cx="100" cy="100" r="60" fill="none" stroke="white" strokeWidth="0.5" />
            <circle cx="100" cy="100" r="40" fill="none" stroke="white" strokeWidth="0.5" />
          </svg>
        </div>
        <div className="relative">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white/90 backdrop-blur-sm">
            <Sparkles size={10} />
            {t('ws.aiAssistedDecision')}
          </span>
          <h2 className="mt-3 text-xl font-semibold">{t('ws.generateYourPoc')}</h2>
          <p className="mt-1 max-w-2xl text-sm text-blue-100">
            {t('ws.generateDescription')}
          </p>
        </div>
      </div>

      {isCheckingExisting && (
        <div className="flex items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <Loader2 size={18} className="animate-spin text-indigo-600" />
          <span className="text-sm text-gray-500">{t('ws.checkingExistingPoc')}</span>
        </div>
      )}

      {!effectiveData && !isCheckingExisting && (
        <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg"
              style={{ background: `${brand.primary}15`, color: brand.primary }}
            >
              <Layers size={18} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">{t('ws.configureGeneration')}</h3>
              <p className="text-xs text-gray-500">{t('ws.configureDescription')}</p>
            </div>
          </div>

          <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            {t('ws.deploymentMode')}
          </label>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {buildDeploymentOptions(t).map((opt) => {
              const Icon = opt.icon
              const active = deploymentMode === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDeploymentMode(opt.value)}
                  className={`flex flex-col items-start rounded-xl border-2 p-4 text-left transition-all ${
                    active
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 bg-white hover:border-indigo-300'
                  }`}
                >
                  <Icon size={18} className={`mb-2 ${active ? 'text-indigo-600' : 'text-gray-400'}`} />
                  <span className="text-sm font-semibold text-gray-900">{opt.label}</span>
                  <span className="mt-0.5 text-[11px] text-gray-500">{opt.desc}</span>
                </button>
              )
            })}
          </div>

          <p className="mt-3 flex items-center gap-1.5 text-[11px] italic text-indigo-500">
            <Sparkles size={11} /> {t('ws.pocTypeAuto')}
          </p>

          {usage && !isUnlimited && (
            <div
              className={`mt-6 rounded-xl border p-4 ${
                quotaExhausted
                  ? 'border-red-200 bg-red-50'
                  : remaining === 1
                    ? 'border-amber-200 bg-amber-50'
                    : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className={`font-semibold ${quotaExhausted ? 'text-red-700' : 'text-gray-700'}`}>
                  {quotaExhausted
                    ? t('ws.monthlyLimitReached')
                    : t('ws.pocsGeneratedThisMonth').replace('{used}', String(usage.pocs_generated)).replace('{limit}', String(numericLimit))}
                </span>
                <span
                  className={`text-[10px] font-bold ${
                    quotaExhausted ? 'text-red-500' : remaining === 1 ? 'text-amber-600' : 'text-gray-400'
                  }`}
                >
                  {quotaExhausted ? `0 ${t('ws.remaining').replace('{n}', '0')}` : t('ws.remaining').replace('{n}', String(remaining))}
                </span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className={`h-full rounded-full transition-all ${
                    quotaExhausted ? 'bg-red-500' : remaining === 1 ? 'bg-amber-500' : 'bg-indigo-600'
                  }`}
                  style={{
                    width: `${Math.min(
                      numericLimit > 0 ? (usage.pocs_generated / numericLimit) * 100 : 0,
                      100,
                    )}%`,
                  }}
                />
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-center">
            <button
              type="submit"
              disabled={isGenerating || quotaExhausted}
              className="inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md disabled:opacity-60"
              style={{ background: `linear-gradient(135deg, ${brand.primary}, ${brand.primaryDark})` }}
            >
              <Sparkles size={16} />
              {isGenerating ? t('ws.generatingPocBtn') : 'Generar PoC'}
            </button>
          </div>

          {quotaExhausted && (
            <button
              type="button"
              onClick={() => navigate('/workspace/billing')}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gray-100 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-200"
            >
              {t('ws.upgradePlan')}
            </button>
          )}

          {error && !isGenerating && (
            <p className="mt-3 text-center text-xs text-red-600">
              {t('ws.generationStartError')}
            </p>
          )}
          {progressError && <p className="mt-3 text-center text-xs text-amber-600">{progressError}</p>}
        </form>
      )}

      {effectiveData && (
        <>
          <div className="mb-6 flex items-center gap-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 p-6 text-white shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              {freshGenerationPocId ? <Rocket size={24} /> : <CheckCircle2 size={24} />}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold">
                {freshGenerationPocId
                  ? t('ws.openingPoc')
                  : generatedData
                    ? t('ws.pocGenerated')
                    : t('ws.pocReady')}
              </h3>
              <p className="text-sm text-white/80">
                {freshGenerationPocId
                  ? 'Te llevamos al preview en vivo en unos segundos. Si no arranca automáticamente, usá el botón "Probar ahora".'
                  : generatedData
                    ? 'Solución completa y funcional basada en tu caso de uso.'
                    : 'Podés probarla o descargarla cuando quieras.'}
              </p>
            </div>
            {freshGenerationPocId && (
              <button
                type="button"
                onClick={() => navigate(`/preview/${freshGenerationPocId}`)}
                className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/25"
              >
                {t('ws.openNow')}
                <ArrowUpRight size={14} />
              </button>
            )}
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <div className="space-y-6 xl:col-span-2">
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{ background: `${brand.primary}15`, color: brand.primary }}
                  >
                    <Cloud size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">{t('ws.selectedPocType')}</h3>
                    <p className="mt-1 text-sm text-gray-500">{blueprintDescription}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="text-base font-semibold text-gray-900">{t('ws.blueprint')}</h3>
                <dl className="mt-5 space-y-5 text-sm">
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
                          <dt className="mb-2 text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                            {label}
                          </dt>
                          <dd className="rounded-xl bg-gray-50 p-4 text-gray-600">
                            {key === 'workflow' ? (
                              <ol className="list-inside list-decimal space-y-1">
                                {items.map((item, idx) => (
                                  <li key={idx} className="text-xs">
                                    {item}
                                  </li>
                                ))}
                              </ol>
                            ) : (
                              <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                {items.map((item, idx) => (
                                  <li key={idx} className="flex items-center gap-2 text-xs">
                                    <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-600" />
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </dd>
                        </div>
                      )
                    }
                    return (
                      <div key={key}>
                        <dt className="mb-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                          {label}
                        </dt>
                        <dd className="text-gray-600">{content}</dd>
                      </div>
                    )
                  })}
                </dl>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-900">{t('ws.techStack')}</h4>
                <div className="mt-4 flex flex-wrap gap-2">
                  {safeTechStack.map((item, idx) => (
                    <span
                      key={idx}
                      className="rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-semibold text-indigo-700"
                    >
                      {item}
                    </span>
                  ))}
                  {safeTechStack.length === 0 && <span className="text-xs text-gray-400">{t('ws.undefined')}</span>}
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-900">{t('ws.testPoc')}</h4>
                  {previewData && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-600">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                      {t('ws.previewActiveLabel')}
                    </span>
                  )}
                </div>
                {!previewData ? (
                  <>
                    <button
                      type="button"
                      onClick={handleTestPoc}
                      disabled={!effectiveData?.download_url}
                      className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md disabled:opacity-50"
                      style={{ background: `linear-gradient(135deg, ${brand.primary}, ${brand.primaryDark})` }}
                    >
                      <Rocket size={14} />
                      {t('ws.testNow')}
                    </button>
                    {previewError && <p className="mt-3 text-center text-xs text-red-600">{previewError}</p>}
                    {!effectiveData?.download_url && (
                      <p className="mt-3 text-center text-xs text-amber-600">
                        {effectiveData?.status === 'blueprint_only'
                          ? t('ws.blueprintOnlyMsg')
                          : t('ws.willEnableWhenPackaged')}
                      </p>
                    )}
                  </>
                ) : (
                  <div className="space-y-3">
                    <div className="rounded-xl bg-indigo-50 px-3 py-2 text-xs text-indigo-600">
                      {t('ws.expires')} {new Date(previewData.expires_at).toLocaleString()}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => window.open(previewData.preview_url, '_blank')}
                        className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white hover:bg-indigo-700"
                      >
                        {t('ws.openPoc')}
                        <ArrowUpRight size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleStopPreview()}
                        className="flex items-center justify-center gap-1 rounded-xl border border-red-200 px-4 py-3 text-xs font-bold text-red-600 hover:bg-red-50"
                      >
                        <XCircle size={12} />
                        {t('ws.stop')}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-900">{t('ws.downloadCode')}</h4>
                <DownloadPanel
                  billingStatus={billingStatus}
                  onDownload={handleDownload}
                  onNavigateBilling={() => navigate('/workspace/billing')}
                  isDownloading={isDownloading}
                  downloadError={downloadError}
                />
              </div>
            </aside>
          </div>
        </>
      )}

      {isGenerating && (
        <SimulatedThoughts
          t={(key: string) => buildThoughtsStrings(t)[key] ?? key}
          steps={generationThoughts}
          status={progressError ? 'error' : generationProgressStatus}
        />
      )}

      <VerticalSelectorModal
        isOpen={isVerticalModalOpen}
        onClose={() => setIsVerticalModalOpen(false)}
        onSelect={(vertical) => {
          void runGenerationWithVertical(vertical)
        }}
      />
    </>
  )
}

function DownloadPanel({
  billingStatus,
  onDownload,
  onNavigateBilling,
  isDownloading,
  downloadError,
}: {
  billingStatus: BillingStatus | null
  onDownload: () => void
  onNavigateBilling: () => void
  isDownloading: boolean
  downloadError: string | null
}) {
  const { t } = useI18n()
  const plan = billingStatus?.plan_config
  const canDownload = plan?.can_download_zip ?? false
  const tier = billingStatus?.plan ?? 'free'
  const isUnlimited = plan?.pocs_per_month === 'unlimited'
  const usage = billingStatus?.usage

  if (!canDownload || tier === 'free') {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 rounded-xl bg-gray-50 p-3 text-xs text-gray-500">
          <Lock size={14} className="text-gray-400" />
          {t('ws.downloadNotFree')}
        </div>
        <button
          type="button"
          onClick={onNavigateBilling}
          className="w-full rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700"
        >
          {t('ws.upgradePlan')}
        </button>
      </div>
    )
  }

  if (!isUnlimited && usage) {
    const used = usage.pocs_generated
    const numLimit = Number(usage.pocs_limit)
    const remaining = Math.max(0, numLimit - used)
    if (remaining <= 0) {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-700">
            <Lock size={14} />
            {t('ws.downloadLimitReached').replace('{limit}', String(numLimit))}
          </div>
          <button
            type="button"
            onClick={onNavigateBilling}
            className="w-full rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700"
          >
            {t('ws.upgradePlan')}
          </button>
        </div>
      )
    }
    return (
      <div className="space-y-3">
        <div className="flex justify-between text-[11px] font-bold text-gray-400">
          <span>{t('ws.usage')}</span>
          <span>
            {t('ws.usageOf').replace('{used}', String(used)).replace('{limit}', String(numLimit))}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full bg-indigo-600"
            style={{ width: `${numLimit > 0 ? (used / numLimit) * 100 : 0}%` }}
          />
        </div>
        <button
          type="button"
          onClick={onDownload}
          disabled={isDownloading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-100 py-3 text-xs font-bold text-gray-900 transition-colors hover:bg-gray-200 disabled:opacity-60"
        >
          <Download size={14} />
          {isDownloading ? t('ws.downloading') : t('ws.downloadZip')}
        </button>
        {downloadError && <p className="text-center text-[11px] text-red-600">{downloadError}</p>}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={onDownload}
        disabled={isDownloading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-100 py-3 text-xs font-bold text-gray-900 transition-colors hover:bg-gray-200 disabled:opacity-60"
      >
        <Download size={14} />
        {isDownloading ? 'Descargando...' : 'Descargar ZIP'}
      </button>
      {downloadError && <p className="text-center text-[11px] text-red-600">{downloadError}</p>}
    </div>
  )
}
