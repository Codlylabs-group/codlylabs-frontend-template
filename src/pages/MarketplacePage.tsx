import { useDeferredValue, useEffect, useState, type ReactNode } from 'react'
import { ArrowLeft, ArrowRight, Clock, Loader2, Plug, Search, Shield, Sparkles } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import {
  marketplaceApi,
  MarketplaceBundle,
  MarketplaceCollectionsResponse,
  MarketplaceListingSummary,
} from '../services/marketplace'
import { useAppSelector } from '../store/hooks'

const complexityLabel: Record<string, string> = {
  low: 'Integracion simple',
  medium: 'Integracion media',
  high: 'Integracion compleja',
}

const qualityLabel: Record<string, string> = {
  gold: 'Validada',
  silver: 'Revisada',
  bronze: 'Inicial',
  none: 'Base',
}

const readinessLabel: Record<string, string> = {
  sandbox_only: 'Sandbox Only',
  pilot_ready: 'Pilot Ready',
  deploy_ready: 'Deploy Ready',
  enterprise_ready: 'Enterprise Ready',
}

export default function MarketplacePage() {
  const navigate = useNavigate()
  const currentUser = useAppSelector((state) => state.user.user)
  const [items, setItems] = useState<MarketplaceListingSummary[]>([])
  const [collections, setCollections] = useState<MarketplaceCollectionsResponse>({
    pilot_ready: [],
    fastest_to_deploy: [],
    regulated_workflows: [],
  })
  const [bundles, setBundles] = useState<MarketplaceBundle[]>([])
  const [verticals, setVerticals] = useState<string[]>([])
  const [pocTypes, setPocTypes] = useState<string[]>([])
  const [vertical, setVertical] = useState('')
  const [pocType, setPocType] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const deferredSearch = useDeferredValue(search)

  useEffect(() => {
    document.title = 'Marketplace | CodlyLabs'
    let cancelled = false

    const loadCatalog = async () => {
      setLoading(true)
      setError('')
      try {
        const [catalogResult, collectionsResult, bundlesResult] = await Promise.allSettled([
          marketplaceApi.listCatalog({
            vertical: vertical || undefined,
            poc_type: pocType || undefined,
            search: deferredSearch.trim() || undefined,
          }),
          marketplaceApi.getCollections(),
          marketplaceApi.getBundles(),
        ])

        if (catalogResult.status !== 'fulfilled') {
          throw catalogResult.reason
        }

        if (cancelled) return

        setItems(catalogResult.value.items)
        setVerticals(catalogResult.value.verticals)
        setPocTypes(catalogResult.value.poc_types)
        setCollections(
          collectionsResult.status === 'fulfilled'
            ? collectionsResult.value
            : {
                pilot_ready: [],
                fastest_to_deploy: [],
                regulated_workflows: [],
              },
        )
        setBundles(bundlesResult.status === 'fulfilled' ? bundlesResult.value.items : [])
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.response?.data?.detail || 'No se pudo cargar el marketplace')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadCatalog()

    return () => {
      cancelled = true
    }
  }, [deferredSearch, pocType, vertical])

  const groupedItems: Record<string, MarketplaceListingSummary[]> = {}
  for (const item of items) {
    if (!groupedItems[item.vertical]) {
      groupedItems[item.vertical] = []
    }
    groupedItems[item.vertical].push(item)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </button>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Marketplace curado</p>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-8 px-6 py-8 lg:grid-cols-[1.3fr_0.9fr] lg:px-10">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                <Sparkles className="h-4 w-4" />
                Soluciones de IA validadas
              </div>
              <div className="space-y-3">
                <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                  Catalogo buyer-ready para probar, comparar y escalar.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                  La Fase 1 arranca con colecciones curadas por vertical, señales de confianza y sandbox instantaneo
                  sobre snapshots ya validados por CodlyLabs.
                </p>
              </div>
            </div>

            <div className="grid gap-4 rounded-[1.75rem] bg-slate-900 p-6 text-white">
              <MetricCard value={String(items.length)} label="Soluciones visibles" />
              <MetricCard value={String(verticals.length)} label="Verticales activas" />
              <MetricCard value={String(pocTypes.length)} label="Tipos de solucion" />
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <p className="text-sm text-slate-500">Fase 2 activa: partners invitados ya pueden subir submissions privadas.</p>
            <div className="flex flex-wrap items-center gap-3">
              {currentUser && (
                <Link
                  to="/marketplace/private-workspace"
                  className="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-800 hover:bg-sky-100"
                >
                  Private Workspace
                </Link>
              )}
              {currentUser && (
                <Link
                  to="/marketplace/purchases"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300"
                >
                  My Purchases
                </Link>
              )}
              <Link
                to="/marketplace/partners"
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-100"
              >
                Partner dashboard
              </Link>
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr_0.7fr]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por caso de uso, tag o vertical"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:bg-white"
              />
            </label>

            <select
              value={vertical}
              onChange={(event) => setVertical(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-300 focus:bg-white"
            >
              <option value="">Todas las verticales</option>
              {verticals.map((entry) => (
                <option key={entry} value={entry}>
                  {entry}
                </option>
              ))}
            </select>

            <select
              value={pocType}
              onChange={(event) => setPocType(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-300 focus:bg-white"
            >
              <option value="">Todos los tipos</option>
              {pocTypes.map((entry) => (
                <option key={entry} value={entry}>
                  {entry.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>
        </section>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
          </div>
        )}

        {!loading && error && (
          <div className="mt-8 rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
            {error}
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="mt-8 rounded-[1.75rem] border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-500">
            No hay listings para ese filtro todavia.
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="mt-8 space-y-10">
            {bundles.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Bundles</p>
                    <h2 className="text-2xl font-semibold text-slate-900">Curated rollout bundles</h2>
                  </div>
                  <p className="text-sm text-slate-500">{bundles.length} bundles activas</p>
                </div>
                <div className="grid gap-5 xl:grid-cols-3">
                  {bundles.slice(0, 3).map((bundle) => (
                    <Link
                      key={bundle.slug}
                      to={`/marketplace/bundles/${bundle.slug}`}
                      className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-lg"
                    >
                      <p className="text-xs uppercase tracking-[0.2em] text-sky-600">{bundle.vertical || bundle.use_case || 'bundle'}</p>
                      <h3 className="mt-3 text-xl font-semibold text-slate-900">{bundle.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{bundle.subtitle || bundle.description}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {bundle.items.slice(0, 3).map((item) => (
                          <span key={item.slug} className="rounded-full bg-slate-50 px-3 py-1 text-xs text-slate-600">
                            {item.title}
                          </span>
                        ))}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            <section className="grid gap-6 xl:grid-cols-3">
              <CollectionPanel title="Pilot Ready" subtitle="Listas para evaluacion con menor friccion." items={collections.pilot_ready} />
              <CollectionPanel title="Fastest to Deploy" subtitle="Las rutas mas cortas a un go-live controlado." items={collections.fastest_to_deploy} />
              <CollectionPanel title="Regulated Workflows" subtitle="Soluciones con señales explicitas para verticales sensibles." items={collections.regulated_workflows} />
            </section>

            {Object.entries(groupedItems).map(([groupVertical, groupItems]) => (
              <section key={groupVertical} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{groupVertical}</p>
                    <h2 className="text-2xl font-semibold text-slate-900">
                      Coleccion {groupVertical}
                    </h2>
                  </div>
                  <p className="text-sm text-slate-500">{groupItems.length} soluciones</p>
                </div>

                <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
                  {groupItems.map((item) => {
                    const primaryBadge =
                      item.trust_badges[item.trust_badges.length - 1] ||
                      readinessLabel[item.deployment_readiness] ||
                      qualityLabel[item.quality_badge] ||
                      qualityLabel.none

                    return (
                      <Link
                        key={item.slug}
                        to={`/marketplace/${item.slug}`}
                        className="group flex h-full flex-col rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg"
                      >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-2">
                          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-600">
                            {item.poc_type_label}
                          </span>
                          <h3 className="text-xl font-semibold text-slate-900">{item.title}</h3>
                        </div>
                        <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
                          {primaryBadge}
                        </span>
                      </div>

                      <p className="mt-3 text-sm leading-6 text-slate-600">{item.subtitle}</p>

                      <div className="mt-5 grid gap-3 sm:grid-cols-3">
                        <MiniStat
                          icon={<Shield className="h-4 w-4" />}
                          label="Trust"
                          value={`${item.trust_score}/100`}
                        />
                        <MiniStat
                          icon={<Clock className="h-4 w-4" />}
                          label="Setup"
                          value={`${item.setup_estimate_hours}h`}
                        />
                        <MiniStat
                          icon={<Plug className="h-4 w-4" />}
                          label="Integracion"
                          value={complexityLabel[item.integration_complexity] || item.integration_complexity}
                        />
                      </div>

                      <div className="mt-5 flex flex-wrap gap-2">
                        {item.tech_stack.map((entry) => (
                          <span
                            key={entry}
                            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600"
                          >
                            {entry}
                          </span>
                        ))}
                      </div>

                      <div className="mt-5 flex flex-wrap gap-2">
                        {item.tags.slice(0, 4).map((tag) => (
                          <span key={tag} className="rounded-full bg-amber-50 px-3 py-1 text-xs text-amber-700">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                        <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">
                          {readinessLabel[item.deployment_readiness] || item.deployment_readiness}
                        </span>
                        <span className="rounded-full bg-white px-3 py-1 font-medium text-slate-500">
                          {item.partner_display_name}
                        </span>
                      </div>

                      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Desde</p>
                          <p className="text-lg font-semibold text-slate-900">USD {item.price_license}</p>
                        </div>
                        <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700">
                          Ver detalle
                          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                        </span>
                      </div>
                      </Link>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function MetricCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
      <p className="text-3xl font-semibold">{value}</p>
      <p className="mt-1 text-sm text-slate-300">{label}</p>
    </div>
  )
}

function MiniStat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-500">
        {icon}
        {label}
      </div>
      <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  )
}

function CollectionPanel({
  title,
  subtitle,
  items,
}: {
  title: string
  subtitle: string
  items: MarketplaceListingSummary[]
}) {
  return (
    <article className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{subtitle}</p>

      <div className="mt-5 space-y-3">
        {items.slice(0, 3).map((item) => (
          <Link
            key={item.slug}
            to={`/marketplace/${item.slug}`}
            className="block rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-emerald-300 hover:bg-white"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-sm text-slate-500">{item.partner_display_name}</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                {item.trust_score}/100
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{item.subtitle}</p>
          </Link>
        ))}
        {items.length === 0 && (
          <div className="rounded-[1.25rem] border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
            No hay listings visibles en esta coleccion todavia.
          </div>
        )}
      </div>
    </article>
  )
}
