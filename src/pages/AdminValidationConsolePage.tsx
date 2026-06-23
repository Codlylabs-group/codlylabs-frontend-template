import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { RefreshCw, ExternalLink, Wrench, Check, X, RotateCcw, Trash2 } from 'lucide-react'
import { api } from '../services/api'
import { useAppSelector, useAppDispatch } from '../store/hooks'
import { clearAuth } from '../store/userSlice'
import AdminSidebar from '../components/AdminSidebar'

interface ValidationRequest {
  anon_session_id: string
  poc_id: string | null
  company_name: string | null
  contact_email: string | null
  vertical: string | null
  status: string
  status_label: string
  status_color: string
  preview_url: string | null
  email_sent: boolean
  created_at: string | null
  review_token: string | null
  can_review: boolean
  can_retry: boolean
}

const formatDate = (iso: string | null): string => {
  if (!iso) return '-'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '-'
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${dd}/${mm} ${hh}:${mi}`
}

export default function AdminValidationConsolePage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const userData = useAppSelector((state) => state.user.user)

  const [requests, setRequests] = useState<ValidationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyAnon, setBusyAnon] = useState<string | null>(null)

  useEffect(() => {
    if (!userData) { navigate('/admin/login'); return }
    loadData()
  }, [userData, navigate])

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/api/v1/plg/admin/validation-requests')
      setRequests(res.data.requests || [])
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error cargando la consola de validación')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => { dispatch(clearAuth()); navigate('/admin/login') }

  const review = async (req: ValidationRequest, action: 'approve' | 'reject') => {
    if (!req.anon_session_id) return
    const verb = action === 'approve' ? 'aprobar y enviar el email a' : 'rechazar (no se envía email) a'
    if (!window.confirm(`¿Vas a ${verb} ${req.contact_email || req.company_name || 'este pedido'}?`)) return
    setBusyAnon(req.anon_session_id)
    try {
      await api.post(`/api/v1/plg/admin/validation-requests/${encodeURIComponent(req.anon_session_id)}/review`, { action })
      await loadData()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'No se pudo registrar la revisión')
    } finally {
      setBusyAnon(null)
    }
  }

  const retry = async (req: ValidationRequest) => {
    if (!window.confirm('¿Regenerar esta PoC desde el pedido original?')) return
    setBusyAnon(req.anon_session_id)
    try {
      await api.post(`/api/v1/plg/admin/validation-requests/${encodeURIComponent(req.anon_session_id)}/retry`)
      await loadData()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'No se pudo regenerar el pedido')
    } finally {
      setBusyAnon(null)
    }
  }

  const remove = async (req: ValidationRequest) => {
    if (!window.confirm('¿Eliminar este pedido? No se puede deshacer.')) return
    setBusyAnon(req.anon_session_id)
    try {
      await api.delete(`/api/v1/plg/admin/validation-requests/${encodeURIComponent(req.anon_session_id)}`)
      await loadData()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'No se pudo eliminar el pedido')
    } finally {
      setBusyAnon(null)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar currentPage="validation" onLogout={handleLogout} />

      <div className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Consola de Validación</h1>
            <p className="text-gray-600">Pedidos del funnel público de validación de IA</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{requests.length} pedidos</span>
            <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700">
              <RefreshCw className="w-4 h-4" /> Refrescar
            </button>
          </div>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Empresa</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Vertical</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Preview</th>
                  <th className="px-4 py-3">Email enviado</th>
                  <th className="px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-gray-400">
                      Todavía no hay pedidos.
                    </td>
                  </tr>
                ) : (
                  requests.map((req) => {
                    const busy = busyAnon === req.anon_session_id
                    return (
                      <tr key={req.anon_session_id} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-gray-500">{formatDate(req.created_at)}</td>
                        <td className="px-4 py-3 text-gray-900">{req.company_name || '-'}</td>
                        <td className="px-4 py-3 text-blue-600">{req.contact_email || '-'}</td>
                        <td className="px-4 py-3 text-gray-500">{req.vertical || '-'}</td>
                        <td className="px-4 py-3">
                          <span
                            className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: req.status_color }}
                          >
                            {req.status_label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {req.preview_url ? (
                            <a href={req.preview_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:underline">
                              <ExternalLink className="w-3.5 h-3.5" /> Abrir
                            </a>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{req.email_sent ? 'Sí' : 'No'}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {busy ? (
                            <span className="text-gray-400">Procesando…</span>
                          ) : req.can_review ? (
                            <div className="flex items-center gap-3">
                              {req.review_token && (
                                <button onClick={() => navigate(`/review/pocs/${encodeURIComponent(req.review_token!)}`)} className="inline-flex items-center gap-1 text-blue-600 font-semibold hover:underline">
                                  <Wrench className="w-3.5 h-3.5" /> Arreglar
                                </button>
                              )}
                              <button onClick={() => review(req, 'approve')} className="inline-flex items-center gap-1 text-green-600 font-semibold hover:underline">
                                <Check className="w-3.5 h-3.5" /> Aprobar
                              </button>
                              <button onClick={() => review(req, 'reject')} className="inline-flex items-center gap-1 text-red-600 font-semibold hover:underline">
                                <X className="w-3.5 h-3.5" /> Rechazar
                              </button>
                            </div>
                          ) : req.can_retry ? (
                            <div className="flex items-center gap-3">
                              <button onClick={() => retry(req)} className="inline-flex items-center gap-1 text-blue-600 font-semibold hover:underline">
                                <RotateCcw className="w-3.5 h-3.5" /> Regenerar
                              </button>
                              <button onClick={() => remove(req)} className="inline-flex items-center gap-1 text-red-600 font-semibold hover:underline">
                                <Trash2 className="w-3.5 h-3.5" /> Eliminar
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
