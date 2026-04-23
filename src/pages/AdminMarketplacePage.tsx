import { useEffect, useState } from 'react'
import { Loader2, ShieldCheck, Store } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import AdminSidebar from '../components/AdminSidebar'
import {
  marketplacePartnersApi,
  MarketplaceAdminBundlesResponse,
  MarketplaceAdminQueueResponse,
  MarketplaceAdminStatsResponse,
} from '../services/marketplacePartners'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { clearAuth } from '../store/userSlice'

export default function AdminMarketplacePage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const userData = useAppSelector((state) => state.user.user)

  const [queue, setQueue] = useState<MarketplaceAdminQueueResponse | null>(null)
  const [stats, setStats] = useState<MarketplaceAdminStatsResponse | null>(null)
  const [bundles, setBundles] = useState<MarketplaceAdminBundlesResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notesById, setNotesById] = useState<Record<string, string>>({})
  const [bundleForm, setBundleForm] = useState({
    title: '',
    subtitle: '',
    description: '',
    vertical: '',
    use_case: '',
    listing_slugs: '',
  })

  useEffect(() => {
    if (!userData) {
      navigate('/admin/login')
      return
    }
    void loadAll()
  }, [userData, navigate])

  const loadAll = async () => {
    setLoading(true)
    setError('')
    try {
      const [queueData, statsData, bundlesData] = await Promise.all([
        marketplacePartnersApi.getAdminQueue(),
        marketplacePartnersApi.getAdminStats(),
        marketplacePartnersApi.getAdminBundles(),
      ])
      setQueue(queueData)
      setStats(statsData)
      setBundles(bundlesData)
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'No se pudo cargar la cola de curacion')
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        navigate('/admin/login')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    dispatch(clearAuth())
    navigate('/admin/login')
  }

  const handlePartnerDecision = async (profileId: string, decision: 'approve' | 'reject') => {
    try {
      if (decision === 'approve') {
        await marketplacePartnersApi.approvePartner(profileId, notesById[profileId])
      } else {
        await marketplacePartnersApi.rejectPartner(profileId, notesById[profileId])
      }
      await loadAll()
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'No se pudo actualizar el partner')
    }
  }

  const handlePartnerCertification = async (
    profileId: string,
    certification: 'certified' | 'premier',
  ) => {
    try {
      await marketplacePartnersApi.updatePartnerProgram(profileId, {
        certification_status: certification,
        partner_program: certification === 'premier' ? 'integrator' : 'consultancy',
        co_sell_ready: true,
        public_badges: certification === 'premier' ? ['Premier Partner'] : ['Certified Partner'],
      })
      await loadAll()
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'No se pudo actualizar la certificacion del partner')
    }
  }

  const handleListingDecision = async (listingId: string, decision: 'approve' | 'pilot_only' | 'reject') => {
    try {
      if (decision === 'approve') {
        await marketplacePartnersApi.approveListing(listingId, notesById[listingId])
      } else if (decision === 'pilot_only') {
        await marketplacePartnersApi.markPilotOnly(listingId, notesById[listingId])
      } else {
        await marketplacePartnersApi.rejectListing(listingId, notesById[listingId])
      }
      await loadAll()
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'No se pudo actualizar la listing')
    }
  }

  const handleSecurityReview = async (
    listingId: string,
    status: 'pending' | 'passed' | 'not_required',
  ) => {
    try {
      await marketplacePartnersApi.setSecurityReviewStatus(listingId, status, notesById[listingId])
      await loadAll()
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'No se pudo actualizar el security review')
    }
  }

  const handleCreateBundle = async () => {
    try {
      await marketplacePartnersApi.createBundle({
        title: bundleForm.title,
        subtitle: bundleForm.subtitle,
        description: bundleForm.description,
        vertical: bundleForm.vertical || undefined,
        use_case: bundleForm.use_case || undefined,
        listing_slugs: bundleForm.listing_slugs
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        featured: true,
        is_public: true,
      })
      setBundleForm({
        title: '',
        subtitle: '',
        description: '',
        vertical: '',
        use_case: '',
        listing_slugs: '',
      })
      await loadAll()
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'No se pudo crear el bundle')
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar currentPage="marketplace" onLogout={handleLogout} />

      <main className="flex-1 p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex items-center gap-3">
            <Store className="h-6 w-6 text-brand-600" />
            <h1 className="text-2xl font-bold text-gray-900">Marketplace Curation</h1>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-4">
                <StatCard label="Partners aplicados" value={String(stats?.profiles.applied || 0)} />
                <StatCard label="Partners aprobados" value={String(stats?.profiles.approved || 0)} />
                <StatCard label="Listings en review" value={String(stats?.listings.under_review || 0)} />
                <StatCard label="Listings publicadas" value={String((stats?.listings.approved || 0) + (stats?.listings.pilot_only || 0))} />
              </div>

              <section className="grid gap-6 lg:grid-cols-2">
                <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-brand-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Partners pendientes</h2>
                  </div>
                  <div className="mt-4 space-y-4">
                    {(queue?.pending_profiles || []).length === 0 && (
                      <EmptyState text="No hay partners pendientes." />
                    )}
                    {(queue?.pending_profiles || []).map((profile) => (
                      <div key={profile.id} className="rounded-2xl border border-gray-200 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-gray-900">{profile.display_name}</p>
                            <p className="text-sm text-gray-500">{profile.company_name || 'Sin company'}</p>
                            <p className="mt-2 text-sm text-gray-600">{profile.bio || 'Sin bio.'}</p>
                          </div>
                          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
                            {profile.status}
                          </span>
                        </div>
                        <p className="mt-3 text-xs text-gray-500">
                          Verticales: {(profile.target_verticals || []).join(', ') || 'n/a'}
                        </p>
                        <textarea
                          rows={3}
                          placeholder="Notas de curacion"
                          value={notesById[profile.id] || ''}
                          onChange={(event) => setNotesById((prev) => ({ ...prev, [profile.id]: event.target.value }))}
                          className="mt-3 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900"
                        />
                        <div className="mt-3 flex gap-2">
                          <button onClick={() => void handlePartnerDecision(profile.id, 'approve')} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
                            Aprobar
                          </button>
                          <button onClick={() => void handlePartnerCertification(profile.id, 'certified')} className="rounded-xl border border-sky-200 px-4 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-50">
                            Certificar
                          </button>
                          <button onClick={() => void handlePartnerCertification(profile.id, 'premier')} className="rounded-xl border border-amber-200 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-50">
                            Premier
                          </button>
                          <button onClick={() => void handlePartnerDecision(profile.id, 'reject')} className="rounded-xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50">
                            Rechazar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Store className="h-5 w-5 text-brand-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Listings en curacion</h2>
                  </div>
                  <div className="mt-4 space-y-4">
                    {(queue?.pending_listings || []).length === 0 && (
                      <EmptyState text="No hay listings en review." />
                    )}
                    {(queue?.pending_listings || []).map((listing) => (
                      <div key={listing.id} className="rounded-2xl border border-gray-200 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-gray-900">{listing.title}</p>
                            <p className="text-sm text-gray-500">{listing.vertical} · {listing.poc_type}</p>
                            <p className="mt-2 text-sm text-gray-600">{listing.short_description || 'Sin resumen.'}</p>
                          </div>
                          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                            {listing.status}
                          </span>
                        </div>
                        <div className="mt-3 grid gap-3 sm:grid-cols-3">
                          <MiniStat label="Quality" value={String(listing.quality_score)} />
                          <MiniStat label="Badge" value={listing.quality_badge} />
                          <MiniStat label="Preview" value={listing.preview_supported ? 'Si' : 'No'} />
                        </div>
                        <div className="mt-3 grid gap-3 sm:grid-cols-3">
                          <MiniStat label="Trust" value={String(listing.trust_summary?.trust_score || 0)} />
                          <MiniStat label="Readiness" value={listing.trust_summary?.deployment_readiness || 'sandbox_only'} />
                          <MiniStat label="Security" value={listing.trust_summary?.security_review_status || 'pending'} />
                        </div>
                        <textarea
                          rows={3}
                          placeholder="Notas de curacion"
                          value={notesById[listing.id] || ''}
                          onChange={(event) => setNotesById((prev) => ({ ...prev, [listing.id]: event.target.value }))}
                          className="mt-3 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900"
                        />
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button onClick={() => void handleListingDecision(listing.id, 'approve')} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
                            Aprobar
                          </button>
                          <button onClick={() => void handleListingDecision(listing.id, 'pilot_only')} className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600">
                            Pilot only
                          </button>
                          <button onClick={() => void handleListingDecision(listing.id, 'reject')} className="rounded-xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50">
                            Rechazar
                          </button>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <button onClick={() => void handleSecurityReview(listing.id, 'passed')} className="rounded-xl border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50">
                            Security pass
                          </button>
                          <button onClick={() => void handleSecurityReview(listing.id, 'pending')} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                            Security pending
                          </button>
                          <button onClick={() => void handleSecurityReview(listing.id, 'not_required')} className="rounded-xl border border-brand-200 px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50">
                            Not required
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              </section>

              <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Store className="h-5 w-5 text-brand-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Crear bundle curado</h2>
                  </div>
                  <div className="mt-4 space-y-3">
                    <input
                      value={bundleForm.title}
                      onChange={(event) => setBundleForm((prev) => ({ ...prev, title: event.target.value }))}
                      placeholder="Titulo"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900"
                    />
                    <input
                      value={bundleForm.subtitle}
                      onChange={(event) => setBundleForm((prev) => ({ ...prev, subtitle: event.target.value }))}
                      placeholder="Subtitle"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900"
                    />
                    <textarea
                      rows={3}
                      value={bundleForm.description}
                      onChange={(event) => setBundleForm((prev) => ({ ...prev, description: event.target.value }))}
                      placeholder="Descripcion"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900"
                    />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input
                        value={bundleForm.vertical}
                        onChange={(event) => setBundleForm((prev) => ({ ...prev, vertical: event.target.value }))}
                        placeholder="Vertical"
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900"
                      />
                      <input
                        value={bundleForm.use_case}
                        onChange={(event) => setBundleForm((prev) => ({ ...prev, use_case: event.target.value }))}
                        placeholder="Use case"
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900"
                      />
                    </div>
                    <textarea
                      rows={4}
                      value={bundleForm.listing_slugs}
                      onChange={(event) => setBundleForm((prev) => ({ ...prev, listing_slugs: event.target.value }))}
                      placeholder="listing-slug-1, listing-slug-2"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900"
                    />
                    <button
                      onClick={() => void handleCreateBundle()}
                      className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
                    >
                      Crear bundle
                    </button>
                  </div>
                </article>

                <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-brand-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Bundles publicas</h2>
                  </div>
                  <div className="mt-4 space-y-4">
                    {(bundles?.items || []).length === 0 && <EmptyState text="No hay bundles creadas." />}
                    {(bundles?.items || []).map((bundle) => (
                      <div key={bundle.id} className="rounded-2xl border border-gray-200 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-gray-900">{bundle.title}</p>
                            <p className="text-sm text-gray-500">
                              {bundle.vertical || bundle.use_case || 'bundle'} · {bundle.item_count} listings
                            </p>
                          </div>
                          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
                            {bundle.source || 'manual'}
                          </span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {bundle.items.map((item) => (
                            <span key={item.slug} className="rounded-full bg-gray-50 px-3 py-1 text-xs text-gray-600">
                              {item.title}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-xs uppercase tracking-[0.2em] text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
      <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-gray-900">{value}</p>
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
      {text}
    </div>
  )
}
