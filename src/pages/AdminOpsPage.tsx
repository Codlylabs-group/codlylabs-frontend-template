import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play, Loader2, AlertTriangle, Terminal, RefreshCw, CheckCircle2, XCircle } from 'lucide-react'
import { api } from '../services/api'
import { useAppSelector, useAppDispatch } from '../store/hooks'
import { clearAuth } from '../store/userSlice'
import AdminSidebar from '../components/AdminSidebar'

interface OpParam {
  name: string
  label: string
  type: string
  required?: boolean
  env?: boolean
}
interface AdminOp {
  name: string
  label: string
  desc: string
  danger: boolean
  background: boolean
  params: OpParam[]
}

export default function AdminOpsPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const userData = useAppSelector((state) => state.user.user)

  const [ops, setOps] = useState<AdminOp[]>([])
  const [args, setArgs] = useState<Record<string, Record<string, string>>>({})
  const [running, setRunning] = useState<string | null>(null)
  const [output, setOutput] = useState<{ name: string; ok: boolean; text: string } | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!userData) { navigate('/admin/login'); return }
    api.get('/api/v1/admin/system/ops')
      .then((r) => setOps(r.data.ops || []))
      .catch((e: any) => setError(e.response?.data?.detail || 'Error cargando operaciones'))
  }, [userData, navigate])

  const handleLogout = () => { dispatch(clearAuth()); navigate('/admin/login') }

  const setArg = (op: string, name: string, val: string) =>
    setArgs((p) => ({ ...p, [op]: { ...(p[op] || {}), [name]: val } }))

  const run = async (op: AdminOp) => {
    if (op.danger && !window.confirm(`"${op.label}" es una operación sensible/destructiva. ¿Ejecutar?`)) return
    // Validar requeridos
    for (const p of op.params) {
      if (p.required && !(args[op.name]?.[p.name] || '').trim()) {
        setError(`"${op.label}": falta el campo "${p.label}".`); return
      }
    }
    setRunning(op.name); setOutput(null); setError('')
    try {
      const res = await api.post(`/api/v1/admin/system/ops/${op.name}/run`, { args: args[op.name] || {} })
      const d = res.data
      setOutput({ name: op.name, ok: !!d.ok, text: d.output || d.error || JSON.stringify(d, null, 2) })
    } catch (e: any) {
      setOutput({ name: op.name, ok: false, text: e.response?.data?.detail || 'Error ejecutando la operación' })
    } finally {
      setRunning(null)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar currentPage="operaciones" onLogout={handleLogout} />

      <div className="flex-1 p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900">Operaciones</h1>
            <p className="text-gray-600">Scripts de mantenimiento — backup, restore, vidriera, admin. Sin consola manual.</p>
          </div>
          <button onClick={() => window.location.reload()} className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <RefreshCw className="h-4 w-4" /> Recargar
          </button>
        </div>

        {error && <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>}

        <div className="grid gap-4 lg:grid-cols-2">
          {ops.map((op) => (
            <div key={op.name} className={`rounded-xl border bg-white p-5 shadow-sm ${op.danger ? 'border-amber-200' : 'border-gray-100'}`}>
              <div className="mb-1 flex items-center gap-2">
                <h3 className="font-bold text-gray-900">{op.label}</h3>
                {op.danger && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                    <AlertTriangle className="h-3 w-3" /> sensible
                  </span>
                )}
                {op.background && (
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">background</span>
                )}
              </div>
              <p className="mb-3 text-sm text-gray-500">{op.desc}</p>

              {op.params.length > 0 && (
                <div className="mb-3 space-y-2">
                  {op.params.map((p) => (
                    <div key={p.name}>
                      <label className="mb-1 block text-xs font-semibold text-gray-600">
                        {p.label}{p.required && <span className="text-red-500"> *</span>}
                      </label>
                      <input
                        type={p.type === 'password' ? 'password' : 'text'}
                        value={args[op.name]?.[p.name] || ''}
                        onChange={(e) => setArg(op.name, p.name, e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                      />
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => run(op)}
                disabled={running === op.name}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 ${op.danger ? 'bg-amber-500 hover:bg-amber-600' : 'bg-indigo-600 hover:bg-indigo-500'}`}
              >
                {running === op.name ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                {running === op.name ? 'Ejecutando…' : 'Ejecutar'}
              </button>
            </div>
          ))}
        </div>

        {output && (
          <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-gray-900 shadow">
            <div className="flex items-center gap-2 border-b border-gray-700 px-4 py-2 text-sm text-gray-300">
              <Terminal className="h-4 w-4" />
              <span className="font-semibold">{output.name}</span>
              {output.ok
                ? <CheckCircle2 className="ml-auto h-4 w-4 text-emerald-400" />
                : <XCircle className="ml-auto h-4 w-4 text-red-400" />}
            </div>
            <pre className="max-h-[420px] overflow-auto px-4 py-3 text-xs leading-relaxed text-gray-100 whitespace-pre-wrap">{output.text}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
