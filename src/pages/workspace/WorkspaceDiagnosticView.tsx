import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  Lightbulb,
  Loader2,
  Lock,
  Sparkles,
  X,
} from 'lucide-react'

import { API_BASE_URL } from '../../services/api'
import {
  plgService,
  type FreeDiagnosticRequest,
  type FreeDiagnosticResponse,
  type IndustryInfo,
  type PLGStats,
} from '../../services/plg'
import { useWorkspaceOutletContext } from './WorkspaceLayout'

const DEFAULT_FORM: FreeDiagnosticRequest = {
  industry: '',
  company_size: '',
  business_problem: '',
  email: '',
  company_name: '',
}

const SIDEBAR_STEPS = [
  {
    title: 'Respondé 3 preguntas clave',
    desc: 'Industria, tamaño de empresa y el problema de negocio que querés resolver con IA.',
  },
  {
    title: 'Evaluamos casos comparables',
    desc: 'Nuestro motor mide tu caso contra cientos de iniciativas reales de IA con evidencia.',
  },
  {
    title: 'Recibís el diagnóstico',
    desc: 'ROI esperado, payback, PoCs recomendadas, fuentes y un PDF ejecutivo descargable.',
  },
]

export default function WorkspaceDiagnosticView() {
  const navigate = useNavigate()
  const { brand, setHeader } = useWorkspaceOutletContext()
  const currencyFormatter = useMemo(() => new Intl.NumberFormat('es-AR'), [])

  const [formData, setFormData] = useState<FreeDiagnosticRequest>(DEFAULT_FORM)
  const [industries, setIndustries] = useState<IndustryInfo[]>([])
  const [stats, setStats] = useState<PLGStats | null>(null)
  const [statsError, setStatsError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [rateLimited, setRateLimited] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [result, setResult] = useState<FreeDiagnosticResponse | null>(null)

  const resultsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setHeader('Diagnóstico', 'Explorá ROI, payback y PoCs recomendadas para tu caso')
  }, [setHeader])

  useEffect(() => {
    let cancelled = false
    const loadMeta = async () => {
      try {
        const [statsResponse, industriesResponse] = await Promise.all([
          plgService.getStats(),
          plgService.getIndustries(),
        ])
        if (cancelled) return
        setStats(statsResponse)
        setIndustries(industriesResponse.industries || [])
      } catch (err: any) {
        if (cancelled) return
        setStatsError(err?.response?.data?.detail || 'No se pudieron cargar las estadísticas del diagnóstico.')
      }
    }
    void loadMeta()
    return () => {
      cancelled = true
    }
  }, [])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setErrorMessage(null)
    setResult(null)
    try {
      const response = await plgService.getFreeDiagnostic({ ...formData, language: 'es' })
      setResult(response)
      window.setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 120)
    } catch (err: any) {
      if (err?.response?.status === 429) {
        setRateLimited(true)
      } else {
        setErrorMessage(err?.response?.data?.detail || 'No se pudo generar el diagnóstico. Probá de nuevo en unos minutos.')
      }
    } finally {
      setLoading(false)
    }
  }

  const inputClasses =
    'w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-colors focus:border-blue-300'

  return (
    <>
      <div
        className="relative mb-6 overflow-hidden rounded-xl p-6 text-white"
        style={{ background: `linear-gradient(135deg, ${brand.primary}, ${brand.primaryDark})` }}
      >
        <div className="absolute right-0 top-0 h-40 w-40 opacity-10">
          <svg viewBox="0 0 200 200" className="h-full w-full">
            <circle cx="100" cy="100" r="80" fill="none" stroke="white" strokeWidth="0.5" />
            <circle cx="100" cy="100" r="60" fill="none" stroke="white" strokeWidth="0.5" />
            <circle cx="100" cy="100" r="40" fill="none" stroke="white" strokeWidth="0.5" />
          </svg>
        </div>
        <div className="relative">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white/90 backdrop-blur-sm">
            <Sparkles size={10} />
            Diagnóstico guiado
          </span>
          <h2 className="mt-3 text-xl font-semibold">Descubrí el ROI potencial de tu iniciativa de IA</h2>
          <p className="mt-1 max-w-2xl text-sm text-blue-100">
            Validamos tu caso contra nuestra base de iniciativas reales y te devolvemos ROI, payback y PoCs recomendadas.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {['Sin compromisos', 'Resultados en segundos', 'Evidencia externa'].map((badge) => (
              <span
                key={badge}
                className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm"
              >
                <CheckCircle2 size={10} />
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatTile
          value={stats ? `+${currencyFormatter.format(stats.total_diagnostics)}` : '+500'}
          label="Diagnósticos generados"
          color={brand.primary}
        />
        <StatTile
          value={stats?.avg_roi_predicted ?? '180%'}
          label="ROI promedio"
          color="#10B981"
        />
        <StatTile
          value={stats?.avg_payback_months ? `${stats.avg_payback_months} meses` : '8 meses'}
          label="Payback promedio"
          color={brand.primary}
        />
      </div>
      {statsError && <p className="mb-4 text-xs text-amber-600">{statsError}</p>}

      {!result && (
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6">
              <h3 className="text-base font-semibold text-gray-900">Contanos tu contexto</h3>
              <p className="mt-1 text-xs text-gray-500">Cuánto más detalle nos des, mejor será la recomendación.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold text-gray-500">Industria</label>
                  <input
                    list="workspace-diagnostic-industries"
                    placeholder="Ej: Fintech, Retail, Salud..."
                    value={formData.industry}
                    onChange={(event) => setFormData({ ...formData, industry: event.target.value })}
                    className={inputClasses}
                    required
                  />
                  <datalist id="workspace-diagnostic-industries">
                    {industries.map((item) => (
                      <option key={item.name} value={item.name} />
                    ))}
                  </datalist>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold text-gray-500">Tamaño de la empresa</label>
                  <select
                    value={formData.company_size}
                    onChange={(event) => setFormData({ ...formData, company_size: event.target.value })}
                    className={inputClasses}
                    required
                  >
                    <option value="" disabled>
                      Seleccioná un tamaño
                    </option>
                    <option value="Startup">Startup (1-50)</option>
                    <option value="SME">PyME (51-500)</option>
                    <option value="Enterprise">Enterprise (500+)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-gray-500">Desafío de negocio</label>
                <textarea
                  value={formData.business_problem}
                  onChange={(event) => setFormData({ ...formData, business_problem: event.target.value })}
                  className={inputClasses}
                  rows={4}
                  placeholder="Ej: Automatizar clasificación de reclamos, predecir churn, acelerar revisión de contratos..."
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-gray-500">Email de contacto (opcional)</label>
                <input
                  type="email"
                  value={formData.email ?? ''}
                  onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                  className={inputClasses}
                  placeholder="tu@empresa.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md disabled:opacity-60"
                style={{ background: `linear-gradient(135deg, ${brand.primary}, ${brand.primaryDark})` }}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {loading ? 'Generando diagnóstico...' : 'Generar diagnóstico'}
              </button>

              {errorMessage && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                  {errorMessage}
                </div>
              )}
            </form>

            {loading && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-white/90 backdrop-blur-sm">
                <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-indigo-600" />
                <p className="text-xs font-semibold text-indigo-600">Evaluando casos similares y evidencia externa...</p>
              </div>
            )}
          </div>

          <div className="space-y-5">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900">Cómo funciona</h3>
              <div className="mt-5 space-y-5">
                {SIDEBAR_STEPS.map((step, index) => (
                  <div key={step.title} className="flex gap-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-600">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">{step.title}</h4>
                      <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
              <Lock size={16} className="mt-0.5 flex-shrink-0 text-emerald-600" />
              <div>
                <h4 className="text-sm font-semibold text-gray-900">Tus datos quedan en tu workspace</h4>
                <p className="mt-1 text-xs text-gray-500">
                  No compartimos tu información con terceros. Todo el análisis se guarda asociado a tu organización.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {result && (
        <section ref={resultsRef} className="space-y-10">
          <div>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                Diagnóstico generado
              </span>
              <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-indigo-700">
                Payback {Math.round(result.roi_prediction.payback_period_months)} meses
              </span>
            </div>
            <h2 className="mt-3 text-2xl font-bold text-gray-900">Potencial estimado para tu caso</h2>
            <p className="mt-2 text-sm text-gray-500">
              Basado en {result.roi_prediction.based_on_cases} casos comparables · confianza{' '}
              {(result.roi_prediction.confidence_score * 100).toFixed(0)}%
            </p>
            {result.roi_prediction.based_on_cases === 0 && (
              <p className="mt-2 text-xs text-amber-700">
                Todavía no tenemos suficientes casos en esta industria — el resultado es orientativo.
              </p>
            )}
          </div>

          {/* ROI scenarios */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {[
              { label: 'Conservador', desc: 'Escenario cauto si el despliegue toma más tiempo.', data: result.roi_prediction.conservative, style: 'bg-white border border-gray-200', isLight: true },
              { label: 'Realista', desc: 'El escenario esperado con buena ejecución.', data: result.roi_prediction.realistic, style: 'bg-indigo-600 text-white md:scale-105 shadow-xl shadow-indigo-500/20 z-10', isLight: false },
              { label: 'Optimista', desc: 'Upside si todo acelera según lo planificado.', data: result.roi_prediction.optimistic, style: 'bg-emerald-600 text-white', isLight: false },
            ].map((item) => (
              <div key={item.label} className={`rounded-2xl p-6 transition-all ${item.style}`}>
                <span className={`text-[10px] font-semibold uppercase tracking-wider ${item.isLight ? 'text-gray-400' : 'opacity-80'}`}>
                  Escenario {item.label}
                </span>
                <div className="mt-3 text-4xl font-black" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  {item.data.roi_percent.toFixed(0)}%
                </div>
                <p className={`mt-2 text-xs ${item.isLight ? 'text-gray-500' : 'opacity-90'}`}>{item.desc}</p>
                <div className={`mt-4 space-y-1 text-[11px] ${item.isLight ? 'text-gray-500' : 'opacity-80'}`}>
                  <p>Ahorro anual: ${currencyFormatter.format(item.data.annual_savings)}</p>
                  <p>Inversión inicial: ${currencyFormatter.format(item.data.investment_cost)}</p>
                </div>
              </div>
            ))}
          </div>

          {result.roi_prediction.roi_reference && (
            <p className="flex items-center gap-2 text-xs italic text-gray-400">
              <CheckCircle2 size={12} />
              {result.roi_prediction.roi_reference}
            </p>
          )}

          {/* Methodology + sources */}
          <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h4 className="text-sm font-semibold text-gray-900">Metodología</h4>
              <p className="mt-2 text-xs text-gray-500">
                Calidad de evidencia:{' '}
                <strong>{result.roi_methodology?.evidence_quality || 'N/D'}</strong>
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Casos similares: {result.roi_methodology?.total_matching_cases ?? 0} · Con ROI:{' '}
                {result.roi_methodology?.cases_with_roi_evidence ?? 0} · Con payback:{' '}
                {result.roi_methodology?.cases_with_payback_evidence ?? 0}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Citas externas: {result.roi_methodology?.external_citations_found ?? 0}/
                {result.roi_methodology?.external_citations_requested ?? 0} ({result.roi_methodology?.external_citations_provider || 'N/D'})
              </p>

              <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
                <p className="text-[10px] font-semibold uppercase text-gray-400">Fórmula</p>
                <p className="mt-1 text-xs text-gray-600">ROI = (Ahorro anual − Inversión) / Inversión × 100</p>
                <p className="mt-1 text-xs text-gray-600">
                  ROI realista: {result.roi_prediction.realistic.roi_percent.toFixed(0)}% · Ahorro: $
                  {currencyFormatter.format(result.roi_prediction.realistic.annual_savings)} · Inversión: $
                  {currencyFormatter.format(
                    result.roi_methodology?.base_investment_usd || result.roi_prediction.realistic.investment_cost,
                  )}
                </p>
              </div>

              <div className="mt-4">
                <p className="text-[10px] font-semibold uppercase text-gray-400">Pasos del cálculo</p>
                <ol className="mt-2 list-decimal space-y-1 pl-5 text-xs text-gray-500">
                  {(result.roi_methodology?.calculation_steps || []).map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </div>

              <div className="mt-4">
                <p className="text-[10px] font-semibold uppercase text-gray-400">Supuestos</p>
                <ul className="mt-2 space-y-1 text-xs text-gray-500">
                  {(result.roi_methodology?.assumptions || []).map((assumption) => (
                    <li key={assumption} className="flex items-start gap-2">
                      <CheckCircle2 size={12} className="mt-0.5 text-emerald-500" />
                      <span>{assumption}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h4 className="text-sm font-semibold text-gray-900">Fuentes comparables</h4>
              <p className="mt-1 text-xs text-gray-400">Casos reales usados como base del cálculo</p>
              <div className="mt-3 max-h-80 space-y-3 overflow-y-auto pr-1">
                {(result.roi_sources || []).length === 0 && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                    No se encontraron fuentes comparables para este caso.
                  </div>
                )}
                {(result.roi_sources || []).map((source, idx) => (
                  <div
                    key={`${source.use_case_id}-${source.external_citation?.url || idx}`}
                    className="rounded-xl border border-gray-100 bg-gray-50 p-3"
                  >
                    <p className="text-xs font-semibold text-gray-900">
                      [{idx + 1}] {source.title} <span className="text-gray-400">({source.use_case_id})</span>
                    </p>
                    <p className="mt-1 text-[11px] text-gray-400">Score: {source.match_score}</p>
                    {source.external_citation ? (
                      <div className="mt-2 rounded-lg border border-indigo-100 bg-indigo-50 px-2 py-2">
                        <a
                          href={source.external_citation.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] font-semibold text-indigo-700 hover:text-indigo-800"
                        >
                          {source.external_citation.title}
                        </a>
                        <p className="mt-1 text-[11px] text-gray-500">
                          {source.external_citation.domain}
                          {source.external_citation.published_date ? ` · ${source.external_citation.published_date}` : ''}
                        </p>
                        {source.external_citation.snippet && (
                          <p className="mt-1 text-[11px] italic text-gray-500">"{source.external_citation.snippet}"</p>
                        )}
                      </div>
                    ) : (
                      <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-2 py-2 text-[11px] text-amber-700">
                        Sin cita externa verificable
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommended PoCs */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900">PoCs recomendadas</h3>
            {result.recommended_pocs.length > 0 ? (
              <div className="mt-5 grid gap-5 md:grid-cols-3">
                {result.recommended_pocs.map((poc, index) => (
                  <button
                    key={poc.use_case_id}
                    type="button"
                    onClick={() => {
                      const prompt = `Quiero desarrollar un ${poc.title}. ${poc.description}`
                      window.localStorage.setItem('onboarding_initial_prompt', prompt)
                      navigate('/workspace/discovery')
                    }}
                    className="group cursor-pointer rounded-2xl border border-gray-200 bg-white p-6 text-left transition-all hover:shadow-md"
                  >
                    <div className="mb-5 flex items-start justify-between">
                      <span className="text-4xl font-bold text-gray-200 transition-colors group-hover:text-indigo-600">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="rounded bg-gray-100 px-2 py-0.5 text-[9px] font-bold uppercase text-gray-500">
                        {poc.complexity}
                      </span>
                    </div>
                    <h4 className="text-base font-semibold text-gray-900">{poc.title}</h4>
                    <p className="mt-2 text-xs leading-relaxed text-gray-500">{poc.description}</p>
                    <div className="mt-4 space-y-1 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-gray-400">ROI esperado</span>
                        <span className="font-bold text-emerald-600">{poc.estimated_roi}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Payback</span>
                        <span className="font-semibold text-gray-900">
                          {typeof poc.payback_months === 'number' ? `${poc.payback_months} meses` : 'N/D'}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {poc.tech_stack.slice(0, 4).map((tech) => (
                        <span key={tech} className="rounded-full bg-indigo-50 px-2 py-0.5 text-[9px] font-semibold text-indigo-600">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
                <Lightbulb size={24} className="mx-auto text-indigo-300" />
                <p className="mt-3 text-sm text-gray-500">
                  No encontramos PoCs directamente comparables todavía.
                </p>
                <p className="mt-2 text-xs text-gray-400">
                  Probá iniciar un Discovery para explorar opciones en base a tu caso.
                </p>
              </div>
            )}
          </div>

          {/* Insights + Risks */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="mb-4 flex items-center gap-3">
                <Lightbulb size={18} className="text-emerald-600" />
                <h3 className="text-base font-semibold text-gray-900">Insights del mercado</h3>
              </div>
              <p className="text-sm leading-relaxed text-gray-500">{result.market_insights}</p>
              <ul className="mt-4 space-y-3">
                {result.success_factors.map((factor) => (
                  <li key={factor} className="flex items-start gap-3">
                    <CheckCircle2 size={14} className="mt-0.5 flex-shrink-0 text-emerald-500" />
                    <span className="text-xs text-gray-500">{factor}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="mb-4 flex items-center gap-3">
                <AlertTriangle size={18} className="text-amber-500" />
                <h3 className="text-base font-semibold text-gray-900">Riesgos comunes</h3>
              </div>
              <ul className="space-y-3">
                {result.common_risks.map((risk) => (
                  <li key={risk} className="flex items-start gap-3">
                    <AlertTriangle size={14} className="mt-0.5 flex-shrink-0 text-amber-400 opacity-70" />
                    <span className="text-xs text-gray-500">{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* PDF CTA */}
          <div
            className="relative overflow-hidden rounded-2xl p-8 text-white"
            style={{ background: `linear-gradient(135deg, ${brand.primary}, ${brand.primaryDark})` }}
          >
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
            <div className="relative flex flex-col items-center justify-between gap-5 md:flex-row">
              <div className="text-center md:text-left">
                <h3 className="text-xl font-bold">Descargá el reporte ejecutivo</h3>
                <p className="mt-1 max-w-md text-sm opacity-80">
                  Un PDF con el diagnóstico completo, los escenarios de ROI y las PoCs recomendadas, listo para compartir.
                </p>
              </div>
              {result.pdf_report_url ? (
                <button
                  type="button"
                  onClick={() => {
                    const url = result.pdf_report_url!.startsWith('http')
                      ? result.pdf_report_url!
                      : `${API_BASE_URL || ''}${result.pdf_report_url!}`
                    window.open(url, '_blank')
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-indigo-600 shadow-sm transition-shadow hover:shadow-md"
                >
                  <Download size={16} />
                  Descargar PDF
                </button>
              ) : (
                <div className="text-center md:text-right">
                  <span className="inline-block rounded-xl bg-white/20 px-6 py-3 text-sm font-semibold text-white/80">
                    Reporte en preparación
                  </span>
                  <p className="mt-2 text-[11px] opacity-70">Volvé a generar en unos minutos.</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                setResult(null)
                setFormData(DEFAULT_FORM)
                setErrorMessage(null)
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium text-gray-600 transition-colors hover:border-blue-200 hover:text-blue-600"
            >
              Volver al formulario
            </button>
          </div>
        </section>
      )}

      {rateLimited && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-gray-900/30 px-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl">
            <button
              type="button"
              onClick={() => setRateLimited(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
            <Clock size={32} className="mx-auto text-indigo-500" />
            <h3 className="mt-4 text-lg font-bold text-gray-900">Estamos procesando muchos diagnósticos</h3>
            <p className="mt-2 text-sm text-gray-500">
              Alcanzaste el límite temporal de diagnósticos. Probá de nuevo en unos minutos.
            </p>
            <button
              type="button"
              onClick={() => setRateLimited(false)}
              className="mt-5 w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  )
}

function StatTile({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
      <div className="text-2xl font-bold" style={{ color }}>
        {value}
      </div>
      <div className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">{label}</div>
    </div>
  )
}
