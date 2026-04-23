import { useEffect, useState } from 'react'
import { ArrowLeft, Building2, ExternalLink, Loader2, Shield } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import {
  marketplaceApi,
  MarketplacePartnerProfileResponse,
} from '../services/marketplace'

const readinessLabel: Record<string, string> = {
  sandbox_only: 'Sandbox Only',
  pilot_ready: 'Pilot Ready',
  deploy_ready: 'Deploy Ready',
  enterprise_ready: 'Enterprise Ready',
}

export default function MarketplacePartnerProfilePage() {
  const { profileId } = useParams<{ profileId: string }>()
  const navigate = useNavigate()

  const [profile, setProfile] = useState<MarketplacePartnerProfileResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!profileId) return

    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const response = await marketplaceApi.getPartnerProfile(profileId)
        if (cancelled) return
        setProfile(response)
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.response?.data?.detail || 'No se pudo cargar el perfil del partner')
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
  }, [profileId])

  useEffect(() => {
    if (!profile) return
    document.title = `${profile.display_name} | Partner Marketplace`
  }, [profile])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-[1.75rem] border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
          {error || 'Partner no encontrado'}
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
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Marketplace
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <article className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-emerald-600" />
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Partner profile</p>
            </div>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900">{profile.display_name}</h1>
            <p className="mt-2 text-base text-slate-500">{profile.company_name || profile.tier}</p>
            {profile.bio && (
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">{profile.bio}</p>
            )}

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                {profile.partner_program}
              </span>
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                {profile.certification_status}
              </span>
              {profile.public_badges.map((badge) => (
                <span key={badge} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {badge}
                </span>
              ))}
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <StatCard label="Listings publicadas" value={String(profile.public_metrics.published_listings)} />
              <StatCard label="Trust medio" value={`${profile.public_metrics.average_trust_score}/100`} />
              <StatCard label="Pilot ready" value={String(profile.public_metrics.pilot_ready_listings)} />
              <StatCard label="Deploy ready" value={String(profile.public_metrics.deploy_ready_listings)} />
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {profile.target_verticals.map((vertical) => (
                <span key={vertical} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {vertical}
                </span>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {profile.website_url && (
                <a
                  href={profile.website_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-300"
                >
                  Website
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
              {profile.support_contact_email && (
                <a
                  href={`mailto:${profile.support_contact_email}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-300"
                >
                  Contacto
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>

            {profile.featured_case_study && Object.keys(profile.featured_case_study).length > 0 && (
              <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Caso de exito</p>
                <p className="mt-3 text-lg font-semibold text-slate-900">
                  {String(profile.featured_case_study.title || 'Caso destacado')}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {String(profile.featured_case_study.outcome || profile.featured_case_study.metric || '')}
                </p>
              </div>
            )}
          </article>

          <article className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-amber-500" />
              <h2 className="text-lg font-semibold text-slate-900">Listings publicas</h2>
            </div>
            <div className="mt-5 space-y-4">
              {profile.listings.map((listing) => (
                <Link
                  key={listing.slug}
                  to={`/marketplace/${listing.slug}`}
                  className="block rounded-[1.5rem] border border-slate-200 bg-slate-50 px-5 py-4 transition hover:border-emerald-300 hover:bg-white"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{listing.title}</p>
                      <p className="mt-1 text-sm text-slate-500">{listing.subtitle}</p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                      {listing.trust_score}/100
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-white px-3 py-1 font-medium text-slate-600">
                      {readinessLabel[listing.deployment_readiness] || listing.deployment_readiness}
                    </span>
                    {listing.trust_badges.slice(-2).map((badge) => (
                      <span key={badge} className="rounded-full bg-amber-50 px-3 py-1 font-medium text-amber-700">
                        {badge}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </article>
        </section>
      </main>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  )
}
