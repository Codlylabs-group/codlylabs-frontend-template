import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowRight,
  CheckCircle2,
  FileUp,
  Loader2,
  MessageCircle,
  Search,
  Sparkles,
  Upload,
} from 'lucide-react'

import { DiscoveryChatInterface } from '../../components/DiscoveryChatInterface'
import { VerticalSelectorModal, type SelectableVertical } from '../../components/VerticalSelectorModal'
import { api } from '../../services/api'
import { discoveryService } from '../../services/discovery'
import { useAppSelector } from '../../store/hooks'
import type {
  DiscoveryProgressResponse,
  DiscoveryResponse,
  DiscoverySummary,
  Message,
} from '../../types/discovery'
import { ONBOARDING_STORAGE_KEY, clearOnboardingState } from '../../utils/onboardingStorage'
import { readSelectedVertical, writeSelectedVertical } from '../../utils/verticalStorage'
import { setSessionName } from '../../utils/sessionName'
import { useWorkspaceOutletContext } from './WorkspaceLayout'

type DiscoveryStatus = 'in_progress' | 'ready_for_confirmation' | 'completed' | 'completed_with_low_confidence'

const MIN_PROMPT_LENGTH = 10
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024
// Opción B — Vertical-first UX: la vertical se elige al inicio del flujo (antes
// del primer mensaje del chat) y persiste en localStorage + backend session.
// Esto elimina la invalidación del pre-gen cuando el user eligía vertical al final.
// El helper de storage vive en ../../utils/verticalStorage.
const ALLOWED_UPLOAD_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]

const SIMULATED_THOUGHTS = [
  'Analizando tu contexto y objetivos...',
  'Buscando patrones en casos similares...',
  'Evaluando verticales y arquetipos relevantes...',
  'Identificando dependencias y restricciones...',
  'Preparando la siguiente pregunta del agente...',
]

const workspaceSummaryPath = (sessionId: string, tierQuery: string) =>
  `/workspace/summary?session=${sessionId}${tierQuery}`

function EntryForm({
  inputValue,
  onInputChange,
  onSubmit,
  onUpload,
  isStarting,
  isAnalyzing,
  brandPrimary,
  brandPrimaryDark,
}: {
  inputValue: string
  onInputChange: (value: string) => void
  onSubmit: () => void
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  isStarting: boolean
  isAnalyzing: boolean
  brandPrimary: string
  brandPrimaryDark: string
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const disabled = isStarting || isAnalyzing || inputValue.trim().length < MIN_PROMPT_LENGTH

  return (
    <>
      <div
        className="relative mb-6 overflow-hidden rounded-xl p-6 text-white"
        style={{ background: `linear-gradient(135deg, ${brandPrimary}, ${brandPrimaryDark})` }}
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
            Diagnóstico consultivo guiado
          </span>
          <h2 className="mt-3 text-xl font-semibold">Iniciá tu Discovery</h2>
          <p className="mt-1 max-w-2xl text-sm text-blue-100">
            Contanos tu contexto y el agente va a conversar con vos para identificar las mejores oportunidades de IA.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
          Describí tu necesidad
        </label>
        <textarea
          value={inputValue}
          onChange={(event) => onInputChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              if (!disabled) onSubmit()
            }
          }}
          placeholder="Ej: Automatizar la gestión de reclamos, reducir tiempos de respuesta, análisis de contratos, predecir demanda..."
          className="mt-3 h-48 w-full resize-none rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm leading-relaxed text-gray-800 placeholder:text-gray-400 outline-none transition-colors focus:border-blue-300"
          disabled={isStarting || isAnalyzing}
        />

        <div className="mt-4 flex flex-col items-stretch justify-between gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center">
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={onUpload}
              accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isAnalyzing || isStarting}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 transition-colors hover:border-blue-200 hover:text-blue-600 disabled:opacity-60"
            >
              {isAnalyzing ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              {isAnalyzing ? 'Analizando documento...' : 'Subir documento (PDF, Word o TXT)'}
            </button>
            <p className="mt-1.5 text-[10px] text-gray-400">Máximo 10 MB. Extraemos los requisitos automáticamente.</p>
          </div>
          <button
            type="button"
            onClick={onSubmit}
            disabled={disabled}
            className="inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
            style={{ background: `linear-gradient(135deg, ${brandPrimary}, ${brandPrimaryDark})` }}
          >
            {isStarting ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
            {isStarting ? 'Iniciando...' : 'Iniciar Discovery'}
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <TipCard icon={MessageCircle} title="Conversación guiada" description="El agente hace preguntas iterativas hasta entender tu caso." />
        <TipCard icon={FileUp} title="Importá tu brief" description="Subí un PDF con los requisitos y lo transformamos en el input inicial." />
        <TipCard icon={CheckCircle2} title="Resultado accionable" description="Al finalizar, recibís un diagnóstico y una recomendación estratégica." />
      </div>
    </>
  )
}

function TipCard({ icon: Icon, title, description }: { icon: typeof MessageCircle; title: string; description: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
        <Icon size={16} />
      </div>
      <h3 className="mt-3 text-sm font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-xs leading-relaxed text-gray-500">{description}</p>
    </div>
  )
}

function ThinkingModal({
  thoughtSteps,
  currentStepIndex,
  isRevealing,
  scrollRef,
}: {
  thoughtSteps: string[]
  currentStepIndex: number
  isRevealing: boolean
  scrollRef: React.RefObject<HTMLDivElement>
}) {
  const [simIndex, setSimIndex] = useState(0)

  useEffect(() => {
    if (isRevealing) return
    const timer = window.setInterval(() => {
      setSimIndex((prev) => (prev < SIMULATED_THOUGHTS.length - 1 ? prev + 1 : prev))
    }, 3000)
    return () => window.clearInterval(timer)
  }, [isRevealing])

  useEffect(() => {
    setSimIndex(0)
  }, [])

  const showingReal = isRevealing && thoughtSteps.length > 0
  const steps = showingReal ? thoughtSteps : SIMULATED_THOUGHTS
  const activeIdx = showingReal ? currentStepIndex : simIndex

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/30 px-4 backdrop-blur-md">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 shadow-2xl">
        <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-indigo-200 via-indigo-600 to-indigo-200" />
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="relative mb-4">
            <div className="h-14 w-14 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">El agente está razonando</h2>
          <p className="mt-1 text-xs text-gray-500">Analizando tu contexto para preparar la siguiente respuesta...</p>
        </div>

        <div ref={scrollRef} className="max-h-56 space-y-4 overflow-y-auto">
          {steps.map((step, idx) => (
            <div
              key={`${showingReal ? 'real' : 'sim'}-${idx}`}
              className={`flex items-center gap-3 transition-all duration-700 ${
                idx <= activeIdx ? 'opacity-100' : 'h-0 overflow-hidden opacity-0'
              }`}
            >
              <div
                className={`h-2 w-2 flex-shrink-0 rounded-full ${
                  idx < activeIdx
                    ? 'bg-emerald-500'
                    : 'animate-pulse bg-indigo-600 shadow-[0_0_8px_rgba(88,68,237,0.5)]'
                }`}
              />
              <span className={`text-xs ${idx === activeIdx ? 'font-semibold text-indigo-600' : 'text-gray-500'}`}>
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function WorkspaceDiscoveryView() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  // Tier seleccionado en el header o sidebar (preservado durante todo el flujo)
  const selectedTier = (searchParams.get('tier') || 'poc').toLowerCase()
  const tierQuery = selectedTier !== 'poc' ? `&tier=${selectedTier}` : ''
  const userData = useAppSelector((state) => state.user.user)
  const { brand, setHeader } = useWorkspaceOutletContext()

  const [sessionId, setSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [status, setStatus] = useState<DiscoveryStatus>('in_progress')
  const [discoverySummary, setDiscoverySummary] = useState<DiscoverySummary | null>(null)
  const [progress, setProgress] = useState<DiscoveryProgressResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)

  const [inputValue, setInputValue] = useState('')
  const [isStartingDiscovery, setIsStartingDiscovery] = useState(false)
  const [isAnalyzingDocument, setIsAnalyzingDocument] = useState(false)

  const [thoughtSteps, setThoughtSteps] = useState<string[]>([])
  const [currentStepIndex, setCurrentStepIndex] = useState(-1)
  const [isRevealing, setIsRevealing] = useState(false)
  const activeThoughtRef = useRef<string | null>(null)
  const thoughtsScrollRef = useRef<HTMLDivElement>(null)
  const entryPickupRef = useRef(false)

  // Opción B — Vertical-first UX. selectedVertical se hidrata de localStorage
  // al montar. El modal se abre automáticamente si el usuario entra al flujo
  // sin haber elegido vertical todavía (solo en fresh entry, sin ?session=).
  const [selectedVertical, setSelectedVertical] = useState<SelectableVertical | null>(
    () => readSelectedVertical(),
  )
  const [isVerticalModalOpen, setIsVerticalModalOpen] = useState(false)

  useEffect(() => {
    setHeader('Discovery', 'Conversación guiada con el agente de IA')
  }, [setHeader])

  // Resolve session: only restore if ?session= is in the URL.
  // Entering without ?session= always starts a fresh discovery.
  useEffect(() => {
    if (entryPickupRef.current) return
    entryPickupRef.current = true

    const sessionFromUrl = searchParams.get('session')
    if (!sessionFromUrl) {
      // Fresh entry — clean up any previous state
      clearOnboardingState()
      // Opción B: en fresh entry (intención clara de crear una PoC nueva)
      // abrimos SIEMPRE el modal de vertical. Si ya había una persistida de
      // una PoC anterior, el user igual confirma para este flujo — un click
      // extra que evita arrancar con la vertical incorrecta por accidente.
      setIsVerticalModalOpen(true)
      return
    }

    setSessionId(sessionFromUrl)
    try {
      const raw = window.localStorage.getItem(ONBOARDING_STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed?.sessionId === sessionFromUrl) {
          if (Array.isArray(parsed.messages)) setMessages(parsed.messages)
          if (parsed.status) setStatus(parsed.status)
          if (parsed.discoverySummary) setDiscoverySummary(parsed.discoverySummary)
          if (parsed.progress) setProgress(parsed.progress)
        }
      }
    } catch (err) {
      console.error('Error restoring discovery state', err)
    }
  }, [searchParams])

  // Hydrate from server
  useEffect(() => {
    if (!sessionId) return
    let cancelled = false
    const run = async () => {
      try {
        const session = await discoveryService.getSession(sessionId)
        if (cancelled) return
        if (session?.conversation_history) setMessages(session.conversation_history)
        if (session?.discovery_summary) setDiscoverySummary(session.discovery_summary)
        const objectives = session?.objectives_achieved ?? {}
        const confidence = session?.confidence_score
        if (Object.keys(objectives).length > 0 || confidence !== undefined) {
          setProgress({
            objectives_achieved: objectives,
            estimated_completion:
              confidence != null ? `${Math.round(confidence * 100)}%` : progress?.estimated_completion ?? '0%',
          })
        }
        if (session?.status) setStatus(session.status as DiscoveryStatus)
      } catch (err) {
        console.error('Error hydrating discovery session', err)
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [sessionId])

  // Persist
  useEffect(() => {
    if (!sessionId) return
    try {
      window.localStorage.setItem(
        ONBOARDING_STORAGE_KEY,
        JSON.stringify({ sessionId, messages, status, discoverySummary, progress }),
      )
    } catch (err) {
      console.error('Error saving discovery state', err)
    }
  }, [sessionId, messages, status, discoverySummary, progress])

  // Auto-scroll thoughts
  useEffect(() => {
    if (thoughtsScrollRef.current && currentStepIndex >= 0) {
      thoughtsScrollRef.current.scrollTo({ top: thoughtsScrollRef.current.scrollHeight, behavior: 'smooth' })
    }
  }, [currentStepIndex])

  const handleSelectVertical = (vertical: SelectableVertical) => {
    setSelectedVertical(vertical)
    setIsVerticalModalOpen(false)
    writeSelectedVertical(vertical)
  }

  const handleStartDiscovery = async () => {
    const trimmed = inputValue.trim()
    if (trimmed.length < MIN_PROMPT_LENGTH) return

    setIsStartingDiscovery(true)
    try {
      const response = await discoveryService.start({
        initial_message: trimmed,
        language: 'es',
        selected_vertical: selectedVertical ?? undefined,
      })
      const newSessionId = response.session_id

      if (userData?.full_name) {
        try {
          const result = await discoveryService.associateUserWithSession(newSessionId)
          if (result.success && result.user_name) {
            setSessionName(newSessionId, result.user_name)
          }
        } catch (err) {
          console.error('Failed to associate user with session:', err)
        }
      }

      setSessionId(newSessionId)
      setMessages([
        { role: 'client', message: trimmed, timestamp: new Date().toISOString() },
        {
          role: 'agent',
          message: response.agent_response,
          thought: response.agent_thought,
          timestamp: new Date().toISOString(),
        },
      ])
      setStatus(response.status)
      if (response.progress) setProgress(response.progress)
      if (response.discovery_summary) setDiscoverySummary(response.discovery_summary)

      navigate(`/workspace/discovery?session=${newSessionId}${tierQuery}`, { replace: true })
    } catch (err) {
      console.error('Error starting discovery:', err)
      window.alert('No se pudo iniciar el Discovery. Probá de nuevo en unos segundos.')
    } finally {
      setIsStartingDiscovery(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!ALLOWED_UPLOAD_TYPES.includes(file.type)) {
      window.alert('Por favor subí un archivo PDF, Word (.doc, .docx) o texto (.txt).')
      return
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      window.alert('El archivo es demasiado grande. Máximo 10 MB.')
      return
    }

    setIsAnalyzingDocument(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await api.post('/api/v1/document/analyze-requirements', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      if (response.data.prompt) setInputValue(response.data.prompt)
    } catch (err) {
      console.error('Error analyzing document:', err)
      window.alert('No se pudo analizar el documento. Probá de nuevo en unos segundos.')
    } finally {
      setIsAnalyzingDocument(false)
      event.target.value = ''
    }
  }

  const handleSendMessage = async (message: string) => {
    const trimmed = message.trim()
    if (!trimmed || isLoading) return

    setIsLoading(true)
    try {
      let response: DiscoveryResponse
      if (!sessionId) {
        response = await discoveryService.start({
          initial_message: trimmed,
          language: 'es',
          selected_vertical: selectedVertical ?? undefined,
        })
        setSessionId(response.session_id)
        navigate(`/workspace/discovery?session=${response.session_id}${tierQuery}`, { replace: true })
      } else {
        response = await discoveryService.continue({
          session_id: sessionId,
          user_message: trimmed,
          language: 'es',
        })
      }

      setMessages((prev) => [
        ...prev,
        { role: 'client', message: trimmed, timestamp: new Date().toISOString() },
        {
          role: 'agent',
          message: response.agent_response,
          thought: response.agent_thought,
          timestamp: new Date().toISOString(),
        },
      ])

      if (response.agent_thought) activeThoughtRef.current = response.agent_thought

      setStatus(response.status)
      if (response.progress) setProgress(response.progress)
      if (response.discovery_summary) setDiscoverySummary(response.discovery_summary)

      if (response.status === 'completed') {
        window.setTimeout(() => {
          navigate(workspaceSummaryPath(response.session_id, tierQuery))
        }, 800)
      }
    } catch (err: any) {
      console.error('Error during discovery:', err)
      const errorStatus = err?.response?.status
      const detail = err?.response?.data?.detail

      if (sessionId && errorStatus === 404 && detail === 'Session not found') {
        clearOnboardingState()
        setSessionId(null)
        setMessages([])
        setStatus('in_progress')
        setDiscoverySummary(null)
        setProgress(null)
        setInputValue(trimmed)
        return
      }

      if (errorStatus === 422) {
        const validationDetail = Array.isArray(detail)
          ? detail.map((d: any) => d.msg || d.message).join('. ')
          : typeof detail === 'string'
            ? detail
            : 'El mensaje no cumple los requisitos mínimos.'
        setMessages((prev) => [
          ...prev,
          {
            role: 'agent',
            message: `No pude procesar tu mensaje: ${validationDetail}`,
            timestamp: new Date().toISOString(),
          },
        ])
        return
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'agent',
          message: 'Hubo un error procesando tu mensaje. Probá de nuevo en un momento.',
          timestamp: new Date().toISOString(),
        },
      ])
    } finally {
      const thought = activeThoughtRef.current
      if (thought) {
        setIsRevealing(true)
        const steps = thought
          .split('###')
          .map((s) => s.trim())
          .filter(Boolean)
          .map((s) => s.replace(/^\d+:\s*/, ''))
        setThoughtSteps(steps)
        setCurrentStepIndex(0)
        for (let i = 0; i < steps.length; i += 1) {
          setCurrentStepIndex(i)
          await new Promise((resolve) => window.setTimeout(resolve, 1500))
        }
        await new Promise((resolve) => window.setTimeout(resolve, 1000))
        setIsRevealing(false)
      }
      setIsLoading(false)
      activeThoughtRef.current = null
    }
  }

  const handleConfirmSynthesis = async () => {
    if (!sessionId || isConfirming) return
    setIsConfirming(true)
    try {
      const response = await discoveryService.confirm({
        session_id: sessionId,
        user_confirmation: 'Sí, confirmo',
        language: 'es',
      })
      setMessages((prev) => [
        ...prev,
        { role: 'agent', message: response.agent_response, timestamp: new Date().toISOString() },
      ])
      setStatus(response.status)
      if (response.discovery_summary) setDiscoverySummary(response.discovery_summary)
      if (response.progress) setProgress(response.progress)
      setSessionId(response.session_id)
      navigate(workspaceSummaryPath(response.session_id, tierQuery))
    } catch (err) {
      console.error('Error confirming synthesis:', err)
    } finally {
      setIsConfirming(false)
    }
  }

  const handleReset = () => {
    clearOnboardingState()
    setSessionId(null)
    setMessages([])
    setStatus('in_progress')
    setDiscoverySummary(null)
    setProgress(null)
    setInputValue('')
    navigate(
      `/workspace/discovery${tierQuery ? `?${tierQuery.slice(1)}` : ''}`,
      { replace: true },
    )
  }

  const completion = progress?.estimated_completion
  const percent = completion ? Math.min(Math.max(parseInt(completion, 10), 0), 100) : 0
  const isCompleted = status === 'completed' || status === 'completed_with_low_confidence'

  if (!sessionId) {
    return (
      <EntryForm
        inputValue={inputValue}
        onInputChange={setInputValue}
        onSubmit={() => void handleStartDiscovery()}
        onUpload={(event) => void handleFileUpload(event)}
        isStarting={isStartingDiscovery}
        isAnalyzing={isAnalyzingDocument}
        brandPrimary={brand.primary}
        brandPrimaryDark={brand.primaryDark}
      />
    )
  }

  return (
    <>
      <div
        className="relative mb-6 flex flex-col gap-3 overflow-hidden rounded-xl p-6 text-white sm:flex-row sm:items-center sm:justify-between"
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
            <Search size={10} />
            Sesión en curso
          </span>
          <h2 className="mt-3 text-xl font-semibold">Discovery con el agente</h2>
          <p className="mt-1 max-w-2xl text-sm text-blue-100">
            Respondé las preguntas del agente. A medida que avances vamos armando el diagnóstico.
          </p>
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={handleReset}
            className="rounded-lg bg-white/10 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-white/20"
          >
            Iniciar nueva sesión
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[6fr_4fr] lg:items-start">
        <div className="flex h-[720px] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white p-2 shadow-sm">
          <div className="min-h-0 flex-1">
            <DiscoveryChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              status={status}
            />
          </div>

          {status === 'ready_for_confirmation' && discoverySummary && (
            <div className="mt-2 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-xs text-indigo-700">
              <p className="flex-1 text-[11px]">
                Revisá la síntesis del agente y confirmá para pasar a la recomendación.
              </p>
              <button
                type="button"
                onClick={() => void handleConfirmSynthesis()}
                disabled={isConfirming || isLoading}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-[11px] font-bold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-60"
              >
                {isConfirming ? 'Confirmando...' : 'Confirmar síntesis'}
              </button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900">Progreso del Discovery</h3>
            <div className="mt-4 flex items-end justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600">Completado</span>
              <span className="text-2xl font-bold text-indigo-600">{percent}%</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${percent}%`,
                  background: `linear-gradient(90deg, ${brand.primary}, ${brand.primaryDark})`,
                }}
              />
            </div>
          </div>

          {discoverySummary?.narrative && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Síntesis narrativa
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">{discoverySummary.narrative}</p>
            </div>
          )}

          {isCompleted && (
            <button
              type="button"
              onClick={() => navigate(workspaceSummaryPath(sessionId, tierQuery))}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md"
              style={{ background: `linear-gradient(135deg, ${brand.primary}, ${brand.primaryDark})` }}
            >
              <Sparkles size={16} />
              Ver resumen
            </button>
          )}
        </div>
      </div>

      {(isLoading || isRevealing) && (
        <ThinkingModal
          thoughtSteps={thoughtSteps}
          currentStepIndex={currentStepIndex}
          isRevealing={isRevealing}
          scrollRef={thoughtsScrollRef}
        />
      )}

      {/* Opción B — modal de vertical al INICIO del flujo. Se abre automáticamente
          en fresh entry si el user todavía no eligió vertical. La vertical se
          propaga al backend en el primer discoveryService.start y se persiste
          en session → el pre-gen la recibe sin riesgo de invalidación. */}
      <VerticalSelectorModal
        isOpen={isVerticalModalOpen}
        onClose={() => setIsVerticalModalOpen(false)}
        onSelect={handleSelectVertical}
      />
    </>
  )
}
