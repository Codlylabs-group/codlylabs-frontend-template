import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'

import { roadmapApi } from '../services/roadmap'
import RoadmapTimeline from '../components/RoadmapTimeline'
import { RoadmapGantt } from '../components/RoadmapGantt'
import { useI18n } from '../i18n'
import { getSessionDisplayName } from '../utils/sessionName'
import { useLogout } from '../hooks/useLogout'

export default function RoadmapPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { t } = useI18n()
  const logout = useLogout()

  const sessionId = searchParams.get('session')

  const { data, isLoading, error } = useQuery({
    queryKey: ['roadmap', sessionId],
    queryFn: () => roadmapApi.generate(sessionId as string),
    enabled: Boolean(sessionId),
    staleTime: 1000 * 60 * 5, // 5 minutes (matches prefetch)
  })

  const handleGeneratePoc = () => {
    if (sessionId) {
      navigate(`/poc-generator?session=${sessionId}`)
    }
  }

  const handleDownloadProject = async () => {
    if (!sessionId) return
    try {
      const blob = await roadmapApi.downloadProject(sessionId)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `roadmap_${sessionId}.xml`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (e) {
      console.error('Error downloading Project export', e)
    }
  }

  const handleDownloadGantt = async () => {
    if (!sessionId) return
    try {
      const blob = await roadmapApi.downloadGantt(sessionId)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `roadmap_${sessionId}_gantt.json`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (e) {
      console.error('Error downloading Gantt export', e)
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
              {t('roadmap.noSession')}
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
            onClick={() => navigate(`/recommendation?session=${sessionId}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">{t('roadmap.back')}</span>
          </button>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">
              {getSessionDisplayName(sessionId || '')}
            </span>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              {t('app.finish')}
            </button>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {t('roadmap.title')}
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t('roadmap.subtitle')}
          </p>
        </div>

        {isLoading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <p className="text-gray-600">{t('roadmap.loading')}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4">
            {t('roadmap.error')}
          </div>
        )}

        {data && (
          <>
            <RoadmapTimeline phases={data.phases} />
            <RoadmapGantt phases={data.phases} />

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                {t('roadmap.export.title')}
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                {t('roadmap.export.description')}
              </p>
              <div className="flex flex-wrap gap-2 items-center">
                <button
                  type="button"
                  onClick={handleGeneratePoc}
                  className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors"
                >
                  {t('roadmap.export.generatePoc')}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadProject}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {t('roadmap.export.project')}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadGantt}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {t('roadmap.export.gantt')}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
