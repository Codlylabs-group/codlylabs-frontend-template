import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Building2, FileText, Activity, AlertTriangle, Gauge, ShieldCheck, Clock3, RefreshCw, DollarSign } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts'
import { api } from '../services/api'
import { useAppSelector, useAppDispatch } from '../store/hooks'
import { clearAuth } from '../store/userSlice'
import AdminSidebar from '../components/AdminSidebar'

interface AdminStats {
  users: {
    total: number
    active: number
    verified: number
  }
  organizations: {
    total: number
  }
  sessions: {
    onboarding: number
    discovery: number
    completed: number
  }
  timestamp: string
}

interface PageStats {
  home_visits: number
  unique_sessions: number
  top_pages: Array<{ path: string; views: number }>
  period_days: number
}

interface PipelineTtfpStats {
  samples: number
  average_seconds: number | null
  p50_seconds: number | null
  p95_seconds: number | null
}

interface PipelineSlo {
  target: number
  current: number | null
  met: boolean
}

interface PipelineDashboardResponse {
  window_hours: number
  generated_at: string
  events_summary: Record<string, number>
  kpis: {
    time_to_first_preview_seconds: PipelineTtfpStats
    time_prompt_to_visible_change_seconds: {
      available: boolean
      reason?: string
    }
    build_success_rate: number | null
    preview_crash_rate: number | null
    deploy_success_rate: number | null
    rollback_rate: number | null
    auto_heal_success_rate: number | null
  }
  slos: Record<string, PipelineSlo>
}

interface IncidentItem {
  timestamp: string
  event_name: string
  poc_id: string | null
  message: string
}

interface IncidentCategory {
  category: string
  count: number
  recent: IncidentItem[]
}

interface PipelineIncidentsResponse {
  window_hours: number
  generated_at: string
  total_incidents: number
  categories: IncidentCategory[]
}

interface Phase1Criterion {
  target: number
  current: number | null
  current_percent?: number | null
  met: boolean
}

interface Phase1StatusResponse {
  generated_at: string
  phase1_targets: Record<string, Phase1Criterion>
  phase1_exit_met: boolean
  baseline_window: {
    start: string
    end: string
    metrics: Record<string, number | null>
  }
  current_window: {
    start: string
    end: string
    metrics: Record<string, number | null>
  }
}

interface Phase4Criterion {
  target: number
  current: number | null
  met: boolean
}

interface Phase4StatusResponse {
  generated_at: string
  phase4_targets: Record<string, Phase4Criterion>
  phase4_exit_met: boolean
  phase4_release_ready: boolean
  missing_data_metrics: string[]
  current_window: {
    start: string
    end: string
    metrics: Record<string, number | null>
  }
}

interface LlmOrgRow {
  id: string
  name: string
  plan: string
  budget_usd: number
  spent_usd: number
  remaining_usd: number
  usage_percentage: number
  is_near_limit: boolean
}

interface LlmAlert {
  org_name: string
  usage_percentage: number
  plan: string
}

interface LlmCacheStats {
  available: boolean
  hits?: number
  misses?: number
  hit_rate?: number
  cached_keys?: number
}

interface LlmUsageSummaryResponse {
  total_organizations: number
  total_budget_usd: number
  total_spent_usd: number
  total_remaining_usd: number
  platform_usage_percentage: number
  real_cost_usd?: number
  real_total_calls?: number
  real_total_tokens?: number
  organizations: LlmOrgRow[]
  alerts: LlmAlert[]
  by_plan: Record<string, { count: number; total_budget: number; total_spent: number }>
  cache_stats?: LlmCacheStats
  generated_at: string
}

interface MetricCardProps {
  title: string
  value: string
  hint: string
  good?: boolean | null
}

function prettifyMetricName(value: string) {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function MetricCard({ title, value, hint, good }: MetricCardProps) {
  const badgeClass =
    good === undefined || good === null
      ? 'bg-gray-100 text-gray-600'
      : good
        ? 'bg-green-100 text-green-700'
        : 'bg-red-100 text-red-700'
  const badgeText = good === undefined || good === null ? 'N/A' : good ? 'OK' : 'Alerta'

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
          <p className="text-xs text-gray-500 mt-2">{hint}</p>
        </div>
        <span className={`text-[11px] px-2 py-1 rounded ${badgeClass}`}>
          {badgeText}
        </span>
      </div>
    </div>
  )
}

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const userData = useAppSelector((state) => state.user.user)

  const [stats, setStats] = useState<AdminStats | null>(null)
  const [pageStats, setPageStats] = useState<PageStats | null>(null)
  const [pipelineDashboard, setPipelineDashboard] = useState<PipelineDashboardResponse | null>(null)
  const [pipelineIncidents, setPipelineIncidents] = useState<PipelineIncidentsResponse | null>(null)
  const [phase1Status, setPhase1Status] = useState<Phase1StatusResponse | null>(null)
  const [phase4Status, setPhase4Status] = useState<Phase4StatusResponse | null>(null)
  const [llmUsage, setLlmUsage] = useState<LlmUsageSummaryResponse | null>(null)
  const [llmBreakdown, setLlmBreakdown] = useState<any>(null)
  const [funnelStats, setFunnelStats] = useState<any>(null)
  const [previewResources, setPreviewResources] = useState<any>(null)
  const [billingOverview, setBillingOverview] = useState<any>(null)
  const [croInsights, setCroInsights] = useState<any>(null)
  const [croLoading, setCroLoading] = useState(false)
  const [croError, setCroError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [pipelineHours, setPipelineHours] = useState(24)
  const [incidentHours, setIncidentHours] = useState(24 * 7)
  const [error, setError] = useState('')
  const [pipelineError, setPipelineError] = useState('')

  const windowOptions = [24, 72, 168, 336, 720]

  const incidentChartData = useMemo(() => {
    if (!pipelineIncidents?.categories) return []
    return pipelineIncidents.categories.map((item) => ({
      name: prettifyMetricName(item.category),
      count: item.count,
    }))
  }, [pipelineIncidents])

  const eventSummaryData = useMemo(() => {
    if (!pipelineDashboard?.events_summary) return []
    return Object.entries(pipelineDashboard.events_summary)
      .map(([eventName, count]) => ({
        eventName,
        eventLabel: prettifyMetricName(eventName),
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }, [pipelineDashboard])

  const phase1WindowComparisonData = useMemo(() => {
    if (!phase1Status) return []
    const baseline = phase1Status.baseline_window.metrics || {}
    const current = phase1Status.current_window.metrics || {}
    const metricNames = Array.from(new Set([...Object.keys(baseline), ...Object.keys(current)])).sort()

    return metricNames.map((metricName) => {
      const baselineValue = baseline[metricName]
      const currentValue = current[metricName]
      const hasDelta =
        typeof baselineValue === 'number' &&
        typeof currentValue === 'number' &&
        Number.isFinite(baselineValue) &&
        Number.isFinite(currentValue)

      return {
        metricName,
        baselineValue,
        currentValue,
        delta: hasDelta ? currentValue - baselineValue : null,
      }
    })
  }, [phase1Status])

  const formatPercent = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'N/A'
    return `${(value * 100).toFixed(1)}%`
  }

  const formatSeconds = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'N/A'
    return `${value.toFixed(1)}s`
  }

  const formatRawMetric = (metricName: string, value: number | null | undefined) => {
    if (value === null || value === undefined) return 'N/A'
    if (metricName.includes('rate') || metricName.includes('reduction')) {
      return formatPercent(value)
    }
    return Number.isInteger(value) ? value.toLocaleString() : value.toFixed(2)
  }

  useEffect(() => {
    if (!userData) {
      navigate('/admin/login')
      return
    }

    loadAdminData()
  }, [userData, navigate, pipelineHours, incidentHours])

  const loadCroInsights = async (forceRefresh = false) => {
    setCroLoading(true)
    setCroError('')
    try {
      const res = await api.get(`/api/v1/analytics/cro-insights?days=7&force_refresh=${forceRefresh}`)
      setCroInsights(res.data)
    } catch (err: any) {
      setCroError(err?.response?.data?.detail || 'Error generando insights CRO')
    } finally {
      setCroLoading(false)
    }
  }

  useEffect(() => {
    if (pageStats && !croInsights && !croLoading) {
      loadCroInsights()
    }
  }, [pageStats])

  const loadAdminData = async () => {
    setIsLoading(true)
    setError('')
    setPipelineError('')

    try {
      const results = await Promise.allSettled([
        api.get('/api/v1/admin/stats'),
        api.get('/api/v1/analytics/stats/pages?days=30'),
        api.get(`/api/v1/analytics/pipeline/dashboard?hours=${pipelineHours}`),
        api.get(`/api/v1/analytics/pipeline/incidents?hours=${incidentHours}`),
        api.get('/api/v1/analytics/pipeline/phase1-status?baseline_hours=72&current_hours=72'),
        api.get(`/api/v1/analytics/pipeline/phase4-status?current_hours=${pipelineHours}`),
        api.get('/api/v1/admin/llm-usage-summary'),
        api.get('/api/v1/plg/funnel/stats?days=30'),
        api.get('/api/v1/poc-preview/system-summary'),
        api.get('/api/v1/billing/admin/overview'),
        api.get('/api/v1/admin/llm-usage/breakdown?days=30'),
      ])

      const [
        statsResult,
        pageStatsResult,
        pipelineDashboardResult,
        pipelineIncidentsResult,
        phase1Result,
        phase4Result,
        llmUsageResult,
        funnelStatsResult,
        previewResourcesResult,
        billingOverviewResult,
        llmBreakdownResult,
      ] = results
      let nextError = ''

      if (statsResult.status === 'fulfilled') {
        setStats(statsResult.value.data)
      } else {
        nextError = statsResult.reason?.response?.data?.detail || 'Failed to load admin stats'
      }

      if (pageStatsResult.status === 'fulfilled') {
        setPageStats(pageStatsResult.value.data)
      } else if (!nextError) {
        nextError = pageStatsResult.reason?.response?.data?.detail || 'Failed to load page analytics'
      }
      setError(nextError)

      if (pipelineDashboardResult.status === 'fulfilled') {
        setPipelineDashboard(pipelineDashboardResult.value.data)
      } else {
        setPipelineError('No se pudo cargar el dashboard de pipeline.')
      }

      if (pipelineIncidentsResult.status === 'fulfilled') {
        setPipelineIncidents(pipelineIncidentsResult.value.data)
      } else {
        setPipelineError((previous) => previous || 'No se pudo cargar el tablero de incidentes.')
      }

      if (phase1Result.status === 'fulfilled') {
        setPhase1Status(phase1Result.value.data)
      } else {
        setPipelineError((previous) => previous || 'No se pudo cargar el estado de fase 1.')
      }

      if (phase4Result.status === 'fulfilled') {
        setPhase4Status(phase4Result.value.data)
      } else {
        setPipelineError((previous) => previous || 'No se pudo cargar el estado de fase 4.')
      }

      if (llmUsageResult.status === 'fulfilled') {
        setLlmUsage(llmUsageResult.value.data)
      }

      if (funnelStatsResult.status === 'fulfilled') {
        setFunnelStats(funnelStatsResult.value.data)
      }

      if (previewResourcesResult.status === 'fulfilled') {
        setPreviewResources(previewResourcesResult.value.data)
      }

      if (billingOverviewResult.status === 'fulfilled') {
        setBillingOverview(billingOverviewResult.value.data)
      }

      if (llmBreakdownResult.status === 'fulfilled') {
        setLlmBreakdown(llmBreakdownResult.value.data)
      }
    } catch (err: any) {
      console.error('Error loading admin data:', err)
      setError(err.response?.data?.detail || 'Failed to load data')

      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/admin/login')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    dispatch(clearAuth())
    navigate('/admin/login')
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar currentPage="dashboard" onLogout={handleLogout} />

      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Panel Principal</h1>
          <p className="text-gray-600">Bienvenido, {userData?.full_name}</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Stats Cards */}
        {!isLoading && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Users */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.users.total}</p>
                  <p className="text-xs text-green-600 mt-1">{stats.users.active} activos</p>
                </div>
                <Users className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </div>

            {/* Organizations */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Organizaciones</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.organizations.total}</p>
                </div>
                <Building2 className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </div>

            {/* Total Sessions */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Sesiones</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats.sessions.onboarding + stats.sessions.discovery}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.sessions.onboarding} onboarding, {stats.sessions.discovery} discovery
                  </p>
                </div>
                <Activity className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </div>

            {/* Completed Sessions */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completadas</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.sessions.completed}</p>
                </div>
                <FileText className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </div>
          </div>
        )}

        {/* Pipeline KPIs & Metrics */}
        {!isLoading && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Gauge className="w-5 h-5 text-brand-600" />
                  KPIs Operativos del Pipeline
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Métricas end-to-end de generación, build, preview, rollback e incidentes.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label className="text-sm text-gray-600">Ventana KPI</label>
                <select
                  value={pipelineHours}
                  onChange={(event) => setPipelineHours(Number(event.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  {windowOptions.map((hours) => (
                    <option key={hours} value={hours}>
                      {hours}h
                    </option>
                  ))}
                </select>
                <label className="text-sm text-gray-600">Ventana incidentes</label>
                <select
                  value={incidentHours}
                  onChange={(event) => setIncidentHours(Number(event.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  {windowOptions.map((hours) => (
                    <option key={hours} value={hours}>
                      {hours}h
                    </option>
                  ))}
                </select>
                <button
                  onClick={loadAdminData}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50"
                >
                  <RefreshCw className="w-4 h-4" />
                  Actualizar
                </button>
              </div>
            </div>

            {pipelineError && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
                {pipelineError}
              </div>
            )}

            {pipelineDashboard ? (
              <>
                <div className="mb-6 p-3 bg-brand-50 border border-brand-100 rounded-lg flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div className="text-xs text-brand-800">
                    Última actualización KPI: {new Date(pipelineDashboard.generated_at).toLocaleString()}
                  </div>
                  <div className="text-xs text-brand-700">
                    Ventana KPIs: {pipelineDashboard.window_hours}h
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                  <MetricCard
                    title="Build success rate"
                    value={formatPercent(pipelineDashboard.kpis.build_success_rate)}
                    hint={`SLO >= ${(pipelineDashboard.slos.build_success_rate?.target ?? 0) * 100}%`}
                    good={pipelineDashboard.slos.build_success_rate?.met}
                  />
                  <MetricCard
                    title="Preview crash rate"
                    value={formatPercent(pipelineDashboard.kpis.preview_crash_rate)}
                    hint="Objetivo <= 10%"
                    good={
                      pipelineDashboard.kpis.preview_crash_rate !== null
                        ? pipelineDashboard.kpis.preview_crash_rate <= 0.1
                        : null
                    }
                  />
                  <MetricCard
                    title="Deploy success rate"
                    value={formatPercent(pipelineDashboard.kpis.deploy_success_rate)}
                    hint="Deploy completados / iniciados"
                    good={
                      pipelineDashboard.kpis.deploy_success_rate !== null
                        ? pipelineDashboard.kpis.deploy_success_rate >= 0.9
                        : null
                    }
                  />
                  <MetricCard
                    title="Auto-heal success rate"
                    value={formatPercent(pipelineDashboard.kpis.auto_heal_success_rate)}
                    hint="Fixes automáticos exitosos"
                    good={
                      pipelineDashboard.kpis.auto_heal_success_rate !== null
                        ? pipelineDashboard.kpis.auto_heal_success_rate >= 0.8
                        : null
                    }
                  />
                  <MetricCard
                    title="Rollback rate"
                    value={formatPercent(pipelineDashboard.kpis.rollback_rate)}
                    hint="Rollback por generación iniciada"
                    good={
                      pipelineDashboard.kpis.rollback_rate !== null
                        ? pipelineDashboard.kpis.rollback_rate <= 0.25
                        : null
                    }
                  />
                  <MetricCard
                    title="TTFP promedio"
                    value={formatSeconds(pipelineDashboard.kpis.time_to_first_preview_seconds.average_seconds)}
                    hint={`Muestras: ${pipelineDashboard.kpis.time_to_first_preview_seconds.samples}`}
                    good={
                      pipelineDashboard.kpis.time_to_first_preview_seconds.average_seconds !== null
                        ? pipelineDashboard.kpis.time_to_first_preview_seconds.average_seconds <= 180
                        : null
                    }
                  />
                  <MetricCard
                    title="TTFP p50"
                    value={formatSeconds(pipelineDashboard.kpis.time_to_first_preview_seconds.p50_seconds)}
                    hint={`SLO <= ${pipelineDashboard.slos.time_to_first_preview_seconds_p50?.target ?? 180}s`}
                    good={pipelineDashboard.slos.time_to_first_preview_seconds_p50?.met}
                  />
                  <MetricCard
                    title="TTFP p95"
                    value={formatSeconds(pipelineDashboard.kpis.time_to_first_preview_seconds.p95_seconds)}
                    hint="Objetivo interno <= 300s"
                    good={
                      pipelineDashboard.kpis.time_to_first_preview_seconds.p95_seconds !== null
                        ? pipelineDashboard.kpis.time_to_first_preview_seconds.p95_seconds <= 300
                        : null
                    }
                  />
                  <MetricCard
                    title="Prompt -> cambio visible"
                    value={
                      pipelineDashboard.kpis.time_prompt_to_visible_change_seconds.available
                        ? 'Disponible'
                        : 'Pendiente'
                    }
                    hint={
                      pipelineDashboard.kpis.time_prompt_to_visible_change_seconds.reason ||
                      'Requiere eventos prompt_submitted/visible_change'
                    }
                    good={pipelineDashboard.kpis.time_prompt_to_visible_change_seconds.available}
                  />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3">SLOs activos</h3>
                    {Object.entries(pipelineDashboard.slos).length > 0 ? (
                      <div className="space-y-2">
                        {Object.entries(pipelineDashboard.slos).map(([name, slo]) => (
                          <div
                            key={name}
                            className={`p-3 rounded-lg border ${slo.met ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-sm font-medium text-gray-900">
                                {prettifyMetricName(name)}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded ${slo.met ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {slo.met ? 'Cumplido' : 'No cumplido'}
                              </span>
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              Target: {name.includes('seconds') ? `${slo.target}s` : `${(slo.target * 100).toFixed(1)}%`} ·
                              Actual: {name.includes('seconds') ? formatSeconds(slo.current) : formatPercent(slo.current)}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No hay SLOs configurados.</p>
                    )}
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-blue-600" />
                      Gate Fase 1
                    </h3>
                    {phase1Status ? (
                      <>
                        <div className={`mb-3 p-3 rounded-lg border ${phase1Status.phase1_exit_met ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                          <div className="text-sm font-semibold">
                            {phase1Status.phase1_exit_met ? 'Fase 1 cumplida' : 'Fase 1 pendiente'}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            Ventana baseline: {new Date(phase1Status.baseline_window.start).toLocaleString()} - {new Date(phase1Status.baseline_window.end).toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-600">
                            Ventana actual: {new Date(phase1Status.current_window.start).toLocaleString()} - {new Date(phase1Status.current_window.end).toLocaleString()}
                          </div>
                        </div>
                        <div className="space-y-2">
                          {Object.entries(phase1Status.phase1_targets).map(([name, criterion]) => (
                            <div key={name} className="p-2 border border-gray-200 rounded">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-medium text-gray-900">{prettifyMetricName(name)}</span>
                                <span className={`text-[11px] px-2 py-0.5 rounded ${criterion.met ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                  {criterion.met ? 'OK' : 'FAIL'}
                                </span>
                              </div>
                              <div className="text-xs text-gray-600 mt-1">
                                Target: {formatPercent(criterion.target)} ·
                                Actual: {typeof criterion.current_percent === 'number' ? `${criterion.current_percent.toFixed(1)}%` : formatPercent(criterion.current)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-gray-500">Sin datos de fase 1 disponibles.</p>
                    )}
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Gate Fase 4
                    </h3>
                    {phase4Status ? (
                      <>
                        <div className={`mb-3 p-3 rounded-lg border ${phase4Status.phase4_exit_met ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                          <div className="text-sm font-semibold">
                            {phase4Status.phase4_release_ready ? 'Release ready' : 'Release no listo'}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            Ventana actual: {new Date(phase4Status.current_window.start).toLocaleString()} - {new Date(phase4Status.current_window.end).toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-600">
                            Cálculo: {new Date(phase4Status.generated_at).toLocaleString()}
                          </div>
                        </div>
                        <div className="space-y-2">
                          {Object.entries(phase4Status.phase4_targets).map(([name, criterion]) => {
                            const isSeconds = name.includes('seconds')
                            const targetText = isSeconds
                              ? `${criterion.target}s`
                              : `${(criterion.target * 100).toFixed(1)}%`
                            const currentText = criterion.current === null
                              ? 'N/A'
                              : isSeconds
                                ? `${criterion.current.toFixed(1)}s`
                                : `${(criterion.current * 100).toFixed(1)}%`

                            return (
                              <div key={name} className="p-2 border border-gray-200 rounded">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-xs font-medium text-gray-900">{prettifyMetricName(name)}</span>
                                  <span className={`text-[11px] px-2 py-0.5 rounded ${criterion.met ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {criterion.met ? 'OK' : 'FAIL'}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-600 mt-1">
                                  Target: {targetText} · Actual: {currentText}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                        {phase4Status.missing_data_metrics.length > 0 && (
                          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                            Faltan datos en: {phase4Status.missing_data_metrics.map(prettifyMetricName).join(', ')}
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-gray-500">Sin datos de fase 4 disponibles.</p>
                    )}
                  </div>
                </div>

                {phase1Status && (
                  <div className="mb-6 border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-1">Comparativa Baseline vs Actual</h3>
                    <p className="text-xs text-gray-500 mb-3">
                      Último cálculo: {new Date(phase1Status.generated_at).toLocaleString()}
                    </p>
                    {phase1WindowComparisonData.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead>
                            <tr className="text-left text-gray-600 border-b">
                              <th className="py-2 pr-4">Métrica</th>
                              <th className="py-2 pr-4">Baseline</th>
                              <th className="py-2 pr-4">Actual</th>
                              <th className="py-2">Delta</th>
                            </tr>
                          </thead>
                          <tbody>
                            {phase1WindowComparisonData.map((row) => {
                              const isRateMetric =
                                row.metricName.includes('rate') || row.metricName.includes('reduction')
                              const deltaValue =
                                row.delta === null
                                  ? 'N/A'
                                  : isRateMetric
                                    ? `${row.delta >= 0 ? '+' : ''}${(row.delta * 100).toFixed(1)} pp`
                                    : `${row.delta >= 0 ? '+' : ''}${Number.isInteger(row.delta) ? row.delta.toLocaleString() : row.delta.toFixed(2)}`

                              return (
                                <tr key={row.metricName} className="border-b last:border-0">
                                  <td className="py-2 pr-4 text-gray-900">{prettifyMetricName(row.metricName)}</td>
                                  <td className="py-2 pr-4 text-gray-700">
                                    {formatRawMetric(row.metricName, row.baselineValue)}
                                  </td>
                                  <td className="py-2 pr-4 text-gray-700">
                                    {formatRawMetric(row.metricName, row.currentValue)}
                                  </td>
                                  <td className={`py-2 ${row.delta !== null && row.delta < 0 ? 'text-red-600' : 'text-green-700'}`}>
                                    {deltaValue}
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No hay métricas comparables entre baseline y actual.</p>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <Clock3 className="w-4 h-4 text-brand-600" />
                      Eventos más frecuentes ({pipelineDashboard.window_hours}h)
                    </h3>
                    {eventSummaryData.length > 0 ? (
                      <>
                        <div className="h-72">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={eventSummaryData} margin={{ top: 10, right: 10, left: 0, bottom: 50 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} />
                              <XAxis
                                dataKey="eventLabel"
                                tick={{ fontSize: 11 }}
                                interval={0}
                                angle={-35}
                                textAnchor="end"
                                height={70}
                              />
                              <YAxis />
                              <Tooltip
                                formatter={(value) => [`${value ?? 0}`, 'Eventos']}
                                labelFormatter={(_, payload) => {
                                  if (!payload || payload.length === 0) return ''
                                  return payload[0]?.payload?.eventName || ''
                                }}
                              />
                              <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="mt-3 max-h-32 overflow-auto space-y-1">
                          {eventSummaryData.map((event) => (
                            <div key={event.eventName} className="text-xs text-gray-600 flex items-center justify-between">
                              <span className="truncate pr-4">{event.eventName}</span>
                              <span className="font-medium text-gray-800">{event.count}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-gray-500">No hay eventos en la ventana seleccionada.</p>
                    )}
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      Incident Board ({incidentHours}h)
                    </h3>
                    {pipelineIncidents ? (
                      <>
                        <div className="text-sm text-gray-600 mb-3">
                          Total incidentes: <span className="font-semibold text-gray-900">{pipelineIncidents.total_incidents}</span>
                          <span className="text-xs text-gray-500 ml-2">
                            ({new Date(pipelineIncidents.generated_at).toLocaleString()})
                          </span>
                        </div>
                        {incidentChartData.length > 0 && (
                          <div className="h-52 mb-4">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={incidentChartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        )}
                        <div className="max-h-64 overflow-auto space-y-2">
                          {pipelineIncidents.categories.map((category) => (
                            <div key={category.category} className="p-3 border border-gray-200 rounded-lg">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-900">
                                  {prettifyMetricName(category.category)}
                                </span>
                                <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded">
                                  {category.count}
                                </span>
                              </div>
                              {category.recent.length > 0 ? (
                                <div className="mt-2 space-y-1">
                                  {category.recent.slice(0, 3).map((incident, index) => (
                                    <div key={`${category.category}-${incident.timestamp}-${index}`} className="text-xs text-gray-600">
                                      <span className="font-medium">{prettifyMetricName(incident.event_name)}</span>
                                      {incident.poc_id ? ` · ${incident.poc_id}` : ''}
                                      {incident.message ? ` · ${incident.message}` : ''}
                                      {incident.timestamp ? ` · ${new Date(incident.timestamp).toLocaleString()}` : ''}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="mt-2 text-xs text-gray-400">Sin incidentes recientes.</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-gray-500">No hay datos de incidentes disponibles.</p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-500">No hay datos de pipeline disponibles todavía.</p>
            )}
          </div>
        )}

        {/* LLM Cost Control — Fase 7 */}
        {!isLoading && llmUsage && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                Control de Costos LLM
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Consumo de tokens y presupuesto por organización.
                Última actualización: {new Date(llmUsage.generated_at).toLocaleString()}
              </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
              <MetricCard
                title="Gasto real (todos los calls)"
                value={`$${(llmUsage.real_cost_usd ?? 0).toFixed(4)}`}
                hint={`${(llmUsage.real_total_calls ?? 0)} llamadas · ${((llmUsage.real_total_tokens ?? 0) / 1000).toFixed(1)}K tokens`}
                good={null}
              />
              <MetricCard
                title="Budget total asignado"
                value={`$${llmUsage.total_budget_usd.toFixed(0)}`}
                hint={`${llmUsage.total_organizations} organizaciones`}
                good={null}
              />
              <MetricCard
                title="Gasto atribuido a orgs"
                value={`$${llmUsage.total_spent_usd.toFixed(2)}`}
                hint={`de $${llmUsage.total_budget_usd.toFixed(0)} asignados`}
                good={llmUsage.platform_usage_percentage < 80}
              />
              <MetricCard
                title="Orgs en alerta (≥80%)"
                value={`${llmUsage.alerts.length}`}
                hint={llmUsage.alerts.length > 0
                  ? llmUsage.alerts.slice(0, 2).map((a) => a.org_name).join(', ')
                  : 'Sin alertas activas'}
                good={llmUsage.alerts.length === 0}
              />
            </div>

            {/* By Plan Distribution */}
            {Object.keys(llmUsage.by_plan).length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {Object.entries(llmUsage.by_plan).map(([plan, data]) => {
                  const planPct = data.total_budget > 0
                    ? ((data.total_spent / data.total_budget) * 100).toFixed(1)
                    : '0.0'
                  return (
                    <div key={plan} className="p-3 border border-gray-200 rounded-lg">
                      <div className="text-xs text-gray-500 uppercase tracking-wide">{plan}</div>
                      <div className="text-lg font-semibold text-gray-900 mt-1">
                        ${data.total_spent.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {data.count} org{data.count !== 1 ? 's' : ''} · {planPct}% usado
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Organizations Table */}
            {llmUsage.organizations.length > 0 && (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-left text-gray-600 border-b">
                        <th className="py-2.5 px-4">Organización</th>
                        <th className="py-2.5 px-4">Plan</th>
                        <th className="py-2.5 px-4 text-right">Budget</th>
                        <th className="py-2.5 px-4 text-right">Gasto</th>
                        <th className="py-2.5 px-4 text-right">Restante</th>
                        <th className="py-2.5 px-4">Uso</th>
                      </tr>
                    </thead>
                    <tbody>
                      {llmUsage.organizations.map((org) => (
                        <tr
                          key={org.id}
                          className={`border-b last:border-0 ${org.is_near_limit ? 'bg-red-50' : ''}`}
                        >
                          <td className="py-2.5 px-4 font-medium text-gray-900">{org.name}</td>
                          <td className="py-2.5 px-4">
                            <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                              {org.plan}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-right text-gray-700">${org.budget_usd.toFixed(0)}</td>
                          <td className="py-2.5 px-4 text-right text-gray-700">${org.spent_usd.toFixed(2)}</td>
                          <td className="py-2.5 px-4 text-right text-gray-700">${org.remaining_usd.toFixed(2)}</td>
                          <td className="py-2.5 px-4 w-40">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    org.usage_percentage >= 90
                                      ? 'bg-red-500'
                                      : org.usage_percentage >= 80
                                        ? 'bg-amber-500'
                                        : 'bg-emerald-500'
                                  }`}
                                  style={{ width: `${Math.min(org.usage_percentage, 100)}%` }}
                                />
                              </div>
                              <span className={`text-xs font-medium min-w-[40px] text-right ${
                                org.usage_percentage >= 80 ? 'text-red-600' : 'text-gray-600'
                              }`}>
                                {org.usage_percentage.toFixed(0)}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Alerts */}
            {llmUsage.alerts.length > 0 && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-amber-900">
                      {llmUsage.alerts.length} organización{llmUsage.alerts.length !== 1 ? 'es' : ''} cerca del límite de presupuesto
                    </div>
                    <div className="text-xs text-amber-700 mt-1">
                      {llmUsage.alerts.map((a) => `${a.org_name} (${a.usage_percentage.toFixed(0)}%, plan ${a.plan})`).join(' · ')}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* LLM Breakdown by Model */}
            {llmBreakdown && llmBreakdown.by_model?.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Consumo por Modelo (últimos {llmBreakdown.period_days} días)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <MetricCard
                    title="Total Llamadas"
                    value={`${(llmBreakdown.total_calls ?? 0).toLocaleString()}`}
                    hint={`${(llmBreakdown.by_model?.length ?? 0)} modelos usados`}
                    good={null}
                  />
                  <MetricCard
                    title="Tokens Input"
                    value={`${((llmBreakdown.total_input_tokens ?? 0) / 1000).toFixed(1)}K`}
                    hint="Tokens de prompt enviados"
                    good={null}
                  />
                  <MetricCard
                    title="Tokens Output"
                    value={`${((llmBreakdown.total_output_tokens ?? 0) / 1000).toFixed(1)}K`}
                    hint="Tokens generados"
                    good={null}
                  />
                  <MetricCard
                    title="Costo Total"
                    value={`$${(llmBreakdown.total_cost_usd ?? 0).toFixed(4)}`}
                    hint="Costo real de API calls"
                    good={null}
                  />
                </div>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-left text-gray-600 border-b">
                        <th className="py-2.5 px-4">Modelo</th>
                        <th className="py-2.5 px-4">Provider</th>
                        <th className="py-2.5 px-4 text-right">Llamadas</th>
                        <th className="py-2.5 px-4 text-right">Input Tokens</th>
                        <th className="py-2.5 px-4 text-right">Output Tokens</th>
                        <th className="py-2.5 px-4 text-right">Costo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {llmBreakdown.by_model.map((m: any) => (
                        <tr key={m.model} className="border-b last:border-0">
                          <td className="py-2.5 px-4 font-medium text-gray-900 font-mono text-xs">{m.model}</td>
                          <td className="py-2.5 px-4">
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              m.provider === 'openai' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                            }`}>{m.provider}</span>
                          </td>
                          <td className="py-2.5 px-4 text-right text-gray-700">{m.calls.toLocaleString()}</td>
                          <td className="py-2.5 px-4 text-right text-gray-700">{m.input_tokens.toLocaleString()}</td>
                          <td className="py-2.5 px-4 text-right text-gray-700">{m.output_tokens.toLocaleString()}</td>
                          <td className="py-2.5 px-4 text-right font-medium text-gray-900">${m.cost_usd.toFixed(4)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* By Provider Summary */}
                {llmBreakdown.by_provider?.length > 1 && (
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    {llmBreakdown.by_provider.map((p: any) => (
                      <div key={p.provider} className="p-3 border border-gray-200 rounded-lg">
                        <div className="text-xs text-gray-500 uppercase tracking-wide">{p.provider}</div>
                        <div className="text-lg font-semibold text-gray-900 mt-1">${p.cost_usd.toFixed(4)}</div>
                        <div className="text-xs text-gray-500">
                          {p.calls} llamadas · {((p.input_tokens + p.output_tokens) / 1000).toFixed(1)}K tokens
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Recent Calls */}
                {llmBreakdown.recent_calls?.length > 0 && (
                  <details className="mt-4">
                    <summary className="text-sm font-medium text-gray-600 cursor-pointer hover:text-gray-900">
                      Últimas {llmBreakdown.recent_calls.length} llamadas
                    </summary>
                    <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden">
                      <table className="min-w-full text-xs">
                        <thead>
                          <tr className="bg-gray-50 text-gray-500 border-b">
                            <th className="py-2 px-3 text-left">Fecha</th>
                            <th className="py-2 px-3 text-left">Modelo</th>
                            <th className="py-2 px-3 text-left">Origen</th>
                            <th className="py-2 px-3 text-right">Input</th>
                            <th className="py-2 px-3 text-right">Output</th>
                            <th className="py-2 px-3 text-right">Costo</th>
                          </tr>
                        </thead>
                        <tbody>
                          {llmBreakdown.recent_calls.map((c: any, i: number) => (
                            <tr key={i} className="border-b last:border-0">
                              <td className="py-1.5 px-3 text-gray-500">{c.created_at ? new Date(c.created_at).toLocaleString('es-ES', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                              <td className="py-1.5 px-3 font-mono text-gray-700">{c.model}</td>
                              <td className="py-1.5 px-3">
                                <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                                  c.source === 'try' ? 'bg-purple-100 text-purple-700' :
                                  c.source === 'discovery' ? 'bg-blue-100 text-blue-700' :
                                  c.source === 'poc-generator' ? 'bg-green-100 text-green-700' :
                                  c.source === 'onboarding' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-gray-100 text-gray-600'
                                }`}>{c.source || 'unknown'}</span>
                              </td>
                              <td className="py-1.5 px-3 text-right text-gray-700">{c.input_tokens.toLocaleString()}</td>
                              <td className="py-1.5 px-3 text-right text-gray-700">{c.output_tokens.toLocaleString()}</td>
                              <td className="py-1.5 px-3 text-right text-gray-900">${c.cost_usd.toFixed(6)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </details>
                )}
              </div>
            )}

            {/* Cache Stats */}
            {llmUsage.cache_stats?.available && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Cache de LLM (Redis)</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <MetricCard
                    title="Cache Hits"
                    value={`${(llmUsage.cache_stats.hits ?? 0).toLocaleString()}`}
                    hint="Respuestas servidas desde cache"
                    good={true}
                  />
                  <MetricCard
                    title="Cache Misses"
                    value={`${(llmUsage.cache_stats.misses ?? 0).toLocaleString()}`}
                    hint="Llamadas que fueron a OpenAI"
                    good={null}
                  />
                  <MetricCard
                    title="Hit Rate"
                    value={`${(llmUsage.cache_stats.hit_rate ?? 0).toFixed(1)}%`}
                    hint="Porcentaje de llamadas evitadas"
                    good={(llmUsage.cache_stats.hit_rate ?? 0) > 20}
                  />
                  <MetricCard
                    title="Keys en cache"
                    value={`${(llmUsage.cache_stats.cached_keys ?? 0).toLocaleString()}`}
                    hint="Respuestas almacenadas actualmente"
                    good={null}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* PLG Funnel Stats */}
        {!isLoading && funnelStats && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">PLG Funnel ({funnelStats.period_days} días)</h2>

            {/* Event totals */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
              {(funnelStats.funnel_steps || []).map((step: string) => (
                <div key={step} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 truncate">{step.replace(/_/g, ' ')}</p>
                  <p className="text-xl font-bold text-gray-900">
                    {(funnelStats.event_totals?.[step] ?? 0).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            {/* Conversion rates */}
            {funnelStats.conversion_rates?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Tasas de Conversión</h3>
                <div className="space-y-2">
                  {funnelStats.conversion_rates.map((cr: any) => (
                    <div key={`${cr.from}-${cr.to}`} className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-40 truncate">{cr.from.replace(/_/g, ' ')}</span>
                      <span className="text-gray-400">→</span>
                      <span className="text-xs text-gray-500 w-40 truncate">{cr.to.replace(/_/g, ' ')}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-brand-500 h-2 rounded-full"
                          style={{ width: `${Math.min(cr.rate_percent, 100)}%` }}
                        />
                      </div>
                      <span className={`text-sm font-medium w-14 text-right ${cr.rate_percent > 20 ? 'text-green-600' : 'text-gray-600'}`}>
                        {cr.rate_percent}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Revenue funnel for GTM 1.2 */}
            {funnelStats.funnels?.saas_conversion && (
              <div className="mt-8 pt-6 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Revenue Funnel (signup → diagnosis → PoC → checkout)
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-5">
                  {(funnelStats.funnels.saas_conversion.funnel_steps || []).map((step: string) => (
                    <div key={`saas-${step}`} className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                      <p className="text-xs text-blue-700 truncate">{step.replace(/_/g, ' ')}</p>
                      <p className="text-xl font-bold text-blue-950">
                        {(funnelStats.funnels.saas_conversion.event_totals?.[step] ?? 0).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                {funnelStats.funnels.saas_conversion.conversion_rates?.length > 0 && (
                  <div className="space-y-2">
                    {funnelStats.funnels.saas_conversion.conversion_rates.map((cr: any) => (
                      <div key={`saas-rate-${cr.from}-${cr.to}`} className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 w-40 truncate">{cr.from.replace(/_/g, ' ')}</span>
                        <span className="text-gray-400">→</span>
                        <span className="text-xs text-gray-500 w-40 truncate">{cr.to.replace(/_/g, ' ')}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${Math.min(cr.rate_percent, 100)}%` }}
                          />
                        </div>
                        <span className={`text-sm font-medium w-14 text-right ${cr.rate_percent > 20 ? 'text-green-600' : 'text-gray-600'}`}>
                          {cr.rate_percent}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Preview Resources — Phase 9 */}
        {!isLoading && previewResources && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Preview Resources</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Active Previews</p>
                <p className="text-2xl font-bold text-gray-900">{previewResources.active_previews ?? 0}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">CPU (previews)</p>
                <p className="text-2xl font-bold text-gray-900">{previewResources.total_preview_cpu?.toFixed(1) ?? '—'}%</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">RAM (previews)</p>
                <p className="text-2xl font-bold text-gray-900">{previewResources.total_preview_memory_mb?.toFixed(0) ?? '—'} MB</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">System CPU</p>
                <p className="text-2xl font-bold text-gray-900">{previewResources.system_cpu_percent?.toFixed(1) ?? '—'}%</p>
              </div>
            </div>
            {previewResources.queue && (
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-blue-600">Queue Pending</p>
                  <p className="text-xl font-bold text-blue-900">{previewResources.queue.pending ?? 0}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-blue-600">Creating</p>
                  <p className="text-xl font-bold text-blue-900">{previewResources.queue.active_creating ?? 0}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-xs text-green-600">Warm Pool</p>
                  <p className="text-xl font-bold text-green-900">
                    {previewResources.warm_pool?.available ?? 0}/{previewResources.warm_pool?.target_size ?? 0}
                  </p>
                </div>
              </div>
            )}
            {previewResources.limits && (
              <div className="text-xs text-gray-500 flex gap-4">
                <span>Max/org: {previewResources.limits.max_per_org}</span>
                <span>Max global: {previewResources.limits.max_global}</span>
                <span>Idle timeout: {previewResources.limits.idle_timeout_min} min</span>
                <span>Max TTL: {previewResources.limits.max_lifetime_hours}h</span>
              </div>
            )}
          </div>
        )}

        {/* Revenue — Phase 10 */}
        {!isLoading && billingOverview && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              Revenue
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-emerald-50 rounded-lg p-4">
                <p className="text-xs text-emerald-700">MRR</p>
                <p className="text-2xl font-bold text-emerald-900">${(billingOverview.mrr_usd ?? 0).toLocaleString()}</p>
              </div>
              <div className="bg-emerald-50 rounded-lg p-4">
                <p className="text-xs text-emerald-700">ARR</p>
                <p className="text-2xl font-bold text-emerald-900">${(billingOverview.arr_usd ?? 0).toLocaleString()}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-xs text-blue-700">Active Subscribers</p>
                <p className="text-2xl font-bold text-blue-900">{billingOverview.active_subscribers ?? 0}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-600">Total Orgs</p>
                <p className="text-2xl font-bold text-gray-900">{billingOverview.total_organizations ?? 0}</p>
              </div>
            </div>
            {billingOverview.plan_distribution && Object.keys(billingOverview.plan_distribution).length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Plan Distribution</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={Object.entries(billingOverview.plan_distribution).map(([plan, count]) => ({ plan, count }))}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="plan" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        {!isLoading && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => navigate('/admin/users')}
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Users className="w-6 h-6 text-blue-600" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">Ver Usuarios</div>
                  <div className="text-sm text-gray-500">Gestionar usuarios registrados</div>
                </div>
              </button>
              <button
                onClick={() => navigate('/admin/pocs')}
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FileText className="w-6 h-6 text-blue-600" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">Ver POCs</div>
                  <div className="text-sm text-gray-500">Revisar POCs generadas</div>
                </div>
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Activity className="w-6 h-6 text-blue-600" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">Ver Sitio</div>
                  <div className="text-sm text-gray-500">Ir a la plataforma principal</div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Page Analytics */}
        {!isLoading && pageStats && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Páginas Más Visitadas (últimos {pageStats.period_days} días)
            </h2>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-600">Visitas al Home</div>
                <div className="text-2xl font-bold text-blue-600">{pageStats.home_visits.toLocaleString()}</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-sm text-gray-600">Sesiones Únicas</div>
                <div className="text-2xl font-bold text-green-600">{pageStats.unique_sessions.toLocaleString()}</div>
              </div>
            </div>

            {/* Top Pages Bar Chart */}
            {pageStats.top_pages.length > 0 ? (
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={pageStats.top_pages}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="path" tick={{ fontSize: 12 }} interval={0} angle={-45} textAnchor="end" height={60} />
                    <YAxis />
                    <Tooltip
                      formatter={(value: any) => [`${value} visitas`, 'Visitas'] as [string, string]}
                      contentStyle={{
                        borderRadius: '8px',
                        border: 'none',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Bar dataKey="views" radius={[4, 4, 0, 0]}>
                      {pageStats.top_pages.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={index < 3 ? '#2563eb' : '#93c5fd'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No hay datos de visitas disponibles todavía
              </div>
            )}

            {/* CRO AI Insights */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-medium text-gray-900">Análisis de Conversión (IA)</h3>
                </div>
                <button
                  onClick={() => loadCroInsights(true)}
                  disabled={croLoading}
                  className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${croLoading ? 'animate-spin' : ''}`} />
                  {croLoading ? 'Analizando...' : 'Regenerar'}
                </button>
              </div>

              {croLoading && !croInsights ? (
                <div className="p-6 bg-indigo-50 border border-indigo-200 rounded-lg text-center">
                  <RefreshCw className="w-5 h-5 animate-spin text-indigo-600 mx-auto mb-2" />
                  <div className="text-sm text-indigo-700">Analizando datos de conversión con IA...</div>
                </div>
              ) : croError ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {croError}
                </div>
              ) : croInsights ? (
                <div className="space-y-4">
                  {/* Summary */}
                  <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
                    <p className="text-sm text-indigo-900">{croInsights.summary}</p>
                    {croInsights.from_cache && (
                      <span className="text-xs text-indigo-400 mt-1 block">Desde caché · Regenerar para datos frescos</span>
                    )}
                  </div>

                  {/* Metrics Snapshot */}
                  {croInsights.metrics_snapshot && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="p-3 bg-white border border-gray-200 rounded-lg text-center">
                        <div className="text-xs text-gray-500">Conversión Total</div>
                        <div className="text-lg font-semibold text-gray-900">{croInsights.metrics_snapshot.overall_conversion}%</div>
                      </div>
                      <div className="p-3 bg-white border border-gray-200 rounded-lg text-center">
                        <div className="text-xs text-gray-500">Págs/Sesión</div>
                        <div className="text-lg font-semibold text-gray-900">{croInsights.metrics_snapshot.avg_session_depth}</div>
                      </div>
                      <div className="p-3 bg-white border border-gray-200 rounded-lg text-center">
                        <div className="text-xs text-gray-500">Bounce Rate</div>
                        <div className="text-lg font-semibold text-gray-900">{croInsights.metrics_snapshot.bounce_rate}%</div>
                      </div>
                      <div className="p-3 bg-white border border-gray-200 rounded-lg text-center">
                        <div className="text-xs text-gray-500">Mejor Referrer</div>
                        <div className="text-sm font-semibold text-gray-900 truncate">{croInsights.metrics_snapshot.best_referrer}</div>
                      </div>
                    </div>
                  )}

                  {/* Funnel Analysis */}
                  {croInsights.funnel_analysis && (
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="font-medium text-orange-900 mb-1 text-sm">Mayor caída del funnel</div>
                      <div className="text-sm text-orange-800 mb-3">
                        {croInsights.funnel_analysis.worst_dropoff_step.from} → {croInsights.funnel_analysis.worst_dropoff_step.to}:
                        <span className="font-semibold ml-1">-{croInsights.funnel_analysis.worst_dropoff_step.rate}%</span>
                      </div>
                      <ul className="space-y-1">
                        {croInsights.funnel_analysis.recommendations?.map((rec: string, i: number) => (
                          <li key={i} className="text-sm text-orange-700 flex items-start gap-2">
                            <span className="mt-0.5 text-orange-400">›</span> {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Quick Wins */}
                  {croInsights.quick_wins?.length > 0 && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <div className="font-medium text-emerald-900 mb-2 text-sm">Quick Wins</div>
                      <ul className="space-y-1">
                        {croInsights.quick_wins.map((win: string, i: number) => (
                          <li key={i} className="text-sm text-emerald-800 flex items-start gap-2">
                            <span className="mt-0.5 text-emerald-400">✓</span> {win}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Engagement Insights */}
                  {croInsights.engagement_insights?.length > 0 && (
                    <div className="space-y-2">
                      {croInsights.engagement_insights.map((insight: any, i: number) => (
                        <div key={i} className={`p-3 rounded-lg border ${
                          insight.priority === 'high' ? 'bg-red-50 border-red-200' :
                          insight.priority === 'medium' ? 'bg-amber-50 border-amber-200' :
                          'bg-gray-50 border-gray-200'
                        }`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded ${
                              insight.priority === 'high' ? 'bg-red-200 text-red-800' :
                              insight.priority === 'medium' ? 'bg-amber-200 text-amber-800' :
                              'bg-gray-200 text-gray-700'
                            }`}>{insight.priority}</span>
                            <span className="font-medium text-sm text-gray-900">{insight.title}</span>
                          </div>
                          <p className="text-sm text-gray-600">{insight.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
