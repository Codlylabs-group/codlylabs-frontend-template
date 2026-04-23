import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, PlayCircle, RefreshCw } from 'lucide-react'
import {
  simulationsService,
  type DataSource,
  type PocTypeOption,
  type SimulationResult,
  type SimulationSummary,
} from '../services/simulations'

const defaultConfig = {
  poc_type: '',
  data_source: 'synthetic' as DataSource,
  volume: 500,
  duration_minutes: undefined as number | undefined,
  use_real_models: false,
  include_optimization: true,
}

export default function ShadowModePage() {
  const [pocTypes, setPocTypes] = useState<PocTypeOption[]>([])
  const [config, setConfig] = useState(defaultConfig)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [recent, setRecent] = useState<SimulationSummary[]>([])
  const [pollingId, setPollingId] = useState<string | null>(null)

  const selectedPoc = useMemo(
    () => pocTypes.find((option) => option.type === config.poc_type),
    [config.poc_type, pocTypes]
  )

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const [types, latest] = await Promise.all([
          simulationsService.getPocTypes(),
          simulationsService.listSimulations(undefined, 8),
        ])
        if (!mounted) return
        setPocTypes(types)
        setRecent(latest)
      } catch (err) {
        if (!mounted) return
        setError('No pudimos cargar los templates del simulador.')
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (!pollingId) return
    let active = true
    const poll = async () => {
      try {
        const data = await simulationsService.getSimulation(pollingId)
        if (!active) return
        setResult(data)
        if (data.status === 'completed' || data.status === 'failed') {
          setPollingId(null)
        } else {
          setTimeout(poll, 2500)
        }
      } catch (err) {
        if (!active) return
        setPollingId(null)
        setError('No pudimos obtener el resultado de la simulacion.')
      }
    }
    poll()
    return () => {
      active = false
    }
  }, [pollingId])

  const handleRun = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setResult(null)
    setLoading(true)
    try {
      const summary = await simulationsService.runSimulation(config)
      setPollingId(summary.simulation_id)
      const latest = await simulationsService.listSimulations(undefined, 8)
      setRecent(latest)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'No pudimos iniciar la simulacion.')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value?: number | null) => {
    if (!value && value !== 0) return '-'
    return `$${value.toLocaleString('es-ES', { maximumFractionDigits: 0 })}`
  }

  const formatNumber = (value?: number | null, unit?: string) => {
    if (!value && value !== 0) return '-'
    const rounded = Number(value).toFixed(1)
    return unit ? `${rounded} ${unit}` : rounded
  }

  return (
    <div className="min-h-screen bg-white">
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.15),_transparent_55%)]">
        <div className="relative max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600">
              Shadow Mode Simulator
            </span>
            <h1 className="mt-6 text-4xl md:text-5xl font-bold text-slate-900">
              Simula tu POC antes del deployment real.
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Evalua costos, latencia, calidad y ROI en minutos. Ajusta volumen y data source para
              decidir el proximo paso con confianza.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-8 items-start">
          <form onSubmit={handleRun} className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-100">
            <h2 className="text-2xl font-bold text-slate-900">Configura tu simulacion</h2>
            <p className="mt-2 text-sm text-slate-600">
              Define el tipo de POC, la fuente de datos y el volumen a simular.
            </p>

            {error && (
              <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                {error}
              </div>
            )}

            <div className="mt-6 grid gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Tipo de POC</label>
                <select
                  value={config.poc_type}
                  onChange={(event) => setConfig({ ...config, poc_type: event.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100"
                  required
                >
                  <option value="">Selecciona</option>
                  {pocTypes.map((option) => (
                    <option key={option.type} value={option.type}>
                      {option.name}
                    </option>
                  ))}
                </select>
                {selectedPoc && (
                  <p className="mt-2 text-xs text-slate-500">{selectedPoc.description}</p>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Fuente de datos</label>
                  <select
                    value={config.data_source}
                    onChange={(event) =>
                      setConfig({ ...config, data_source: event.target.value as DataSource })
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100"
                  >
                    <option value="synthetic">Sintetica (rapido)</option>
                    <option value="sample">Sample (balanceado)</option>
                    <option value="historical">Historica (mas precisa)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Volumen</label>
                  <input
                    type="number"
                    min={10}
                    max={10000}
                    value={config.volume}
                    onChange={(event) => setConfig({ ...config, volume: Number(event.target.value) })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100"
                  />
                  {selectedPoc && (
                    <p className="mt-2 text-xs text-slate-500">
                      Volumen recomendado: {selectedPoc.typical_volume.toLocaleString('es-ES')}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={config.use_real_models}
                    onChange={(event) =>
                      setConfig({ ...config, use_real_models: event.target.checked })
                    }
                    className="h-4 w-4 rounded border-slate-300 text-slate-900"
                  />
                  Usar modelos reales (costoso)
                </label>
                <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={config.include_optimization}
                    onChange={(event) =>
                      setConfig({ ...config, include_optimization: event.target.checked })
                    }
                    className="h-4 w-4 rounded border-slate-300 text-slate-900"
                  />
                  Incluir recomendaciones
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-70"
              >
                {loading ? 'Iniciando simulacion...' : 'Ejecutar simulacion'}
                <PlayCircle className="w-4 h-4" />
              </button>
            </div>
          </form>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Ultimas simulaciones</h3>
                <button
                  type="button"
                  onClick={async () => setRecent(await simulationsService.listSimulations(undefined, 8))}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  <RefreshCw className="w-4 h-4" />
                  Actualizar
                </button>
              </div>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                {recent.length === 0 && <p>No hay simulaciones recientes.</p>}
                {recent.map((sim) => (
                  <div key={sim.simulation_id} className="rounded-2xl border border-slate-100 px-4 py-3">
                    <p className="font-semibold text-slate-900">{sim.poc_type}</p>
                    <p className="text-xs text-slate-500">
                      {sim.status.toUpperCase()} · {new Date(sim.started_at).toLocaleString('es-ES')}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white shadow-sm">
              <h3 className="text-lg font-semibold">Shadow Mode Benefits</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-200">
                <li>• Evita costos innecesarios en produccion.</li>
                <li>• Compara configuraciones antes de decidir.</li>
                <li>• Conecta resultados con ROI estimado.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {result && (
        <section className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-100">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-600">Resultado de simulacion</p>
                <h2 className="text-2xl font-bold text-slate-900 mt-2">{result.poc_type}</h2>
                <p className="text-xs text-slate-500 mt-1">Status: {result.status.toUpperCase()}</p>
              </div>
              {pollingId && (
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Ejecutando simulacion...
                </span>
              )}
            </div>

            <div className="mt-6 grid lg:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Costo estimado (simulado)</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {formatCurrency(result.cost_breakdown?.total_cost)}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  LLM {formatCurrency(result.cost_breakdown?.llm_api_cost)} · Compute{' '}
                  {formatCurrency(result.cost_breakdown?.compute_cost)}
                </p>
                <p className="text-[11px] text-slate-400 mt-2">
                  La simulacion es gratuita. Esto es solo una estimacion de costo en produccion.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Latencia promedio</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {formatNumber(result.performance_metrics?.avg_latency_ms, 'ms')}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  P95 {formatNumber(result.performance_metrics?.p95_latency_ms, 'ms')} · Error{' '}
                  {formatNumber(result.performance_metrics?.error_rate_percent, '%')}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs text-slate-500">ROI estimado</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {formatNumber(result.roi_projection?.roi_percent, '%')}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Payback {formatNumber(result.roi_projection?.payback_months, 'meses')}
                </p>
              </div>
            </div>

            <div className="mt-8 grid lg:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-slate-100 p-5">
                <h3 className="text-sm font-semibold text-slate-900">Performance</h3>
                <div className="mt-3 space-y-2 text-xs text-slate-600">
                  <p>Throughput: {formatNumber(result.performance_metrics?.throughput_rps, 'rps')}</p>
                  <p>P50: {formatNumber(result.performance_metrics?.p50_latency_ms, 'ms')}</p>
                  <p>P99: {formatNumber(result.performance_metrics?.p99_latency_ms, 'ms')}</p>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-100 p-5">
                <h3 className="text-sm font-semibold text-slate-900">Calidad</h3>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600">
                  <p>Accuracy: {formatNumber(result.quality_metrics?.accuracy, '%')}</p>
                  <p>Precision: {formatNumber(result.quality_metrics?.precision, '%')}</p>
                  <p>Recall: {formatNumber(result.quality_metrics?.recall, '%')}</p>
                  <p>F1: {formatNumber(result.quality_metrics?.f1_score, '%')}</p>
                </div>
              </div>
            </div>

            {result.recommendations && result.recommendations.length > 0 && (
              <div className="mt-8 rounded-2xl border border-slate-100 p-5">
                <h3 className="text-sm font-semibold text-slate-900">Recomendaciones</h3>
                <ul className="mt-3 space-y-2 text-xs text-slate-600">
                  {result.recommendations.map((rec) => (
                    <li key={rec}>• {rec}</li>
                  ))}
                </ul>
              </div>
            )}

            {!pollingId && (
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setConfig(defaultConfig)}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Resetear
                </button>
                <button
                  type="button"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
                >
                  Ejecutar otra simulacion
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  )
}
