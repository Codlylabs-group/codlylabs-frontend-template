import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Download,
  Lightbulb,
  Loader2,
  Lock,
  Sparkles,
  X,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import {
  plgService,
  type FreeDiagnosticRequest,
  type FreeDiagnosticResponse,
  type IndustryInfo,
  type PLGStats,
} from '../services/plg'
import { API_BASE_URL } from '../services/api'
import { useI18n } from '../i18n'

const defaultForm: FreeDiagnosticRequest = {
  industry: '',
  company_size: '',
  business_problem: '',
  email: '',
  company_name: '',
}

export default function FreeDiagnosticPage() {
  const { language, t } = useI18n()
  const navigate = useNavigate()
  const [formData, setFormData] = useState<FreeDiagnosticRequest>(defaultForm)
  const [loading, setLoading] = useState(false)
  const [, setError] = useState<string | null>(null)
  const [rateLimited, setRateLimited] = useState(false)
  const [result, setResult] = useState<FreeDiagnosticResponse | null>(null)
  const [industries, setIndustries] = useState<IndustryInfo[]>([])
  const [stats, setStats] = useState<PLGStats | null>(null)
  const [statsError, setStatsError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    const loadMeta = async () => {
      try {
        const [statsResponse, industriesResponse] = await Promise.all([
          plgService.getStats(),
          plgService.getIndustries(),
        ])
        if (!isMounted) return
        setStats(statsResponse)
        setIndustries(industriesResponse.industries || [])
      } catch (err: any) {
        if (!isMounted) return
        setStatsError(err.response?.data?.detail || t('diag.error.loadMeta'))
      }
    }
    loadMeta()
    return () => { isMounted = false }
  }, [])

  const currency = useMemo(() => new Intl.NumberFormat(language === 'es' ? 'es-ES' : 'en-US'), [language])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const response = await plgService.getFreeDiagnostic({ ...formData, language })
      setResult(response)
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' })
      }, 120)
    } catch (err: any) {
      if (err.response?.status === 429) {
        setRateLimited(true)
      } else {
        setError(err.response?.data?.detail || t('diag.error.generate'))
      }
    } finally {
      setLoading(false)
    }
  }

  const inputClasses = 'w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 placeholder:text-gray-400 outline-none'

  const sidebarSteps = [
    { title: t('diag.sidebar.step1.title'), desc: t('diag.sidebar.step1.desc') },
    { title: t('diag.sidebar.step2.title'), desc: t('diag.sidebar.step2.desc') },
    { title: t('diag.sidebar.step3.title'), desc: t('diag.sidebar.step3.desc') },
  ]

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-sm shadow-indigo-500/5">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-gray-400 hover:text-gray-600 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Link to="/" className="text-xl font-bold text-indigo-600 tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>
              CodlyLabs
            </Link>
          </div>
          <div className="hidden md:flex gap-6 items-center">
            <span className="text-sm font-medium text-slate-500">{t('diag.headerLabel')}</span>
            <span className="h-4 w-px bg-slate-200" />
            <Link
              to="/onboarding"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
            >
              {t('diag.headerCta')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-20">
        {/* Hero */}
        <section className="max-w-7xl mx-auto px-6 mb-16">
          <div className="relative overflow-hidden rounded-3xl p-12 border border-gray-200/10"
            style={{ background: 'linear-gradient(135deg, rgba(228,223,255,0.3) 0%, #f8f9fa 50%, rgba(211,228,254,0.2) 100%)' }}>
            <div className="relative z-10 max-w-3xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>
                {t('diag.hero.title')} <span className="text-indigo-600">{t('diag.hero.titleHighlight')}</span>
              </h1>
              <p className="text-lg text-gray-500 mb-8 max-w-2xl leading-relaxed">
                {t('diag.hero.subtitle')}
              </p>
              <div className="flex flex-wrap gap-3">
                {[t('diag.hero.badge1'), t('diag.hero.badge2'), t('diag.hero.badge3')].map((badge) => (
                  <span key={badge} className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-200/20 text-sm font-semibold text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                    {badge}
                  </span>
                ))}
              </div>
            </div>
            <div className="absolute -right-20 -top-20 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
          </div>
        </section>

        {/* Stats Bar */}
        <section className="max-w-7xl mx-auto px-6 mb-16">
          <div className="bg-white/70 backdrop-blur-xl border border-gray-200/15 rounded-2xl p-2 flex flex-col md:flex-row items-center justify-around gap-4">
            <div className="flex flex-col items-center px-8 py-4">
              <span className="text-3xl font-extrabold text-indigo-600" style={{ fontFamily: 'Manrope, sans-serif' }}>
                {stats ? `+${currency.format(stats.total_diagnostics)}` : '+500'}
              </span>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('diag.stats.diagnostics')}</span>
            </div>
            <div className="hidden md:block h-10 w-px bg-gray-200/30" />
            <div className="flex flex-col items-center px-8 py-4">
              <span className="text-3xl font-extrabold text-emerald-600" style={{ fontFamily: 'Manrope, sans-serif' }}>
                {stats?.avg_roi_predicted || '180%'}
              </span>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('diag.stats.avgRoi')}</span>
            </div>
            <div className="hidden md:block h-10 w-px bg-gray-200/30" />
            <div className="flex flex-col items-center px-8 py-4">
              <span className="text-3xl font-extrabold text-indigo-600" style={{ fontFamily: 'Manrope, sans-serif' }}>
                {stats?.avg_payback_months ? `${stats.avg_payback_months} ${t('diag.stats.months')}` : `8 ${t('diag.stats.months')}`}
              </span>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('diag.stats.avgPayback')}</span>
            </div>
          </div>
          {statsError && <p className="mt-4 text-xs text-amber-600">{statsError}</p>}
        </section>

        {/* ═══ STATE 1: FORM ═══ */}
        {!result && (
          <section className="max-w-7xl mx-auto px-6 mb-32">
            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12">
              {/* Form */}
              <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm shadow-indigo-500/5 relative overflow-hidden">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
                    {t('diag.form.title')}
                  </h2>
                  <p className="mt-2 text-sm text-gray-500">
                    {t('diag.form.subtitle')}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-500 ml-1">{t('diag.form.industry')}</label>
                      <input
                        list="industries"
                        placeholder={t('diag.form.industryPlaceholder')}
                        value={formData.industry}
                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                        className={inputClasses}
                        required
                      />
                      <datalist id="industries">
                        {industries.map((item) => <option key={item.name} value={item.name} />)}
                      </datalist>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-500 ml-1">{t('diag.form.companySize')}</label>
                      <select
                        value={formData.company_size}
                        onChange={(e) => setFormData({ ...formData, company_size: e.target.value })}
                        className={inputClasses}
                        required
                      >
                        <option value="" disabled>{t('diag.form.companySizeSelect')}</option>
                        <option value="Startup">{t('diag.form.sizeStartup')}</option>
                        <option value="SME">{t('diag.form.sizeSME')}</option>
                        <option value="Enterprise">{t('diag.form.sizeEnterprise')}</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-500 ml-1">{t('diag.form.challenge')}</label>
                    <textarea
                      value={formData.business_problem}
                      onChange={(e) => setFormData({ ...formData, business_problem: e.target.value })}
                      className={inputClasses}
                      placeholder={t('diag.form.challengePlaceholder')}
                      rows={4}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-500 ml-1">{t('diag.form.email')}</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={inputClasses}
                      placeholder={t('diag.form.emailPlaceholder')}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-3 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98] transition-all disabled:opacity-60"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                    {loading ? t('diag.form.submitting') : t('diag.form.submit')}
                  </button>
                </form>

                {loading && (
                  <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4" />
                    <p className="text-sm font-semibold text-indigo-600 animate-pulse">
                      {t('diag.form.loading')}
                    </p>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-bold mb-6 text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>{t('diag.sidebar.title')}</h3>
                  <div className="space-y-6">
                    {sidebarSteps.map((step, i) => (
                      <div key={step.title} className="flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center font-bold text-indigo-600">
                          {i + 1}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{step.title}</h4>
                          <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 rounded-xl bg-gray-50 border border-gray-200/10 flex items-start gap-4">
                  <Lock className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{t('diag.sidebar.privacy.title')}</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {t('diag.sidebar.privacy.desc')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ═══ STATE 2: RESULTS ═══ */}
        {result && (
          <section id="results-section" className="max-w-7xl mx-auto px-6 space-y-16">
            {/* ROI Header */}
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  {t('diag.results.badge')}
                </span>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  {t('diag.results.paybackBadge', { months: String(Math.round(result.roi_prediction.payback_period_months)) })}
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
                {t('diag.results.title')}
              </h2>
              <p className="text-sm text-gray-500 mt-2" dangerouslySetInnerHTML={{
                __html: t('diag.results.basedOn', {
                  cases: String(result.roi_prediction.based_on_cases),
                  confidence: (result.roi_prediction.confidence_score * 100).toFixed(0),
                })
              }} />
              {result.roi_prediction.based_on_cases === 0 && (
                <p className="mt-2 text-xs text-amber-700">
                  {t('diag.results.noCases')}
                </p>
              )}
            </div>

            {/* ROI Scenario Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { labelKey: 'diag.results.conservative', descKey: 'diag.results.conservativeDesc', data: result.roi_prediction.conservative, style: 'bg-gray-50 border border-gray-200/5', isLight: true },
                { labelKey: 'diag.results.realistic', descKey: 'diag.results.realisticDesc', data: result.roi_prediction.realistic, style: 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 md:scale-105 z-10', isLight: false },
                { labelKey: 'diag.results.optimistic', descKey: 'diag.results.optimisticDesc', data: result.roi_prediction.optimistic, style: 'bg-emerald-600 text-white', isLight: false },
              ].map((item) => (
                <div key={item.labelKey} className={`rounded-2xl p-8 ${item.style} transition-all`}>
                  <span className={`text-xs font-bold uppercase tracking-wider ${item.isLight ? 'text-gray-400' : 'opacity-80'}`}>
                    {t('diag.results.scenario')} {t(item.labelKey)}
                  </span>
                  <div className="text-5xl font-black mt-4 mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
                    {item.data.roi_percent.toFixed(0)}%
                  </div>
                  <p className={`text-sm ${item.isLight ? 'text-gray-500' : 'opacity-90'}`}>
                    {t(item.descKey)}
                  </p>
                </div>
              ))}
            </div>

            {/* ROI Source Reference */}
            {result.roi_prediction.roi_reference && (
              <div className="flex items-center gap-2 text-xs text-gray-400 italic">
                <CheckCircle2 className="w-3 h-3" />
                {result.roi_prediction.roi_reference}
              </div>
            )}

            {/* Methodology & Sources */}
            <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-6">
              <div className="rounded-2xl bg-gray-50 p-6">
                <h4 className="text-sm font-semibold text-gray-900">{t('diag.methodology.title')}</h4>
                <p className="mt-2 text-xs text-gray-500">
                  {t('diag.methodology.evidenceQuality')}: <strong>{result.roi_methodology?.evidence_quality || 'N/D'}</strong>
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {t('diag.methodology.similarCases')}: {result.roi_methodology?.total_matching_cases ?? 0} |
                  {' '}{t('diag.methodology.withRoi')}: {result.roi_methodology?.cases_with_roi_evidence ?? 0} |
                  {' '}{t('diag.methodology.withPayback')}: {result.roi_methodology?.cases_with_payback_evidence ?? 0}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {t('diag.methodology.externalCitations')}: {result.roi_methodology?.external_citations_found ?? 0}/
                  {result.roi_methodology?.external_citations_requested ?? 0} (
                  {result.roi_methodology?.external_citations_provider || 'N/D'})
                </p>
                <div className="mt-3 rounded-xl bg-white px-3 py-2 border border-gray-100">
                  <p className="text-[11px] font-semibold uppercase text-gray-400">{t('diag.methodology.formulaLabel')}</p>
                  <p className="mt-1 text-xs text-gray-600">{t('diag.methodology.formulaRoi')}</p>
                  <p className="mt-1 text-xs text-gray-600">
                    {t('diag.methodology.roi')}: {result.roi_prediction.realistic.roi_percent.toFixed(0)}% |
                    {' '}{t('diag.methodology.savings')}: ${currency.format(result.roi_prediction.realistic.annual_savings)} |
                    {' '}{t('diag.methodology.investment')}: ${currency.format(result.roi_methodology?.base_investment_usd || result.roi_prediction.realistic.investment_cost)}
                  </p>
                  <p className="mt-1 text-xs text-gray-600">
                    {t('diag.methodology.mean')}: {result.roi_methodology?.weighted_mean_roi_percent?.toFixed(1) ?? 'N/D'}% |
                    {' '}&sigma;: {result.roi_methodology?.weighted_std_roi_percent?.toFixed(1) ?? 'N/D'} |
                    {' '}{t('diag.methodology.payback')}: {result.roi_methodology?.estimated_payback_mean_months?.toFixed(1) ?? 'N/D'} {t('diag.stats.months')}
                  </p>
                </div>
                <div className="mt-3 rounded-xl bg-indigo-50/50 border border-indigo-100 px-4 py-3">
                  <p className="text-xs font-semibold text-indigo-700 mb-1.5">{t('diag.methodology.practiceTitle')}</p>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {(() => {
                      const r = result.roi_prediction.realistic
                      const inv = result.roi_methodology?.base_investment_usd || r.investment_cost
                      const roiVal = r.roi_percent.toFixed(0)
                      const payback = result.roi_methodology?.estimated_payback_mean_months?.toFixed(0) || String(Math.round(result.roi_prediction.payback_period_months))
                      return t('diag.methodology.practiceBody', {
                        investment: currency.format(inv),
                        savings: currency.format(r.annual_savings),
                        payback,
                        roi: roiVal,
                        returnPerDollar: (r.roi_percent / 100).toFixed(1),
                      })
                    })()}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1.5">
                    {t('diag.methodology.practiceFooter')}
                  </p>
                </div>
                <div className="mt-3">
                  <p className="text-xs font-semibold uppercase text-gray-400">{t('diag.methodology.methodologyLabel')}</p>
                  <ol className="mt-2 list-decimal pl-5 space-y-1 text-xs text-gray-500">
                    {(result.roi_methodology?.calculation_steps || []).map((step) => <li key={step}>{step}</li>)}
                  </ol>
                </div>
                <div className="mt-3">
                  <p className="text-xs font-semibold uppercase text-gray-400">{t('diag.methodology.assumptionsLabel')}</p>
                  <ul className="mt-2 space-y-1 text-xs text-gray-500">
                    {(result.roi_methodology?.assumptions || []).map((a) => (
                      <li key={a} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5" /><span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-6 border border-gray-100">
                <h4 className="text-sm font-semibold text-gray-900">{t('diag.sources.title')}</h4>
                <p className="mt-2 text-xs text-gray-400">{t('diag.sources.subtitle')}</p>
                <div className="mt-3 max-h-72 overflow-y-auto space-y-3 pr-1">
                  {(result.roi_sources || []).length === 0 && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                      {t('diag.sources.noSources')}
                    </div>
                  )}
                  {(result.roi_sources || []).map((source, idx) => (
                    <div key={`${source.use_case_id}-${source.external_citation?.url || idx}`} className="rounded-xl bg-gray-50 p-3">
                      <p className="text-xs font-semibold text-gray-900">[{idx + 1}] {source.title} <span className="text-gray-400">({source.use_case_id})</span></p>
                      <p className="mt-1 text-[11px] text-gray-400">{t('diag.sources.score')}: {source.match_score}</p>
                      {(typeof source.roi_weight_used === 'number' || typeof source.payback_weight_used === 'number') && (
                        <p className="mt-1 text-[11px] text-gray-500">{t('diag.sources.weight')}: ROI={source.roi_weight_used ?? 0} | Payback={source.payback_weight_used ?? 0}</p>
                      )}
                      {source.evidence_used?.length > 0 && <p className="mt-1 text-[11px] text-gray-500">{t('diag.sources.evidence')}: {source.evidence_used.join(', ')}</p>}
                      {Object.entries(source.roi_indicators || {}).length > 0 && (
                        <p className="mt-1 text-[11px] text-gray-500">ROI: {Object.entries(source.roi_indicators).slice(0, 3).map(([k, v]) => `${k}=${v}`).join(' | ')}</p>
                      )}
                      {source.kpi_targets?.length > 0 && <p className="mt-1 text-[11px] text-gray-500">{t('diag.sources.kpis')}: {source.kpi_targets.slice(0, 3).join(' | ')}</p>}
                      {typeof source.estimated_roi_percent === 'number' && (
                        <p className="mt-1 text-[11px] text-gray-500">{t('diag.sources.caseRoi')}: {source.estimated_roi_percent.toFixed(1)}%</p>
                      )}
                      {source.external_citation ? (
                        <div className="mt-2 rounded-lg bg-indigo-50 px-2 py-2 border border-indigo-100">
                          <a href={source.external_citation.url} target="_blank" rel="noreferrer" className="text-[11px] font-semibold text-indigo-700 hover:text-indigo-800">
                            {source.external_citation.title}
                          </a>
                          <p className="mt-1 text-[11px] text-gray-500">{source.external_citation.domain}{source.external_citation.published_date ? ` | ${source.external_citation.published_date}` : ''}</p>
                          {source.external_citation.snippet && <p className="mt-1 text-[11px] text-gray-500 italic">"{source.external_citation.snippet}"</p>}
                        </div>
                      ) : (
                        <div className="mt-2 rounded-lg bg-amber-50 px-2 py-2 border border-amber-200 text-[11px] text-amber-700">{t('diag.sources.noExternal')}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommended PoCs */}
            <div>
              <h3 className="text-2xl font-bold mb-8 text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>{t('diag.pocs.title')}</h3>
              {result.recommended_pocs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {result.recommended_pocs.map((poc, index) => (
                    <button
                      key={poc.use_case_id}
                      onClick={() => {
                        const prompt = language === 'es'
                          ? `Quiero desarrollar un ${poc.title}. ${poc.description}`
                          : `I want to develop a ${poc.title}. ${poc.description}`
                        localStorage.setItem('onboarding_initial_prompt', prompt)
                        navigate('/onboarding')
                      }}
                      className="text-left bg-white rounded-2xl p-8 border border-gray-200/10 hover:shadow-md transition-all group cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <span className="text-4xl font-bold text-gray-200 group-hover:text-indigo-600 transition-colors" style={{ fontFamily: 'Manrope, sans-serif' }}>
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="px-2 py-1 bg-gray-50 text-gray-500 rounded text-[10px] font-bold uppercase">{poc.complexity}</span>
                      </div>
                      <h4 className="font-bold text-lg mb-4 text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>{poc.title}</h4>
                      <p className="text-sm text-gray-500 mb-4">{poc.description}</p>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-xs"><span className="text-gray-400">{t('diag.pocs.roi')}</span><span className="font-bold text-emerald-600">{poc.estimated_roi}</span></div>
                        <div className="flex justify-between text-xs"><span className="text-gray-400">{t('diag.pocs.payback')}</span><span className="font-bold">{typeof poc.payback_months === 'number' ? t('diag.pocs.months', { months: String(poc.payback_months) }) : t('diag.pocs.na')}</span></div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {poc.tech_stack.slice(0, 4).map((tech) => (
                          <span key={tech} className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold">{tech}</span>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-12 border border-gray-200/10 text-center">
                  <Lightbulb className="w-10 h-10 text-indigo-300 mx-auto mb-4" />
                  <p className="text-sm text-gray-500 max-w-md mx-auto">
                    {t('diag.pocs.empty')}
                  </p>
                  <p className="text-xs text-gray-400 mt-3 max-w-sm mx-auto">
                    {t('diag.pocs.emptyHint')}
                  </p>
                </div>
              )}
            </div>

            {/* Insights & Risks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Lightbulb className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>{t('diag.insights.title')}</h3>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">{result.market_insights}</p>
                <ul className="mt-4 space-y-3">
                  {result.success_factors.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-500">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>{t('diag.risks.title')}</h3>
                </div>
                <ul className="space-y-3">
                  {result.common_risks.map((r) => (
                    <li key={r} className="flex items-start gap-3">
                      <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0 opacity-60" />
                      <span className="text-sm text-gray-500">{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Download PDF CTA */}
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-2xl p-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="text-center md:text-left">
                  <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
                    {t('diag.pdf.title')}
                  </h3>
                  <p className="opacity-80 text-sm max-w-lg">
                    {t('diag.pdf.subtitle')}
                  </p>
                </div>
                {result.pdf_report_url ? (
                  <button
                    onClick={() => {
                      const url = result.pdf_report_url!.startsWith('http')
                        ? result.pdf_report_url!
                        : `${API_BASE_URL || ''}${result.pdf_report_url!}`
                      window.open(url, '_blank')
                    }}
                    className="flex-shrink-0 px-10 py-5 bg-white text-indigo-600 rounded-xl font-bold text-lg flex items-center gap-3 hover:shadow-lg hover:shadow-white/20 active:scale-[0.97] transition-all"
                  >
                    <Download className="w-5 h-5" />
                    {t('diag.pdf.download')}
                  </button>
                ) : (
                  <div className="flex-shrink-0 text-center md:text-right">
                    <span className="block px-10 py-5 bg-white/20 text-white/80 rounded-xl font-bold text-sm">
                      {t('diag.pdf.noReport')}
                    </span>
                    <p className="mt-2 text-xs text-white/60">
                      {t('diag.pdf.retry')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Rate Limit Modal */}
      {rateLimited && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative bg-white rounded-2xl p-10 max-w-md mx-4 shadow-2xl text-center">
            <button
              onClick={() => setRateLimited(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <Clock className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
              {t('diag.rateLimit.title')}
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              {t('diag.rateLimit.message')}
            </p>
            <button
              onClick={() => setRateLimited(false)}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
            >
              {t('diag.rateLimit.close')}
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full py-8 border-t border-slate-200/50 bg-[#f8f9fa]">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 max-w-7xl mx-auto gap-4">
          <div>
            <span className="font-bold text-indigo-600" style={{ fontFamily: 'Manrope, sans-serif' }}>CodlyLabs</span>
            <p className="text-sm text-slate-400 mt-1">{t('footer.copyright', { year: new Date().getFullYear() })}</p>
          </div>
          <div className="flex gap-8">
            <Link to="/policies" className="text-sm text-slate-400 hover:text-indigo-500 transition-colors">{t('footer.privacy')}</Link>
            <Link to="/policies" className="text-sm text-slate-400 hover:text-indigo-500 transition-colors">{t('footer.terms')}</Link>
            <Link to="/contact" className="text-sm text-slate-400 hover:text-indigo-500 transition-colors">{t('footer.contact')}</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
