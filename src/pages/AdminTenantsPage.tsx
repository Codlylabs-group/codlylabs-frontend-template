import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  RefreshCw, CheckCircle, XCircle, AlertTriangle,
  Loader2, Play, Eye, Zap, ArrowLeft,
} from 'lucide-react'
import { api } from '../services/api'
import { useAppSelector, useAppDispatch } from '../store/hooks'
import { clearAuth } from '../store/userSlice'
import AdminSidebar from '../components/AdminSidebar'

interface TenantResult {
  slug: string
  organization_id: string
  outcome: 'updated' | 'skipped' | 'failed'
  old_sha: string | null
  new_sha: string | null
  error: string | null
}

interface BulkReport {
  started_at: string
  finished_at: string | null
  template_sha: string | null
  force: boolean
  dry_run: boolean
  concurrency: number
  total_published: number
  stale_found: number
  updated: number
  skipped: number
  failed: number
  results: TenantResult[]
}

export default function AdminTenantsPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const userData = useAppSelector((state) => state.user.user)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [report, setReport] = useState<BulkReport | null>(null)
  const [force, setForce] = useState(false)
  const [dryRun, setDryRun] = useState(false)

  const handleLogout = () => {
    dispatch(clearAuth())
    navigate('/admin/login')
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Cargando...</p>
      </div>
    )
  }

  const handleRepublish = async () => {
    setRunning(true)
    setError(null)
    try {
      const { data } = await api.post('/api/v1/admin/tenants/republish', {
        force,
        dry_run: dryRun,
      })
      setReport(data as BulkReport)
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Error al disparar el re-publish.')
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar currentPage="tenants" onLogout={handleLogout} />
      <main className="flex-1 p-8 max-w-5xl mx-auto">
        <button
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={14} />
          Volver al panel admin
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-indigo-500 flex items-center justify-center text-white">
            <RefreshCw size={18} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Actualizar frontends de tenants</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Re-publica cada tenant para que adopte el último template del monorepo.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Opciones</h2>
          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={dryRun}
                onChange={e => setDryRun(e.target.checked)}
                className="mt-1"
              />
              <div>
                <div className="text-sm font-medium text-gray-800 flex items-center gap-2">
                  <Eye size={14} className="text-gray-400" />
                  Dry run
                </div>
                <div className="text-xs text-gray-500">
                  Solo listar qué tenants están desactualizados, sin hacer publish real.
                </div>
              </div>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={force}
                onChange={e => setForce(e.target.checked)}
                className="mt-1"
              />
              <div>
                <div className="text-sm font-medium text-gray-800 flex items-center gap-2">
                  <Zap size={14} className="text-amber-500" />
                  Forzar todos (ignorar sha)
                </div>
                <div className="text-xs text-gray-500">
                  Re-publica incluso los tenants que ya están en el template actual. Úsalo solo si un cambio no se refleja después de un push normal.
                </div>
              </div>
            </label>
          </div>

          <div className="mt-5 pt-5 border-t border-gray-100">
            <button
              onClick={handleRepublish}
              disabled={running}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:shadow-md disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
            >
              {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play size={14} />}
              {running ? 'Actualizando tenants...' : (dryRun ? 'Previsualizar tenants desactualizados' : 'Actualizar tenants')}
            </button>
            <p className="text-xs text-gray-400 mt-2">
              Con concurrencia baja (2 tenants a la vez) para no saturar GitHub/Vercel. Puede tardar unos minutos si hay muchos.
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-2">
            <AlertTriangle size={16} className="text-red-500 mt-0.5" />
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {report && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-900">Resultado</h2>
                {report.template_sha && (
                  <span className="font-mono text-[11px] text-gray-400">
                    sha: {report.template_sha.slice(0, 12)}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-5 gap-3">
                <Stat label="Publicados" value={report.total_published} />
                <Stat label="Desactualizados" value={report.stale_found} tone="amber" />
                <Stat label="Actualizados" value={report.updated} tone="green" />
                <Stat label="Saltados" value={report.skipped} tone="gray" />
                <Stat label="Con error" value={report.failed} tone={report.failed > 0 ? 'red' : 'gray'} />
              </div>
              {report.dry_run && (
                <div className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                  <Eye size={12} className="inline mr-1" />
                  Dry run — no se tocó ningún tenant.
                </div>
              )}
            </div>

            {report.results.length > 0 && (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr className="text-xs text-gray-500">
                    <th className="text-left px-5 py-2 font-medium">Slug</th>
                    <th className="text-left px-5 py-2 font-medium">Estado</th>
                    <th className="text-left px-5 py-2 font-medium">Sha anterior → nuevo</th>
                    <th className="text-left px-5 py-2 font-medium">Detalle</th>
                  </tr>
                </thead>
                <tbody>
                  {report.results.map(r => (
                    <tr key={r.organization_id} className="border-b border-gray-50 last:border-0">
                      <td className="px-5 py-2.5 font-mono text-xs text-gray-800">{r.slug}</td>
                      <td className="px-5 py-2.5">
                        <OutcomeBadge outcome={r.outcome} />
                      </td>
                      <td className="px-5 py-2.5 font-mono text-[11px] text-gray-500">
                        {r.old_sha ? r.old_sha : '—'} → {r.new_sha ? r.new_sha : '—'}
                      </td>
                      <td className="px-5 py-2.5 text-xs text-gray-600 max-w-[280px] truncate">
                        {r.error || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {report.results.length === 0 && (
              <div className="px-5 py-8 text-center text-sm text-gray-400">
                Todos los tenants ya están en el template actual. Nada que hacer.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

function Stat({ label, value, tone = 'gray' }: { label: string; value: number; tone?: 'gray' | 'green' | 'amber' | 'red' }) {
  const toneClasses = {
    gray: 'bg-gray-50 text-gray-700',
    green: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-red-50 text-red-700',
  }[tone]
  return (
    <div className={`rounded-lg p-3 ${toneClasses}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-[11px] uppercase tracking-wider opacity-80">{label}</div>
    </div>
  )
}

function OutcomeBadge({ outcome }: { outcome: TenantResult['outcome'] }) {
  if (outcome === 'updated') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
        <CheckCircle size={10} />
        Actualizado
      </span>
    )
  }
  if (outcome === 'skipped') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
        Saltado
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-700">
      <XCircle size={10} />
      Con error
    </span>
  )
}
