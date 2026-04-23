import { useEffect, useState } from 'react'
import { ArrowLeft, Loader2, Package } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { marketplaceApi, MarketplaceBundle } from '../services/marketplace'

export default function MarketplaceBundlePage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [bundle, setBundle] = useState<MarketplaceBundle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    void marketplaceApi
      .getBundle(slug)
      .then((response) => {
        if (!cancelled) {
          setBundle(response)
          document.title = `${response.title} | Marketplace Bundle`
        }
      })
      .catch((err: any) => {
        if (!cancelled) {
          setError(err?.response?.data?.detail || 'No se pudo cargar el bundle')
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
  }, [slug])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-6 w-6 animate-spin text-sky-600" />
      </div>
    )
  }

  if (error || !bundle) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-[1.75rem] border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
          {error || 'Bundle no encontrada'}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => navigate('/marketplace')}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Marketplace
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-2 text-sky-700">
            <Package className="h-5 w-5" />
            <p className="text-xs uppercase tracking-[0.22em]">{bundle.vertical || bundle.use_case || 'bundle'}</p>
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900">{bundle.title}</h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">{bundle.description || bundle.subtitle}</p>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {bundle.items.map((item) => (
            <Link
              key={item.slug}
              to={`/marketplace/${item.slug}`}
              className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-lg"
            >
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{item.vertical}</p>
              <h2 className="mt-3 text-xl font-semibold text-slate-900">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.short_description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {item.trust_badges.slice(-2).map((badge) => (
                  <span key={badge} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {badge}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </section>
      </main>
    </div>
  )
}
