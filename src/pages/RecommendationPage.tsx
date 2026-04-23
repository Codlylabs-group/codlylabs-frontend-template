import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Loader2, Download, FileText, Sparkles } from 'lucide-react'
import { useState } from 'react'

import { recommendationApi } from '../services/recommendation'
import DocumentPreview from '../components/DocumentPreview'
import { useI18n } from '../i18n'
import { useAppSelector } from '../store/hooks'
import { useLogout } from '../hooks/useLogout'
import { getSessionDisplayName } from '../utils/sessionName'

export default function RecommendationPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { t, language } = useI18n()
  const logout = useLogout()
  const isAuthenticated = useAppSelector((state) => state.user.tokens !== null)

  const sessionId = searchParams.get('session')

  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false)
  const [isDownloadingWord, setIsDownloadingWord] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['recommendation', sessionId, language],
    queryFn: () => recommendationApi.generate(sessionId as string, language),
    enabled: Boolean(sessionId),
    staleTime: 1000 * 60 * 5,
  })

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">{t('recommendation.noSession')}</p>
          <Link to="/" className="text-indigo-600 font-semibold hover:underline">{t('onboarding.back')}</Link>
        </div>
      </div>
    )
  }

  const startDownload = async (type: 'pdf' | 'word') => {
    if (!sessionId) return
    try {
      setDownloadError(null)
      if (type === 'pdf') setIsDownloadingPdf(true)
      else setIsDownloadingWord(true)

      const downloadFn = type === 'pdf' ? recommendationApi.downloadPdf : recommendationApi.downloadWord
      const blob = await downloadFn(sessionId)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = type === 'pdf' ? `recommendation_${sessionId}.pdf` : `recommendation_${sessionId}.docx`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (e) {
      console.error('Error downloading recommendation export', e)
      setDownloadError(t('recommendation.export.downloadError'))
    } finally {
      if (type === 'pdf') setIsDownloadingPdf(false)
      else setIsDownloadingWord(false)
    }
  }

  const handleDownload = (type: 'pdf' | 'word') => {
    if (isAuthenticated) { void startDownload(type); return }
    navigate('/onboarding')
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
      {/* Header */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-indigo-500/10 shadow-sm shadow-indigo-500/5">
        <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/discovery-progress?session=${sessionId}`)}
              className="p-2 hover:bg-slate-100 transition-colors rounded-full active:scale-95"
            >
              <ArrowLeft className="w-5 h-5 text-slate-500" />
            </button>
            <Link to="/" className="text-xl font-bold text-indigo-600 tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>
              CodlyLabs
            </Link>
            <span className="text-xs text-gray-400 hidden md:block">
              {getSessionDisplayName(sessionId || '')}
            </span>
          </div>
          <button
            type="button"
            onClick={logout}
            className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-semibold active:scale-95 transition-all shadow-lg shadow-indigo-500/10 text-sm"
          >
            {t('app.finish')}
          </button>
        </div>
      </nav>

      <main className="flex-grow pt-28 pb-20 px-6 max-w-7xl mx-auto w-full">
        {/* Title */}
        <header className="mb-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-indigo-600 mb-3 block">
            {t('recommendation.strategicConsulting')}
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
            {t('recommendation.title')}
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl leading-relaxed">
            {t('recommendation.subtitle')}
          </p>
        </header>

        {/* Loading */}
        {isLoading && (
          <div className="bg-white rounded-xl p-12 flex flex-col items-center justify-center gap-4 shadow-sm">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-sm text-gray-500">{t('recommendation.loading')}</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4">
            {t('recommendation.error')}
          </div>
        )}

        {/* Content */}
        {data && (
          <>
            <DocumentPreview recommendation={data} />

            {/* Export Section */}
            <section className="mt-16 p-10 rounded-2xl text-center relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, rgba(88,68,237,0.05) 0%, rgba(88,68,237,0.1) 50%, rgba(16,185,129,0.05) 100%)' }}>
              <h2 className="text-2xl font-bold mb-2 text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
                {t('recommendation.export.title')}
              </h2>
              <p className="text-gray-500 mb-8 max-w-lg mx-auto">
                {t('recommendation.export.description')}
              </p>
              <div className="flex flex-col md:flex-row justify-center items-center gap-4">
                <button
                  type="button"
                  onClick={() => navigate(`/poc-generator?session=${sessionId}`)}
                  className="w-full md:w-auto px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-indigo-500/20 transition-all active:scale-95"
                >
                  <Sparkles className="w-5 h-5" />
                  {t('recommendation.generatePoc')}
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload('pdf')}
                  disabled={isDownloadingPdf}
                  className="w-full md:w-auto px-8 py-4 bg-gray-100 text-indigo-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-all active:scale-95 disabled:opacity-60"
                >
                  <Download className="w-5 h-5" />
                  {isDownloadingPdf ? t('recommendation.export.downloadingPdf') : t('recommendation.export.pdf')}
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload('word')}
                  disabled={isDownloadingWord}
                  className="w-full md:w-auto px-8 py-4 bg-gray-100 text-indigo-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-all active:scale-95 disabled:opacity-60"
                >
                  <FileText className="w-5 h-5" />
                  {isDownloadingWord ? t('recommendation.export.downloadingWord') : t('recommendation.export.word')}
                </button>
              </div>
              {downloadError && (
                <p className="text-xs text-red-600 mt-4">{downloadError}</p>
              )}
            </section>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full py-8 mt-auto bg-gray-50 border-t border-slate-200/50">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 max-w-7xl mx-auto gap-4">
          <span className="text-sm text-slate-400">{t('footer.copyright', { year: new Date().getFullYear() })}</span>
          <nav className="flex gap-6">
            <Link to="/policies" className="text-sm text-slate-400 hover:text-indigo-500 transition-colors">{t('footer.privacy')}</Link>
            <Link to="/policies" className="text-sm text-slate-400 hover:text-indigo-500 transition-colors">{t('footer.terms')}</Link>
            <Link to="/contact" className="text-sm text-slate-400 hover:text-indigo-500 transition-colors">{t('footer.contact')}</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
