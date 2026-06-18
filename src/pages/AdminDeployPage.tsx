import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Rocket, ShieldCheck, ArrowLeftRight, Undo2, Power, RefreshCw,
  CircleDot, AlertTriangle, CheckCircle2, XCircle, X,
} from 'lucide-react'
import { api } from '../services/api'
import { useAppSelector, useAppDispatch } from '../store/hooks'
import { clearAuth } from '../store/userSlice'
import AdminSidebar from '../components/AdminSidebar'

type Color = 'blue' | 'green'

interface ColorState {
  running: boolean
  health: 'healthy' | 'unhealthy' | 'down'
  image: string
}
interface DeployStatus {
  active: Color | 'unknown'
  idle: Color
  caddy: string
  blue: ColorState
  green: ColorState
}

const COLOR_DOT: Record<string, string> = {
  blue: 'bg-sky-500',
  green: 'bg-emerald-500',
}

export default function AdminDeployPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const userData = useAppSelector((s) => s.user.user)

  const [status, setStatus] = useState<DeployStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  // Color verificado OK (gate del swap). Se resetea ante cualquier cambio de estado.
  const [verifiedColor, setVerifiedColor] = useState<Color | null>(null)
  const [confirmSwap, setConfirmSwap] = useState<Color | null>(null)

  useEffect(() => {
    if (!userData) { navigate('/admin/login'); return }
    loadStatus()
  }, [userData, navigate])

  const handleLogout = () => { dispatch(clearAuth()); navigate('/admin/login') }

  const loadStatus = async () => {
    setLoading(true); setError('')
    try {
      const res = await api.get('/api/v1/admin/deploy/status')
      setStatus(res.data)
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'No se pudo leer el estado del deploy. ¿ENABLE_BLUEGREEN_DEPLOY=True?')
    } finally {
      setLoading(false)
    }
  }

  const run = async (action: string, label: string) => {
    setBusy(action); setError(''); setNotice('')
    try {
      const res = await api.post(`/api/v1/admin/deploy/${action}`, { color: 'auto' })
      const d = res.data || {}
      if (action === 'verify' && d.ok) {
        setVerifiedColor((d.color as Color) ?? status?.idle ?? null)
        setNotice(`Verificación OK en ${d.color}. Ya podés hacer el swap.`)
      } else if (action === 'swap') {
        setVerifiedColor(null)
        setNotice(d.noop ? `Ya estaba activo ${d.to}.` : `Swap completado: tráfico ahora en ${d.to}. (rollback disponible)`)
      } else if (action === 'rollback') {
        setVerifiedColor(null)
        setNotice(`Rollback completado: tráfico en ${d.to}.`)
      } else if (action === 'release') {
        setVerifiedColor(null)
        setNotice(`Release OK: ${d.color} está healthy. Verificá antes de swapear.`)
      } else if (action === 'stop-idle') {
        setNotice(d.noop ? 'El color idle ya estaba apagado.' : `Color idle (${d.stopped}) apagado.`)
      }
      await loadStatus()
    } catch (e: any) {
      setError(e?.response?.data?.detail || `Error en ${label}.`)
    } finally {
      setBusy(null); setConfirmSwap(null)
    }
  }

  const idle = status?.idle
  const active = status?.active
  const idleState = status && idle ? status[idle] : null
  const swapReady = !!idle && verifiedColor === idle
  const bothRunning = !!status && status.blue.running && status.green.running

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar currentPage="deploy" onLogout={handleLogout} />

      <div className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Deployments</h1>
            <p className="text-gray-600">Blue-Green · swap de tráfico sin downtime (estilo Azure slot swap)</p>
          </div>
          <button onClick={loadStatus} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refrescar
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" /> <span>{error}</span>
          </div>
        )}
        {notice && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" /> <span>{notice}</span>
          </div>
        )}

        {/* Tiles de color */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {(['blue', 'green'] as Color[]).map((c) => {
            const st = status?.[c]
            const isLive = active === c
            return (
              <div key={c} className={`p-6 rounded-xl border-2 bg-white ${isLive ? 'border-gray-900 shadow-md' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${COLOR_DOT[c]}`} />
                    <span className="text-lg font-bold capitalize text-gray-900">{c}</span>
                  </div>
                  {isLive ? (
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-900 text-white flex items-center gap-1">
                      <CircleDot className="w-3 h-3" /> LIVE
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">idle</span>
                  )}
                </div>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between"><dt className="text-gray-500">Estado</dt>
                    <dd className="font-medium text-gray-900">{st?.running ? 'corriendo' : 'apagado'}</dd></div>
                  <div className="flex justify-between"><dt className="text-gray-500">Health</dt>
                    <dd className="font-medium flex items-center gap-1">
                      {st?.health === 'healthy' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        : st?.health === 'unhealthy' ? <XCircle className="w-4 h-4 text-red-600" />
                        : <span className="w-4 h-4 inline-block rounded-full bg-gray-300" />}
                      <span className={st?.health === 'healthy' ? 'text-emerald-700' : st?.health === 'unhealthy' ? 'text-red-700' : 'text-gray-400'}>
                        {st?.health ?? '-'}
                      </span>
                    </dd></div>
                  <div className="flex justify-between"><dt className="text-gray-500">Imagen</dt>
                    <dd className="font-mono text-xs text-gray-700 truncate max-w-[60%]">{st?.image ?? '-'}</dd></div>
                </dl>
                {verifiedColor === c && (
                  <div className="mt-3 text-xs font-medium text-emerald-700 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" /> verificado — listo para recibir tráfico
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Flujo guiado 3 pasos */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Deploy guiado al color idle {idle ? `(${idle})` : ''}</h2>
          <p className="text-sm text-gray-500 mb-5">Release → Verificar → Swap. El swap se habilita recién cuando la verificación pasa.</p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Paso 1 */}
            <StepCard n={1} title="Release" desc={`Levanta/actualiza ${idle ?? 'idle'} con la imagen nueva y espera health.`}>
              <button
                disabled={!!busy}
                onClick={() => run('release', 'release')}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-40"
              >
                <Rocket className="w-4 h-4" /> {busy === 'release' ? 'Levantando…' : `Actualizar ${idle ?? ''}`}
              </button>
            </StepCard>

            {/* Paso 2 */}
            <StepCard n={2} title="Verificar" desc={`Health + smoke contra ${idle ?? 'idle'} sin mandarle tráfico real.`}>
              <button
                disabled={!!busy || !idleState?.running}
                onClick={() => run('verify', 'verify')}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-800 text-sm font-medium hover:bg-gray-50 disabled:opacity-40"
              >
                <ShieldCheck className="w-4 h-4" /> {busy === 'verify' ? 'Verificando…' : 'Verificar'}
              </button>
            </StepCard>

            {/* Paso 3 */}
            <StepCard n={3} title="Swap" desc="Flipa Caddy al color verificado. Cero downtime." highlight={swapReady}>
              <button
                disabled={!!busy || !swapReady}
                onClick={() => setConfirmSwap(idle ?? null)}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-40"
              >
                <ArrowLeftRight className="w-4 h-4" /> {busy === 'swap' ? 'Swapeando…' : `Swap → ${idle ?? ''}`}
              </button>
              {!swapReady && <p className="mt-2 text-xs text-gray-400">Verificá primero para habilitar.</p>}
            </StepCard>
          </div>

          {/* Acciones secundarias */}
          <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-100">
            <button
              disabled={!!busy || !bothRunning}
              onClick={() => run('rollback', 'rollback')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-amber-300 text-amber-700 text-sm font-medium hover:bg-amber-50 disabled:opacity-40"
            >
              <Undo2 className="w-4 h-4" /> Rollback (volver al otro color)
            </button>
            <button
              disabled={!!busy}
              onClick={() => run('stop-idle', 'stop-idle')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 disabled:opacity-40"
            >
              <Power className="w-4 h-4" /> Apagar idle
            </button>
          </div>
        </div>
      </div>

      {/* Modal de confirmación del swap */}
      {confirmSwap && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-semibold text-gray-900">Confirmar swap de tráfico</h3>
              </div>
              <button onClick={() => setConfirmSwap(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-sm text-gray-600 mb-5">
              Vas a mandar <strong>TODO el tráfico de producción</strong> a <strong className="capitalize">{confirmSwap}</strong>.
              El color actual (<span className="capitalize">{active}</span>) queda vivo para rollback instantáneo.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmSwap(null)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50">Cancelar</button>
              <button onClick={() => run('swap', 'swap')} disabled={busy === 'swap'} className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50">
                {busy === 'swap' ? 'Swapeando…' : `Sí, swap a ${confirmSwap}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StepCard({ n, title, desc, children, highlight }: {
  n: number; title: string; desc: string; children: React.ReactNode; highlight?: boolean
}) {
  return (
    <div className={`rounded-lg border p-4 ${highlight ? 'border-emerald-300 bg-emerald-50/40' : 'border-gray-200 bg-gray-50/50'}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="w-6 h-6 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center">{n}</span>
        <span className="font-semibold text-gray-900">{title}</span>
      </div>
      <p className="text-xs text-gray-500 mb-4 min-h-[32px]">{desc}</p>
      {children}
    </div>
  )
}
