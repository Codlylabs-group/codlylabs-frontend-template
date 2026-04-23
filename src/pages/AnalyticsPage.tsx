import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, TrendingUp } from 'lucide-react'

import {
  analyticsApi,
  type KPIProjection,
  type AggregatedMetrics,
  type ROISummary,
  type TimeSeriesMetrics,
  type AlertsResponse,
} from '../services/analytics'
import { useI18n } from '../i18n'
import { getSessionDisplayName } from '../utils/sessionName'
import { useLogout } from '../hooks/useLogout'

export default function AnalyticsPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const logout = useLogout()
  const { t } = useI18n()

  const sessionId = searchParams.get('session')

  const { data, isLoading, error } = useQuery({
    queryKey: ['analytics', sessionId],
    queryFn: () => analyticsApi.summary(sessionId as string),
    enabled: Boolean(sessionId),
  })

  const { data: metrics } = useQuery<AggregatedMetrics>({
    queryKey: ['analytics-metrics', sessionId],
    queryFn: () => analyticsApi.metrics(sessionId as string),
    enabled: Boolean(sessionId),
  })

  const { data: roi } = useQuery<ROISummary>({
    queryKey: ['analytics-roi', sessionId],
    queryFn: () => analyticsApi.roi(sessionId as string),
    enabled: Boolean(sessionId),
  })

  const [periodFilter, setPeriodFilter] = useState<'day' | 'week' | 'month'>('month')

  const { data: timeSeries } = useQuery<TimeSeriesMetrics>({
    queryKey: ['analytics-timeseries', sessionId, periodFilter],
    queryFn: () => analyticsApi.timeSeries(sessionId as string, periodFilter),
    enabled: Boolean(sessionId),
  })

  const { data: alerts } = useQuery<AlertsResponse>({
    queryKey: ['analytics-alerts', sessionId],
    queryFn: () => analyticsApi.alerts(sessionId as string),
    enabled: Boolean(sessionId),
  })

  const handleDownloadReport = async () => {
    if (!sessionId) return
    try {
      const blob = await analyticsApi.downloadReport(sessionId)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `analytics_report_${sessionId}.csv`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (e) {
      // Para MVP, mostramos solo un log en consola; el error genérico ya se maneja a nivel de página.
      console.error('Error downloading analytics report', e)
    }
  }

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t('onboarding.back')}</span>
          </button>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-gray-700">
              {t('analytics.noSession')}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(`/poc-generator?session=${sessionId}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">{t('analytics.back')}</span>
          </button>
          <span className="text-xs text-gray-500">{getSessionDisplayName(sessionId || '')}</span>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex items-center justify-center gap-3 text-center">
          <TrendingUp className="w-6 h-6 text-brand-600" />
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              {t('analytics.title')}
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto mt-2">
              {t('analytics.subtitle')}
            </p>
          </div>
        </div>

        {isLoading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <p className="text-gray-600">{t('analytics.loading')}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4">
            {t('analytics.error')}
          </div>
        )}

        {data && (
          <>
            {/* Summary card */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    {t('analytics.summary.title')}
                  </p>
                  <p className="text-sm text-gray-700">
                    {t('analytics.summary.objective')}{' '}
                    <span className="font-medium text-gray-900">
                      {data.objective || t('onboarding.objective.notDetermined')}
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">{t('analytics.summary.complexity')}</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {data.complexity}
                  </p>
                  <p className="text-xs text-gray-500">
                    {t('analytics.summary.horizon')} {data.estimated_time}
                  </p>
                </div>
              </div>
            </div>

            {/* Simple impact distribution chart */}
            <ImpactDistributionChart projections={data.projections} />

            {/* Time series + filters */}
            {timeSeries && (
              <TimeSeriesBlock
                timeSeries={timeSeries}
                period={periodFilter}
                onChangePeriod={setPeriodFilter}
              />
            )}

            {/* ROI summary + metric cards */}
            {roi && (
              <ROISummarySection roi={roi} />
            )}

            {alerts && alerts.alerts.length > 0 && (
              <AlertsPanel alerts={alerts} />
            )}

            {metrics && (
              <MetricsCards metrics={metrics} />
            )}

            {/* KPI projections */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.projections.map((projection) => (
                <div
                  key={projection.description}
                  className="bg-white rounded-2xl shadow-md border border-gray-200 p-5"
                >
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                    {projection.label}
                  </p>
                  <p className="text-sm text-gray-800">
                    {projection.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleDownloadReport}
                className="inline-flex items-center px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {t('analytics.export')}
              </button>
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center px-5 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors"
              >
                {t('analytics.finish')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

interface ImpactDistributionChartProps {
  projections: KPIProjection[]
}

function ImpactDistributionChart({ projections }: ImpactDistributionChartProps) {
  const { t } = useI18n()
  
  const distribution = useMemo(() => {
    const counts: Record<string, number> = {}
    projections.forEach((p) => {
      counts[p.dimension] = (counts[p.dimension] || 0) + 1
    })
    const total = projections.length || 1
    const ordered: Array<{ key: string; label: string; color: string; value: number }> = [
      { key: 'cost', label: t('analytics.dimension.cost'), color: 'bg-emerald-500', value: 0 },
      { key: 'time', label: t('analytics.dimension.time'), color: 'bg-brand-500', value: 0 },
      { key: 'revenue', label: t('analytics.dimension.revenue'), color: 'bg-amber-500', value: 0 },
      { key: 'risk', label: t('analytics.dimension.risk'), color: 'bg-rose-500', value: 0 },
      { key: 'other', label: t('analytics.dimension.other'), color: 'bg-slate-400', value: 0 },
    ]
    ordered.forEach((item) => {
      item.value = ((counts[item.key] || 0) / total) * 100
    })
    return ordered
  }, [projections, t])

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
      <h2 className="text-sm font-semibold text-gray-900 mb-4">
        {t('analytics.distribution.title')}
      </h2>
      <div className="mt-3 flex items-end justify-between gap-4 h-40">
        {distribution
          .filter((item) => item.value > 0)
          .map((item) => (
            <div key={item.key} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-gray-600">
                {Math.round(item.value)}%
              </span>
              <div className="relative w-6 sm:w-8 md:w-10 flex-1 flex items-end">
                <div className="w-full h-full rounded-t-md bg-gray-100 overflow-hidden flex items-end">
                  <div
                    className={`${item.color} w-full rounded-t-md`}
                    style={{ height: `${item.value}%` }}
                  />
                </div>
              </div>
              <div className="mt-1 text-[11px] text-gray-700 text-center leading-tight">
                {item.label}
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}

interface TimeSeriesBlockProps {
  timeSeries: TimeSeriesMetrics
  period: 'day' | 'week' | 'month'
  onChangePeriod: (period: 'day' | 'week' | 'month') => void
}

function TimeSeriesBlock({ timeSeries, period, onChangePeriod }: TimeSeriesBlockProps) {
  const { t } = useI18n()

  const dimensions = Object.keys(timeSeries.series)
  if (dimensions.length === 0) {
    return null
  }

  const maxTotal = Math.max(
    ...dimensions.flatMap((dim) => timeSeries.series[dim].map((b) => b.total)),
    0,
  )

  if (!maxTotal) {
    return null
  }

  const periodLabel =
    period === 'day'
      ? t('analytics.period.day')
      : period === 'week'
        ? t('analytics.period.week')
        : t('analytics.period.month')

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">
            {t('analytics.timeseries.title')}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            {t('analytics.timeseries.subtitle', { period: periodLabel })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">
            {t('analytics.period.label')}
          </span>
          <select
            value={period}
            onChange={(e) => onChangePeriod(e.target.value as 'day' | 'week' | 'month')}
            className="text-xs border border-gray-300 rounded-md px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="day">{t('analytics.period.day')}</option>
            <option value="week">{t('analytics.period.week')}</option>
            <option value="month">{t('analytics.period.month')}</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {dimensions.map((dim) => {
          const buckets = timeSeries.series[dim]
          if (!buckets || buckets.length === 0) return null

          const label =
            dim === 'cost'
              ? t('analytics.dimension.cost')
              : dim === 'time'
                ? t('analytics.dimension.time')
                : dim === 'revenue'
                  ? t('analytics.dimension.revenue')
                  : dim === 'risk'
                    ? t('analytics.dimension.risk')
                    : t('analytics.dimension.other')

          return (
            <div key={dim}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium text-gray-700">
                  {label}
                </p>
                <p className="text-[11px] text-gray-500">
                  {t('analytics.timeseries.points', { count: buckets.length })}
                </p>
              </div>
              <div className="flex items-end gap-1 h-16">
                {buckets.map((bucket) => {
                  const height = Math.max((bucket.total / maxTotal) * 100, 5)
                  return (
                    <div key={`${dim}-${bucket.period}`} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex-1 flex items-end">
                        <div className="w-full bg-gray-100 rounded-t-sm overflow-hidden">
                          <div
                            className="w-full bg-brand-500 rounded-t-sm"
                            style={{ height: `${height}%` }}
                            title={`${bucket.period}: ${bucket.total.toLocaleString()}`}
                          />
                        </div>
                      </div>
                      <span className="text-[9px] text-gray-500 truncate max-w-[4rem]">
                        {bucket.period}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface AlertsPanelProps {
  alerts: AlertsResponse
}

function AlertsPanel({ alerts }: AlertsPanelProps) {
  const { t } = useI18n()

  if (!alerts.alerts.length) {
    return null
  }

  const colorByLevel: Record<string, string> = {
    info: 'bg-sky-50 border-sky-200 text-sky-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    critical: 'bg-rose-50 border-rose-200 text-rose-800',
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-gray-700">
        {t('analytics.alerts.title')}
      </p>
      <div className="grid md:grid-cols-2 gap-2">
        {alerts.alerts.map((alert, index) => (
          <div
            key={`${alert.level}-${index}`}
            className={`rounded-xl border px-3 py-2 text-xs ${colorByLevel[alert.level] ?? colorByLevel.info}`}
          >
            <p className="font-semibold mb-0.5">
              {alert.title}
            </p>
            <p className="text-[11px] leading-snug">
              {alert.message}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

interface ROISummarySectionProps {
  roi: ROISummary
}

function ROISummarySection({ roi }: ROISummarySectionProps) {
  const { t } = useI18n()
  const positive = roi.roi_percent >= 0

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">
            {t('analytics.roi.title')}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            {positive ? t('analytics.roi.positive') : t('analytics.roi.negative')}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-gray-500">
            {t('analytics.roi.roi')}
          </p>
          <p className={`text-2xl font-bold ${positive ? 'text-emerald-600' : 'text-rose-600'}`}>
            {roi.roi_percent.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500">
            {t('analytics.roi.payback', { months: roi.payback_period_months.toFixed(1) })}
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mt-4">
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
          <p className="text-xs text-emerald-700 font-medium mb-1">
            {t('analytics.roi.savings')}
          </p>
          <p className="text-sm font-semibold text-emerald-900">
            €{roi.estimated_savings_annual.toLocaleString()}
          </p>
          <p className="text-[11px] text-emerald-700 mt-1">
            {t('analytics.roi.savingsHint')}
          </p>
        </div>
        <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-4">
          <p className="text-xs text-amber-700 font-medium mb-1">
            {t('analytics.roi.revenue')}
          </p>
          <p className="text-sm font-semibold text-amber-900">
            €{roi.estimated_revenue_annual.toLocaleString()}
          </p>
          <p className="text-[11px] text-amber-700 mt-1">
            {t('analytics.roi.revenueHint')}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs text-slate-700 font-medium mb-1">
            {t('analytics.roi.investment')}
          </p>
          <p className="text-sm font-semibold text-slate-900">
            €{roi.investment_cost.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-600 mt-1">
            {t('analytics.roi.investmentHint')}
          </p>
        </div>
      </div>
    </div>
  )
}

interface MetricsCardsProps {
  metrics: AggregatedMetrics
}

function MetricsCards({ metrics }: MetricsCardsProps) {
  const { t } = useI18n()

  const orderedDimensions: Array<{ key: string; label: string; color: string }> = [
    { key: 'cost', label: t('analytics.dimension.cost'), color: 'border-emerald-200 bg-emerald-50/70' },
    { key: 'time', label: t('analytics.dimension.time'), color: 'border-brand-200 bg-brand-50/70' },
    { key: 'revenue', label: t('analytics.dimension.revenue'), color: 'border-amber-200 bg-amber-50/70' },
    { key: 'risk', label: t('analytics.dimension.risk'), color: 'border-rose-200 bg-rose-50/70' },
    { key: 'other', label: t('analytics.dimension.other'), color: 'border-slate-200 bg-slate-50' },
  ]

  const items = orderedDimensions
    .map((dim) => ({
      ...dim,
      stats: metrics.metrics[dim.key],
    }))
    .filter((item) => item.stats && item.stats.count > 0)

  if (items.length === 0) {
    return null
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item) => (
        <div
          key={item.key}
          className={`rounded-2xl border shadow-sm p-4 ${item.color}`}
        >
          <p className="text-xs uppercase tracking-wide text-gray-600 mb-1">
            {t('analytics.metrics.dimension', { dimension: item.label })}
          </p>
          <p className="text-xs text-gray-500">
            {t('analytics.metrics.events', { count: item.stats.count })}
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <div>
              <p className="text-[11px] text-gray-600">
                {t('analytics.metrics.total')}
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {item.stats.total.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-gray-600">
                {t('analytics.metrics.average')}
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {item.stats.average.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
