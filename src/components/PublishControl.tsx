// Fase 6: control de publicación/despublicación del preview.
// Incluye badge de estado, botón de acción y modal de confirmación.

import { useCallback, useEffect, useState } from 'react'
import { Copy, Globe, Loader2 } from 'lucide-react'
import {
  getPublishStatus,
  publishPreview,
  unpublishPreview,
} from '@/services/publishApi'
import type {
  PublishStatusResponse,
  QuotaExceededDetail,
} from '@/types/publishing'

interface PublishControlProps {
  pocId: string
}

export default function PublishControl({ pocId }: PublishControlProps) {
  const [status, setStatus] = useState<PublishStatusResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionInFlight, setActionInFlight] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [quotaInfo, setQuotaInfo] = useState<QuotaExceededDetail['quota'] | null>(null)
  const [copied, setCopied] = useState(false)

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getPublishStatus(pocId)
      setStatus(data)
    } catch (err) {
      console.error('[PublishControl] status failed', err)
    } finally {
      setLoading(false)
    }
  }, [pocId])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  const handlePublish = useCallback(async () => {
    setErrorMessage(null)
    setQuotaInfo(null)
    try {
      setActionInFlight(true)
      await publishPreview(pocId)
      await fetchStatus()
      setModalOpen(false)
    } catch (err: any) {
      const detail = err?.response?.data?.detail
      if (detail?.error === 'quota_exceeded') {
        setQuotaInfo(detail.quota)
        setErrorMessage(detail.message || 'Alcanzaste el límite de tu plan')
      } else {
        setErrorMessage(detail?.message || detail || err?.message || 'No se pudo publicar')
      }
    } finally {
      setActionInFlight(false)
    }
  }, [pocId, fetchStatus])

  const handleUnpublish = useCallback(async () => {
    setErrorMessage(null)
    try {
      setActionInFlight(true)
      await unpublishPreview(pocId)
      await fetchStatus()
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.detail || err?.message || 'No se pudo despublicar')
    } finally {
      setActionInFlight(false)
    }
  }, [pocId, fetchStatus])

  const handleCopy = useCallback(async () => {
    if (!status?.data?.public_url) return
    try {
      await navigator.clipboard.writeText(status.data.public_url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.warn('[PublishControl] clipboard failed', err)
    }
  }, [status])

  if (loading) {
    return (
      <div className="inline-flex items-center gap-2 text-xs text-slate-400">
        <Loader2 className="h-3 w-3 animate-spin" />
        Verificando estado...
      </div>
    )
  }

  const isPublished = status?.published === true && status.data != null

  return (
    <div className="flex items-center gap-3">
      {/* Badge de estado */}
      {isPublished ? (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
          <Globe className="h-3 w-3" />
          Publicado
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          Efímero
        </span>
      )}

      {/* URL pública + copiar */}
      {isPublished && status?.data?.public_url && (
        <div className="flex items-center gap-1.5">
          <a
            href={status.data.public_url}
            target="_blank"
            rel="noopener noreferrer"
            className="max-w-[220px] truncate rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          >
            {status.data.public_url}
          </a>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          >
            <Copy className="h-3 w-3" />
            {copied ? '¡Copiado!' : 'Copiar'}
          </button>
        </div>
      )}

      {/* Botón principal */}
      {isPublished ? (
        <button
          type="button"
          onClick={handleUnpublish}
          disabled={actionInFlight}
          className="rounded border border-red-200 bg-white px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900 dark:bg-slate-900 dark:text-red-400"
        >
          {actionInFlight ? 'Despublicando...' : 'Despublicar'}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          disabled={actionInFlight}
          className="rounded bg-slate-900 px-3 py-1 text-xs font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
        >
          Publicar
        </button>
      )}

      {/* Modal de confirmación de publish */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Publicar esta PoC</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Vas a hacer este preview accesible como URL pública hasta que lo despubliques.
              Cualquier persona con el link podrá verlo.
            </p>

            {errorMessage && (
              <div className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
                <p className="font-medium">{errorMessage}</p>
                {quotaInfo && (
                  <p className="mt-1 text-xs">
                    Uso actual: {quotaInfo.used}
                    {quotaInfo.limit >= 0 ? ` de ${quotaInfo.limit}` : ''} (plan: {quotaInfo.plan_tier})
                  </p>
                )}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setModalOpen(false)
                  setErrorMessage(null)
                  setQuotaInfo(null)
                }}
                className="rounded px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handlePublish}
                disabled={actionInFlight}
                className="rounded bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-900"
              >
                {actionInFlight ? 'Publicando...' : 'Publicar →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
