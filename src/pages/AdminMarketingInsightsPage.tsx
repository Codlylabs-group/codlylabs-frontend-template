import { useState, useEffect } from 'react'
import {
  BarChart3, RefreshCw, Sparkles, TrendingUp, Eye, Heart, MessageCircle,
  Share2, Bookmark, AlertCircle, Crown, Lightbulb,
} from 'lucide-react'
import AdminSidebar from '../components/AdminSidebar'
import { api } from '../services/api'

interface Insights {
  reach: number | null; impressions: number | null; likes: number | null
  comments: number | null; shares: number | null; saves: number | null
  engagement: number | null; error?: string | null
}
interface Publication {
  id: string; network: string; external_id: string; text: string
  pillar: string; audience: string; published_at: string
  has_image: boolean; is_carousel: boolean
  insights: Insights | null; insights_at: string | null
}
interface Strategy {
  summary: string; what_works: string[]; recommendations: string[]
  best_post: string; preliminary: boolean; posts_analyzed: number
}

const NET_LABEL: Record<string, string> = { linkedin: 'LinkedIn', instagram: 'Instagram', x: 'X', facebook: 'Facebook' }
const fmtNum = (n: number | null | undefined) => (n === null || n === undefined ? '—' : n.toLocaleString('es-AR'))

export default function AdminMarketingInsightsPage() {
  const [pubs, setPubs] = useState<Publication[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncErrors, setSyncErrors] = useState<string[]>([])
  const [strategy, setStrategy] = useState<Strategy | null>(null)
  const [stratLoading, setStratLoading] = useState(false)
  const [sortBy, setSortBy] = useState<'date' | 'reach' | 'engagement'>('date')

  const handleLogout = () => { localStorage.removeItem('adminToken'); window.location.href = '/admin/login' }

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/api/v1/admin/poc-social/publications')
      setPubs(data.publications || [])
    } catch { /* no-op */ } finally { setLoading(false) }
  }

  const refresh = async () => {
    setRefreshing(true)
    try {
      const { data } = await api.post('/api/v1/admin/poc-social/publications/refresh-insights')
      setPubs(data.publications || [])
    } catch { /* no-op */ } finally { setRefreshing(false) }
  }

  const syncAccount = async () => {
    setSyncing(true); setSyncErrors([])
    try {
      const { data } = await api.post('/api/v1/admin/poc-social/publications/sync-account')
      setPubs(data.publications || [])
      setSyncErrors(data.errors || [])
    } catch (e: any) {
      setSyncErrors([e?.response?.data?.detail || 'No se pudieron sincronizar las publicaciones.'])
    } finally { setSyncing(false) }
  }

  const loadStrategy = async () => {
    setStratLoading(true)
    try {
      const { data } = await api.get('/api/v1/admin/poc-social/publications/strategy')
      setStrategy(data)
    } catch { /* no-op */ } finally { setStratLoading(false) }
  }

  const sorted = [...pubs].sort((a, b) => {
    if (sortBy === 'reach') return (b.insights?.reach || 0) - (a.insights?.reach || 0)
    if (sortBy === 'engagement') return (b.insights?.engagement || 0) - (a.insights?.engagement || 0)
    return (b.published_at || '').localeCompare(a.published_at || '')
  })
  const topId = [...pubs].sort((a, b) => (b.insights?.reach || 0) - (a.insights?.reach || 0))[0]?.id

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar currentPage="marketing-insights" onLogout={handleLogout} />
      <div className="flex-1">
        <div className="bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="text-brand-600" /> Marketing — Insights
            </h1>
            <p className="text-gray-600 mt-2">Qué publicaste, a cuánta gente llegó y qué conviene hacer.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={syncAccount} disabled={syncing}
              className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 disabled:opacity-50">
              <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
              {syncing ? 'Sincronizando…' : 'Sincronizar de IG/FB'}
            </button>
            <button onClick={refresh} disabled={refreshing}
              className="flex items-center gap-2 text-brand-700 border border-brand-200 bg-white px-4 py-2 rounded-lg hover:bg-brand-50 disabled:opacity-50">
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Actualizando…' : 'Actualizar métricas'}
            </button>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
            Las métricas automáticas son de <b className="mx-1">Instagram y Facebook</b>. LinkedIn (perfil) y X no exponen métricas de post por API, así que esos aparecen sin reach.
          </div>

          {syncErrors.length > 0 && (() => {
            const blob = syncErrors.join(' ').toLowerCase()
            const tokenBad = blob.includes('malformed') || blob.includes('invalid oauth') || blob.includes('code":190') || blob.includes('expired')
            const permBad = blob.includes('permission') || blob.includes('read_insights') || blob.includes('instagram_manage_insights')
            return (
              <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="font-semibold mb-1 flex items-center gap-1.5"><AlertCircle size={14} /> Problemas al traer métricas</p>
                <ul className="list-disc list-inside space-y-0.5">{syncErrors.map((e, i) => <li key={i}>{e}</li>)}</ul>
                {tokenBad && <p className="mt-1 text-red-500">El token de Meta no es válido (vencido o mal copiado). Regeneralo y hacelo de <b>larga duración</b> (debe decir "Expira: Nunca" en el debugger), después actualizá el <code>.env</code> y rebuildeá.</p>}
                {permBad && <p className="mt-1 text-red-500">Falta permiso: el token necesita <code>read_insights</code> (Facebook) e <code>instagram_manage_insights</code> (Instagram).</p>}
              </div>
            )
          })()}

          {/* Estrategia IA */}
          <div className="bg-gradient-to-br from-brand-50 to-white border border-brand-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-gray-900 flex items-center gap-2">
                <Sparkles size={18} className="text-brand-600" /> Estrategia con IA
              </span>
              <button onClick={loadStrategy} disabled={stratLoading}
                className="flex items-center gap-1.5 text-sm text-brand-600 border border-brand-200 bg-white rounded-lg px-3 py-1.5 hover:bg-brand-50 disabled:opacity-50">
                <Lightbulb size={14} className={stratLoading ? 'animate-pulse' : ''} />
                {stratLoading ? 'Analizando…' : strategy ? 'Regenerar' : 'Generar estrategia'}
              </button>
            </div>
            {!strategy ? (
              <p className="text-sm text-gray-500">Generá un análisis de qué está funcionando y qué hacer en la próxima tanda.</p>
            ) : (
              <div className="space-y-3">
                {strategy.preliminary && (
                  <span className="text-xs bg-amber-100 text-amber-700 rounded-full px-2 py-0.5">Preliminar (sin métricas reales todavía)</span>
                )}
                <p className="text-sm text-gray-800">{strategy.summary}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 flex items-center gap-1.5"><TrendingUp size={13} /> Qué funciona</h4>
                    <ul className="space-y-1">{strategy.what_works.map((w, i) => <li key={i} className="text-sm text-gray-700 flex gap-1.5"><span className="text-brand-400 mt-1">•</span>{w}</li>)}</ul>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 flex items-center gap-1.5"><Lightbulb size={13} /> Recomendaciones</h4>
                    <ul className="space-y-1">{strategy.recommendations.map((r, i) => <li key={i} className="text-sm text-gray-700 flex gap-1.5"><span className="text-green-500 mt-1">→</span>{r}</li>)}</ul>
                  </div>
                </div>
                {strategy.best_post && (
                  <p className="text-sm text-gray-700 flex items-start gap-1.5"><Crown size={15} className="text-amber-500 mt-0.5 shrink-0" /> <span><b>Mejor ángulo:</b> {strategy.best_post}</span></p>
                )}
              </div>
            )}
          </div>

          {/* Tabla de publicaciones */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="font-semibold text-gray-900">Publicaciones ({pubs.length})</span>
              <div className="ml-auto flex items-center gap-1 text-xs">
                <span className="text-gray-400">Ordenar:</span>
                {([['date', 'Fecha'], ['reach', 'Reach'], ['engagement', 'Engagement']] as const).map(([id, label]) => (
                  <button key={id} onClick={() => setSortBy(id)}
                    className={`px-2 py-0.5 rounded ${sortBy === id ? 'bg-brand-100 text-brand-700 font-semibold' : 'text-gray-500 hover:bg-gray-100'}`}>{label}</button>
                ))}
              </div>
            </div>
            {loading ? (
              <div className="text-center text-gray-400 py-12"><RefreshCw size={24} className="mx-auto mb-2 animate-spin" /> Cargando…</div>
            ) : pubs.length === 0 ? (
              <div className="text-center text-gray-400 py-12 bg-white border border-gray-100 rounded-xl">
                Sin publicaciones todavía. Tocá <b className="text-gray-600">"Sincronizar de IG/FB"</b> para traer tus posts reales de la cuenta, o publicá desde la plataforma.
              </div>
            ) : (
              <div className="space-y-2">
                {sorted.map(p => (
                  <div key={p.id} className={`bg-white border rounded-xl p-4 ${p.id === topId && p.insights?.reach ? 'border-amber-300 ring-1 ring-amber-200' : 'border-gray-200'}`}>
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-gray-700">{NET_LABEL[p.network] || p.network}</span>
                          {p.is_carousel && <span className="text-xs bg-gray-100 text-gray-500 rounded px-1.5">carrusel</span>}
                          {p.id === topId && p.insights?.reach ? <span className="text-xs bg-amber-100 text-amber-700 rounded px-1.5 flex items-center gap-1"><Crown size={11} /> top alcance</span> : null}
                          <span className="text-xs text-gray-400 ml-auto">{new Date(p.published_at).toLocaleDateString('es-AR')}</span>
                        </div>
                        <p className="text-sm text-gray-700 line-clamp-2">{p.text}</p>
                        {p.insights?.error && <p className="text-xs text-gray-400 mt-1">métrica no disponible</p>}
                      </div>
                    </div>
                    {p.insights && !p.insights.error && (
                      <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-600">
                        <span className="flex items-center gap-1"><Eye size={13} className="text-brand-500" /> {fmtNum(p.insights.reach)} reach</span>
                        <span className="flex items-center gap-1"><Heart size={13} className="text-rose-500" /> {fmtNum(p.insights.likes)}</span>
                        <span className="flex items-center gap-1"><MessageCircle size={13} className="text-sky-500" /> {fmtNum(p.insights.comments)}</span>
                        <span className="flex items-center gap-1"><Share2 size={13} className="text-emerald-500" /> {fmtNum(p.insights.shares)}</span>
                        <span className="flex items-center gap-1"><Bookmark size={13} className="text-amber-500" /> {fmtNum(p.insights.saves)}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
