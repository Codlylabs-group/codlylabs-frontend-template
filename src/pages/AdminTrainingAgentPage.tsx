import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '../store/hooks'
import { clearAuth } from '../store/userSlice'
import AdminSidebar from '../components/AdminSidebar'
import { api } from '../services/api'
import { FlaskConical, Play, XCircle, RefreshCw, ChevronDown, ChevronRight, Filter } from 'lucide-react'

type Tab = 'execute' | 'history' | 'prompts' | 'intelligence'

interface TrainingRun {
  id: string
  vertical: string
  num_prompts: number
  complexity_filter: string | null
  status: string
  prompts_generated: number
  specs_generated: number
  builds_successful: number
  builds_failed: number
  smoke_tests_passed: number
  smoke_tests_failed: number
  patterns_discovered: number
  success_rate: number
  total_cost_usd: number
  total_tokens: number
  duration_seconds: number | null
  error_summary: Record<string, number>
  started_at: string | null
  completed_at: string | null
  created_at: string | null
  results?: TrainingResult[]
  live_progress?: LiveProgress
}

interface TrainingResult {
  id: string
  prompt_id: string
  status: string
  inferred_poc_type: string | null
  endpoint_count: number
  has_integration_kits: boolean
  spec_quality_score: number | null
  build_success: boolean | null
  smoke_test_success: boolean | null
  fixes_applied: string[]
  errors_found: string[]
  error_message: string | null
  cost_usd: number
  tokens_used: number
  duration_seconds: number
  created_at: string | null
}


interface LiveProgress {
  run_id: string
  status: string
  total: number
  completed: number
  current_prompt: string | null
  errors: string[]
}

interface TrainingPrompt {
  id: string
  prompt_text: string
  vertical: string
  sub_domain: string | null
  complexity: string
  integration_kits: string[]
  kit_count: number
  batch_id: string | null
  created_at: string | null
}

const VERTICALS = ['fintech', 'healthcare', 'retail', 'legal', 'education']
const COMPLEXITIES = ['low', 'medium', 'high']

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  running: 'bg-blue-100 text-blue-800 animate-pulse',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-600',
  success: 'bg-green-100 text-green-800',
  failure: 'bg-red-100 text-red-800',
  skipped: 'bg-gray-100 text-gray-600',
}

export default function AdminTrainingAgentPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const userData = useAppSelector((state) => state.user.user)

  const [tab, setTab] = useState<Tab>('execute')
  const [error, setError] = useState('')

  // Execute tab state
  const [vertical, setVertical] = useState('fintech')
  const [numPrompts, setNumPrompts] = useState(10)
  const [complexity, setComplexity] = useState<string>('')
  const [isStarting, setIsStarting] = useState(false)
  const [activeRunId, setActiveRunId] = useState<string | null>(null)
  const [liveProgress, setLiveProgress] = useState<LiveProgress | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // History tab state
  const [runs, setRuns] = useState<TrainingRun[]>([])
  const [runsTotal, setRunsTotal] = useState(0)
  const [loadingRuns, setLoadingRuns] = useState(false)
  const [expandedRun, setExpandedRun] = useState<string | null>(null)
  const [expandedRunDetail, setExpandedRunDetail] = useState<TrainingRun | null>(null)
  const [filterVertical, setFilterVertical] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  // Prompts tab state
  const [prompts, setPrompts] = useState<TrainingPrompt[]>([])
  const [promptsTotal, setPromptsTotal] = useState(0)
  const [loadingPrompts, setLoadingPrompts] = useState(false)
  const [expandedPrompt, setExpandedPrompt] = useState<string | null>(null)
  const [promptFilterVertical, setPromptFilterVertical] = useState('')
  const [promptFilterComplexity, setPromptFilterComplexity] = useState('')
  const [promptFilterHasKits, setPromptFilterHasKits] = useState<string>('')

  // Intelligence tab state
  const [intelligence, setIntelligence] = useState<any>(null)
  const [loadingIntelligence, setLoadingIntelligence] = useState(false)

  useEffect(() => {
    if (!userData) { navigate('/admin/login'); return }
  }, [userData, navigate])

  useEffect(() => {
    if (tab === 'history') loadRuns()
    if (tab === 'prompts') loadPrompts()
    if (tab === 'intelligence') loadIntelligence()
  }, [tab])

  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [])

  const handleLogout = () => {
    dispatch(clearAuth())
    navigate('/admin/login')
  }

  // ── Execute tab ──

  const startTraining = async () => {
    setIsStarting(true)
    setError('')
    try {
      const res = await api.post('/api/v1/admin/training-agent/start', {
        vertical,
        num_prompts: numPrompts,
        complexity_filter: complexity || null,
      })
      const runId = res.data.run_id
      setActiveRunId(runId)
      startPolling(runId)
    } catch (err: any) {
      if (err.response?.status === 401) navigate('/admin/login')
      setError(err.response?.data?.detail || 'Error al iniciar entrenamiento')
    } finally {
      setIsStarting(false)
    }
  }

  const startPolling = (runId: string) => {
    if (pollRef.current) clearInterval(pollRef.current)
    pollRef.current = setInterval(async () => {
      try {
        const res = await api.get(`/api/v1/admin/training-agent/runs/${runId}`)
        const run = res.data as TrainingRun
        if (run.live_progress) {
          setLiveProgress(run.live_progress)
        }
        if (['completed', 'failed', 'cancelled'].includes(run.status)) {
          if (pollRef.current) clearInterval(pollRef.current)
          pollRef.current = null
          setLiveProgress(null)
          setActiveRunId(null)
        }
      } catch (err: any) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          if (pollRef.current) clearInterval(pollRef.current)
          pollRef.current = null
          navigate('/admin/login')
        }
      }
    }, 3000)
  }

  const cancelRun = async () => {
    if (!activeRunId) return
    try {
      await api.delete(`/api/v1/admin/training-agent/runs/${activeRunId}`)
    } catch {
      // ignore
    }
  }

  // ── History tab ──

  const loadRuns = async () => {
    setLoadingRuns(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (filterVertical) params.set('vertical', filterVertical)
      if (filterStatus) params.set('status', filterStatus)
      params.set('limit', '50')
      const res = await api.get(`/api/v1/admin/training-agent/runs?${params.toString()}`)
      setRuns(res.data.runs || [])
      setRunsTotal(res.data.total || 0)
    } catch (err: any) {
      if (err.response?.status === 401) navigate('/admin/login')
      setError(err.response?.data?.detail || 'Error cargando historial')
    } finally {
      setLoadingRuns(false)
    }
  }

  const toggleRunDetail = async (runId: string) => {
    if (expandedRun === runId) {
      setExpandedRun(null)
      setExpandedRunDetail(null)
      return
    }
    try {
      const res = await api.get(`/api/v1/admin/training-agent/runs/${runId}`)
      setExpandedRunDetail(res.data)
      setExpandedRun(runId)
    } catch {
      // ignore
    }
  }

  // ── Prompts tab ──

  const loadPrompts = async () => {
    setLoadingPrompts(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (promptFilterVertical) params.set('vertical', promptFilterVertical)
      if (promptFilterComplexity) params.set('complexity', promptFilterComplexity)
      if (promptFilterHasKits === 'true') params.set('has_kits', 'true')
      else if (promptFilterHasKits === 'false') params.set('has_kits', 'false')
      params.set('limit', '50')
      const res = await api.get(`/api/v1/admin/training-agent/prompts?${params.toString()}`)
      setPrompts(res.data.prompts || [])
      setPromptsTotal(res.data.total || 0)
    } catch (err: any) {
      if (err.response?.status === 401) navigate('/admin/login')
      setError(err.response?.data?.detail || 'Error cargando prompts')
    } finally {
      setLoadingPrompts(false)
    }
  }

  // ── Intelligence tab ──

  const loadIntelligence = async () => {
    setLoadingIntelligence(true)
    try {
      const res = await api.get('/api/v1/admin/training-agent/intelligence')
      setIntelligence(res.data)
    } catch (err: any) {
      if (err.response?.status === 401) navigate('/admin/login')
    } finally {
      setLoadingIntelligence(false)
    }
  }

  // ── Render ──

  const maturityColor = (score: number) => {
    if (score >= 70) return 'text-green-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-red-500'
  }

  const maturityLabel = (score: number) => {
    if (score >= 80) return 'Avanzado'
    if (score >= 60) return 'Intermedio'
    if (score >= 30) return 'Aprendiendo'
    return 'Inicial'
  }

  const tabs = [
    { id: 'execute' as Tab, label: 'Ejecutar' },
    { id: 'history' as Tab, label: 'Historial' },
    { id: 'prompts' as Tab, label: 'Prompts' },
    { id: 'intelligence' as Tab, label: 'Inteligencia' },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar currentPage="training-agent" onLogout={handleLogout} />

      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <FlaskConical className="w-8 h-8 text-purple-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Training Agent</h1>
              <p className="text-gray-600">Generacion sintetica de prompts y evaluacion del pipeline</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                tab === t.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Tab: Ejecutar */}
        {tab === 'execute' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold mb-4">Nuevo Entrenamiento</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vertical</label>
                  <select
                    value={vertical}
                    onChange={e => setVertical(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled={!!activeRunId}
                  >
                    {VERTICALS.map(v => (
                      <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad de prompts</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={numPrompts}
                    onChange={e => setNumPrompts(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled={!!activeRunId}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Complejidad</label>
                  <select
                    value={complexity}
                    onChange={e => setComplexity(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled={!!activeRunId}
                  >
                    <option value="">Todas</option>
                    {COMPLEXITIES.map(c => (
                      <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>

              {!activeRunId ? (
                <button
                  onClick={startTraining}
                  disabled={isStarting}
                  className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors"
                >
                  <Play className="w-4 h-4" />
                  {isStarting ? 'Iniciando...' : 'Iniciar Entrenamiento'}
                </button>
              ) : (
                <button
                  onClick={cancelRun}
                  className="flex items-center gap-2 bg-red-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Cancelar
                </button>
              )}
            </div>

            {/* Live progress */}
            {liveProgress && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700">Progreso</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[liveProgress.status] || 'bg-gray-100'}`}>
                    {liveProgress.status}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                  <div
                    className="bg-purple-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${liveProgress.total > 0 ? (liveProgress.completed / liveProgress.total) * 100 : 0}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{liveProgress.completed} / {liveProgress.total} prompts procesados</span>
                  <span>{liveProgress.total > 0 ? Math.round((liveProgress.completed / liveProgress.total) * 100) : 0}%</span>
                </div>
                {liveProgress.current_prompt && (
                  <p className="mt-2 text-xs text-gray-500 truncate">
                    Procesando: {liveProgress.current_prompt}
                  </p>
                )}
                {liveProgress.errors.length > 0 && (
                  <div className="mt-3 p-2 bg-red-50 rounded text-xs text-red-600">
                    Ultimo error: {liveProgress.errors[liveProgress.errors.length - 1]}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab: Historial */}
        {tab === 'history' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex gap-3 items-end">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Vertical</label>
                <select
                  value={filterVertical}
                  onChange={e => setFilterVertical(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                >
                  <option value="">Todos</option>
                  {VERTICALS.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Estado</label>
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                >
                  <option value="">Todos</option>
                  <option value="completed">Completed</option>
                  <option value="running">Running</option>
                  <option value="failed">Failed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <button
                onClick={loadRuns}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 border border-gray-300 rounded-lg"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Filtrar
              </button>
            </div>

            {/* Runs table */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              {loadingRuns ? (
                <div className="p-8 text-center text-gray-400">Cargando...</div>
              ) : runs.length === 0 ? (
                <div className="p-8 text-center text-gray-400">No hay ejecuciones registradas</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-gray-500 w-8"></th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">Vertical</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">Estado</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">Specs</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">Builds</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">Smoke</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">Patterns</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">Costo</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">Duracion</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {runs.map(run => (
                      <>
                        <tr
                          key={run.id}
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => toggleRunDetail(run.id)}
                        >
                          <td className="px-4 py-3">
                            {expandedRun === run.id ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                          </td>
                          <td className="px-4 py-3 font-medium capitalize">{run.vertical}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[run.status] || 'bg-gray-100'}`}>
                              {run.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs">{run.specs_generated || 0}</td>
                          <td className="px-4 py-3 text-xs">
                            <span className="text-green-600">{run.builds_successful || 0}</span>
                            {(run.builds_failed || 0) > 0 && <span className="text-red-500 ml-1">/ {run.builds_failed} fail</span>}
                          </td>
                          <td className="px-4 py-3 text-xs">
                            <span className="text-green-600">{run.smoke_tests_passed || 0}</span>
                            {(run.smoke_tests_failed || 0) > 0 && <span className="text-red-500 ml-1">/ {run.smoke_tests_failed} fail</span>}
                          </td>
                          <td className="px-4 py-3 text-xs text-purple-600">{run.patterns_discovered || 0}</td>
                          <td className="px-4 py-3 text-gray-600 text-xs">${run.total_cost_usd.toFixed(4)}</td>
                          <td className="px-4 py-3 text-gray-600 text-xs">
                            {run.duration_seconds ? `${run.duration_seconds}s` : '-'}
                          </td>
                        </tr>
                        {expandedRun === run.id && expandedRunDetail?.results && (
                          <tr key={`${run.id}-detail`}>
                            <td colSpan={9} className="px-4 py-3 bg-gray-50">
                              <div className="space-y-2">
                                <h4 className="text-xs font-semibold text-gray-500 uppercase">Resultados</h4>
                                <div className="grid grid-cols-1 gap-1">
                                  {expandedRunDetail.results.map(r => (
                                    <div key={r.id} className="flex items-center gap-3 text-xs py-1 px-2 bg-white rounded border">
                                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[r.status] || ''}`}>{r.status}</span>
                                      <span className="text-gray-600">{r.inferred_poc_type || '-'}</span>
                                      <span className="text-gray-400">{r.endpoint_count} ep</span>
                                      {r.spec_quality_score != null && (
                                        <span className={`font-medium ${r.spec_quality_score >= 70 ? 'text-green-600' : r.spec_quality_score >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                                          {r.spec_quality_score.toFixed(0)}pts
                                        </span>
                                      )}
                                      {r.build_success != null && (
                                        <span className={r.build_success ? 'text-green-600' : 'text-red-500'}>
                                          build:{r.build_success ? 'ok' : 'fail'}
                                        </span>
                                      )}
                                      {r.smoke_test_success != null && (
                                        <span className={r.smoke_test_success ? 'text-green-600' : 'text-red-500'}>
                                          smoke:{r.smoke_test_success ? 'ok' : 'fail'}
                                        </span>
                                      )}
                                      <span className="text-gray-400">{r.duration_seconds}s</span>
                                      {r.has_integration_kits && <span className="text-purple-500">+kits</span>}
                                      {r.fixes_applied.length > 0 && <span className="text-blue-500">{r.fixes_applied.length} fixes</span>}
                                      {r.error_message && <span className="text-red-500 truncate max-w-xs">{r.error_message}</span>}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              )}
              {runsTotal > 50 && (
                <div className="px-4 py-2 bg-gray-50 border-t text-xs text-gray-500">
                  Mostrando 50 de {runsTotal} ejecuciones
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: Prompts */}
        {tab === 'prompts' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex gap-3 items-end">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Vertical</label>
                <select
                  value={promptFilterVertical}
                  onChange={e => setPromptFilterVertical(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                >
                  <option value="">Todos</option>
                  {VERTICALS.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Complejidad</label>
                <select
                  value={promptFilterComplexity}
                  onChange={e => setPromptFilterComplexity(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                >
                  <option value="">Todas</option>
                  {COMPLEXITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Kits</label>
                <select
                  value={promptFilterHasKits}
                  onChange={e => setPromptFilterHasKits(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                >
                  <option value="">Todos</option>
                  <option value="true">Con kits</option>
                  <option value="false">Sin kits</option>
                </select>
              </div>
              <button
                onClick={loadPrompts}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 border border-gray-300 rounded-lg"
              >
                <Filter className="w-3.5 h-3.5" /> Filtrar
              </button>
            </div>

            {/* Prompts list */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              {loadingPrompts ? (
                <div className="p-8 text-center text-gray-400">Cargando...</div>
              ) : prompts.length === 0 ? (
                <div className="p-8 text-center text-gray-400">No hay prompts generados</div>
              ) : (
                <div className="divide-y">
                  {prompts.map(p => (
                    <div key={p.id} className="px-4 py-3 hover:bg-gray-50">
                      <div
                        className="flex items-start gap-3 cursor-pointer"
                        onClick={() => setExpandedPrompt(expandedPrompt === p.id ? null : p.id)}
                      >
                        <div className="mt-0.5">
                          {expandedPrompt === p.id ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm text-gray-900 ${expandedPrompt === p.id ? '' : 'truncate'}`}>
                            {p.prompt_text}
                          </p>
                          <div className="flex gap-2 mt-1">
                            <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded capitalize">{p.vertical}</span>
                            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded capitalize">{p.complexity}</span>
                            {p.sub_domain && <span className="text-xs text-gray-400">{p.sub_domain}</span>}
                            {p.kit_count > 0 && (
                              <span className="text-xs px-2 py-0.5 bg-purple-50 text-purple-700 rounded">
                                {p.kit_count} kit{p.kit_count > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          {p.created_at ? new Date(p.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }) : ''}
                        </span>
                      </div>
                      {expandedPrompt === p.id && p.integration_kits.length > 0 && (
                        <div className="mt-2 ml-7 flex gap-1 flex-wrap">
                          {p.integration_kits.map(kit => (
                            <span key={kit} className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">{kit}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {promptsTotal > 50 && (
                <div className="px-4 py-2 bg-gray-50 border-t text-xs text-gray-500">
                  Mostrando 50 de {promptsTotal} prompts
                </div>
              )}
            </div>
          </div>
        )}
        {/* Tab: Inteligencia */}
        {tab === 'intelligence' && (
          <div className="space-y-6">
            {loadingIntelligence ? (
              <div className="p-8 text-center text-gray-400">Cargando datos de inteligencia...</div>
            ) : !intelligence ? (
              <div className="bg-white rounded-xl shadow-sm border p-8 text-center text-gray-400">
                No hay datos. Ejecuta entrenamientos para ver la evolucion.
              </div>
            ) : (
              <>
                {/* Maturity Score */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-semibold text-gray-500 uppercase">Nivel de Inteligencia del Sistema</h2>
                      <p className="text-xs text-gray-400 mt-1">
                        Basado en datos de entrenamiento, calidad de specs, tasa de builds exitosos y patrones aprendidos
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`text-5xl font-bold ${maturityColor(intelligence.maturity_score)}`}>
                        {intelligence.maturity_score.toFixed(0)}
                      </div>
                      <div className={`text-sm font-medium ${maturityColor(intelligence.maturity_score)}`}>
                        {maturityLabel(intelligence.maturity_score)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-1000 ${
                        intelligence.maturity_score >= 70 ? 'bg-green-500' :
                        intelligence.maturity_score >= 40 ? 'bg-yellow-500' : 'bg-red-400'
                      }`}
                      style={{ width: `${Math.min(100, intelligence.maturity_score)}%` }}
                    />
                  </div>
                </div>

                {/* Global Stats */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {[
                    { label: 'Runs completados', value: intelligence.global_stats.total_runs },
                    { label: 'Prompts testeados', value: intelligence.global_stats.total_prompts },
                    { label: 'Specs evaluados', value: intelligence.global_stats.total_results },
                    { label: 'Calidad promedio', value: `${intelligence.global_stats.avg_spec_quality}/100`, color: intelligence.global_stats.avg_spec_quality >= 70 ? 'text-green-600' : 'text-yellow-600' },
                    { label: 'Build success rate', value: `${intelligence.global_stats.build_success_rate}%`, color: intelligence.global_stats.build_success_rate >= 70 ? 'text-green-600' : 'text-yellow-600' },
                    { label: 'Patrones aprendidos', value: intelligence.global_stats.total_patterns, color: 'text-purple-600' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-xl shadow-sm border p-4 text-center">
                      <div className={`text-2xl font-bold ${(stat as any).color || 'text-gray-900'}`}>{stat.value}</div>
                      <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Per-Vertical Evolution */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">Evolucion por Vertical</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(intelligence.vertical_evolution || {}).map(([vertical, data]: [string, any]) => (
                      <div key={vertical} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold capitalize">{vertical}</h4>
                          <span className={`text-lg font-bold ${
                            data.current_success_rate >= 0.7 ? 'text-green-600' :
                            data.current_success_rate >= 0.4 ? 'text-yellow-600' : 'text-gray-400'
                          }`}>
                            {data.current_success_rate > 0 ? `${(data.current_success_rate * 100).toFixed(0)}%` : '-'}
                          </span>
                        </div>
                        <div className="flex gap-4 text-xs text-gray-500 mb-2">
                          <span>{data.total_runs} runs</span>
                          <span>{data.total_prompts} prompts</span>
                          <span>score: {data.avg_score > 0 ? data.avg_score.toFixed(0) : '-'}</span>
                        </div>
                        {/* Mini trend bars */}
                        {data.history.length > 0 && (
                          <div className="flex gap-0.5 items-end h-8 mt-2">
                            {data.history.slice(-10).map((h: any, i: number) => (
                              <div
                                key={i}
                                className={`flex-1 rounded-t ${
                                  h.success_rate >= 70 ? 'bg-green-400' :
                                  h.success_rate >= 40 ? 'bg-yellow-400' : 'bg-red-300'
                                }`}
                                style={{ height: `${Math.max(4, h.success_rate * 0.3)}px` }}
                                title={`${h.date}: ${h.success_rate}%`}
                              />
                            ))}
                          </div>
                        )}
                        {data.alerts.length > 0 && (
                          <div className="mt-2 text-xs text-red-500">
                            {data.alerts[data.alerts.length - 1].message}
                          </div>
                        )}
                        {data.guardrails.length > 0 && (
                          <div className="mt-2">
                            <span className="text-xs text-purple-600 font-medium">{data.guardrails.length} guardrails activos</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Patterns Learned */}
                {intelligence.top_patterns.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border p-6">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Patrones Aprendidos (Top 15)</h3>
                    <div className="space-y-1">
                      {intelligence.top_patterns.map((p: any, i: number) => (
                        <div key={i} className="flex items-center gap-3 text-xs py-1.5 px-2 rounded hover:bg-gray-50">
                          <span className={`px-2 py-0.5 rounded font-medium ${
                            p.type === 'smoke_test_failure' ? 'bg-red-100 text-red-700' :
                            p.type === 'build_fix' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>{p.type}</span>
                          <span className="text-gray-600 truncate flex-1">{p.signature}</span>
                          <span className="text-gray-400 whitespace-nowrap">x{p.occurrences}</span>
                          {p.fix && <span className="text-green-600 truncate max-w-[200px]">{p.fix}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Trend Timeline */}
                {intelligence.trends.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border p-6">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Timeline de Entrenamientos</h3>
                    <div className="space-y-2">
                      {intelligence.trends.slice(-20).reverse().map((t: any, i: number) => (
                        <div key={i} className="flex items-center gap-3 text-xs py-1 border-b border-gray-50">
                          <span className="text-gray-400 w-20">{t.date}</span>
                          <span className="font-medium capitalize w-20">{t.vertical}</span>
                          <span className="text-gray-600">{t.specs} specs</span>
                          <span className="text-green-600">{t.builds_ok} ok</span>
                          {t.builds_fail > 0 && <span className="text-red-500">{t.builds_fail} fail</span>}
                          <span className={`font-medium ${t.success_rate >= 70 ? 'text-green-600' : t.success_rate >= 40 ? 'text-yellow-600' : 'text-red-500'}`}>
                            {t.success_rate}%
                          </span>
                          {t.patterns > 0 && <span className="text-purple-500">{t.patterns} patterns</span>}
                          <span className="text-gray-400">${t.cost_usd}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
