import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreditCard, RefreshCw, DollarSign } from 'lucide-react'
import { api } from '../services/api'
import { useAppSelector, useAppDispatch } from '../store/hooks'
import { clearAuth } from '../store/userSlice'
import AdminSidebar from '../components/AdminSidebar'

interface Subscription {
  org_id: string
  org_name: string
  plan: string
  status: string
  stripe_customer_id: string | null
  trial_end: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
}

export default function AdminBillingPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const userData = useAppSelector((state) => state.user.user)

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!userData) { navigate('/admin/login'); return }
    loadData()
  }, [userData, navigate])

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/api/v1/admin/billing/overview')
      setData(res.data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error cargando billing')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => { dispatch(clearAuth()); navigate('/admin/login') }

  const formatDate = (d: string | null) => {
    if (!d) return '-'
    return new Date(d).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const statusColor = (s: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-700',
      trialing: 'bg-blue-100 text-blue-700',
      past_due: 'bg-red-100 text-red-700',
      canceled: 'bg-gray-100 text-gray-500',
      none: 'bg-gray-100 text-gray-400',
    }
    return colors[s] || 'bg-gray-100 text-gray-400'
  }

  const planColor = (p: string) => {
    const colors: Record<string, string> = {
      free: 'bg-gray-100 text-gray-700',
      starter: 'bg-sky-100 text-sky-700',
      builder: 'bg-blue-100 text-blue-700',
      team: 'bg-indigo-100 text-indigo-700',
      growth: 'bg-green-100 text-green-700',
      enterprise: 'bg-yellow-100 text-yellow-700',
    }
    return colors[p] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar currentPage="billing" onLogout={handleLogout} />

      <div className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Billing</h1>
            <p className="text-gray-600">Suscripciones, MRR y distribucion por plan</p>
          </div>
          <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700">
            <RefreshCw className="w-4 h-4" /> Refrescar
          </button>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>}

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        )}

        {!loading && data && (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="w-6 h-6 text-emerald-600" />
                  <div className="text-sm text-gray-500">MRR Estimado</div>
                </div>
                <div className="text-3xl font-bold text-gray-900">${data.mrr_estimate_usd}</div>
                <div className="text-xs text-gray-400 mt-1">Basado en planes activos + trial</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-3 mb-2">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                  <div className="text-sm text-gray-500">Organizaciones</div>
                </div>
                <div className="text-3xl font-bold text-gray-900">{data.total_organizations}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm text-gray-500 mb-2">Por Status</div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(data.by_status as Record<string, number>).map(([status, count]) => (
                    <span key={status} className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor(status)}`}>
                      {status}: {count}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Plan Distribution */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Distribucion por Plan</h2>
              <div className="flex gap-4">
                {Object.entries(data.by_plan as Record<string, number>).map(([plan, count]) => {
                  const total = data.total_organizations || 1
                  const pct = Math.round((count / total) * 100)
                  return (
                    <div key={plan} className="flex-1 p-4 border border-gray-200 rounded-lg text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-2 ${planColor(plan)}`}>{plan}</span>
                      <div className="text-2xl font-bold text-gray-900">{count}</div>
                      <div className="text-xs text-gray-400">{pct}%</div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Subscriptions Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Suscripciones</h2>
              </div>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Organizacion</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trial End</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Periodo Fin</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cancela</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {(data.subscriptions as Subscription[]).map(sub => (
                    <tr key={sub.org_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{sub.org_name}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${planColor(sub.plan)}`}>{sub.plan}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor(sub.status)}`}>{sub.status}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{formatDate(sub.trial_end)}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{formatDate(sub.current_period_end)}</td>
                      <td className="px-6 py-4 text-sm">
                        {sub.cancel_at_period_end && <span className="text-red-600 font-medium">Si</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
