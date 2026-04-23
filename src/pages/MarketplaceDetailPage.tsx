import { useEffect, useState, type ReactNode } from 'react'
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  Loader2,
  Play,
  Plug,
  RefreshCw,
  Rocket,
  Shield,
  Star,
} from 'lucide-react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'

import { saveAuthReturnUrl } from '../services/auth'
import {
  MarketplaceEmbedConfig,
  marketplaceApi,
  MarketplaceDeployRequestPayload,
  MarketplaceListingDetail,
  MarketplacePreviewStatus,
  MarketplacePurchasePayload,
  MarketplaceTrustSummary,
  normalizeMarketplacePreviewUrl,
} from '../services/marketplace'
import { useAppSelector } from '../store/hooks'

const complexityLabel: Record<string, string> = {
  low: 'Simple',
  medium: 'Media',
  high: 'Alta',
}

const readinessLabel: Record<string, string> = {
  sandbox_only: 'Sandbox Only',
  pilot_ready: 'Pilot Ready',
  deploy_ready: 'Deploy Ready',
  enterprise_ready: 'Enterprise Ready',
}

export default function MarketplaceDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const currentUser = useAppSelector((state) => state.user.user)

  const [listing, setListing] = useState<MarketplaceListingDetail | null>(null)
  const [preview, setPreview] = useState<MarketplacePreviewStatus | null>(null)
  const [embedConfig, setEmbedConfig] = useState<MarketplaceEmbedConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [startingPreview, setStartingPreview] = useState(false)
  const [requestingPilot, setRequestingPilot] = useState(false)
  const [requestingDeploy, setRequestingDeploy] = useState(false)
  const [purchasingType, setPurchasingType] = useState<string | null>(null)
  const [downloadingBundle, setDownloadingBundle] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [latestPurchaseId, setLatestPurchaseId] = useState<string | null>(null)
  const [pilotForm, setPilotForm] = useState({
    requested_data_mode: 'sanitized_upload',
    requested_use_case: '',
    requested_timeline: '2 weeks',
    contact_email: '',
    notes: '',
  })
  const [deployForm, setDeployForm] = useState<MarketplaceDeployRequestPayload>({
    deploy_mode: 'partner_handoff',
    environment_target: 'staging',
    requested_timeline: '2-4 weeks',
    requested_data_mode: 'sanitized_upload',
    notes: '',
  })

  useEffect(() => {
    if (!slug) return

    let cancelled = false
    const refCode = new URLSearchParams(location.search).get('ref') || undefined

    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const [nextListing, nextPreview, nextEmbedConfig] = await Promise.all([
          marketplaceApi.getListing(slug, { ref: refCode, source: 'detail' }),
          marketplaceApi.getTryStatus(slug),
          marketplaceApi.getEmbedConfig(slug, refCode),
        ])
        if (cancelled) return
        setListing(nextListing)
        setPreview(nextPreview)
        setEmbedConfig(nextEmbedConfig)
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.response?.data?.detail || 'No se pudo cargar el listing')
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
  }, [location.search, slug])

  useEffect(() => {
    if (!listing) return
    document.title = `${listing.seo_meta?.meta_title || listing.title} | Marketplace CodlyLabs`
    const meta = document.querySelector('meta[name="description"]')
    if (meta && listing.seo_meta?.meta_description) {
      meta.setAttribute('content', listing.seo_meta.meta_description)
    }
  }, [listing])

  const handleStartPreview = async () => {
    if (!slug) return
    setStartingPreview(true)
    setError('')
    try {
      const nextPreview = await marketplaceApi.tryListing(slug)
      setPreview(nextPreview)
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'No se pudo iniciar el sandbox')
    } finally {
      setStartingPreview(false)
    }
  }

  const handleRefreshPreview = async () => {
    if (!slug) return
    try {
      const nextPreview = await marketplaceApi.getTryStatus(slug)
      setPreview(nextPreview)
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'No se pudo refrescar el estado del sandbox')
    }
  }

  const handleRequestPilot = async () => {
    if (!slug || !listing) return
    if (!currentUser) {
      saveAuthReturnUrl()
      navigate(`/login?returnTo=${encodeURIComponent(`/marketplace/${slug}`)}`)
      return
    }

    setRequestingPilot(true)
    setError('')
    setNotice('')
    try {
      const response = await marketplaceApi.requestPilot(slug, pilotForm)
      setNotice(response.message)
      setListing((prev) =>
        prev
          ? {
              ...prev,
              trust_summary: response.trust_summary,
            }
          : prev,
      )
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'No se pudo solicitar el pilot')
    } finally {
      setRequestingPilot(false)
    }
  }

  const handlePurchase = async (purchaseType: MarketplacePurchasePayload['purchase_type']) => {
    if (!slug || !listing) return
    if (!currentUser) {
      saveAuthReturnUrl()
      navigate(`/login?returnTo=${encodeURIComponent(`/marketplace/${slug}`)}`)
      return
    }

    setPurchasingType(purchaseType)
    setError('')
    setNotice('')
    try {
      const response = await marketplaceApi.purchaseListing(slug, {
        purchase_type: purchaseType,
        notes: pilotForm.requested_use_case || undefined,
      })
      setLatestPurchaseId(response.transaction.id)
      setNotice(response.message)
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'No se pudo registrar la compra')
    } finally {
      setPurchasingType(null)
    }
  }

  const handleRequestDeploy = async () => {
    if (!slug || !listing) return
    if (!currentUser) {
      saveAuthReturnUrl()
      navigate(`/login?returnTo=${encodeURIComponent(`/marketplace/${slug}`)}`)
      return
    }

    setRequestingDeploy(true)
    setError('')
    setNotice('')
    try {
      const response = await marketplaceApi.requestDeploy(slug, deployForm)
      setNotice(response.message)
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'No se pudo solicitar el deploy')
    } finally {
      setRequestingDeploy(false)
    }
  }

  const handleDownloadBundle = async () => {
    if (!slug) return
    setDownloadingBundle(true)
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
      setDownloadingBundle(false)
    }
  }

  const previewUrl = preview?.preview_url ? normalizeMarketplacePreviewUrl(preview.preview_url) : ''

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
      </div>
    )
  }

  if (error && !listing) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-[1.75rem] border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
          {error}
        </div>
      </div>
    )
  }

  if (!listing) {
    return null
  }

  const manifest = listing.generated_manifest
  const trust = listing.trust_summary
  const partner = listing.partner_profile
  const primaryBadge =
    trust.trust_badges[trust.trust_badges.length - 1] ||
    readinessLabel[trust.deployment_readiness] ||
    'Validated'

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => navigate('/marketplace')}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al marketplace
          </button>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{listing.vertical}</p>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                {listing.poc_type_label}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                {primaryBadge}
              </span>
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
                {readinessLabel[trust.deployment_readiness] || trust.deployment_readiness}
              </span>
            </div>

            <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900">{listing.title}</h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">{listing.short_description}</p>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <PrimaryStat icon={<Shield className="h-4 w-4" />} label="Trust score" value={`${trust.trust_score}/100`} />
              <PrimaryStat icon={<Clock className="h-4 w-4" />} label="Setup estimado" value={`${listing.setup_estimate_hours}h`} />
              <PrimaryStat icon={<Plug className="h-4 w-4" />} label="Integracion" value={complexityLabel[listing.integration_complexity] || listing.integration_complexity} />
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {listing.tech_stack.map((entry) => (
                <span key={entry} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700">
                  {entry}
                </span>
              ))}
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <InfoCard label="Partner" value={listing.partner_display_name} />
              <InfoCard label="Rating publico" value={trust.rating_label} />
              <InfoCard label="Pilot requests" value={String(trust.pilot_request_count)} />
              <InfoCard label="Data mode" value={trust.data_mode_for_trial} />
            </div>
          </article>

          <aside className="rounded-[2rem] border border-slate-200 bg-slate-900 p-7 text-white shadow-sm">
            <p className="text-xs uppercase tracking-[0.25em] text-emerald-300">Pricing y conversion</p>
            <div className="mt-4 grid gap-3">
              <PricingOption
                title="Pilot"
                subtitle="Compra validacion guiada con bundle y handoff."
                price={listing.price_trial}
                cta="Buy Pilot"
                loading={purchasingType === 'pilot'}
                onClick={() => handlePurchase('pilot')}
              />
              <PricingOption
                title="License"
                subtitle="Acceso al paquete para despliegue controlado."
                price={listing.price_license}
                cta="Buy License"
                loading={purchasingType === 'license'}
                onClick={() => handlePurchase('license')}
              />
              <PricingOption
                title="Enterprise"
                subtitle="Canal comercial para rollout y soporte ampliado."
                price={listing.price_enterprise}
                cta="Enterprise Access"
                loading={purchasingType === 'enterprise'}
                onClick={() => handlePurchase('enterprise')}
              />
            </div>

            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={handleStartPreview}
                disabled={startingPreview}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {startingPreview ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                Try Sandbox
              </button>

              <button
                type="button"
                onClick={handleRequestPilot}
                disabled={requestingPilot}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {requestingPilot ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
                Request Pilot
              </button>

              <button
                type="button"
                onClick={handleRequestDeploy}
                disabled={requestingDeploy}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 px-4 py-3 text-sm font-medium text-white transition hover:border-white/30 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {requestingDeploy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
                Request Deploy
              </button>

              {latestPurchaseId && (
                <button
                  type="button"
                  onClick={handleDownloadBundle}
                  disabled={downloadingBundle}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 px-4 py-3 text-sm font-medium text-white transition hover:border-white/30 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {downloadingBundle ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  Descargar bundle comprado
                </button>
              )}

              <button
                type="button"
                onClick={handleRefreshPreview}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 px-4 py-3 text-sm font-medium text-white transition hover:border-white/30 hover:bg-white/5"
              >
                <RefreshCw className="h-4 w-4" />
                Refrescar estado
              </button>

              {previewUrl && (
                <button
                  type="button"
                  onClick={() => window.open(previewUrl, '_blank', 'noopener,noreferrer')}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 px-4 py-3 text-sm font-medium text-white transition hover:border-white/30 hover:bg-white/5"
                >
                  <ExternalLink className="h-4 w-4" />
                  Abrir preview
                </button>
              )}
            </div>

            <div className="mt-6 space-y-3 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
              <TrustLine label="Security review" value={trust.security_review_status} inverse />
              <TrustLine label="SLA soporte" value={`${trust.support_sla_hours}h`} inverse />
              <TrustLine label="Deploy modes" value={manifest.deployment.modes.join(', ')} inverse />
              <TrustLine label="Support owner" value={trust.security_packet.support_owner_name || 'No definido'} inverse />
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-semibold text-white">Growth y enterprise</p>
              <div className="mt-4 space-y-3 text-sm text-slate-200">
                <TrustLine label="Private workspace ready" value={listing.private_marketplace_ready ? 'Si' : 'No'} inverse />
                <TrustLine label="White-label ready" value={listing.white_label_ready ? 'Si' : 'No'} inverse />
                <TrustLine label="Cloud templates" value={listing.cloud_templates.join(', ')} inverse />
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                {embedConfig && (
                  <Link
                    to={`/marketplace/embed/${listing.slug}`}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-white hover:border-white/30 hover:bg-white/5"
                  >
                    Ver Embed
                  </Link>
                )}
                {currentUser && (
                  <Link
                    to="/marketplace/private-workspace"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-white hover:border-white/30 hover:bg-white/5"
                  >
                    Private Workspace
                  </Link>
                )}
              </div>
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-semibold text-white">Solicitar pilot</p>
              <div className="mt-4 space-y-3">
                <label className="block">
                  <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-slate-300">Use case</span>
                  <textarea
                    rows={3}
                    value={pilotForm.requested_use_case}
                    onChange={(event) => setPilotForm((prev) => ({ ...prev, requested_use_case: event.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400"
                    placeholder="Que equipo, flujo y resultado quieres validar en el pilot."
                  />
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-slate-300">Data mode</span>
                    <select
                      value={pilotForm.requested_data_mode}
                      onChange={(event) => setPilotForm((prev) => ({ ...prev, requested_data_mode: event.target.value }))}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                    >
                      <option value="demo_only">demo_only</option>
                      <option value="sanitized_upload">sanitized_upload</option>
                      <option value="isolated_enterprise_sandbox">isolated_enterprise_sandbox</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-slate-300">Timeline</span>
                    <input
                      value={pilotForm.requested_timeline}
                      onChange={(event) => setPilotForm((prev) => ({ ...prev, requested_timeline: event.target.value }))}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-semibold text-white">Request deploy</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-slate-300">Deploy mode</span>
                  <select
                    value={deployForm.deploy_mode}
                    onChange={(event) => setDeployForm((prev) => ({ ...prev, deploy_mode: event.target.value as MarketplaceDeployRequestPayload['deploy_mode'] }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                  >
                    <option value="partner_handoff">partner_handoff</option>
                    <option value="codly_managed">codly_managed</option>
                    <option value="buyer_managed">buyer_managed</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-slate-300">Environment</span>
                  <select
                    value={deployForm.environment_target}
                    onChange={(event) => setDeployForm((prev) => ({ ...prev, environment_target: event.target.value as MarketplaceDeployRequestPayload['environment_target'] }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                  >
                    <option value="sandbox">sandbox</option>
                    <option value="staging">staging</option>
                    <option value="production">production</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-slate-300">Timeline</span>
                  <input
                    value={deployForm.requested_timeline || ''}
                    onChange={(event) => setDeployForm((prev) => ({ ...prev, requested_timeline: event.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-slate-300">Data mode</span>
                  <select
                    value={deployForm.requested_data_mode || 'demo_only'}
                    onChange={(event) => setDeployForm((prev) => ({ ...prev, requested_data_mode: event.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                  >
                    <option value="demo_only">demo_only</option>
                    <option value="sanitized_upload">sanitized_upload</option>
                    <option value="isolated_enterprise_sandbox">isolated_enterprise_sandbox</option>
                  </select>
                </label>
              </div>
            </div>
          </aside>
        </section>

        {error && (
          <div className="mt-6 rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
            {error}
          </div>
        )}

        {notice && (
          <div className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
            {notice}
          </div>
        )}

        {!currentUser && (
          <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
            Necesitas login para comprar, descargar bundles o enviar requests de pilot/deploy.
            <button
              type="button"
              onClick={() => {
                saveAuthReturnUrl()
                navigate(`/login?returnTo=${encodeURIComponent(`/marketplace/${slug}`)}`)
              }}
              className="ml-2 font-semibold underline"
            >
              Iniciar sesion
            </button>
          </div>
        )}

        {latestPurchaseId && (
          <div className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
            Compra registrada. Puedes descargar el bundle desde esta pagina o revisar el historial en
            <button
              type="button"
              onClick={() => navigate('/marketplace/purchases')}
              className="ml-2 font-semibold underline"
            >
              My Purchases
            </button>
            .
          </div>
        )}

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Preview</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">Sandbox de evaluacion</h2>
              </div>
              {preview?.preview_available && (
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  {preview.status}
                </span>
              )}
            </div>

            {!preview?.preview_available && (
              <div className="mt-5 rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
                <p className="text-base font-medium text-slate-900">El sandbox todavia no fue lanzado.</p>
                <p className="mt-2 text-sm text-slate-500">
                  Inicia el preview para validar UX, stack y fit funcional antes de pasar a pilot.
                </p>
              </div>
            )}

            {preview?.preview_available && previewUrl && (
              <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-slate-200">
                <iframe
                  src={previewUrl}
                  title={listing.title}
                  className="min-h-[720px] w-full border-0 bg-white"
                  allow="camera; microphone; fullscreen; autoplay; display-capture; clipboard-read; clipboard-write; geolocation"
                />
              </div>
            )}
          </article>

          <div className="space-y-6">
            <TrustSummaryCard trust={trust} />

            <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-600" />
                <h3 className="text-lg font-semibold text-slate-900">Security packet</h3>
              </div>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <TrustLine label="Data handling" value={trust.security_packet.data_handling} />
                <TrustLine label="PII soportado" value={trust.security_packet.pii_supported ? 'Si' : 'No'} />
                <TrustLine label="Audit logs" value={trust.security_packet.audit_logs_available ? 'Si' : 'No'} />
                <TrustLine label="Rollback plan" value={trust.security_packet.rollback_plan_available ? 'Si' : 'No'} />
                <TrustLine label="Runbook" value={trust.security_packet.runbook_available ? 'Si' : 'No'} />
                <TrustLine label="Documentacion" value={trust.security_packet.documentation_complete ? 'Completa' : 'Parcial'} />
              </div>
              {trust.security_packet.compliance_notes && (
                <p className="mt-4 rounded-[1.25rem] bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
                  {trust.security_packet.compliance_notes}
                </p>
              )}
            </article>

            <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Stack y dependencias</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {manifest.stack.frontend.concat(manifest.stack.backend).map((entry) => (
                  <span key={entry} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700">
                    {entry}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {listing.dependencies.length > 0 ? listing.dependencies.map((entry) => (
                  <span key={entry} className="rounded-full bg-amber-50 px-3 py-1 text-xs text-amber-700">
                    {entry}
                  </span>
                )) : (
                  <p className="text-sm text-slate-500">No requiere dependencias extras en trial.</p>
                )}
              </div>
            </article>

            {partner && (
              <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-slate-700" />
                  <h3 className="text-lg font-semibold text-slate-900">Partner profile</h3>
                </div>
                <div className="mt-4 space-y-3">
                  <div>
                    <p className="font-semibold text-slate-900">{partner.display_name}</p>
                    <p className="text-sm text-slate-500">{partner.company_name || partner.tier}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                        {partner.partner_program}
                      </span>
                      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                        {partner.certification_status}
                      </span>
                      {partner.public_badges.map((badge) => (
                        <span key={badge} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                          {badge}
                        </span>
                      ))}
                    </div>
                  </div>
                  {partner.bio && <p className="text-sm leading-6 text-slate-600">{partner.bio}</p>}
                  {partner.featured_case_study && Object.keys(partner.featured_case_study).length > 0 && (
                    <div className="rounded-[1.25rem] bg-slate-50 px-4 py-3 text-sm text-slate-600">
                      <p className="font-semibold text-slate-900">
                        {String(partner.featured_case_study.title || 'Caso destacado')}
                      </p>
                      <p className="mt-1">{String(partner.featured_case_study.outcome || partner.featured_case_study.metric || '')}</p>
                    </div>
                  )}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <InfoCard label="Listings publicadas" value={String(partner.public_metrics.published_listings)} />
                    <InfoCard label="Trust medio" value={`${partner.public_metrics.average_trust_score}/100`} />
                    <InfoCard label="Pilot ready" value={String(partner.public_metrics.pilot_ready_listings)} />
                    <InfoCard label="Fastest setup" value={partner.public_metrics.fastest_setup_hours ? `${partner.public_metrics.fastest_setup_hours}h` : 'n/a'} />
                  </div>
                  {partner.id && (
                    <Link
                      to={`/marketplace/partners/${partner.id}`}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                    >
                      Ver perfil publico del partner
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              </article>
            )}
          </div>
        </section>

        <div className="mt-8">
          <Link to="/marketplace" className="text-sm font-medium text-emerald-700 hover:text-emerald-800">
            Ver mas soluciones curadas
          </Link>
        </div>
      </main>
    </div>
  )
}

function PrimaryStat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-500">
        {icon}
        {label}
      </div>
      <p className="mt-3 text-lg font-semibold text-slate-900">{value}</p>
    </div>
  )
}

function PricingOption({
  title,
  subtitle,
  price,
  cta,
  loading,
  onClick,
}: {
  title: string
  subtitle: string
  price: number
  cta: string
  loading: boolean
  onClick: () => void
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-white">{title}</p>
          <p className="mt-1 text-sm leading-6 text-slate-300">{subtitle}</p>
        </div>
        <p className="text-lg font-semibold text-white">USD {price}</p>
      </div>
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {cta}
      </button>
    </div>
  )
}

function TrustLine({ label, value, inverse = false }: { label: string; value: string; inverse?: boolean }) {
  return (
    <div className={`flex items-start justify-between gap-4 border-b pb-3 last:border-b-0 last:pb-0 ${inverse ? 'border-white/10' : 'border-slate-100'}`}>
      <span className={inverse ? 'text-slate-300' : 'text-slate-500'}>{label}</span>
      <span className={`text-right font-medium ${inverse ? 'text-white' : 'text-slate-900'}`}>{value}</span>
    </div>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-2 text-base font-semibold text-slate-900">{value}</p>
    </div>
  )
}

function TrustSummaryCard({ trust }: { trust: MarketplaceTrustSummary }) {
  return (
    <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <Star className="h-4 w-4 text-amber-500" />
        <h3 className="text-lg font-semibold text-slate-900">Trust summary</h3>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <InfoCard label="Deployment readiness" value={readinessLabel[trust.deployment_readiness] || trust.deployment_readiness} />
        <InfoCard label="Rating status" value={trust.rating_label} />
      </div>
      <div className="mt-4 space-y-3">
        {trust.trust_factors.map((factor) => (
          <div key={factor.code} className="flex items-center justify-between rounded-[1.25rem] border border-slate-200 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-900">{factor.label}</p>
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{factor.points} pts</p>
            </div>
            <span className={`inline-flex items-center gap-1 text-xs font-semibold ${factor.passed ? 'text-emerald-700' : 'text-rose-700'}`}>
              <CheckCircle2 className="h-4 w-4" />
              {factor.passed ? 'pass' : 'gap'}
            </span>
          </div>
        ))}
      </div>
    </article>
  )
}
