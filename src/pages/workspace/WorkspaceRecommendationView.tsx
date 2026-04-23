import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, Download, FileText, Lightbulb, Loader2, Search, Sparkles } from 'lucide-react'

import DocumentPreview from '../../components/DocumentPreview'
import { pocGeneratorApi } from '../../services/pocGenerator'
import { recommendationApi } from '../../services/recommendation'
import { getSessionDisplayName } from '../../utils/sessionName'
import { useWorkspaceOutletContext } from './WorkspaceLayout'

function EmptyState({ brandPrimary }: { brandPrimary: string }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-200 bg-white p-10 text-center">
      <div
        className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{ background: `${brandPrimary}15`, color: brandPrimary }}
      >
        <Lightbulb size={24} />
      </div>
      <h3 className="mt-4 text-base font-semibold text-gray-900">Todavía no hay una recomendación</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500">
        Iniciá un Discovery para que el agente genere una recomendación a medida del caso de uso de tu workspace.
      </p>
      <Link
        to="/workspace/discovery"
        className="mt-5 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm transition-shadow hover:shadow-md"
        style={{ background: brandPrimary }}
      >
        <Search size={14} />
        Iniciar Discovery
      </Link>
    </div>
  )
}

export default function WorkspaceRecommendationView() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const selectedTier = (searchParams.get('tier') || 'poc').toLowerCase() as 'poc' | 'mvp' | 'app'
  const selectedTierLabel = selectedTier === 'mvp' ? 'MVP' : selectedTier === 'app' ? 'App' : 'PoC'
  const { brand, setHeader } = useWorkspaceOutletContext()

  const sessionId = searchParams.get('session')

  useEffect(() => {
    setHeader('Recomendación', 'Síntesis estratégica lista para compartir con tu equipo')
  }, [setHeader])

  // Pre-gen trigger: al entrar a la pantalla de resumen arrancamos la
  // generación de la PoC en background. El backend deduplica (no-op si ya
  // hay task corriendo o PoC completa), así que es seguro llamarlo en cada
  // montaje. Sin esto, el pre-gen depende de confirm_synthesis que tiene
  // guards frágiles (user_id, selected_vertical) y a veces no arranca.
  useEffect(() => {
    if (!sessionId) return
    pocGeneratorApi
      .triggerPregeneration(sessionId)
      .then((res) => {
        if (res?.status === 'started') {
          console.info('[PreGen] Started for session', sessionId, 'vertical:', res.vertical)
        } else if (res?.status === 'skipped_no_vertical') {
          console.warn('[PreGen] Skipped — no selected_vertical in session')
        }
      })
      .catch((err) => {
        // No mostrar al usuario — el pre-gen es best-effort. Si falla,
        // la generación corre normalmente cuando haga click en "Generar".
        console.debug('[PreGen] Trigger failed (non-fatal):', err)
      })
  }, [sessionId])

  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false)
  const [isDownloadingWord, setIsDownloadingWord] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['recommendation', sessionId, 'es'],
    queryFn: () => recommendationApi.generate(sessionId as string, 'es'),
    enabled: Boolean(sessionId),
    staleTime: 1000 * 60 * 5,
  })

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
    } catch (err) {
      console.error('Error downloading recommendation export', err)
      setDownloadError('No se pudo descargar el archivo. Volvé a intentarlo en unos segundos.')
    } finally {
      if (type === 'pdf') setIsDownloadingPdf(false)
      else setIsDownloadingWord(false)
    }
  }

  if (!sessionId) {
    return <EmptyState brandPrimary={brand.primary} />
  }

  const sessionLabel = getSessionDisplayName(sessionId)

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
            Consultoría estratégica
          </span>
          <h2 className="mt-3 text-xl font-semibold">Recomendación estratégica</h2>
          <p className="mt-1 max-w-2xl text-sm text-blue-100">
            Síntesis del diagnóstico, roadmap y próximos pasos para tu caso de uso.
          </p>
          <p className="mt-2 text-[11px] text-white/70">Sesión · {sessionLabel}</p>
        </div>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white p-12">
          <Loader2 className="h-7 w-7 animate-spin text-indigo-600" />
          <p className="text-sm text-gray-500">Generando tu recomendación...</p>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">No se pudo cargar la recomendación</p>
            <p className="mt-1 text-xs text-rose-600">
              Revisá que el session_id sea válido o volvé a iniciar el Discovery.
            </p>
          </div>
        </div>
      )}

      {data && (
        <>
          <div className="rounded-xl border border-gray-200 bg-white p-6 md:p-8">
            <DocumentPreview recommendation={data} />
          </div>

          <section
            className="relative mt-8 overflow-hidden rounded-2xl p-8 text-center"
            style={{
              background: `linear-gradient(135deg, ${brand.primary}10, ${brand.primary}18 50%, #10B98108)`,
            }}
          >
            <h2 className="text-xl font-semibold text-gray-900">¿Listo para avanzar?</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm text-gray-500">
              Descargá la recomendación o pasá directo a generar tu {selectedTierLabel}.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 md:flex-row">
              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/workspace/poc-generator?session=${sessionId}${
                      selectedTier ? `&tier=${selectedTier}` : ''
                    }`,
                  )
                }
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md md:w-auto"
                style={{ background: `linear-gradient(135deg, ${brand.primary}, ${brand.primaryDark})` }}
              >
                <Sparkles className="h-4 w-4" />
                Generar {selectedTierLabel}
              </button>
              <button
                type="button"
                onClick={() => void startDownload('pdf')}
                disabled={isDownloadingPdf}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-300 hover:text-gray-900 disabled:opacity-60 md:w-auto"
              >
                {isDownloadingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                {isDownloadingPdf ? 'Descargando PDF...' : 'Descargar PDF'}
              </button>
              <button
                type="button"
                onClick={() => void startDownload('word')}
                disabled={isDownloadingWord}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-300 hover:text-gray-900 disabled:opacity-60 md:w-auto"
              >
                {isDownloadingWord ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                {isDownloadingWord ? 'Descargando Word...' : 'Descargar Word'}
              </button>
            </div>
            {downloadError && <p className="mt-4 text-xs text-rose-600">{downloadError}</p>}
          </section>
        </>
      )}
    </>
  )
}
