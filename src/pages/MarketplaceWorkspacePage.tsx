import { useEffect, useState } from 'react'
import { ArrowLeft, Loader2, Rocket, Wand2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import { saveAuthReturnUrl } from '../services/auth'
import {
  marketplaceApi,
  MarketplaceAdvisorResponse,
  MarketplaceBenchmarkResponse,
  MarketplaceDeployPlan,
  MarketplacePrivateWorkspace,
} from '../services/marketplace'
import { useAppSelector } from '../store/hooks'

export default function MarketplaceWorkspacePage() {
  const navigate = useNavigate()
  const currentUser = useAppSelector((state) => state.user.user)
  const [workspace, setWorkspace] = useState<MarketplacePrivateWorkspace | null>(null)
  const [advisor, setAdvisor] = useState<MarketplaceAdvisorResponse | null>(null)
  const [benchmarks, setBenchmarks] = useState<MarketplaceBenchmarkResponse | null>(null)
  const [deployPlan, setDeployPlan] = useState<MarketplaceDeployPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [planningSlug, setPlanningSlug] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    industry: 'general',
    company_size: 'mid-market',
    adoption_stage: 'pilot',
    default_cloud: 'aws' as 'aws' | 'gcp' | 'azure',
    allowed_verticals: '',
    white_label_enabled: false,
  })

  useEffect(() => {
    if (!currentUser) {
      setLoading(false)
      return
    }

    let cancelled = false
    void Promise.all([
      marketplaceApi.getPrivateWorkspace(),
      marketplaceApi.getPrivateWorkspaceAdvisor(),
      marketplaceApi.getPrivateWorkspaceBenchmarks(),
    ])
      .then(([workspaceResponse, advisorResponse, benchmarksResponse]) => {
        if (cancelled) return
        setWorkspace(workspaceResponse)
        setAdvisor(advisorResponse)
        setBenchmarks(benchmarksResponse)
        setForm({
          industry: workspaceResponse.industry || 'general',
          company_size: workspaceResponse.company_size,
          adoption_stage: workspaceResponse.adoption_stage,
          default_cloud: workspaceResponse.default_cloud,
          allowed_verticals: workspaceResponse.allowed_verticals.join(', '),
          white_label_enabled: workspaceResponse.white_label_enabled,
        })
        document.title = `${workspaceResponse.name} | Private Workspace`
      })
      .catch((err: any) => {
        if (!cancelled) {
          setError(err?.response?.data?.detail || 'No se pudo cargar el private workspace')
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
  }, [currentUser])

  const reload = async () => {
    const [workspaceResponse, advisorResponse, benchmarksResponse] = await Promise.all([
      marketplaceApi.getPrivateWorkspace(),
      marketplaceApi.getPrivateWorkspaceAdvisor(),
      marketplaceApi.getPrivateWorkspaceBenchmarks(),
    ])
    setWorkspace(workspaceResponse)
    setAdvisor(advisorResponse)
    setBenchmarks(benchmarksResponse)
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      await marketplaceApi.updatePrivateWorkspace({
        industry: form.industry,
        company_size: form.company_size,
        adoption_stage: form.adoption_stage,
        default_cloud: form.default_cloud,
        allowed_verticals: form.allowed_verticals
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        white_label_enabled: form.white_label_enabled,
      })
      await reload()
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'No se pudo actualizar el private workspace')
    } finally {
      setSaving(false)
    }
  }

  const handleGeneratePlan = async (slug: string) => {
    setPlanningSlug(slug)
    setError('')
    try {
      const response = await marketplaceApi.createDeployPlan(slug, {
        cloud_provider: form.default_cloud,
        environment_target: form.adoption_stage === 'production' ? 'production' : 'staging',
      })
      setDeployPlan(response.plan)
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'No se pudo generar el deploy plan')
    } finally {
      setPlanningSlug(null)
    }
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-amber-200 bg-amber-50 p-8 text-center">
          <p className="text-sm font-medium text-amber-900">Necesitas login para ver tu private workspace.</p>
          <button
            type="button"
            onClick={() => {
              saveAuthReturnUrl()
              navigate('/login?returnTo=%2Fmarketplace%2Fprivate-workspace')
            }}
            className="mt-4 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
          >
            Iniciar sesion
          </button>
        </div>
      </div>
    )
  }

  if (loading || !workspace) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-6 w-6 animate-spin text-sky-600" />
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

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-sky-600">Fase 6</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900">{workspace.name}</h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
            Workspace privado para procurement, advisor, benchmark y deploy planning sobre catálogo curado.
          </p>
        </section>

        {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-sky-600" />
              <h2 className="text-2xl font-semibold text-slate-900">Workspace settings</h2>
            </div>
            <div className="mt-6 space-y-4">
              <input
                value={form.industry}
                onChange={(event) => setForm((prev) => ({ ...prev, industry: event.target.value }))}
                placeholder="Industry"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
              />
              <input
                value={form.company_size}
                onChange={(event) => setForm((prev) => ({ ...prev, company_size: event.target.value }))}
                placeholder="Company size"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
              />
              <select
                value={form.adoption_stage}
                onChange={(event) => setForm((prev) => ({ ...prev, adoption_stage: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
              >
                <option value="pilot">pilot</option>
                <option value="rollout">rollout</option>
                <option value="production">production</option>
              </select>
              <select
                value={form.default_cloud}
                onChange={(event) => setForm((prev) => ({ ...prev, default_cloud: event.target.value as 'aws' | 'gcp' | 'azure' }))}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
              >
                <option value="aws">aws</option>
                <option value="gcp">gcp</option>
                <option value="azure">azure</option>
              </select>
              <input
                value={form.allowed_verticals}
                onChange={(event) => setForm((prev) => ({ ...prev, allowed_verticals: event.target.value }))}
                placeholder="allowed verticals csv"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
              />
              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.white_label_enabled}
                  onChange={(event) => setForm((prev) => ({ ...prev, white_label_enabled: event.target.checked }))}
                />
                White-label enabled
              </label>
            </div>
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving}
              className="mt-6 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {saving ? 'Guardando...' : 'Guardar workspace'}
            </button>
          </article>

          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Advisor</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-900">AI advisor recommendations</h2>
            <div className="mt-6 space-y-4">
              {(advisor?.recommendations || []).map((entry) => (
                <div key={entry.listing.slug} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Link to={`/marketplace/${entry.listing.slug}`} className="text-lg font-semibold text-slate-900 hover:text-sky-700">
                        {entry.listing.title}
                      </Link>
                      <p className="mt-1 text-sm text-slate-500">{entry.reasons.join(' · ')}</p>
                    </div>
                    <p className="text-lg font-semibold text-slate-900">{entry.score}</p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => void handleGeneratePlan(entry.listing.slug)}
                      disabled={planningSlug === entry.listing.slug}
                      className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60"
                    >
                      {planningSlug === entry.listing.slug ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
                      Deploy plan
                    </button>
                    <Link
                      to={`/marketplace/${entry.listing.slug}`}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300"
                    >
                      Ver listing
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Benchmarks</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-900">Vertical benchmark snapshot</h2>
            <div className="mt-6 space-y-3">
              {(benchmarks?.verticals || []).map((row) => (
                <div key={row.vertical} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-900">{row.vertical}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {row.pilot_requests} pilots · {row.purchases} purchases · {row.deploy_requests} deploys
                      </p>
                    </div>
                    <div className="text-right text-sm text-slate-600">
                      <p>{row.avg_ticket_usd} avg ticket</p>
                      <p>{row.pilot_to_purchase_rate}% pilot → purchase</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Deploy output</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-900">One-click deploy plan</h2>
            {!deployPlan && (
              <div className="mt-6 rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-sm text-slate-500">
                Genera un plan desde alguna recomendacion del advisor.
              </div>
            )}
            {deployPlan && (
              <div className="mt-6 space-y-4">
                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                  <p className="font-semibold text-slate-900">{deployPlan.listing_title}</p>
                  <p className="mt-1 text-sm text-slate-500">{deployPlan.summary}</p>
                </div>
                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Command</p>
                  <p className="mt-2 break-all font-mono text-sm text-slate-900">{deployPlan.command}</p>
                </div>
                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Infra modules</p>
                  <p className="mt-2 text-sm text-slate-900">{deployPlan.infra_modules.join(', ')}</p>
                </div>
              </div>
            )}
          </article>
        </section>
      </main>
    </div>
  )
}
