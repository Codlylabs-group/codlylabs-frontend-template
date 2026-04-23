import { useEffect, useState, type ChangeEvent, type ReactNode } from 'react'
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Lock,
  Play,
  Plus,
  Save,
  Send,
  Upload,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import { saveAuthReturnUrl } from '../services/auth'
import { normalizeMarketplacePreviewUrl } from '../services/marketplace'
import {
  marketplacePartnersApi,
  PartnerAnalyticsResponse,
  PartnerEarningsResponse,
  PartnerDashboardResponse,
  PartnerEmbedResponse,
  PartnerListing,
  PartnerPayout,
  PartnerReferralsResponse,
  PrivatePreviewStatus,
} from '../services/marketplacePartners'
import { useAppSelector } from '../store/hooks'

interface ProfileFormState {
  display_name: string
  company_name: string
  website_url: string
  contact_email: string
  bio: string
  target_verticals_text: string
}

interface ListingFormState {
  name: string
  title: string
  subtitle: string
  short_description: string
  description: string
  vertical: string
  poc_type: string
  interface: string
  tags_text: string
  tech_stack_text: string
  dependencies_text: string
  buyer_problem_statement: string
  buyer_target_team: string
  buyer_company_size: string
  deploy_modes_text: string
  data_mode_for_trial: string
  managed_deploy_available: boolean
  runbook_available: boolean
  demo_data_included: boolean
  demo_data_description: string
  demo_data_format: string
  support_sla_hours: string
  security_review_required: boolean
  support_owner_name: string
  support_owner_email: string
  documentation_complete: boolean
  security_packet_data_handling: string
  security_packet_pii_supported: boolean
  security_packet_audit_logs_available: boolean
  security_packet_rollback_plan_available: boolean
  security_packet_compliance_notes: string
  submission_notes: string
  setup_estimate_hours: string
  integration_complexity: string
}

const createProfileForm = (dashboard?: PartnerDashboardResponse): ProfileFormState => ({
  display_name: dashboard?.profile.display_name || '',
  company_name: dashboard?.profile.company_name || '',
  website_url: dashboard?.profile.website_url || '',
  contact_email: dashboard?.profile.contact_email || '',
  bio: dashboard?.profile.bio || '',
  target_verticals_text: (dashboard?.profile.target_verticals || []).join(', '),
})

const createListingForm = (listing?: PartnerListing): ListingFormState => {
  const buyerFit = listing?.buyer_fit || {}
  const deploymentMeta = listing?.deployment_meta || {}
  const trustMeta = listing?.trust_meta || {}
  const securityPacket =
    typeof trustMeta.security_packet === 'object' && trustMeta.security_packet !== null
      ? (trustMeta.security_packet as Record<string, unknown>)
      : {}

  return {
    name: listing?.name || '',
    title: listing?.title || '',
    subtitle: listing?.subtitle || '',
    short_description: listing?.short_description || '',
    description: listing?.description || '',
    vertical: listing?.vertical || 'fintech',
    poc_type: listing?.poc_type || 'generative',
    interface: listing?.interface || 'Dashboard',
    tags_text: (listing?.tags || []).join(', '),
    tech_stack_text: (listing?.tech_stack || []).join(', '),
    dependencies_text: (listing?.dependencies || []).join(', '),
    buyer_problem_statement: String(buyerFit.problem_statement || ''),
    buyer_target_team: String(buyerFit.target_team || ''),
    buyer_company_size: String(buyerFit.target_company_size || 'mid-market'),
    deploy_modes_text: Array.isArray(deploymentMeta.modes) ? deploymentMeta.modes.join(', ') : '',
    data_mode_for_trial: String(deploymentMeta.data_mode_for_trial || 'demo_only'),
    managed_deploy_available: Boolean(deploymentMeta.managed_deploy_available),
    runbook_available: Boolean(deploymentMeta.runbook_available),
    demo_data_included: Boolean(deploymentMeta.demo_data_included ?? true),
    demo_data_description: String(deploymentMeta.demo_data_description || 'Partner-provided sandbox dataset'),
    demo_data_format: String(deploymentMeta.demo_data_format || 'json'),
    support_sla_hours: String(trustMeta.support_sla_hours || 24),
    security_review_required: Boolean(trustMeta.security_review_required),
    support_owner_name: String(trustMeta.support_owner_name || ''),
    support_owner_email: String(trustMeta.support_owner_email || ''),
    documentation_complete: Boolean(trustMeta.documentation_complete),
    security_packet_data_handling: String(securityPacket.data_handling || deploymentMeta.data_mode_for_trial || 'demo_only'),
    security_packet_pii_supported: Boolean(securityPacket.pii_supported),
    security_packet_audit_logs_available: Boolean(securityPacket.audit_logs_available),
    security_packet_rollback_plan_available: Boolean(securityPacket.rollback_plan_available),
    security_packet_compliance_notes: String(securityPacket.compliance_notes || ''),
    submission_notes: listing?.submission_notes || '',
    setup_estimate_hours: String(listing?.setup_estimate_hours || 2),
    integration_complexity: listing?.integration_complexity || 'low',
  }
}

const splitCsv = (value: string): string[] =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

const formatUsdCents = (value: number): string => `USD ${(value / 100).toLocaleString()}`

export default function MarketplacePartnerDashboardPage() {
  const navigate = useNavigate()
  const currentUser = useAppSelector((state) => state.user.user)

  const [dashboard, setDashboard] = useState<PartnerDashboardResponse | null>(null)
  const [analytics, setAnalytics] = useState<PartnerAnalyticsResponse | null>(null)
  const [earnings, setEarnings] = useState<PartnerEarningsResponse | null>(null)
  const [payouts, setPayouts] = useState<PartnerPayout[]>([])
  const [referrals, setReferrals] = useState<PartnerReferralsResponse | null>(null)
  const [embedSnippet, setEmbedSnippet] = useState<PartnerEmbedResponse | null>(null)
  const [profileForm, setProfileForm] = useState<ProfileFormState>(createProfileForm())
  const [listingForm, setListingForm] = useState<ListingFormState>(createListingForm())
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null)
  const [preview, setPreview] = useState<PrivatePreviewStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingListing, setSavingListing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [startingPreview, setStartingPreview] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const selectedListing = dashboard?.listings.find((item) => item.id === selectedListingId) || null

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
        const [response, analyticsResponse, earningsResponse, payoutsResponse, referralsResponse] = await Promise.all([
          marketplacePartnersApi.getDashboard(),
          marketplacePartnersApi.getAnalytics(),
          marketplacePartnersApi.getEarnings(),
          marketplacePartnersApi.getPayouts(),
          marketplacePartnersApi.getReferrals(),
        ])
        if (cancelled) return
        setDashboard(response)
        setAnalytics(analyticsResponse)
        setEarnings(earningsResponse)
        setPayouts(payoutsResponse.items)
        setReferrals(referralsResponse)
        setProfileForm(createProfileForm(response))
        const firstListing = response.listings[0] || null
        setSelectedListingId(firstListing?.id || null)
        setListingForm(createListingForm(firstListing || undefined))
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.response?.data?.detail || 'No se pudo cargar el dashboard de partners')
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

  useEffect(() => {
    setListingForm(createListingForm(selectedListing || undefined))
    setPreview(null)
  }, [selectedListingId, selectedListing])

  useEffect(() => {
    if (!selectedListingId) {
      setEmbedSnippet(null)
      return
    }
    let cancelled = false
    void marketplacePartnersApi
      .getEmbed(selectedListingId)
      .then((response) => {
        if (!cancelled) {
          setEmbedSnippet(response)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setEmbedSnippet(null)
        }
      })
    return () => {
      cancelled = true
    }
  }, [selectedListingId])

  const refreshDashboard = async (keepListingId?: string | null) => {
    const [response, analyticsResponse, earningsResponse, payoutsResponse, referralsResponse] = await Promise.all([
      marketplacePartnersApi.getDashboard(),
      marketplacePartnersApi.getAnalytics(),
      marketplacePartnersApi.getEarnings(),
      marketplacePartnersApi.getPayouts(),
      marketplacePartnersApi.getReferrals(),
    ])
    setDashboard(response)
    setAnalytics(analyticsResponse)
    setEarnings(earningsResponse)
    setPayouts(payoutsResponse.items)
    setReferrals(referralsResponse)
    setProfileForm(createProfileForm(response))
    const preferredId = keepListingId || selectedListingId || response.listings[0]?.id || null
    const nextSelected = response.listings.find((item) => item.id === preferredId) || response.listings[0] || null
    setSelectedListingId(nextSelected?.id || null)
    setListingForm(createListingForm(nextSelected || undefined))
  }

  const handleApply = async () => {
    setSavingProfile(true)
    setError('')
    setNotice('')
    try {
      await marketplacePartnersApi.apply({
        display_name: profileForm.display_name,
        company_name: profileForm.company_name,
        website_url: profileForm.website_url,
        contact_email: profileForm.contact_email,
        bio: profileForm.bio,
        target_verticals: splitCsv(profileForm.target_verticals_text),
        onboarding_answers: {},
      })
      await refreshDashboard(selectedListingId)
      setNotice('Solicitud de partner actualizada.')
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'No se pudo guardar la solicitud')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleCreateDraft = async () => {
    setSavingListing(true)
    setError('')
    setNotice('')
    try {
      const created = await marketplacePartnersApi.createListing({
        name: `Nueva solucion ${new Date().toLocaleDateString()}`,
        title: 'Nueva solucion partner',
        vertical: dashboard?.vertical_options[0] || 'fintech',
        poc_type: dashboard?.poc_type_options[0] || 'generative',
      })
      await refreshDashboard(created.id)
      setNotice('Draft creada.')
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'No se pudo crear la draft')
    } finally {
      setSavingListing(false)
    }
  }

  const handleSaveListing = async () => {
    if (!selectedListingId) return
    setSavingListing(true)
    setError('')
    setNotice('')
    try {
      await marketplacePartnersApi.updateListing(selectedListingId, {
        name: listingForm.name,
        title: listingForm.title,
        subtitle: listingForm.subtitle,
        short_description: listingForm.short_description,
        description: listingForm.description,
        vertical: listingForm.vertical,
        poc_type: listingForm.poc_type,
        interface: listingForm.interface,
        tags: splitCsv(listingForm.tags_text),
        tech_stack: splitCsv(listingForm.tech_stack_text),
        dependencies: splitCsv(listingForm.dependencies_text),
        buyer_fit: {
          problem_statement: listingForm.buyer_problem_statement,
          target_team: listingForm.buyer_target_team,
          target_company_size: listingForm.buyer_company_size,
        },
        deployment_meta: {
          modes: splitCsv(listingForm.deploy_modes_text),
          data_mode_for_trial: listingForm.data_mode_for_trial,
          managed_deploy_available: listingForm.managed_deploy_available,
          runbook_available: listingForm.runbook_available,
          trial_duration_hours: 2,
          demo_data_included: listingForm.demo_data_included,
          demo_data_description: listingForm.demo_data_description,
          demo_data_format: listingForm.demo_data_format,
        },
        trust_meta: {
          support_sla_hours: Number(listingForm.support_sla_hours) || 24,
          security_review_required: listingForm.security_review_required,
          support_owner_name: listingForm.support_owner_name,
          support_owner_email: listingForm.support_owner_email,
          documentation_complete: listingForm.documentation_complete,
          security_packet: {
            data_handling: listingForm.security_packet_data_handling,
            pii_supported: listingForm.security_packet_pii_supported,
            audit_logs_available: listingForm.security_packet_audit_logs_available,
            rollback_plan_available: listingForm.security_packet_rollback_plan_available,
            runbook_available: listingForm.runbook_available,
            compliance_notes: listingForm.security_packet_compliance_notes,
          },
        },
        submission_notes: listingForm.submission_notes,
        setup_estimate_hours: Number(listingForm.setup_estimate_hours) || 2,
        integration_complexity: listingForm.integration_complexity,
      })
      await refreshDashboard(selectedListingId)
      setNotice('Metadata guardada.')
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'No se pudo guardar la listing')
    } finally {
      setSavingListing(false)
    }
  }

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !selectedListingId) return
    setUploading(true)
    setError('')
    setNotice('')
    try {
      await marketplacePartnersApi.uploadZip(selectedListingId, file)
      await refreshDashboard(selectedListingId)
      setNotice('ZIP subido y validado.')
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'No se pudo subir el ZIP')
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  const handleSubmitForReview = async () => {
    if (!selectedListingId) return
    setSubmitting(true)
    setError('')
    setNotice('')
    try {
      await marketplacePartnersApi.submitListing(selectedListingId)
      await refreshDashboard(selectedListingId)
      setNotice('Listing enviada a curacion manual.')
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'No se pudo enviar a curacion')
    } finally {
      setSubmitting(false)
    }
  }

  const handleStartPreview = async () => {
    if (!selectedListingId) return
    setStartingPreview(true)
    setError('')
    try {
      const response = await marketplacePartnersApi.createPrivatePreview(selectedListingId)
      setPreview(response)
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'No se pudo iniciar el preview privado')
    } finally {
      setStartingPreview(false)
    }
  }

  const handleRefreshPreview = async () => {
    if (!selectedListingId) return
    try {
      const response = await marketplacePartnersApi.getPrivatePreviewStatus(selectedListingId)
      setPreview(response)
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'No se pudo consultar el preview privado')
    }
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3 text-slate-900">
            <Lock className="h-5 w-5 text-brand-600" />
            <h1 className="text-2xl font-semibold">Partner Dashboard</h1>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            La Fase 2 del marketplace requiere login para crear perfil, subir ZIPs y abrir previews privados.
          </p>
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => {
                saveAuthReturnUrl()
                navigate('/login')
              }}
              className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Iniciar sesion
            </button>
            <Link to="/marketplace" className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:border-slate-300">
              Volver al marketplace
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const previewUrl = preview?.preview_url ? normalizeMarketplacePreviewUrl(preview.preview_url) : ''

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => navigate('/marketplace')}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Marketplace
          </button>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Fase 2 · Partner program cerrado</p>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
          </div>
        ) : (
          <div className="space-y-8">
            <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
              <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Perfil partner</p>
                    <h1 className="mt-2 text-2xl font-semibold text-slate-900">Onboarding y aplicacion</h1>
                  </div>
                  <StatusBadge status={dashboard?.profile.status || 'not_started'} />
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <Field label="Display name">
                    <input
                      value={profileForm.display_name}
                      onChange={(event) => setProfileForm((prev) => ({ ...prev, display_name: event.target.value }))}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
                    />
                  </Field>
                  <Field label="Company">
                    <input
                      value={profileForm.company_name}
                      onChange={(event) => setProfileForm((prev) => ({ ...prev, company_name: event.target.value }))}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
                    />
                  </Field>
                  <Field label="Website">
                    <input
                      value={profileForm.website_url}
                      onChange={(event) => setProfileForm((prev) => ({ ...prev, website_url: event.target.value }))}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
                    />
                  </Field>
                  <Field label="Contact email">
                    <input
                      value={profileForm.contact_email}
                      onChange={(event) => setProfileForm((prev) => ({ ...prev, contact_email: event.target.value }))}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
                    />
                  </Field>
                </div>

                <div className="mt-4">
                  <Field label="Verticales objetivo (csv)">
                    <input
                      value={profileForm.target_verticals_text}
                      onChange={(event) => setProfileForm((prev) => ({ ...prev, target_verticals_text: event.target.value }))}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
                    />
                  </Field>
                </div>

                <div className="mt-4">
                  <Field label="Bio">
                    <textarea
                      rows={4}
                      value={profileForm.bio}
                      onChange={(event) => setProfileForm((prev) => ({ ...prev, bio: event.target.value }))}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
                    />
                  </Field>
                </div>

                <button
                  type="button"
                  onClick={handleApply}
                  disabled={savingProfile}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
                >
                  {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Guardar solicitud
                </button>
              </article>

              <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Submissions</p>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-900">Listings del partner</h2>
                  </div>
                  <button
                    type="button"
                    onClick={handleCreateDraft}
                    disabled={savingListing}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:border-slate-300"
                  >
                    <Plus className="h-4 w-4" />
                    Nueva draft
                  </button>
                </div>

                <div className="mt-5 space-y-3">
                  {(dashboard?.listings || []).length === 0 && (
                    <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-sm text-slate-500">
                      Todavia no hay submissions para esta organizacion.
                    </div>
                  )}
                  {(dashboard?.listings || []).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedListingId(item.id)}
                      className={`w-full rounded-[1.5rem] border p-4 text-left transition ${
                        selectedListingId === item.id
                          ? 'border-brand-300 bg-brand-50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">{item.title}</p>
                          <p className="mt-1 text-sm text-slate-500">{item.vertical} · {item.poc_type}</p>
                        </div>
                        <StatusBadge status={item.status} />
                      </div>
                      <p className="mt-3 text-sm text-slate-600">{item.short_description || 'Sin resumen todavia.'}</p>
                    </button>
                  ))}
                </div>
              </article>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
              <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Fase 4</p>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-900">Earnings por linea de ingreso</h2>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                    {earnings?.summary.transaction_count || 0} ventas
                  </span>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <Metric label="Gross" value={formatUsdCents(earnings?.summary.gross_amount_cents || 0)} />
                  <Metric label="Net partner" value={formatUsdCents(earnings?.summary.net_amount_cents || 0)} />
                  <Metric label="Pending payout" value={formatUsdCents(earnings?.summary.pending_payout_cents || 0)} />
                  <Metric label="Paid out" value={formatUsdCents(earnings?.summary.paid_out_cents || 0)} />
                </div>

                <div className="mt-6 space-y-3">
                  {(earnings?.revenue_lines || []).length === 0 && (
                    <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-sm text-slate-500">
                      Todavia no hay revenue lines registradas para este partner.
                    </div>
                  )}
                  {(earnings?.revenue_lines || []).map((line) => (
                    <div key={line.transaction_type} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-slate-900">{line.line_label}</p>
                          <p className="mt-1 text-sm text-slate-500">{line.transaction_count} transacciones</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-slate-900">{formatUsdCents(line.net_amount_cents)}</p>
                          <p className="text-sm text-slate-500">gross {formatUsdCents(line.gross_amount_cents)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Payout schedule</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">Historial de payouts</h2>
                </div>

                <div className="mt-6 space-y-3">
                  {payouts.length === 0 && (
                    <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-sm text-slate-500">
                      Aun no hay cortes de payout creados para esta cuenta.
                    </div>
                  )}
                  {payouts.map((payout) => (
                    <div key={payout.id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {payout.period_start || 'sin inicio'} → {payout.period_end || 'sin cierre'}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {payout.transaction_count} transacciones · {payout.status}
                          </p>
                        </div>
                        <p className="font-semibold text-slate-900">{formatUsdCents(payout.net_amount_cents)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {Boolean(earnings?.recent_transactions?.length) && (
                  <div className="mt-8">
                    <p className="text-sm font-semibold text-slate-900">Ventas recientes</p>
                    <div className="mt-3 space-y-3">
                      {(earnings?.recent_transactions || []).slice(0, 4).map((transaction) => (
                        <div key={transaction.id} className="rounded-[1.25rem] border border-slate-200 bg-white p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-medium text-slate-900">{transaction.listing_title}</p>
                              <p className="mt-1 text-sm text-slate-500">
                                {transaction.line_label} · {transaction.status}
                              </p>
                            </div>
                            <p className="font-semibold text-slate-900">{formatUsdCents(transaction.developer_payout_cents)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Fase 5</p>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-900">Growth analytics</h2>
                  </div>
                  <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                    {analytics?.profile.certification_status || dashboard?.profile.certification_status || 'none'}
                  </span>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <Metric label="Views" value={String(analytics?.summary.listing_views || 0)} />
                  <Metric label="Trials" value={String(analytics?.summary.trials_started || 0)} />
                  <Metric label="Pilots" value={String(analytics?.summary.pilot_requests || 0)} />
                  <Metric label="Referrals" value={String(analytics?.summary.referral_leads || 0)} />
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <MiniMetric label="View → Trial" value={`${analytics?.summary.view_to_trial_rate || 0}%`} />
                  <MiniMetric label="Trial → Pilot" value={`${analytics?.summary.trial_to_pilot_rate || 0}%`} />
                  <MiniMetric label="Pilot → Purchase" value={`${analytics?.summary.pilot_to_purchase_rate || 0}%`} />
                </div>

                <div className="mt-6 space-y-3">
                  {(analytics?.listing_funnel || []).slice(0, 4).map((row) => (
                    <div key={row.listing_slug} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-slate-900">{row.listing_title}</p>
                          <p className="mt-1 text-sm text-slate-500">
                            {row.views} views · {row.trials} trials · {row.pilots} pilots
                          </p>
                        </div>
                        <div className="text-right text-sm text-slate-600">
                          <p>{row.view_to_trial_rate}% V→T</p>
                          <p>{row.pilot_to_purchase_rate}% P→Buy</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(analytics?.listing_funnel || []).length === 0 && (
                    <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-sm text-slate-500">
                      Todavia no hay actividad suficiente para analytics del publisher.
                    </div>
                  )}
                </div>
              </article>

              <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Distribucion</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">Embeds y referrals</h2>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-900">Referral link</p>
                    <p className="mt-2 text-sm text-slate-600 break-all">
                      {dashboard?.profile.referral_code
                        ? `${window.location.origin}/marketplace/ref/${dashboard.profile.referral_code}`
                        : 'n/a'}
                    </p>
                  </div>

                  {embedSnippet && (
                    <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm font-semibold text-slate-900">Embed snippet</p>
                      <p className="mt-2 text-sm text-slate-600 break-all">{embedSnippet.iframe_snippet}</p>
                    </div>
                  )}

                  <div className="space-y-3">
                    {(referrals?.items || []).slice(0, 4).map((lead) => (
                      <div key={lead.id} className="rounded-[1.25rem] border border-slate-200 bg-white p-4">
                        <p className="font-medium text-slate-900">{lead.company_name || lead.contact_email}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {lead.status} · {lead.listing_slug || 'general'}
                        </p>
                      </div>
                    ))}
                    {(referrals?.items || []).length === 0 && (
                      <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-sm text-slate-500">
                        Todavia no hay referrals registradas para este partner.
                      </div>
                    )}
                  </div>
                </div>
              </article>
            </section>

            {error && <Alert tone="error">{error}</Alert>}
            {notice && <Alert tone="success">{notice}</Alert>}

            {selectedListing && (
              <section className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
                <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Wizard</p>
                      <h2 className="mt-2 text-2xl font-semibold text-slate-900">Metadata de buyer fit, deploy y trust</h2>
                    </div>
                    <button
                      type="button"
                      onClick={handleSaveListing}
                      disabled={savingListing}
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                    >
                      {savingListing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Guardar
                    </button>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <Field label="Nombre">
                      <input value={listingForm.name} onChange={(event) => setListingForm((prev) => ({ ...prev, name: event.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900" />
                    </Field>
                    <Field label="Titulo">
                      <input value={listingForm.title} onChange={(event) => setListingForm((prev) => ({ ...prev, title: event.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900" />
                    </Field>
                    <Field label="Vertical">
                      <select value={listingForm.vertical} onChange={(event) => setListingForm((prev) => ({ ...prev, vertical: event.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900">
                        {(dashboard?.vertical_options || []).map((option) => <option key={option} value={option}>{option}</option>)}
                      </select>
                    </Field>
                    <Field label="Tipo">
                      <select value={listingForm.poc_type} onChange={(event) => setListingForm((prev) => ({ ...prev, poc_type: event.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900">
                        {(dashboard?.poc_type_options || []).map((option) => <option key={option} value={option}>{option}</option>)}
                      </select>
                    </Field>
                    <Field label="Interfaz">
                      <input value={listingForm.interface} onChange={(event) => setListingForm((prev) => ({ ...prev, interface: event.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900" />
                    </Field>
                    <Field label="Setup estimado (h)">
                      <input value={listingForm.setup_estimate_hours} onChange={(event) => setListingForm((prev) => ({ ...prev, setup_estimate_hours: event.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900" />
                    </Field>
                  </div>

                  <div className="mt-4">
                    <Field label="Resumen corto">
                      <textarea rows={3} value={listingForm.short_description} onChange={(event) => setListingForm((prev) => ({ ...prev, short_description: event.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900" />
                    </Field>
                  </div>

                  <div className="mt-4">
                    <Field label="Descripcion">
                      <textarea rows={5} value={listingForm.description} onChange={(event) => setListingForm((prev) => ({ ...prev, description: event.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900" />
                    </Field>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <Field label="Tags (csv)">
                      <input value={listingForm.tags_text} onChange={(event) => setListingForm((prev) => ({ ...prev, tags_text: event.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900" />
                    </Field>
                    <Field label="Tech stack (csv)">
                      <input value={listingForm.tech_stack_text} onChange={(event) => setListingForm((prev) => ({ ...prev, tech_stack_text: event.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900" />
                    </Field>
                    <Field label="Dependencies (csv)">
                      <input value={listingForm.dependencies_text} onChange={(event) => setListingForm((prev) => ({ ...prev, dependencies_text: event.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900" />
                    </Field>
                    <Field label="Integracion">
                      <select value={listingForm.integration_complexity} onChange={(event) => setListingForm((prev) => ({ ...prev, integration_complexity: event.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900">
                        <option value="low">low</option>
                        <option value="medium">medium</option>
                        <option value="high">high</option>
                      </select>
                    </Field>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <Field label="Problema de negocio">
                      <textarea rows={4} value={listingForm.buyer_problem_statement} onChange={(event) => setListingForm((prev) => ({ ...prev, buyer_problem_statement: event.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900" />
                    </Field>
                    <Field label="Target team">
                      <input value={listingForm.buyer_target_team} onChange={(event) => setListingForm((prev) => ({ ...prev, buyer_target_team: event.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900" />
                    </Field>
                    <Field label="Target company size">
                      <input value={listingForm.buyer_company_size} onChange={(event) => setListingForm((prev) => ({ ...prev, buyer_company_size: event.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900" />
                    </Field>
                    <Field label="Deploy modes (csv)">
                      <input value={listingForm.deploy_modes_text} onChange={(event) => setListingForm((prev) => ({ ...prev, deploy_modes_text: event.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900" />
                    </Field>
                    <Field label="Data mode for trial">
                      <input value={listingForm.data_mode_for_trial} onChange={(event) => setListingForm((prev) => ({ ...prev, data_mode_for_trial: event.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900" />
                    </Field>
                    <Field label="Support SLA (h)">
                      <input value={listingForm.support_sla_hours} onChange={(event) => setListingForm((prev) => ({ ...prev, support_sla_hours: event.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900" />
                    </Field>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <Field label="Support owner">
                      <input value={listingForm.support_owner_name} onChange={(event) => setListingForm((prev) => ({ ...prev, support_owner_name: event.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900" />
                    </Field>
                    <Field label="Support email">
                      <input value={listingForm.support_owner_email} onChange={(event) => setListingForm((prev) => ({ ...prev, support_owner_email: event.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900" />
                    </Field>
                    <Field label="Demo data description">
                      <input value={listingForm.demo_data_description} onChange={(event) => setListingForm((prev) => ({ ...prev, demo_data_description: event.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900" />
                    </Field>
                    <Field label="Demo data format">
                      <input value={listingForm.demo_data_format} onChange={(event) => setListingForm((prev) => ({ ...prev, demo_data_format: event.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900" />
                    </Field>
                    <Field label="Security packet · data handling">
                      <input value={listingForm.security_packet_data_handling} onChange={(event) => setListingForm((prev) => ({ ...prev, security_packet_data_handling: event.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900" />
                    </Field>
                    <Field label="Security packet · notes">
                      <textarea rows={3} value={listingForm.security_packet_compliance_notes} onChange={(event) => setListingForm((prev) => ({ ...prev, security_packet_compliance_notes: event.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900" />
                    </Field>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-6">
                    <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                      <input type="checkbox" checked={listingForm.managed_deploy_available} onChange={(event) => setListingForm((prev) => ({ ...prev, managed_deploy_available: event.target.checked }))} />
                      Managed deploy disponible
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                      <input type="checkbox" checked={listingForm.runbook_available} onChange={(event) => setListingForm((prev) => ({ ...prev, runbook_available: event.target.checked }))} />
                      Runbook disponible
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                      <input type="checkbox" checked={listingForm.demo_data_included} onChange={(event) => setListingForm((prev) => ({ ...prev, demo_data_included: event.target.checked }))} />
                      Demo data incluida
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                      <input type="checkbox" checked={listingForm.security_review_required} onChange={(event) => setListingForm((prev) => ({ ...prev, security_review_required: event.target.checked }))} />
                      Security review requerida
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                      <input type="checkbox" checked={listingForm.documentation_complete} onChange={(event) => setListingForm((prev) => ({ ...prev, documentation_complete: event.target.checked }))} />
                      Documentacion completa
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                      <input type="checkbox" checked={listingForm.security_packet_pii_supported} onChange={(event) => setListingForm((prev) => ({ ...prev, security_packet_pii_supported: event.target.checked }))} />
                      PII soportado
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                      <input type="checkbox" checked={listingForm.security_packet_audit_logs_available} onChange={(event) => setListingForm((prev) => ({ ...prev, security_packet_audit_logs_available: event.target.checked }))} />
                      Audit logs disponibles
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                      <input type="checkbox" checked={listingForm.security_packet_rollback_plan_available} onChange={(event) => setListingForm((prev) => ({ ...prev, security_packet_rollback_plan_available: event.target.checked }))} />
                      Rollback plan disponible
                    </label>
                  </div>

                  <div className="mt-4">
                    <Field label="Notas para curacion">
                      <textarea rows={4} value={listingForm.submission_notes} onChange={(event) => setListingForm((prev) => ({ ...prev, submission_notes: event.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900" />
                    </Field>
                  </div>
                </article>

                <div className="space-y-6">
                  <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Validacion</p>
                    <h3 className="mt-2 text-xl font-semibold text-slate-900">ZIP, hard gates y preview privado</h3>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:border-slate-300">
                        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                        Subir ZIP
                        <input type="file" accept=".zip" className="hidden" onChange={handleUpload} />
                      </label>
                      <button type="button" onClick={handleSubmitForReview} disabled={submitting || !selectedListing.uploaded_zip_path} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
                        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        Enviar a curacion
                      </button>
                      <button type="button" onClick={handleStartPreview} disabled={startingPreview || !selectedListing.uploaded_zip_path} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:border-slate-300 disabled:opacity-50">
                        {startingPreview ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                        Preview privado
                      </button>
                    </div>

                    {selectedListing.validation_report && (
                      <div className="mt-5 space-y-4">
                        <div className="grid gap-3 sm:grid-cols-3">
                          <Metric label="Hard gates" value={selectedListing.validation_report.hard_gate_passed ? 'PASS' : 'FAIL'} />
                          <Metric label="Soft score" value={`${selectedListing.validation_report.soft_score}`} />
                          <Metric label="Quality" value={`${selectedListing.validation_report.quality_score}`} />
                        </div>
                        {selectedListing.trust_summary && (
                          <div className="grid gap-3 sm:grid-cols-3">
                            <Metric label="Trust" value={`${selectedListing.trust_summary.trust_score}`} />
                            <Metric label="Readiness" value={selectedListing.trust_summary.deployment_readiness} />
                            <Metric label="Security" value={selectedListing.trust_summary.security_review_status} />
                          </div>
                        )}
                        <ValidationGroup title="Hard checks" checks={selectedListing.validation_report.hard_checks} />
                        <ValidationGroup title="Soft checks" checks={selectedListing.validation_report.soft_checks} />
                      </div>
                    )}
                  </article>

                  <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Preview privado</p>
                        <h3 className="mt-2 text-xl font-semibold text-slate-900">Sandbox para partner y equipo interno</h3>
                      </div>
                      <button type="button" onClick={handleRefreshPreview} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:border-slate-300">
                        Refrescar
                      </button>
                    </div>

                    {!preview?.preview_available && (
                      <div className="mt-5 rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                        Todavia no hay preview privado activo.
                      </div>
                    )}

                    {preview?.preview_available && previewUrl && (
                      <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-slate-200">
                        <iframe
                          src={previewUrl}
                          title="Marketplace partner preview"
                          className="min-h-[540px] w-full border-0 bg-white"
                          allow="camera; microphone; fullscreen; autoplay; display-capture; clipboard-read; clipboard-write; geolocation"
                        />
                      </div>
                    )}
                  </article>
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  )
}

function StatusBadge({ status }: { status: string }) {
  const palette =
    status === 'approved'
      ? 'bg-emerald-50 text-emerald-700'
      : status === 'pilot_only'
        ? 'bg-amber-50 text-amber-700'
        : status === 'under_review' || status === 'applied'
          ? 'bg-brand-50 text-brand-700'
          : status === 'rejected'
            ? 'bg-rose-50 text-rose-700'
            : 'bg-slate-100 text-slate-600'

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${palette}`}>
      {status}
    </span>
  )
}

function Alert({ tone, children }: { tone: 'error' | 'success'; children: ReactNode }) {
  return (
    <div className={`rounded-[1.5rem] border px-4 py-3 text-sm ${
      tone === 'error'
        ? 'border-rose-200 bg-rose-50 text-rose-700'
        : 'border-emerald-200 bg-emerald-50 text-emerald-700'
    }`}>
      {children}
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-semibold text-slate-900">{value}</p>
    </div>
  )
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-semibold text-slate-900">{value}</p>
    </div>
  )
}

function ValidationGroup({ title, checks }: { title: string; checks: Array<{ code: string; label: string; passed: boolean }> }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
      <div className="mt-3 space-y-2">
        {checks.map((check) => (
          <div key={check.code} className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
            <span className="text-sm text-slate-700">{check.label}</span>
            <span className={`inline-flex items-center gap-1 text-xs font-semibold ${check.passed ? 'text-emerald-700' : 'text-rose-700'}`}>
              <CheckCircle2 className="h-4 w-4" />
              {check.passed ? 'pass' : 'fail'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
