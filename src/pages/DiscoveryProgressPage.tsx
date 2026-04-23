import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { ArrowLeft, Loader2, User, Globe, ChevronDown } from 'lucide-react'
import { discoveryService } from '../services/discovery'
import type { Message, DiscoveryResponse, DiscoverySummary, DiscoveryProgressResponse } from '../types/discovery'
import { DiscoveryChatInterface } from '../components/DiscoveryChatInterface'
import { useI18n } from '../i18n'
import { ONBOARDING_STORAGE_KEY, clearOnboardingState } from '../utils/onboardingStorage'
import { useAppSelector } from '../store/hooks'
import { useLogout } from '../hooks/useLogout'
import { useQueryClient } from '@tanstack/react-query'
import { recommendationApi } from '../services/recommendation'
import { roadmapApi } from '../services/roadmap'
import { diagnosisApi } from '../services/diagnosis'
import { logger } from '../utils/logger'


export default function DiscoveryProgressPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { t, language, setLanguage } = useI18n()
  const logout = useLogout()
  const userData = useAppSelector((state) => state.user.user)

  // Discovery Agent state
  const [messages, setMessages] = useState<Message[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<'in_progress' | 'ready_for_confirmation' | 'completed' | 'completed_with_low_confidence'>('in_progress')
  const [discoverySummary, setDiscoverySummary] = useState<DiscoverySummary | null>(null)
  const [progress, setProgress] = useState<DiscoveryProgressResponse | null>(null)
  const [isConfirming, setIsConfirming] = useState(false)
  const [isLangOpen, setIsLangOpen] = useState(false)
  const [thoughtSteps, setThoughtSteps] = useState<string[]>([])
  const [currentStepIndex, setCurrentStepIndex] = useState(-1)
  const [isRevealing, setIsRevealing] = useState(false)
  const activeThoughtRef = useRef<string | null>(null)
  const thoughtsScrollRef = useRef<HTMLDivElement>(null)
  const langRef = useRef<HTMLDivElement>(null)

  // Get session from URL
  useEffect(() => {
    const sessionFromUrl = searchParams.get('session')
    if (sessionFromUrl) {
      setSessionId(sessionFromUrl)
    } else {
      // No session — try restoring from storage
      try {
        const raw = window.localStorage.getItem(ONBOARDING_STORAGE_KEY)
        if (raw) {
          const parsed = JSON.parse(raw)
          if (parsed.sessionId) {
            setSessionId(parsed.sessionId)
            if (parsed.messages) setMessages(parsed.messages)
            if (parsed.status) setStatus(parsed.status)
            if (parsed.discoverySummary) setDiscoverySummary(parsed.discoverySummary)
            if (parsed.progress) setProgress(parsed.progress)
            return
          }
        }
      } catch (e) { console.error('Error restoring discovery state', e) }

      // Nothing found — redirect to onboarding
      navigate('/onboarding', { replace: true })
    }
  }, [searchParams, navigate])

  // Hydrate session from server
  useEffect(() => {
    if (!sessionId) return
    let isCancelled = false
    const hydrateFromServer = async () => {
      try {
        const session = await discoveryService.getSession(sessionId)
        if (isCancelled) return
        if (session?.conversation_history) setMessages(session.conversation_history)
        if (session?.discovery_summary) setDiscoverySummary(session.discovery_summary)
        const objectives = session?.objectives_achieved ?? {}
        const confidence = session?.confidence_score
        if (Object.keys(objectives).length > 0 || confidence !== undefined) {
          setProgress({
            objectives_achieved: objectives,
            estimated_completion: confidence != null ? `${Math.round(confidence * 100)}%` : progress?.estimated_completion ?? '0%',
          })
        }
        if (session?.status) setStatus(session.status as typeof status)
      } catch (error) { console.error('Error hydrating discovery session', error) }
    }
    hydrateFromServer()
    return () => { isCancelled = true }
  }, [sessionId])

  // Auto-scroll thoughts
  useEffect(() => {
    if (thoughtsScrollRef.current && currentStepIndex >= 0) {
      thoughtsScrollRef.current.scrollTo({ top: thoughtsScrollRef.current.scrollHeight, behavior: 'smooth' })
    }
  }, [currentStepIndex])

  // Close lang dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setIsLangOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Persist state
  useEffect(() => {
    try {
      window.localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify({ sessionId, messages, status, discoverySummary, progress }))
    } catch (e) { console.error('Error saving discovery state', e) }
  }, [sessionId, messages, status, discoverySummary, progress])

  // Prefetch
  const queryClient = useQueryClient()
  const triggerPrefetch = (sid: string) => {
    logger.debug("Prefetching diagnosis/recommendation/roadmap", { sessionId: sid })
    void queryClient.prefetchQuery({ queryKey: ['diagnosis', sid], queryFn: () => diagnosisApi.analyze(sid), staleTime: 5 * 60 * 1000 })
    void queryClient.prefetchQuery({ queryKey: ['recommendation', sid], queryFn: () => recommendationApi.generate(sid), staleTime: 5 * 60 * 1000 })
    void queryClient.prefetchQuery({ queryKey: ['roadmap', sid], queryFn: () => roadmapApi.generate(sid), staleTime: 5 * 60 * 1000 })
  }

  useEffect(() => {
    if ((status === 'ready_for_confirmation' || status === 'completed' || status === 'completed_with_low_confidence') && sessionId) {
      triggerPrefetch(sessionId)
    }
  }, [status, sessionId])

  const handleSendMessage = async (message: string) => {
    const trimmed = message.trim()
    if (!trimmed || isLoading) return
    if (trimmed.length < 10) {
      setMessages(prev => [...prev, { role: 'agent', message: t('discovery.minLength'), timestamp: new Date().toISOString() }])
      return
    }

    setIsLoading(true)
    try {
      let response: DiscoveryResponse

      if (!sessionId) {
        // Shouldn't happen (session created in onboarding), but handle gracefully
        response = await discoveryService.start({ initial_message: trimmed, language })
        setSessionId(response.session_id)
        navigate(`/discovery-progress?session=${response.session_id}`, { replace: true })
      } else {
        response = await discoveryService.continue({ session_id: sessionId, user_message: trimmed, language })
      }

      setMessages(prev => [
        ...prev,
        { role: 'client', message: trimmed, timestamp: new Date().toISOString() },
        { role: 'agent', message: response.agent_response, thought: response.agent_thought, timestamp: new Date().toISOString() },
      ])

      if (response.agent_thought) activeThoughtRef.current = response.agent_thought

      setStatus(response.status)
      if (response.progress) setProgress(response.progress)
      if (response.discovery_summary) setDiscoverySummary(response.discovery_summary)

      if (response.status === 'completed' && response.diagnosis_endpoint) {
        setTimeout(() => navigate(`/recommendation?session=${response.session_id}`), 2000)
      }
    } catch (error: any) {
      console.error('Error during discovery:', error)
      const errorStatus = error?.response?.status
      const detail = error?.response?.data?.detail

      if (sessionId && errorStatus === 404 && detail === 'Session not found') {
        clearOnboardingState()
        setSessionId(null)
        setMessages([])
        setStatus('in_progress')
        setDiscoverySummary(null)
        setProgress(null)
        setTimeout(() => handleSendMessage(trimmed), 100)
        return
      }

      if (errorStatus === 422) {
        const validationDetail = Array.isArray(detail) ? detail.map((d: any) => d.msg || d.message).join('. ') : typeof detail === 'string' ? detail : t('discovery.validationDefault')
        setMessages(prev => [...prev, { role: 'agent', message: t('discovery.validationError').replace('{detail}', validationDetail), timestamp: new Date().toISOString() }])
        return
      }

      setMessages(prev => [...prev, { role: 'agent', message: t('discovery.genericError'), timestamp: new Date().toISOString() }])
    } finally {
      const thought = activeThoughtRef.current
      if (thought) {
        setIsRevealing(true)
        const steps = thought.split('###').map((s: string) => s.trim()).filter((s: string) => Boolean(s)).map((s: string) => s.replace(/^\d+:\s*/, ''))
        setThoughtSteps(steps)
        setCurrentStepIndex(0)
        for (let i = 0; i < steps.length; i++) { setCurrentStepIndex(i); await new Promise(resolve => setTimeout(resolve, 1500)) }
        await new Promise(resolve => setTimeout(resolve, 1000))
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
      const response = await discoveryService.confirm({ session_id: sessionId, user_confirmation: t('discovery.confirmYes'), language })
      setMessages(prev => [...prev, { role: 'agent', message: response.agent_response, timestamp: new Date().toISOString() }])
      setStatus(response.status)
      if (response.discovery_summary) setDiscoverySummary(response.discovery_summary)
      if (response.progress) setProgress(response.progress)
      setSessionId(response.session_id)
      triggerPrefetch(response.session_id)
    } catch (error) { console.error('Error confirming synthesis:', error) }
    finally { setIsConfirming(false) }
  }

  const completion = progress?.estimated_completion
  const percent = completion ? Math.min(Math.max(parseInt(completion, 10), 0), 100) : 0

  // If no sessionId yet (loading), show a loader
  if (!sessionId) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
      {/* Header */}
      <header className="fixed top-0 w-full z-40 bg-white/80 backdrop-blur-xl shadow-sm shadow-indigo-500/5">
        <div className="flex justify-between items-center px-6 py-4 max-w-full mx-auto">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/onboarding')} className="text-slate-400 hover:text-indigo-600 transition-colors p-2 rounded-full hover:bg-indigo-50">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Link to="/" className="text-xl font-bold tracking-tight text-indigo-600" style={{ fontFamily: 'Manrope, sans-serif' }}>
              CodlyLabs
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {/* Language */}
            <div ref={langRef} className="relative">
              <button type="button" onClick={() => setIsLangOpen(prev => !prev)}
                className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 transition-colors px-2 py-1.5 rounded-lg hover:bg-slate-100">
                <Globe className="w-4 h-4" />
                <span className="text-sm font-medium uppercase">{language}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
              </button>
              {isLangOpen && (
                <div className="absolute right-0 mt-2 w-32 rounded-xl border border-gray-100 bg-white shadow-lg overflow-hidden z-20">
                  <button type="button" onClick={() => { setLanguage('es'); setIsLangOpen(false) }}
                    className={`w-full px-3 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2 ${language === 'es' ? 'font-semibold text-indigo-600 bg-indigo-50' : 'text-gray-700'}`}>
                    🇪🇸 Español
                  </button>
                  <button type="button" onClick={() => { setLanguage('en'); setIsLangOpen(false) }}
                    className={`w-full px-3 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2 ${language === 'en' ? 'font-semibold text-indigo-600 bg-indigo-50' : 'text-gray-700'}`}>
                    🇺🇸 English
                  </button>
                </div>
              )}
            </div>

            {/* User */}
            {userData && (
              <div className="flex items-center gap-2 pl-4 border-l border-slate-200">
                {userData.profile_picture ? (
                  <img src={userData.profile_picture} alt={userData.full_name || userData.email} className="w-8 h-8 rounded-full object-cover border-2 border-indigo-100" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center border-2 border-indigo-100">
                    <User className="w-4 h-4 text-indigo-600" />
                  </div>
                )}
                <span className="text-xs font-bold text-gray-900 hidden sm:block">
                  {userData.full_name || userData.email?.split('@')[0] || t('discovery.userFallback')}
                </span>
              </div>
            )}

            <button type="button" onClick={logout}
              className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold active:scale-95 transition-transform">
              {t('app.finish')}
            </button>
          </div>
        </div>
      </header>

      {/* Main: Chat + Progress */}
      <main className="flex-grow pt-24 pb-32 px-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[6fr_4fr] gap-8 items-start">
          {/* Chat Column */}
          <div className="flex flex-col h-[750px] bg-white rounded-2xl p-2 shadow-sm overflow-hidden">
            <div className="flex-1 min-h-0">
              <DiscoveryChatInterface
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                status={status}
              />
            </div>

            {/* Confirmation bar */}
            {status === 'ready_for_confirmation' && discoverySummary && (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-xs text-indigo-700">
                <p className="flex-1 text-[11px]">{t('onboarding.confirmHint')}</p>
                <button
                  type="button"
                  onClick={handleConfirmSynthesis}
                  disabled={isConfirming || isLoading}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-[11px] font-bold shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"
                >
                  {isConfirming ? `${t('onboarding.confirmButton')}…` : t('onboarding.confirmButton')}
                </button>
              </div>
            )}
          </div>

          {/* Progress Column */}
          <div className="space-y-6">
            {/* Progress Card */}
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-3 text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
                {t('onboarding.progress.title')}
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">{t('onboarding.progress.label')}</span>
                  <span className="text-2xl font-bold text-indigo-600" style={{ fontFamily: 'Manrope, sans-serif' }}>{percent}%</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full transition-all duration-1000" style={{ width: `${percent}%` }} />
                </div>
              </div>
            </div>

            {/* Narrative Summary */}
            {discoverySummary?.narrative && (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-sm font-bold mb-4 uppercase tracking-widest text-gray-400" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  {t('discovery.narrativeSummary')}
                </h3>
                <div className="text-sm text-gray-600 leading-relaxed space-y-3">
                  {discoverySummary.narrative}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Completion CTAs */}
        {(status === 'completed' || status === 'completed_with_low_confidence') && sessionId && (
          <div className="mt-6 flex flex-wrap gap-3 justify-end">
            <button type="button" onClick={() => navigate(`/recommendation?session=${sessionId}`)}
              className="px-6 py-3 rounded-xl bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors">
              {t('onboarding.cta.document')}
            </button>
          </div>
        )}
      </main>

      {/* Thinking Modal — "Agente razonando" */}
      {(isLoading || isRevealing) && (
        <ThinkingModal
          thoughtSteps={thoughtSteps}
          currentStepIndex={currentStepIndex}
          isRevealing={isRevealing}
          scrollRef={thoughtsScrollRef}
          t={t}
        />
      )}

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
    </div>
  )
}

// ─── Thinking Modal ──────────────────────────────────────────────
// Always shows "Agente razonando" with simulated steps during loading,
// then reveals real thought steps when they arrive from the agent.

function getSimulatedSteps(t: (key: string) => string) {
  return [
    t('discovery.reasoning.step1'),
    t('discovery.reasoning.step2'),
    t('discovery.reasoning.step3'),
    t('discovery.reasoning.step4'),
    t('discovery.reasoning.step5'),
  ]
}

function ThinkingModal({
  thoughtSteps,
  currentStepIndex,
  isRevealing,
  scrollRef,
  t,
}: {
  thoughtSteps: string[]
  currentStepIndex: number
  isRevealing: boolean
  scrollRef: React.RefObject<HTMLDivElement>
  t: (key: string) => string
}) {
  const [simIndex, setSimIndex] = useState(0)

  // Animate simulated steps while waiting for real ones
  useEffect(() => {
    if (isRevealing) return // Real steps are being revealed, stop simulation
    const timer = setInterval(() => {
      setSimIndex(prev => (prev < 4 ? prev + 1 : prev))
    }, 3000)
    return () => clearInterval(timer)
  }, [isRevealing])

  // Reset simulation when modal opens
  useEffect(() => { setSimIndex(0) }, [])

  const simulatedSteps = getSimulatedSteps(t)
  const showingReal = isRevealing && thoughtSteps.length > 0
  const steps = showingReal ? thoughtSteps : simulatedSteps
  const activeIdx = showingReal ? currentStepIndex : simIndex

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-[#f8f9fa]/60 backdrop-blur-md">
      <div className="bg-white max-w-md w-full rounded-2xl p-10 shadow-[0px_24px_48px_rgba(25,28,30,0.08)] border border-gray-200/15 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-200 via-indigo-600 to-indigo-200" />

        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative mb-6">
            <div className="w-16 h-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
            {t('discovery.reasoning.title')}
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            {t('discovery.reasoning.analyzing')}
          </p>
        </div>

        <div ref={scrollRef} className="space-y-5 max-h-60 overflow-y-auto">
          {steps.map((step, idx) => (
            <div
              key={`${showingReal ? 'real' : 'sim'}-${idx}`}
              className={`flex items-center gap-4 transition-all duration-700 ${
                idx <= activeIdx ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'
              }`}
            >
              <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                idx < activeIdx
                  ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                  : 'bg-indigo-600 animate-pulse shadow-[0_0_10px_rgba(88,68,237,0.5)]'
              }`} />
              <span className={`text-sm ${
                idx === activeIdx ? 'font-bold text-indigo-600' : 'font-medium text-gray-500'
              }`}>
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
