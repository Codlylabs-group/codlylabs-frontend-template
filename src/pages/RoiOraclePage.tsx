import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, FileText } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useI18n } from '../i18n'
import { plgService, type ROIOracleCase } from '../services/plg'
// import { ImpactMatrix } from '../components/ImpactMatrix'

const RISK_LABELS = ['Low', 'Medium', 'High'] as const

const normalizeRiskLabel = (value: string): 'Low' | 'Medium' | 'High' => {
  const normalized = value.trim().toLowerCase()
  if (normalized === 'low') return 'Low'
  if (normalized === 'medium') return 'Medium'
  return 'High'
}

const normalizeConfidenceLabel = (value: string): 'Low' | 'Medium' | 'High' => {
  const normalized = value.trim().toLowerCase()
  if (normalized === 'high') return 'High'
  if (normalized === 'medium') return 'Medium'
  return 'Low'
}

export default function RoiOraclePage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [oracleCases, setOracleCases] = useState<ROIOracleCase[]>([])
  const [totalRealCases, setTotalRealCases] = useState(0)
  const [avgRealisticROI, setAvgRealisticROI] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [verticalFilter, setVerticalFilter] = useState('all')
  const [riskFilter, setRiskFilter] = useState<'all' | (typeof RISK_LABELS)[number]>('all')

  useEffect(() => {
    let isMounted = true

    const loadOracleCases = async () => {
      setLoading(true)
      setLoadError(null)
      try {
        const response = await plgService.getROIOracleCases({ limit: 200 })
        if (!isMounted) return
        setOracleCases(response.cases || [])
        setTotalRealCases(response.total_real_cases || 0)
        setAvgRealisticROI(
          typeof response.avg_realistic_roi_percent === 'number' ? response.avg_realistic_roi_percent : null
        )
      } catch (error: any) {
        if (!isMounted) return
        setLoadError(error.response?.data?.detail || 'No pudimos cargar casos reales de ROI Oracle.')
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadOracleCases()
    return () => {
      isMounted = false
    }
  }, [])

  const verticalOptions = useMemo(() => {
    const unique = Array.from(new Set(oracleCases.map((c) => c.industry)))
    return unique
  }, [oracleCases])

  const filteredCases = useMemo(() => {
    return oracleCases.filter((item) => {
      const matchesVertical = verticalFilter === 'all' || item.industry === verticalFilter
      const matchesRisk = riskFilter === 'all' || normalizeRiskLabel(item.risk_level) === riskFilter
      return matchesVertical && matchesRisk
    })
  }, [oracleCases, verticalFilter, riskFilter])

  const summary = useMemo(() => {
    const loadedTotal = oracleCases.length
    const computedAvgROI = loadedTotal
      ? Math.round(oracleCases.reduce((acc, item) => acc + item.roi_realistic_percent, 0) / loadedTotal)
      : 0
    const highConfidence = oracleCases.filter(
      (item) => normalizeConfidenceLabel(item.confidence_label) === 'High'
    ).length

    return {
      total: totalRealCases || loadedTotal,
      avgRoi: avgRealisticROI !== null ? Math.round(avgRealisticROI) : computedAvgROI,
      highConfidence,
    }
  }, [oracleCases, totalRealCases, avgRealisticROI])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">{t('roiOracle.back')}</span>
          </button>
          <Link
            to="/poc-generator"
            className="text-xs font-semibold text-brand-600 hover:text-brand-800"
          >
            {t('roiOracle.viewPocGenerator')}
          </Link>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <header className="space-y-3 text-center">
          <p className="text-xs uppercase tracking-wide text-brand-600 font-semibold">
            {t('roiOracle.label')}
          </p>
          <h1 className="text-4xl font-bold text-gray-900">{t('roiOracle.title')}</h1>
          <h2 className="text-2xl font-semibold text-gray-700">
            {t('roiOracle.heroSubtitle2')}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t('roiOracle.subtitle')}
          </p>
          <div className="mt-6 flex flex-col md:flex-row items-center justify-center gap-4">
            <Link
              to="/onboarding"
              className="inline-flex items-center justify-center px-6 py-3 bg-brand-600 text-white font-semibold rounded-full hover:bg-brand-700 transition-colors shadow-lg shadow-brand-200"
            >
              {t('roiOracle.viewPocGenerator')}
            </Link>
              <div className="flex items-center gap-3 bg-white shadow rounded-2xl px-5 py-4 border border-gray-200">
              <FileText className="w-6 h-6 text-brand-600" />
              <div>
                <p className="text-sm font-semibold text-gray-900">{t('roiOracle.reportPlaceholderTitle')}</p>
                <p className="text-xs text-gray-500">{t('roiOracle.reportPlaceholderSubtitle')}</p>
              </div>
            </div>
          </div>
        </header>

        <section className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: t('roiOracle.steps.step1.title'),
              description: t('roiOracle.steps.step1.description'),
            },
            {
              title: t('roiOracle.steps.step2.title'),
              description: t('roiOracle.steps.step2.description'),
            },
            {
              title: t('roiOracle.steps.step3.title'),
              description: t('roiOracle.steps.step3.description'),
            },
          ].map((step) => (
            <article key={step.title} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-2">
              <p className="text-xs uppercase tracking-wide text-brand-600 font-semibold">
                {step.title}
              </p>
              <p className="text-gray-700 text-sm leading-relaxed">{step.description}</p>
            </article>
          ))}
        </section>

        {/* <section>
          <ImpactMatrix
            items={filteredCases.slice(0, 6).map((item) => ({
              id: item.id,
              label: item.title,
              impact: Math.min(1, (item.roiMin + item.roiMax) / 3000),
              effort: Math.min(1, item.estimatedWeeks / 12),
            }))}
          />
        </section> */}

        <section className="grid sm:grid-cols-3 gap-4">
          <StatisticCard label={t('roiOracle.metrics.cases')} value={`${summary.total}`} />
          <StatisticCard
            label={t('roiOracle.metrics.avgRoi')}
            value={`${summary.avgRoi}%`}
            helper={t('roiOracle.metrics.avgRoiHelper')}
          />
          <StatisticCard
            label={t('roiOracle.metrics.generation')}
            value="5 min"
            helper={t('roiOracle.metrics.generationHelper')}
          />
        </section>

        {loadError && (
          <section className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
            {loadError}
          </section>
        )}

        <section className="bg-white rounded-2xl shadow border border-gray-200 p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-gray-900">{t('roiOracle.filters.title')}</h2>
            <span className="text-xs text-gray-500">
              {t('roiOracle.filters.confidence', { count: summary.highConfidence })}
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            <label className="text-xs text-gray-600 font-semibold">
              {t('roiOracle.filters.vertical')}
              <select
                value={verticalFilter}
                onChange={(event) => setVerticalFilter(event.target.value)}
                className="ml-2 text-sm border border-gray-300 rounded-md px-3 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/70"
              >
                <option value="all">{t('roiOracle.filters.all')}</option>
                {verticalOptions.map((vertical) => (
                  <option key={vertical} value={vertical}>
                    {vertical}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs text-gray-600 font-semibold">
              {t('roiOracle.filters.risk')}
              <select
                value={riskFilter}
                onChange={(event) => setRiskFilter(event.target.value as RoiRiskFilter)}
                className="ml-2 text-sm border border-gray-300 rounded-md px-3 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/70"
              >
                <option value="all">{t('roiOracle.filters.all')}</option>
                {RISK_LABELS.map((risk) => (
                  <option key={risk} value={risk}>
                    {t(`roiOracle.risk.${risk.toLowerCase()}`)}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="space-y-6">
          {loading ? (
            <div className="bg-white rounded-2xl shadow border border-gray-200 p-6 text-center text-sm text-gray-600">
              Cargando casos con evidencia real...
            </div>
          ) : filteredCases.length === 0 ? (
            <div className="bg-white rounded-2xl shadow border border-gray-200 p-6 text-center text-sm text-gray-600">
              {t('roiOracle.emptyState')}
            </div>
          ) : (
            filteredCases.map((item) => (
              <RoiCaseCard key={item.diagnostic_id} item={item} />
            ))
          )}
        </section>
      </main>
    </div>
  )
}

type RoiRiskFilter = 'all' | 'Low' | 'Medium' | 'High'

interface StatisticCardProps {
  label: string
  value: string
  helper?: string
}

function StatisticCard({ label, value, helper }: StatisticCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center shadow-sm">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="text-3xl font-semibold text-gray-900 mt-3">{value}</p>
      {helper && <p className="text-xs text-gray-500 mt-1">{helper}</p>}
    </div>
  )
}

interface RoiCaseCardProps {
  item: ROIOracleCase
}

function RoiCaseCard({ item }: RoiCaseCardProps) {
  const { t } = useI18n()
  const riskLevel = normalizeRiskLabel(item.risk_level)
  const confidence = normalizeConfidenceLabel(item.confidence_label)
  const highlights = item.methodology_steps.length > 0 ? item.methodology_steps : item.assumptions

  return (
    <article className="bg-white rounded-2xl shadow border border-gray-200 p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider">
            {item.industry} · {t(`roiOracle.risk.${riskLevel.toLowerCase()}`)} risk
          </p>
          <h3 className="text-2xl font-semibold text-gray-900">{item.title}</h3>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">{t('roiOracle.card.timeline')}</p>
          <p className="text-sm font-semibold text-gray-900">{item.timeline || '5 min'}</p>
        </div>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed">{item.summary}</p>
      <div className="grid sm:grid-cols-3 gap-4 text-sm text-gray-700">
        <div>
          <p className="text-xs text-gray-500">{t('roiOracle.card.roiRange')}</p>
          <p className="text-lg font-semibold text-gray-900">
            {item.roi_min_percent}% – {item.roi_max_percent}%
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">{t('roiOracle.card.confidenceScore')}</p>
          <p className="text-lg font-semibold text-gray-900">{Math.round(item.confidence_score * 100)}%</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">{t('roiOracle.card.externalSources')}</p>
          <p className="text-lg font-semibold text-gray-900">{item.evidence_sources.length}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="px-3 py-1 rounded-full border text-brand-700 border-brand-200 bg-brand-50">
          {t('roiOracle.card.confidence')} {confidence}
        </span>
        <span className="px-3 py-1 rounded-full border text-rose-600 border-rose-100 bg-rose-50">
          {t('roiOracle.riskTag', { risk: t(`roiOracle.risk.${riskLevel.toLowerCase()}`) })}
        </span>
      </div>
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-gray-500">{t('roiOracle.card.dataAssets')}</p>
        <div className="flex flex-wrap gap-2">
          {item.technologies.map((asset) => (
            <span
              key={asset}
              className="px-3 py-1 rounded-full bg-gray-100 text-xs text-gray-700 border border-gray-200"
            >
              {asset}
            </span>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-gray-500">{t('roiOracle.card.highlights')}</p>
        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
          {highlights.slice(0, 3).map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>
      </div>
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-gray-500">Fuentes Externas Verificables</p>
        <div className="space-y-2">
          {item.evidence_sources.slice(0, 3).map((source) => (
            <div key={`${item.diagnostic_id}-${source.use_case_id}-${source.citation.url}`} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <a
                href={source.citation.url}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-semibold text-brand-700 hover:text-brand-900"
              >
                {source.citation.title}
              </a>
              <p className="mt-1 text-xs text-gray-600">
                {source.citation.domain}
                {source.citation.published_date ? ` | ${source.citation.published_date}` : ''}
              </p>
              {source.citation.snippet && (
                <p className="mt-1 text-xs text-gray-600">"{source.citation.snippet}"</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </article>
  )
}
