import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity, Settings, Monitor, FileText, RefreshCw, CheckCircle, XCircle, AlertTriangle, Trash2 } from 'lucide-react'
import { api } from '../services/api'
import { useAppSelector, useAppDispatch } from '../store/hooks'
import { clearAuth } from '../store/userSlice'
import AdminSidebar from '../components/AdminSidebar'

type Tab = 'health' | 'config' | 'previews' | 'audit'

interface ServiceStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  detail: string
}

interface HealthData {
  overall: string
  services: Record<string, ServiceStatus>
  environment: string
  version: string
  checked_at: string
}

interface ConfigData {
  feature_flags: Record<string, boolean>
  runtime: Record<string, string | number | boolean>
}

interface PreviewItem {
  poc_id: string
  preview_url: string
  status: string
  ports: Record<string, number>
  created_at: string | null
  expires_at: string | null
  organization_id: string | null
  launcher_pid: number | null
}

interface AuditEvent {
  event_id: string
  actor: string
  action: string
  entity: string
  entity_id: string | null
  session_id: string | null
  stage: string | null
  payload: Record<string, any>
  created_at: string | null
}

export default function AdminSystemPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const userData = useAppSelector((state) => state.user.user)

  const [tab, setTab] = useState<Tab>('health')
  const [health, setHealth] = useState<HealthData | null>(null)
  const [config, setConfig] = useState<ConfigData | null>(null)
  const [previews, setPreviews] = useState<PreviewItem[]>([])
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([])
  const [auditTotal, setAuditTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Audit filters
  const [auditActor, setAuditActor] = useState('')
  const [auditAction, setAuditAction] = useState('')
  const [auditEntity, setAuditEntity] = useState('')

  useEffect(() => {
    if (!userData) { navigate('/admin/login'); return }
    loadTab(tab)
  }, [userData, navigate])

  const loadTab = async (t: Tab) => {
    setTab(t)
    setLoading(true)
    setError('')
    try {
      switch (t) {
        case 'health': {
          const res = await api.get('/api/v1/admin/system/health')
          setHealth(res.data)
          break
        }
        case 'config': {
          const res = await api.get('/api/v1/admin/system/config')
          setConfig(res.data)
          break
        }
        case 'previews': {
          const res = await api.get('/api/v1/admin/system/previews')
          setPreviews(res.data.previews || [])
          break
        }
        case 'audit': {
          await loadAudit()
          break
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error cargando datos')
      if (err.response?.status === 401) navigate('/admin/login')
    } finally {
      setLoading(false)
    }
  }

  const loadAudit = async () => {
    const params = new URLSearchParams({ limit: '50', offset: '0' })
    if (auditActor) params.set('actor', auditActor)
    if (auditAction) params.set('action', auditAction)
    if (auditEntity) params.set('entity', auditEntity)
    const res = await api.get(`/api/v1/admin/system/audit-logs?${params}`)
    setAuditEvents(res.data.events || [])
    setAuditTotal(res.data.total || 0)
  }

  const killPreview = async (pocId: string) => {
    if (!confirm(`Matar preview ${pocId}?`)) return
    setActionLoading(pocId)
    try {
      await api.post(`/api/v1/admin/system/previews/${pocId}/kill`)
      setPreviews(prev => prev.filter(p => p.poc_id !== pocId))
    } catch {
      setError('Error matando preview')
    } finally {
      setActionLoading(null)
    }
  }

  const handleLogout = () => {
    dispatch(clearAuth())
    navigate('/admin/login')
  }

  const formatDate = (d: string | null) => {
    if (!d) return '-'
    return new Date(d).toLocaleString('es-ES', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  const statusIcon = (status: string) => {
    if (status === 'healthy') return <CheckCircle className="w-5 h-5 text-green-500" />
    if (status === 'degraded') return <AlertTriangle className="w-5 h-5 text-yellow-500" />
    return <XCircle className="w-5 h-5 text-red-500" />
  }

  const statusBg = (status: string) => {
    if (status === 'healthy') return 'bg-green-50 border-green-200'
    if (status === 'degraded') return 'bg-yellow-50 border-yellow-200'
    return 'bg-red-50 border-red-200'
  }

  const tabs: { id: Tab; label: string; icon: typeof Activity }[] = [
    { id: 'health', label: 'Health', icon: Activity },
    { id: 'config', label: 'Config', icon: Settings },
    { id: 'previews', label: 'Previews', icon: Monitor },
    { id: 'audit', label: 'Audit Logs', icon: FileText },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar currentPage="system" onLogout={handleLogout} />

      <div className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Sistema</h1>
            <p className="text-gray-600">Health, configuracion, previews y audit logs</p>
          </div>
          <button onClick={() => loadTab(tab)} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700">
            <RefreshCw className="w-4 h-4" /> Refrescar
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
          {tabs.map(t => {
            const Icon = t.icon
            return (
              <button
                key={t.id}
                onClick={() => loadTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  tab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" /> {t.label}
              </button>
            )
          })}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Health Tab */}
        {!loading && tab === 'health' && health && (
          <div className="space-y-6">
            {/* Overall status */}
            <div className={`p-6 rounded-lg border ${statusBg(health.overall)}`}>
              <div className="flex items-center gap-3">
                {statusIcon(health.overall)}
                <div>
                  <div className="text-lg font-semibold capitalize">{health.overall}</div>
                  <div className="text-sm text-gray-500">
                    {health.environment} v{health.version} — {formatDate(health.checked_at)}
                  </div>
                </div>
              </div>
            </div>

            {/* Service cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(health.services).map(([name, svc]) => (
                <div key={name} className={`p-5 rounded-lg border ${statusBg(svc.status)}`}>
                  <div className="flex items-center gap-3 mb-2">
                    {statusIcon(svc.status)}
                    <span className="font-semibold text-gray-900 capitalize">{name.replace('_', ' ')}</span>
                  </div>
                  <p className="text-sm text-gray-600 break-all">{svc.detail}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Config Tab */}
        {!loading && tab === 'config' && config && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b bg-gray-50">
                <h2 className="font-semibold text-gray-900">Feature Flags</h2>
              </div>
              <div className="divide-y">
                {Object.entries(config.feature_flags).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between px-6 py-3">
                    <span className="text-sm font-mono text-gray-700">{key}</span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${val ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                      {val ? 'ON' : 'OFF'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b bg-gray-50">
                <h2 className="font-semibold text-gray-900">Runtime Config</h2>
              </div>
              <div className="divide-y">
                {Object.entries(config.runtime).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between px-6 py-3">
                    <span className="text-sm font-mono text-gray-700">{key}</span>
                    <span className="text-sm text-gray-900">{String(val)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Previews Tab */}
        {!loading && tab === 'previews' && (
          <div>
            {previews.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <Monitor className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No hay previews activos</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">POC ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">URL</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Creado</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expira</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {previews.map(p => (
                      <tr key={p.poc_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-mono text-gray-700 truncate max-w-[200px]" title={p.poc_id}>{p.poc_id.slice(0, 12)}...</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            p.status === 'running' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>{p.status}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-blue-600 truncate max-w-[200px]">
                          {p.preview_url ? <a href={p.preview_url} target="_blank" rel="noopener noreferrer">{p.preview_url}</a> : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{formatDate(p.created_at)}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{formatDate(p.expires_at)}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => killPreview(p.poc_id)}
                            disabled={actionLoading === p.poc_id}
                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                            title="Matar preview"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Audit Logs Tab */}
        {!loading && tab === 'audit' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex gap-3 items-end">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Actor</label>
                <input value={auditActor} onChange={e => setAuditActor(e.target.value)} placeholder="system"
                  className="px-3 py-2 border rounded-lg text-sm w-32" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Action</label>
                <input value={auditAction} onChange={e => setAuditAction(e.target.value)} placeholder="create"
                  className="px-3 py-2 border rounded-lg text-sm w-32" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Entity</label>
                <input value={auditEntity} onChange={e => setAuditEntity(e.target.value)} placeholder="poc"
                  className="px-3 py-2 border rounded-lg text-sm w-32" />
              </div>
              <button onClick={() => { setLoading(true); loadAudit().finally(() => setLoading(false)) }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                Filtrar
              </button>
              <span className="text-sm text-gray-500">{auditTotal} eventos</span>
            </div>

            {auditEvents.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No hay eventos de auditoria</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actor</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {auditEvents.map(e => (
                      <tr key={e.event_id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDate(e.created_at)}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{e.actor}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">{e.action}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{e.entity}</td>
                        <td className="px-4 py-3 text-xs font-mono text-gray-500 truncate max-w-[150px]" title={e.entity_id || ''}>{e.entity_id || '-'}</td>
                        <td className="px-4 py-3 text-xs text-gray-500">{e.stage || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
