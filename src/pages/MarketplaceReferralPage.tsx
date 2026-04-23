import { useEffect, useState } from 'react'
import { ArrowLeft, Loader2, Send } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import {
  marketplaceApi,
  MarketplaceReferralLanding,
} from '../services/marketplace'

export default function MarketplaceReferralPage() {
  const { referralCode } = useParams<{ referralCode: string }>()
  const navigate = useNavigate()
  const [landing, setLanding] = useState<MarketplaceReferralLanding | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    listing_slug: '',
    company_name: '',
    contact_email: '',
    notes: '',
  })

  useEffect(() => {
    if (!referralCode) return
    let cancelled = false
    void marketplaceApi
      .getReferralLanding(referralCode)
      .then((response) => {
        if (!cancelled) {
          setLanding(response)
          setForm((prev) => ({
            ...prev,
            listing_slug: response.listings[0]?.slug || '',
          }))
          document.title = `${response.profile.display_name} | Referral`
        }
      })
      .catch((err: any) => {
        if (!cancelled) {
          setError(err?.response?.data?.detail || 'No se pudo cargar la landing de referral')
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
  }, [referralCode])

  const handleSubmit = async () => {
    if (!referralCode) return
    setSubmitting(true)
    setError('')
    setNotice('')
    try {
      const response = await marketplaceApi.createReferralLead(referralCode, form)
      setNotice(response.message)
      setForm((prev) => ({ ...prev, company_name: '', contact_email: '', notes: '' }))
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'No se pudo registrar la referral')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
      </div>
    )
  }

  if (!landing) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-[1.75rem] border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
          {error || 'Referral no encontrada'}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
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

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-xs uppercase tracking-[0.22em] text-emerald-700">Referral partner</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900">{landing.profile.display_name}</h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
            Usa este acceso para introducir una empresa al marketplace curado y dirigirla al listing más relevante.
          </p>

          <div className="mt-6 space-y-3">
            {landing.listings.map((listing) => (
              <Link
                key={listing.slug}
                to={`/marketplace/${listing.slug}?ref=${landing.referral_code}`}
                className="block rounded-[1.5rem] border border-slate-200 bg-slate-50 px-5 py-4 hover:border-emerald-300 hover:bg-white"
              >
                <p className="font-semibold text-slate-900">{listing.title}</p>
                <p className="mt-1 text-sm text-slate-500">{listing.short_description}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Registrar lead</p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900">Referral form</h2>

          <div className="mt-6 space-y-4">
            <select
              value={form.listing_slug}
              onChange={(event) => setForm((prev) => ({ ...prev, listing_slug: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
            >
              {landing.listings.map((listing) => (
                <option key={listing.slug} value={listing.slug}>
                  {listing.title}
                </option>
              ))}
            </select>
            <input
              value={form.company_name}
              onChange={(event) => setForm((prev) => ({ ...prev, company_name: event.target.value }))}
              placeholder="Company name"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
            />
            <input
              value={form.contact_email}
              onChange={(event) => setForm((prev) => ({ ...prev, contact_email: event.target.value }))}
              placeholder="Work email"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
            />
            <textarea
              rows={4}
              value={form.notes}
              onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
              placeholder="Contexto del referral"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
            />
          </div>

          {error && <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
          {notice && <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</div>}

          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={submitting}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Registrar referral
          </button>
        </section>
      </main>
    </div>
  )
}
