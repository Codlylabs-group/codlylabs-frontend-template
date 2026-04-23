import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowUpRight,
  Clock,
  Eye,
  Gauge,
  Layers,
  Plus,
  RefreshCw,
  Search,
} from 'lucide-react'

import type { WorkspaceContextResponse } from '../../services/workspace'
import { useWorkspaceOutletContext } from './WorkspaceLayout'
import { useI18n } from '../../i18n'

type Preview = WorkspaceContextResponse['active_previews'][number]

function buildStatusStyles(t: (key: string) => string): Record<string, { dot: string; label: string; text: string }> {
  return {
    active: { dot: 'bg-emerald-500', label: t('ws.previewActive'), text: 'text-emerald-600' },
    idle: { dot: 'bg-amber-400', label: t('ws.previewInactive'), text: 'text-amber-600' },
    starting: { dot: 'bg-sky-500', label: t('ws.previewStarting'), text: 'text-sky-600' },
    stopped: { dot: 'bg-gray-300', label: t('ws.previewStopped'), text: 'text-gray-500' },
  }
}

function PreviewCard({ preview, accent, statusStyles }: { preview: Preview; accent: string; statusStyles: Record<string, { dot: string; label: string; text: string }> }) {
  const { t } = useI18n()
  const key = (preview.status || 'active').toLowerCase()
  const style = statusStyles[key] || statusStyles.active

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-md">
      <div
        className="relative flex h-24 items-center justify-between overflow-hidden px-5"
        style={{ background: `linear-gradient(135deg, ${accent}18, ${accent}05)` }}
      >
        <div className="absolute right-0 top-0 h-32 w-32 opacity-20">
          <svg viewBox="0 0 200 200" className="h-full w-full">
            <circle cx="140" cy="60" r="60" fill="none" stroke={accent} strokeWidth="0.8" />
            <circle cx="140" cy="60" r="40" fill="none" stroke={accent} strokeWidth="0.8" />
            <circle cx="140" cy="60" r="20" fill="none" stroke={accent} strokeWidth="0.8" />
          </svg>
        </div>
        <div className="relative flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${style.dot} ${style.label === t('ws.previewActive') ? 'animate-pulse' : ''}`} />
          <span className={`text-xs font-semibold uppercase tracking-wide ${style.text}`}>{style.label}</span>
        </div>
        <div
          className="relative flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: `${accent}20`, color: accent }}
        >
          <Eye size={18} />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 text-sm font-semibold text-gray-900">{preview.name}</h3>
        <div className="mt-1 flex items-center gap-2 text-[11px] text-gray-400">
          <Layers size={11} />
          <span>{preview.vertical || 'General'}</span>
        </div>

        <div className="mt-4 flex items-center gap-3 text-[11px] text-gray-500">
          <span className="inline-flex items-center gap-1">
            <Clock size={11} className="text-gray-400" />
            {preview.uptime}
          </span>
          <span className="ml-auto inline-flex items-center gap-1 text-gray-400">
            <Gauge size={11} />
            {String(preview.poc_id).slice(0, 8)}
          </span>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Link
            to={preview.preview_url}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:border-blue-200 hover:text-blue-600"
          >
            {t('ws.openPreview')}
            <ArrowUpRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  )
}

function EmptyState({ onCreate, brandPrimary }: { onCreate: () => void; brandPrimary: string }) {
  const { t } = useI18n()

  return (
    <div className="rounded-xl border border-dashed border-gray-200 bg-white p-10 text-center">
      <div
        className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{ background: `${brandPrimary}15`, color: brandPrimary }}
      >
        <Eye size={24} />
      </div>
      <h3 className="mt-4 text-base font-semibold text-gray-900">{t('ws.noPreviewsTitle')}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500">
        {t('ws.noPreviewsDescription')}
      </p>
      <button
        type="button"
        onClick={onCreate}
        className="mt-5 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm transition-shadow hover:shadow-md"
        style={{ background: brandPrimary }}
      >
        <Plus size={14} />
        {t('ws.generatePoc')}
      </button>
    </div>
  )
}

export default function WorkspacePreviewsView() {
  const navigate = useNavigate()
  const { t } = useI18n()
  const { context, brand, setHeader, refreshContext } = useWorkspaceOutletContext()
  const [query, setQuery] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  const statusStyles = useMemo(() => buildStatusStyles(t), [t])

  useEffect(() => {
    setHeader(t('ws.previewsTitle'), t('ws.previewsSubtitle'))
  }, [setHeader, t])

  const previews = context.active_previews
  const usage = context.usage

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return previews
    return previews.filter((preview) => {
      const haystack = [preview.name, preview.vertical, preview.status, preview.poc_id]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(needle)
    })
  }, [previews, query])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await refreshContext()
    } finally {
      setRefreshing(false)
    }
  }

  const handleCreate = () => navigate('/workspace/poc-generator')

  const previewsLimit = usage.previews_limit
  const previewsUsed = usage.previews_used
  const usagePct = previewsLimit > 0 ? Math.min(100, Math.round((previewsUsed / previewsLimit) * 100)) : 0

  return (
    <>
      <div
        className="relative mb-6 flex flex-col gap-4 overflow-hidden rounded-xl p-6 text-white sm:flex-row sm:items-center sm:justify-between"
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
          <h2 className="text-xl font-semibold">
            {t('ws.previewsCount').replace('{used}', String(previewsUsed)).replace('{limit}', String(previewsLimit))}
          </h2>
          <p className="mt-1 text-sm text-blue-100">
            {t('ws.previewsDescription').replace('{limit}', String(previewsLimit))}
          </p>
          <div className="mt-3 h-1.5 w-56 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-white/80 transition-all"
              style={{ width: `${usagePct}%` }}
            />
          </div>
        </div>
        <div className="relative flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20 disabled:opacity-60"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : undefined} />
            {t('ws.refresh')}
          </button>
          <button
            type="button"
            onClick={handleCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm transition-shadow hover:shadow-md"
          >
            <Plus size={14} />
            {t('ws.newPoc')}
          </button>
        </div>
      </div>

      {previews.length === 0 ? (
        <EmptyState onCreate={handleCreate} brandPrimary={brand.primary} />
      ) : (
        <>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t('ws.searchPreviews')}
                className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-700 placeholder:text-gray-400 outline-none transition-colors focus:border-blue-300"
              />
            </div>
            <div className="text-xs text-gray-400">
              {t('ws.previewsShown').replace('{shown}', String(filtered.length)).replace('{total}', String(previews.length))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
              <Eye size={18} className="mx-auto mb-2 text-gray-300" />
              {t('ws.noPreviewsMatch').replace('{query}', query)}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((preview) => (
                <PreviewCard key={preview.poc_id} preview={preview} accent={brand.primary} statusStyles={statusStyles} />
              ))}
            </div>
          )}
        </>
      )}
    </>
  )
}
