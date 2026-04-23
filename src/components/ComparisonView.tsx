import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { recommendationApi, type ComparisonResponse } from '../services/recommendation'
import { useI18n } from '../i18n'

interface ComparisonViewProps {
  sessionId: string
}

export function ComparisonView({ sessionId }: ComparisonViewProps) {
  const { t } = useI18n()

  const [selectedScenario, setSelectedScenario] = useState<'conservative' | 'realistic' | 'optimistic'>(
    'realistic',
  )

  const { data, isLoading, error } = useQuery<ComparisonResponse>({
    queryKey: ['comparison', sessionId],
    queryFn: () => recommendationApi.getComparison(sessionId),
    enabled: Boolean(sessionId),
  })

  const scenario = useMemo(() => {
    if (!data) return null
    return data.scenarios[selectedScenario]
  }, [data, selectedScenario])

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <p className="text-sm text-gray-600">{t('comparison.loading')}</p>
      </div>
    )
  }

  if (error || !data || !scenario) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-red-200 text-red-800 p-6 text-sm">
        {t('comparison.error')}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {t('comparison.title')}
          </h2>
          <p className="text-xs text-gray-600">
            {t('comparison.subtitle')}
          </p>
        </div>
        <div className="flex gap-1 rounded-full bg-gray-100 p-1 text-xs">
          {(['conservative', 'realistic', 'optimistic'] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedScenario(key)}
              className={`px-3 py-1 rounded-full transition-colors ${
                selectedScenario === key
                  ? 'bg-brand-600 text-white'
                  : 'text-gray-700 hover:bg-white'
              }`}
            >
              {t(`comparison.scenario.${key}`)}
            </button>
          ))}
        </div>
      </div>

      {data.summary?.headline && (
        <div className="px-3 py-2 rounded-lg bg-brand-50 border border-brand-100 text-xs text-brand-800">
          {data.summary.headline}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <ComparisonMetrics scenario={scenario} />
        <ComparisonBars scenario={scenario} />
      </div>
    </div>
  )
}

interface ComparisonScenarioMetricsProps {
  scenario: ComparisonResponse['scenarios'][string]
}

function ComparisonMetrics({ scenario }: ComparisonScenarioMetricsProps) {
  const { t } = useI18n()

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-900">
        {t('comparison.metrics.title')}
      </h3>
      <div className="space-y-2">
        {scenario.metrics.map((metric) => {
          const isPositive = metric.dimension === 'revenue' ? metric.delta_percent >= 0 : metric.delta_percent <= 0
          const deltaAbs = Math.abs(metric.delta_percent)

          return (
            <div
              key={metric.dimension}
              className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"
            >
              <div>
                <p className="text-xs font-medium text-gray-800">
                  {t(`comparison.dimension.${metric.dimension}`, { defaultValue: metric.dimension })}
                </p>
                <p className="text-[11px] text-gray-500">
                  {t('comparison.baseline')}: {metric.baseline.toFixed(0)} | {t('comparison.withAi')}:{' '}
                  {metric.with_ai.toFixed(0)}
                </p>
              </div>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                  isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                }`}
                title={
                  metric.dimension === 'revenue'
                    ? t('comparison.tooltip.revenue', { value: deltaAbs.toFixed(1) })
                    : t('comparison.tooltip.generic', { value: deltaAbs.toFixed(1) })
                }
              >
                {deltaAbs.toFixed(1)}%
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ComparisonBars({ scenario }: ComparisonScenarioMetricsProps) {
  const { t } = useI18n()

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 mb-3">
        {t('comparison.chart.title')}
      </h3>
      <div className="space-y-3">
        {scenario.metrics.map((metric) => {
          const maxValue = Math.max(metric.baseline, metric.with_ai, 1)
          const baselineWidth = (metric.baseline / maxValue) * 100
          const withAiWidth = (metric.with_ai / maxValue) * 100

          return (
            <div key={metric.dimension} className="space-y-1">
              <div className="flex justify-between text-[11px] text-gray-600">
                <span>{t(`comparison.dimension.${metric.dimension}`, { defaultValue: metric.dimension })}</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-10 text-[10px] text-gray-500">{t('comparison.legend.before')}</span>
                  <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-2 rounded-full bg-gray-400"
                      style={{ width: `${baselineWidth}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-10 text-[10px] text-gray-500">{t('comparison.legend.after')}</span>
                  <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-2 rounded-full bg-brand-500"
                      style={{ width: `${withAiWidth}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

