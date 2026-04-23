import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, CheckCircle2, XCircle, Star, Loader2 } from 'lucide-react'
import { api } from '../services/api'
import { useAppSelector, useAppDispatch } from '../store/hooks'
import { clearAuth } from '../store/userSlice'
import AdminSidebar from '../components/AdminSidebar'

interface BlueprintStat {
  id: string
  name: string
  slug: string
  poc_type: string
  times_generated: number
  success_rate: number | null
  is_featured: boolean
  is_active: boolean
}

interface PackStat {
  id: string
  name: string
  slug: string
  vertical: string
  status: string
  total_blueprints: number
  total_pocs_generated: number
  blueprints: BlueprintStat[]
}

interface VerticalPackStats {
  total_packs: number
  total_pocs_generated: number
  packs: PackStat[]
  generated_at: string
}

export default function AdminVerticalPacksPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const userData = useAppSelector((state) => state.user.user)

  const [stats, setStats] = useState<VerticalPackStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedPack, setExpandedPack] = useState<string | null>(null)

  useEffect(() => {
    if (!userData) {
      navigate('/admin/login')
      return
    }
    loadStats()
  }, [userData, navigate])

  const loadStats = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/api/v1/admin/vertical-packs/stats')
      setStats(res.data)
    } catch (err: unknown) {
      const e = err as { response?: { status?: number; data?: { detail?: string } } }
      setError(e.response?.data?.detail || 'Failed to load stats')
      if (e.response?.status === 401 || e.response?.status === 403) {
        navigate('/admin/login')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    dispatch(clearAuth())
    navigate('/admin/login')
  }

  const mostPopular = stats?.packs
    .flatMap((p) => p.blueprints)
    .sort((a, b) => b.times_generated - a.times_generated)[0]

  const avgSuccessRate = (() => {
    if (!stats) return null
    const bps = stats.packs.flatMap((p) => p.blueprints).filter((b) => b.success_rate !== null)
    if (bps.length === 0) return null
    return bps.reduce((sum, b) => sum + (b.success_rate || 0), 0) / bps.length
  })()

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar currentPage="vertical-packs" onLogout={handleLogout} />

      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-brand-600" />
            Vertical Packs
          </h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
            </div>
          ) : stats && (
            <>
              {/* Summary cards */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard label="Total Packs" value={String(stats.total_packs)} />
                <SummaryCard label="PoCs Generados" value={String(stats.total_pocs_generated)} />
                <SummaryCard
                  label="Blueprint Top"
                  value={mostPopular ? `${mostPopular.name} (${mostPopular.times_generated})` : '—'}
                />
                <SummaryCard
                  label="Success Rate Prom."
                  value={avgSuccessRate !== null ? `${(avgSuccessRate * 100).toFixed(1)}%` : 'N/A'}
                />
              </div>

              {/* Packs table */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600">
                      <th className="text-left px-6 py-3 font-medium">Pack</th>
                      <th className="text-left px-6 py-3 font-medium">Vertical</th>
                      <th className="text-center px-4 py-3 font-medium">Blueprints</th>
                      <th className="text-center px-4 py-3 font-medium">PoCs</th>
                      <th className="text-center px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {stats.packs.map((pack) => (
                      <PackRow
                        key={pack.id}
                        pack={pack}
                        isExpanded={expandedPack === pack.id}
                        onToggle={() => setExpandedPack(expandedPack === pack.id ? null : pack.id)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">{label}</p>
      <p className="text-xl font-semibold text-gray-900 truncate">{value}</p>
    </div>
  )
}

function PackRow({
  pack,
  isExpanded,
  onToggle,
}: {
  pack: PackStat
  isExpanded: boolean
  onToggle: () => void
}) {
  return (
    <>
      <tr
        className="hover:bg-gray-50 cursor-pointer transition-colors"
        onClick={onToggle}
      >
        <td className="px-6 py-4 font-medium text-gray-900">{pack.name}</td>
        <td className="px-6 py-4 text-gray-600 capitalize">{pack.vertical}</td>
        <td className="px-4 py-4 text-center text-gray-600">{pack.total_blueprints}</td>
        <td className="px-4 py-4 text-center font-semibold text-brand-600">
          {pack.total_pocs_generated}
        </td>
        <td className="px-4 py-4 text-center">
          <span
            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
              pack.status === 'active'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {pack.status}
          </span>
        </td>
      </tr>
      {isExpanded && pack.blueprints.length > 0 && (
        <tr>
          <td colSpan={5} className="px-6 py-4 bg-gray-50">
            <div className="space-y-2">
              {pack.blueprints.map((bp) => (
                <div
                  key={bp.id}
                  className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    {bp.is_featured && <Star className="w-4 h-4 text-amber-500" />}
                    <div>
                      <span className="font-medium text-gray-900">{bp.name}</span>
                      <span className="ml-2 text-xs text-gray-500">{bp.poc_type}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Generados</p>
                      <p className="font-semibold text-gray-900">{bp.times_generated}</p>
                    </div>
                    <div className="text-center w-24">
                      <p className="text-xs text-gray-500">Success Rate</p>
                      {bp.success_rate !== null ? (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-100 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                bp.success_rate >= 0.8
                                  ? 'bg-green-500'
                                  : bp.success_rate >= 0.5
                                    ? 'bg-amber-500'
                                    : 'bg-red-500'
                              }`}
                              style={{ width: `${bp.success_rate * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-700">
                            {(bp.success_rate * 100).toFixed(0)}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">N/A</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {bp.is_active ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
