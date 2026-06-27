import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { RefreshCw, ExternalLink, Wrench, Check, X, RotateCcw, Trash2, Star } from 'lucide-react'
import { api } from '../services/api'
import { plgService, type ShowcaseStat } from '../services/plg'
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
  can_showcase: boolean
  in_showcase: boolean
}

const SHOWCASE_KINDS = [
  { value: 'predictive', label: 'Predictivo' },
  { value: 'rag', label: 'RAG' },
  { value: 'vision', label: 'Visión' },
  { value: 'map', label: 'Mapa' },
  { value: 'workflow', label: 'Workflow' },
]

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
  const [showcaseStats, setShowcaseStats] = useState<ShowcaseStat[]>([])
  // Modal "Promover a vidriera"
  const [showcaseReq, setShowcaseReq] = useState<ValidationRequest | null>(null)
  const [scTitle, setScTitle] = useState('')
  const [scDesc, setScDesc] = useState('')
  const [scKind, setScKind] = useState('predictive')
  const [scOrder, setScOrder] = useState(0)

  useEffect(() => {
    if (!userData) { navigate('/admin/login'); return }
    loadData()
    // Auto-refresca el estado (generating → pending_review → approved/rejected)
    // sin spinner ni intervención manual.
    const id = setInterval(() => loadData(true), 5000)
    return () => clearInterval(id)
  }, [userData, navigate])

  const loadData = async (silent = false) => {
    if (!silent) { setLoading(true); setError('') }
    try {
      const res = await api.get('/api/v1/plg/admin/validation-requests')
      setRequests(res.data.requests || [])
      // Engagement de la vidriera (interno) — best-effort, no bloquea ni pisa la consola.
      plgService.getShowcaseStats().then(setShowcaseStats).catch(() => {})
      if (silent) setError('')
    } catch (err: any) {
      // En polling silencioso no pisamos la tabla por un blip de red.
      if (!silent) setError(err.response?.data?.detail || 'Error cargando la consola de validación')
    } finally {
      if (!silent) setLoading(false)
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

  const openShowcase = (req: ValidationRequest) => {
    setScTitle('')
    setScDesc('')
    setScKind('predictive')
    setScOrder(0)
    setShowcaseReq(req)
  }

  const submitShowcase = async () => {
    if (!showcaseReq?.poc_id || !scTitle.trim()) return
    setBusyAnon(showcaseReq.anon_session_id)
    try {
      await plgService.promoteShowcase({
        poc_id: showcaseReq.poc_id,
        title: scTitle.trim(),
        vertical: showcaseReq.vertical || undefined,
        kind: scKind || undefined,
        description: scDesc.trim() || undefined,
        sort_order: scOrder,
      })
      setShowcaseReq(null)
      await loadData()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'No se pudo promover a la vidriera')
    } finally {
      setBusyAnon(null)
    }
  }

  const removeShowcase = async (req: ValidationRequest) => {
    if (!req.poc_id || !window.confirm('¿Quitar esta PoC de la vidriera? El preview sigue vivo.')) return
    setBusyAnon(req.anon_session_id)
    try {
      await plgService.removeShowcase(req.poc_id)
      await loadData()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'No se pudo quitar de la vidriera')
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
            <button onClick={() => loadData()} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700">
              <RefreshCw className="w-4 h-4" /> Refrescar
            </button>
          </div>
        </div>

        {/* Vidriera · Engagement (interno — el visitante no ve estos números) */}
        {showcaseStats.length > 0 && (
          <div className="mb-8 bg-white rounded-xl shadow overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
              <Star className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-bold text-gray-900">Vidriera · Engagement</h2>
              <span className="text-xs text-gray-400">interno · ordenado por más elegidas</span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-2">PoC</th>
                  <th className="px-4 py-2">Tipo</th>
                  <th className="px-4 py-2 text-right">Aperturas</th>
                  <th className="px-4 py-2 text-right">Visitantes</th>
                  <th className="px-4 py-2 text-right">Engagement</th>
                  <th className="px-4 py-2 text-right">Tiempo prom.</th>
                  <th className="px-4 py-2">Última</th>
                </tr>
              </thead>
              <tbody>
                {showcaseStats.map((s) => (
                  <tr key={s.poc_id} className="border-t border-gray-100">
                    <td className="px-4 py-2 text-gray-900">{s.title}</td>
                    <td className="px-4 py-2 text-gray-500">{s.kind || '-'}</td>
                    <td className="px-4 py-2 text-right font-semibold text-gray-900">{s.opens}</td>
                    <td className="px-4 py-2 text-right text-gray-600">{s.unique_visitors}</td>
                    <td className="px-4 py-2 text-right text-gray-600">
                      {Math.round(s.engagement_rate * 100)}% <span className="text-gray-300">({s.engaged})</span>
                    </td>
                    <td className="px-4 py-2 text-right text-gray-600">{s.avg_dwell_seconds ? `${s.avg_dwell_seconds}s` : '—'}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-gray-400">{formatDate(s.last_interaction_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

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
                    <td colSpan={7} className="px-4 py-10 text-center text-gray-400">
                      Todavía no hay pedidos.
                    </td>
                  </tr>
                ) : (
                  requests.map((req) => {
                    const busy = busyAnon === req.anon_session_id
                    return (
                      <tr key={req.anon_session_id} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-gray-500">{formatDate(req.created_at)}</td>
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
                          ) : req.in_showcase ? (
                            <div className="flex items-center gap-3">
                              <span className="inline-flex items-center gap-1 font-semibold text-amber-600">
                                <Star className="w-3.5 h-3.5 fill-amber-400" /> En vidriera
                              </span>
                              <button onClick={() => removeShowcase(req)} className="inline-flex items-center gap-1 text-red-600 font-semibold hover:underline">
                                <X className="w-3.5 h-3.5" /> Quitar
                              </button>
                            </div>
                          ) : req.can_showcase ? (
                            <button onClick={() => openShowcase(req)} className="inline-flex items-center gap-1 text-amber-600 font-semibold hover:underline">
                              <Star className="w-3.5 h-3.5" /> Promover a vidriera
                            </button>
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

      {/* Modal: promover a vidriera */}
      {showcaseReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4" onClick={() => setShowcaseReq(null)}>
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500" />
              <h3 className="text-lg font-bold text-gray-900">Promover a la vidriera</h3>
            </div>
            <p className="mb-5 text-sm text-gray-500">
              Esta PoC vivirá indefinidamente en la landing. Definí su copy editorial.
            </p>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">Título *</label>
                <input
                  value={scTitle}
                  onChange={(e) => setScTitle(e.target.value)}
                  placeholder="Ej: Detección de Fraude en Vivo"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">Descripción</label>
                <textarea
                  rows={3}
                  value={scDesc}
                  onChange={(e) => setScDesc(e.target.value)}
                  placeholder="Una línea sobre qué hace y por qué impresiona."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Tipo</label>
                  <select
                    value={scKind}
                    onChange={(e) => setScKind(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  >
                    {SHOWCASE_KINDS.map((k) => (
                      <option key={k.value} value={k.value}>{k.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Orden</label>
                  <input
                    type="number"
                    min={0}
                    value={scOrder}
                    onChange={(e) => setScOrder(Number(e.target.value) || 0)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-400">Vertical: {showcaseReq.vertical || '—'} · PoC: {showcaseReq.poc_id || '—'}</p>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowcaseReq(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Cancelar
              </button>
              <button
                onClick={submitShowcase}
                disabled={!scTitle.trim() || busyAnon === showcaseReq.anon_session_id}
                className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
              >
                <Star className="h-4 w-4" /> Promover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
