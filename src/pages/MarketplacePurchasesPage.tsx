import { useEffect, useState } from 'react'
import { ArrowLeft, Download, Loader2, Package, Rocket, ShieldCheck } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import { saveAuthReturnUrl } from '../services/auth'
import {
  marketplaceApi,
  MarketplaceDeployRequest,
  MarketplaceMyPilotsResponse,
  MarketplaceMyPurchasesResponse,
  MarketplacePilotRequestSummary,
  MarketplaceTransaction,
} from '../services/marketplace'
import { useAppSelector } from '../store/hooks'

const formatUsd = (value: number) => `USD ${value.toLocaleString()}`

export default function MarketplacePurchasesPage() {
  const navigate = useNavigate()
  const currentUser = useAppSelector((state) => state.user.user)

  const [purchases, setPurchases] = useState<MarketplaceMyPurchasesResponse | null>(null)
  const [pilots, setPilots] = useState<MarketplaceMyPilotsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [downloadingSlug, setDownloadingSlug] = useState<string | null>(null)

  useEffect(() => {
    if (!currentUser) {
      setLoading(false)
      return
    }

    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const [purchasesResponse, pilotsResponse] = await Promise.all([
          marketplaceApi.getMyPurchases(),
          marketplaceApi.getMyPilots(),
        ])
        if (cancelled) return
        setPurchases(purchasesResponse)
        setPilots(pilotsResponse)
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.response?.data?.detail || 'No se pudo cargar tu actividad del marketplace')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [currentUser])

  const handleDownload = async (slug: string) => {
    setDownloadingSlug(slug)
    setError('')
    try {
      const { blob, filename } = await marketplaceApi.downloadListing(slug)
      const objectUrl = window.URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = objectUrl
      anchor.download = filename
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      window.URL.revokeObjectURL(objectUrl)
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'No se pudo descargar el bundle')
    } finally {
      setDownloadingSlug(null)
    }
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-amber-200 bg-amber-50 p-8 text-center">
          <p className="text-sm font-medium text-amber-900">Necesitas login para ver tus compras y pilots.</p>
          <button
            type="button"
            onClick={() => {
              saveAuthReturnUrl()
              navigate('/login?returnTo=%2Fmarketplace%2Fpurchases')
            }}
            className="mt-4 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
          >
            Iniciar sesion
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
      </div>
    )
  }

  const purchaseItems = purchases?.items || []
  const pilotItems = pilots?.pilot_requests || []
  const deployItems = pilots?.deploy_requests || []

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => navigate('/marketplace')}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al marketplace
          </button>
          <Link to="/marketplace" className="text-xs uppercase tracking-[0.25em] text-slate-400">
            Buyer workspace
          </Link>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="grid gap-4 sm:grid-cols-3">
          <MetricCard label="Compras" value={String(purchases?.summary.transaction_count || 0)} />
          <MetricCard label="Total invertido" value={formatUsd(purchases?.summary.total_spent_usd || 0)} />
          <MetricCard label="Pilots activos" value={String(pilots?.summary.pilot_count || 0)} />
        </section>

        {error && (
          <div className="mt-6 rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
            {error}
          </div>
        )}

        <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-slate-700" />
            <h2 className="text-xl font-semibold text-slate-900">My Purchases</h2>
          </div>
          <div className="mt-5 space-y-4">
            {purchaseItems.length === 0 && <EmptyState text="Todavia no registras compras en el marketplace." />}
            {purchaseItems.map((item) => (
              <PurchaseRow
                key={item.id}
                item={item}
                downloading={downloadingSlug === item.listing_slug}
                onDownload={handleDownload}
              />
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-700" />
              <h2 className="text-xl font-semibold text-slate-900">My Pilots</h2>
            </div>
            <div className="mt-5 space-y-4">
              {pilotItems.length === 0 && <EmptyState text="No hay pilot requests registrados para esta organizacion." />}
              {pilotItems.map((item) => (
                <PilotRow key={item.id} item={item} />
              ))}
            </div>
          </article>

          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-sky-700" />
              <h2 className="text-xl font-semibold text-slate-900">Deploy Requests</h2>
            </div>
            <div className="mt-5 space-y-4">
              {deployItems.length === 0 && <EmptyState text="Todavia no pediste soporte de deploy." />}
              {deployItems.map((item) => (
                <DeployRow key={item.id} item={item} />
              ))}
            </div>
          </article>
        </section>
      </main>
    </div>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-sm text-slate-500">
      {text}
    </div>
  )
}

function PurchaseRow({
  item,
  downloading,
  onDownload,
}: {
  item: MarketplaceTransaction
  downloading: boolean
  onDownload: (slug: string) => void
}) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link to={`/marketplace/${item.listing_slug}`} className="text-lg font-semibold text-slate-900 hover:text-emerald-700">
            {item.listing_title}
          </Link>
          <p className="mt-1 text-sm text-slate-500">
            {item.line_label} · {item.status} · {item.completed_at ? new Date(item.completed_at).toLocaleString() : 'Sin fecha'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-slate-900">{formatUsd(item.amount_usd)}</p>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{item.currency}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {item.download_available && (
          <button
            type="button"
            onClick={() => onDownload(item.listing_slug)}
            disabled={downloading}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Descargar ZIP
          </button>
        )}
        <Link to={`/marketplace/${item.listing_slug}`} className="text-sm font-medium text-emerald-700 hover:text-emerald-800">
          Ver detalle
        </Link>
      </div>
    </div>
  )
}

function PilotRow({ item }: { item: MarketplacePilotRequestSummary }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
      <Link to={`/marketplace/${item.listing_slug}`} className="text-base font-semibold text-slate-900 hover:text-emerald-700">
        {item.listing_title}
      </Link>
      <p className="mt-2 text-sm text-slate-600">{item.requested_use_case}</p>
      <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-400">
        {item.status} · {item.requested_data_mode} · {item.requested_timeline || 'sin timeline'}
      </p>
    </div>
  )
}

function DeployRow({ item }: { item: MarketplaceDeployRequest }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
      <Link to={`/marketplace/${item.listing_slug}`} className="text-base font-semibold text-slate-900 hover:text-emerald-700">
        {item.listing_title}
      </Link>
      <p className="mt-2 text-sm text-slate-600">
        {item.deploy_mode} · {item.environment_target} · {item.requested_data_mode}
      </p>
      <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-400">
        {item.status} · {item.requested_timeline || 'sin timeline'}
      </p>
    </div>
  )
}
