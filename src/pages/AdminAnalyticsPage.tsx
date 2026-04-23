import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, RefreshCw, BarChart3, Zap } from 'lucide-react'
import { api } from '../services/api'
import { useAppSelector, useAppDispatch } from '../store/hooks'
import { clearAuth } from '../store/userSlice'
import AdminSidebar from '../components/AdminSidebar'

interface TrendPoint {
  date: string
  new_users: number
  pocs_generated: number
  llm_cost_usd: number
  llm_calls: number
}

interface GenStat {
  poc_type: string
  total: number
  successful: number
  failed: number
  success_rate: number
}

interface SourceStat {
  source: string
  calls: number
  cost_usd: number
  input_tokens: number
  output_tokens: number
}

export default function AdminAnalyticsPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const userData = useAppSelector((state) => state.user.user)

  const [trends, setTrends] = useState<TrendPoint[]>([])
  const [trendTotals, setTrendTotals] = useState<any>(null)
  const [genStats, setGenStats] = useState<GenStat[]>([])
  const [sourceStats, setSourceStats] = useState<SourceStat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [days, setDays] = useState(30)

  useEffect(() => {
    if (!userData) { navigate('/admin/login'); return }
    loadData()
  }, [userData, navigate, days])

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const [trendsRes, genRes] = await Promise.allSettled([
        api.get(`/api/v1/admin/analytics/trends?days=${days}`),
        api.get('/api/v1/admin/analytics/generation-stats'),
      ])
      if (trendsRes.status === 'fulfilled') {
        setTrends(trendsRes.value.data.timeline || [])
        setTrendTotals(trendsRes.value.data.totals)
      }
      if (genRes.status === 'fulfilled') {
        setGenStats(genRes.value.data.by_poc_type || [])
        setSourceStats(genRes.value.data.by_source || [])
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error cargando analytics')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => { dispatch(clearAuth()); navigate('/admin/login') }

  // Simple bar chart using CSS
  const maxPocs = Math.max(...trends.map(t => t.pocs_generated), 1)
  const maxCost = Math.max(...trends.map(t => t.llm_cost_usd), 0.001)
  const maxUsers = Math.max(...trends.map(t => t.new_users), 1)

  const sourceColor = (s: string) => {
    const colors: Record<string, string> = {
      try: 'bg-purple-100 text-purple-700',
      discovery: 'bg-blue-100 text-blue-700',
      'poc-generator': 'bg-green-100 text-green-700',
      onboarding: 'bg-yellow-100 text-yellow-700',
    }
    return colors[s] || 'bg-gray-100 text-gray-600'
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar currentPage="analytics" onLogout={handleLogout} />

      <div className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
            <p className="text-gray-600">Tendencias de uso, generacion y costos</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              {[7, 14, 30, 60].map(d => (
                <button key={d} onClick={() => setDays(d)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${days === d ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                  {d}d
                </button>
              ))}
            </div>
            <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700">
              <RefreshCw className="w-4 h-4" /> Refrescar
            </button>
          </div>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>}

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        )}

        {!loading && (
          <div className="space-y-8">
            {/* Totals */}
            {trendTotals && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow p-5">
                  <div className="text-sm text-gray-500">Nuevos Usuarios</div>
                  <div className="text-2xl font-bold text-gray-900 mt-1">{trendTotals.new_users}</div>
                  <div className="text-xs text-gray-400">ultimos {days} dias</div>
                </div>
                <div className="bg-white rounded-lg shadow p-5">
                  <div className="text-sm text-gray-500">POCs Generadas</div>
                  <div className="text-2xl font-bold text-blue-600 mt-1">{trendTotals.pocs_generated}</div>
                  <div className="text-xs text-gray-400">ultimos {days} dias</div>
                </div>
                <div className="bg-white rounded-lg shadow p-5">
                  <div className="text-sm text-gray-500">Costo LLM</div>
                  <div className="text-2xl font-bold text-emerald-600 mt-1">${trendTotals.llm_cost_usd?.toFixed(4)}</div>
                  <div className="text-xs text-gray-400">ultimos {days} dias</div>
                </div>
                <div className="bg-white rounded-lg shadow p-5">
                  <div className="text-sm text-gray-500">Llamadas LLM</div>
                  <div className="text-2xl font-bold text-purple-600 mt-1">{trendTotals.llm_calls}</div>
                  <div className="text-xs text-gray-400">ultimos {days} dias</div>
                </div>
              </div>
            )}

            {/* Trends Chart (CSS bars) */}
            {trends.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" /> Tendencia Diaria
                </h2>
                <p className="text-sm text-gray-500 mb-4">POCs generadas por dia</p>
                <div className="flex items-end gap-1 h-32">
                  {trends.map((t, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                      <div className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                        style={{ height: `${Math.max((t.pocs_generated / maxPocs) * 100, 2)}%` }}
                        title={`${t.date}: ${t.pocs_generated} POCs, $${t.llm_cost_usd.toFixed(4)}`}
                      />
                      {trends.length <= 14 && (
                        <span className="text-[9px] text-gray-400 truncate w-full text-center">
                          {new Date(t.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                {trends.length > 14 && (
                  <div className="flex justify-between mt-1 text-[9px] text-gray-400">
                    <span>{new Date(trends[0].date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
                    <span>{new Date(trends[trends.length - 1].date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
                  </div>
                )}

                {/* LLM Cost trend */}
                <p className="text-sm text-gray-500 mt-6 mb-2">Costo LLM por dia</p>
                <div className="flex items-end gap-1 h-20">
                  {trends.map((t, i) => (
                    <div key={i} className="flex-1">
                      <div className="w-full bg-emerald-400 rounded-t transition-all hover:bg-emerald-500"
                        style={{ height: `${Math.max((t.llm_cost_usd / maxCost) * 100, 2)}%` }}
                        title={`${t.date}: $${t.llm_cost_usd.toFixed(4)}`}
                      />
                    </div>
                  ))}
                </div>

                {/* Users trend */}
                <p className="text-sm text-gray-500 mt-6 mb-2">Nuevos usuarios por dia</p>
                <div className="flex items-end gap-1 h-20">
                  {trends.map((t, i) => (
                    <div key={i} className="flex-1">
                      <div className="w-full bg-purple-400 rounded-t transition-all hover:bg-purple-500"
                        style={{ height: `${Math.max((t.new_users / maxUsers) * 100, 2)}%` }}
                        title={`${t.date}: ${t.new_users} usuarios`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Generation Stats by Type */}
              {genStats.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" /> Por Tipo de PoC
                  </h2>
                  <div className="space-y-3">
                    {genStats.map(s => (
                      <div key={s.poc_type} className="flex items-center gap-3">
                        <div className="w-32 text-sm font-mono text-gray-700 truncate" title={s.poc_type}>{s.poc_type}</div>
                        <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden flex">
                          <div className="h-full bg-green-500 transition-all" style={{ width: `${s.success_rate}%` }} />
                          {s.failed > 0 && <div className="h-full bg-red-400 transition-all" style={{ width: `${((s.failed / s.total) * 100)}%` }} />}
                        </div>
                        <div className="text-sm text-gray-600 w-20 text-right">{s.total} ({s.success_rate}%)</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* By Source */}
              {sourceStats.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-purple-600" /> Por Origen
                  </h2>
                  <div className="space-y-3">
                    {sourceStats.map(s => (
                      <div key={s.source} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs px-2 py-0.5 rounded font-medium ${sourceColor(s.source)}`}>{s.source}</span>
                          <span className="text-sm font-semibold text-gray-900">${s.cost_usd.toFixed(4)}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {s.calls} llamadas · {((s.input_tokens + s.output_tokens) / 1000).toFixed(1)}K tokens
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {trends.length === 0 && genStats.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No hay datos de analytics aun. Genera algunas PoCs para ver tendencias.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
