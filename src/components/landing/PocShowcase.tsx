import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Map as MapIcon,
  ScanFace,
  MessageSquareText,
  TrendingUp,
  Workflow,
  Sparkles,
  ExternalLink,
  X,
  ArrowRight,
  Loader2,
} from 'lucide-react'
import { plgService, type ShowcasePoc } from '../../services/plg'

/**
 * PocShowcase
 * -----------
 * Galería de PoCs "vidriera": un set curado que vive indefinidamente y con el
 * que el visitante interactúa en vivo (iframe en modal). Si la vidriera está
 * vacía (o el endpoint falla), cae al contenido estático que recibe por prop.
 */

const KIND_META: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  map: { label: 'Mapa', icon: MapIcon },
  vision: { label: 'Visión', icon: ScanFace },
  rag: { label: 'RAG', icon: MessageSquareText },
  predictive: { label: 'Predictivo', icon: TrendingUp },
  workflow: { label: 'Workflow', icon: Workflow },
}

const verticalLabel = (v: string | null): string => {
  if (!v) return 'PoC'
  const map: Record<string, string> = {
    banca: 'Banca', fintech: 'Banca', retail: 'Retail', salud: 'Salud', healthcare: 'Salud',
    seguros: 'Seguros', insurance: 'Seguros', legal: 'Legal', logistica: 'Logística',
    logistics: 'Logística', realestate: 'Real Estate', seguridad: 'Seguridad', hr: 'RRHH',
  }
  return map[v.toLowerCase()] || (v.charAt(0).toUpperCase() + v.slice(1))
}

export default function PocShowcase({ fallback, es }: { fallback: React.ReactNode; es: boolean }) {
  const t = (esText: string, enText: string) => (es ? esText : enText)

  const [pocs, setPocs] = useState<ShowcasePoc[] | null>(null)
  const [active, setActive] = useState<ShowcasePoc | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const openedAtRef = useRef(0)

  // Tracking interno de engagement (oculto al visitante, best-effort).
  const openPoc = (poc: ShowcasePoc) => {
    openedAtRef.current = Date.now()
    plgService.trackShowcaseEvent(poc.poc_id, 'open')
    setActive(poc)
  }
  const closeActive = () => {
    if (active) plgService.trackShowcaseEvent(active.poc_id, 'close', Date.now() - openedAtRef.current)
    setActive(null)
  }

  useEffect(() => {
    let alive = true
    plgService
      .getShowcasePocs()
      .then((data) => { if (alive) setPocs(data) })
      .catch(() => { if (alive) setPocs([]) })
    return () => { alive = false }
  }, [])

  // Cerrar el modal con Escape.
  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeActive() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active])

  const verticals = useMemo(() => {
    if (!pocs) return []
    const seen = new Map<string, string>()
    for (const p of pocs) {
      const key = (p.vertical || '').toLowerCase()
      if (key && !seen.has(key)) seen.set(key, verticalLabel(p.vertical))
    }
    return Array.from(seen.entries())
  }, [pocs])

  const shown = useMemo(
    () => (pocs || []).filter((p) => filter === 'all' || (p.vertical || '').toLowerCase() === filter),
    [pocs, filter]
  )

  // Loading
  if (pocs === null) {
    return (
      <div className="flex justify-center py-16 text-gray-400">
        <Loader2 className="h-7 w-7 animate-spin" />
      </div>
    )
  }

  // Vacía → fallback estático
  if (pocs.length === 0) return <>{fallback}</>

  return (
    <>
      {/* Filtros por vertical */}
      {verticals.length > 1 && (
        <div className="mb-10 flex flex-wrap justify-center gap-2.5">
          <Chip active={filter === 'all'} onClick={() => setFilter('all')} label={`${t('Todas', 'All')} · ${pocs.length}`} />
          {verticals.map(([key, label]) => (
            <Chip key={key} active={filter === key} onClick={() => setFilter(key)} label={label} />
          ))}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((poc) => (
          <PocCard key={poc.poc_id} poc={poc} onOpen={() => openPoc(poc)} t={t} />
        ))}
      </div>

      {/* Modal con la PoC viva embebida */}
      {active && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/70 p-4 backdrop-blur-sm"
          onClick={() => closeActive()}
        >
          <div
            className="flex h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  {active.title}
                </p>
                <p className="truncate text-xs text-gray-500">{verticalLabel(active.vertical)}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <a
                  href={active.preview_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  {t('Pantalla completa', 'Full screen')}
                </a>
                <button
                  onClick={() => closeActive()}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                  aria-label={t('Cerrar', 'Close')}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <iframe
              src={active.preview_url}
              title={active.title}
              className="h-full w-full flex-1 border-0 bg-white"
            />
          </div>
        </div>
      )}
    </>
  )
}

function Chip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
        active
          ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
          : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  )
}

function PocCard({
  poc,
  onOpen,
  t,
}: {
  poc: ShowcasePoc
  onOpen: () => void
  t: (es: string, en: string) => string
}) {
  const kind = poc.kind ? KIND_META[poc.kind] : undefined
  const KindIcon = kind?.icon || Sparkles
  return (
    <button
      onClick={onOpen}
      className="group flex flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-100/60"
    >
      {/* Thumbnail */}
      <div className="relative h-44 overflow-hidden border-b border-gray-100 bg-gradient-to-br from-indigo-50 to-violet-100">
        {poc.thumbnail_url ? (
          <img src={poc.thumbnail_url} alt={poc.title} className="h-full w-full object-cover object-top" loading="lazy" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <KindIcon className="h-10 w-10 text-indigo-300" />
          </div>
        )}
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-emerald-500/95 px-2.5 py-1 text-[10px] font-bold tracking-wide text-white">
          <span className="h-1.5 w-1.5 rounded-full bg-white" />
          {t('EN VIVO', 'LIVE')}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-700">
            {verticalLabel(poc.vertical)}
          </span>
          {kind && (
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-600">
              <KindIcon className="h-3 w-3" />
              {kind.label}
            </span>
          )}
        </div>
        <h3 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
          {poc.title}
        </h3>
        {poc.description && <p className="mt-1.5 flex-1 text-sm leading-relaxed text-gray-500">{poc.description}</p>}
        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600">
          {t('Probar en vivo', 'Try it live')}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </button>
  )
}
