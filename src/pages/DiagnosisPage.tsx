import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'

import { diagnosisApi } from '../services/diagnosis'
import { useI18n } from '../i18n'
import { clearOnboardingState } from '../utils/onboardingStorage'
import { DiagnosisResults } from '../components/DiagnosisResults'
import { getSessionDisplayName } from '../utils/sessionName'

export default function DiagnosisPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session')
  const { t } = useI18n()

  const { data, isLoading, error } = useQuery({
    queryKey: ['diagnosis', sessionId],
    queryFn: () => diagnosisApi.analyze(sessionId as string),
    enabled: Boolean(sessionId),
  })

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
              {t('diagnosis.noSession')}
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
            onClick={() => navigate(`/onboarding`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">{t('diagnosis.back')}</span>
          </button>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">
              {getSessionDisplayName(sessionId || '')}
            </span>
            <button
              type="button"
              onClick={() => {
                clearOnboardingState()
                navigate('/')
              }}
              className="inline-flex items-center px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              {t('app.finish')}
            </button>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {t('diagnosis.title')}
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto mb-2">
            {t('diagnosis.subtitle')}
          </p>
          {data?.diagnosis && (
            <p className="text-xs text-gray-500">
              Generado por Codlylabs Agent v{data.diagnosis.reasoning_agent_version} ·{' '}
              {data.processing_time_seconds != null && (
                <span>
                  Tiempo de cálculo: {data.processing_time_seconds}s
                </span>
              )}
            </p>
          )}
        </div>

        {isLoading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <p className="text-gray-600">{t('diagnosis.loading')}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 mb-6">
            {t('diagnosis.error')}
          </div>
        )}
        {data && data.diagnosis && (
          <>
            <DiagnosisResults data={data} />
          </>
        )}

        {data && data.diagnosis && (
          <div className="mt-10 flex justify-end">
            <button
              type="button"
              onClick={() => navigate(`/recommendation?session=${sessionId}`)}
              className="inline-flex items-center px-5 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors"
            >
              {t('diagnosis.generateDoc')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
