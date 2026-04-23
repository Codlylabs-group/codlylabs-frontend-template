import { useEffect, useState } from 'react'
import { ExternalLink, Loader2, ShieldCheck } from 'lucide-react'
import { Link, useLocation, useParams } from 'react-router-dom'

import { marketplaceApi, MarketplaceEmbedConfig, MarketplaceListingDetail } from '../services/marketplace'

export default function MarketplaceEmbedPage() {
  const { slug } = useParams<{ slug: string }>()
  const location = useLocation()
  const [listing, setListing] = useState<MarketplaceListingDetail | null>(null)
  const [embedConfig, setEmbedConfig] = useState<MarketplaceEmbedConfig | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    const ref = new URLSearchParams(location.search).get('ref') || undefined
    let cancelled = false
    void Promise.all([
      marketplaceApi.getListing(slug, { ref, source: 'embed' }),
      marketplaceApi.getEmbedConfig(slug, ref),
    ])
      .then(([listingResponse, embedResponse]) => {
        if (!cancelled) {
          setListing(listingResponse)
          setEmbedConfig(embedResponse)
          document.title = `${listingResponse.title} | Marketplace Embed`
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [location.search, slug])

  if (loading || !listing || !embedConfig) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-300" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-6 text-white">
      <div className="mx-auto max-w-4xl rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 p-8 shadow-2xl">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
            {listing.vertical}
          </span>
          {listing.trust_badges.slice(-2).map((badge) => (
            <span key={badge} className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white">
              {badge}
            </span>
          ))}
        </div>

        <h1 className="mt-5 text-4xl font-bold tracking-tight">{listing.title}</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-slate-200">{listing.short_description}</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Card label="Trust score" value={`${listing.trust_score}/100`} />
          <Card label="Setup" value={`${listing.setup_estimate_hours}h`} />
          <Card label="Deploy" value={listing.deployment_readiness} />
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to={`/marketplace/${listing.slug}${location.search}`}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-300"
          >
            Abrir listing
            <ExternalLink className="h-4 w-4" />
          </Link>
          <a
            href={embedConfig.listing_url}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/15 px-5 py-3 text-sm font-semibold text-white hover:bg-white/5"
          >
            Share link
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
          <div className="flex items-center gap-2 text-emerald-200">
            <ShieldCheck className="h-4 w-4" />
            <p className="text-sm font-semibold">Embed-ready marketplace card</p>
          </div>
          <p className="mt-2 text-sm text-slate-300">
            This card keeps trust, pricing and deploy signals visible without sending the buyer into the full workspace immediately.
          </p>
        </div>
      </div>
    </div>
  )
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-2 text-xl font-semibold text-white">{value}</p>
    </div>
  )
}
