import { useEffect, useState } from 'react'
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  Loader2,
  Minus,
  Receipt,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react'

import { billingApi, type BillingStatus, type PlanInfo } from '../../services/billing'
import { useWorkspaceOutletContext } from './WorkspaceLayout'
import { useI18n } from '../../i18n'

type NumericLimit = number | 'unlimited'

function formatLimit(value: NumericLimit, unit = ''): string {
  if (value === 'unlimited' || value === -1) return 'Ilimitado'
  return `${value}${unit ? ` ${unit}` : ''}`
}

function hasUnlimitedSeats(tier: string, rawLimit: NumericLimit): boolean {
  if (rawLimit === 'unlimited' || rawLimit === -1) return true
  return tier.toLowerCase() !== 'free'
}

function formatCurrency(value: number): string {
  if (!Number.isFinite(value)) return '$0'
  return `$${value.toLocaleString('es-AR', { maximumFractionDigits: 2 })}`
}

function formatDate(iso: string | null): string {
  if (!iso) return 'Sin definir'
  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) return 'Sin definir'
  return parsed.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
}

const SUBSCRIPTION_TONE: Record<string, { label: string; className: string }> = {
  active: { label: 'Activa', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  trialing: { label: 'En trial', className: 'bg-sky-50 text-sky-700 ring-sky-200' },
  past_due: { label: 'Pago vencido', className: 'bg-amber-50 text-amber-700 ring-amber-200' },
  unpaid: { label: 'Impago', className: 'bg-rose-50 text-rose-700 ring-rose-200' },
  canceled: { label: 'Cancelada', className: 'bg-gray-100 text-gray-600 ring-gray-200' },
  incomplete: { label: 'Incompleta', className: 'bg-amber-50 text-amber-700 ring-amber-200' },
  none: { label: 'Sin suscripción', className: 'bg-gray-100 text-gray-600 ring-gray-200' },
}

function subscriptionBadge(status: string) {
  const normalized = (status || 'none').toLowerCase()
  return SUBSCRIPTION_TONE[normalized] || SUBSCRIPTION_TONE.none
}

function UsageBar({
  label,
  used,
  limit,
  unit,
  color,
}: {
  label: string
  used: number
  limit: NumericLimit
  unit?: string
  color: string
}) {
  const isUnlimited = limit === 'unlimited' || limit === -1
  const numericLimit = isUnlimited ? 0 : Number(limit)
  const pct = !isUnlimited && numericLimit > 0 ? Math.min(100, Math.round((used / numericLimit) * 100)) : 0

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500">{label}</span>
        {isUnlimited ? (
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500">
              {used.toLocaleString('es-AR')}
              {unit ? ` ${unit}` : ''} en uso
            </span>
            <span className="text-xs font-semibold text-emerald-600">Ilimitado</span>
          </div>
        ) : (
          <span className="text-xs text-gray-400">
            {used.toLocaleString('es-AR')} / {numericLimit.toLocaleString('es-AR')}
            {unit ? ` ${unit}` : ''}
          </span>
        )}
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
        {isUnlimited ? (
          <div
            className="h-full w-full rounded-full opacity-40"
            style={{ background: `linear-gradient(90deg, ${color}, ${color}33)` }}
          />
        ) : (
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${pct}%`,
              background: pct >= 90 ? '#EF4444' : pct >= 70 ? '#F59E0B' : color,
            }}
          />
        )}
      </div>
    </div>
  )
}

function FeatureRow({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-xs text-gray-600">{label}</span>
      {enabled ? (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
          <Check size={12} />
          Incluido
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-400">
          <Minus size={12} />
          No disponible
        </span>
      )}
    </div>
  )
}

const TIER_ORDER = ['free', 'starter', 'builder', 'team', 'growth', 'enterprise'] as const

function tierRank(tier: string): number {
  const idx = TIER_ORDER.indexOf(tier.toLowerCase() as typeof TIER_ORDER[number])
  return idx === -1 ? 0 : idx
}

function PlanCard({
  plan,
  isCurrent,
  hideButton,
  onSelect,
  disabled,
  loading,
  brandPrimary,
  t,
}: {
  plan: PlanInfo
  isCurrent: boolean
  hideButton: boolean
  onSelect: () => void
  disabled: boolean
  loading: boolean
  brandPrimary: string
  t: (key: string) => string
}) {
  const isEnterprise = plan.tier.toLowerCase() === 'enterprise'

  return (
    <div
      className={`relative flex h-full flex-col rounded-xl border p-6 transition-shadow hover:shadow-md ${
        isCurrent ? 'border-2' : 'border-gray-200'
      } bg-white`}
      style={isCurrent ? { borderColor: brandPrimary } : undefined}
    >
      {isCurrent && (
        <span
          className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
          style={{ background: brandPrimary }}
        >
          <CheckCircle2 size={10} />
          {t('ws.currentPlan')}
        </span>
      )}
      <h4 className="text-base font-semibold text-gray-900">{plan.display_name}</h4>
      <div className="mt-3">
        {isEnterprise ? (
          <span className="text-3xl font-bold text-gray-900">CUSTOM</span>
        ) : (
          <>
            <span className="text-3xl font-bold text-gray-900">{formatCurrency(plan.price_monthly_usd)}</span>
            <span className="ml-1 text-xs text-gray-400">/mes</span>
          </>
        )}
      </div>
      <ul className="mt-5 flex-1 space-y-2 text-xs text-gray-500">
        <li className="flex items-start gap-2">
          <Check size={12} className="mt-0.5 flex-shrink-0 text-emerald-500" />
          <span>
            {plan.pocs_per_month === 'unlimited'
              ? t('ws.unlimitedValidations')
              : `${plan.pocs_per_month} ${t('ws.validationsPerMonth')}`}
          </span>
        </li>
        <li className="flex items-start gap-2">
          <Check size={12} className="mt-0.5 flex-shrink-0 text-emerald-500" />
          <span>
            {hasUnlimitedSeats(plan.tier, plan.max_users_per_org)
              ? t('ws.unlimitedUsers')
              : `${plan.max_users_per_org} ${t('ws.users')}`}
          </span>
        </li>
        <li className="flex items-start gap-2">
          <Check size={12} className="mt-0.5 flex-shrink-0 text-emerald-500" />
          <span>{t('ws.shareablePreview')}</span>
        </li>
        <li className="flex items-start gap-2">
          {plan.can_download_zip ? (
            <Check size={12} className="mt-0.5 flex-shrink-0 text-emerald-500" />
          ) : (
            <Minus size={12} className="mt-0.5 flex-shrink-0 text-gray-300" />
          )}
          <span className={plan.can_download_zip ? '' : 'text-gray-400'}>{t('ws.zipDownload')}</span>
        </li>
        <li className="flex items-start gap-2">
          {plan.can_api_access ? (
            <Check size={12} className="mt-0.5 flex-shrink-0 text-emerald-500" />
          ) : (
            <Minus size={12} className="mt-0.5 flex-shrink-0 text-gray-300" />
          )}
          <span className={plan.can_api_access ? '' : 'text-gray-400'}>{t('ws.apiAccess')}</span>
        </li>
      </ul>
      {!isCurrent && !hideButton && (
        <button
          type="button"
          onClick={isEnterprise ? () => { window.location.href = 'mailto:contact@codlylabs.ai?subject=Enterprise Plan' } : onSelect}
          disabled={disabled || loading}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md disabled:opacity-60"
          style={{ background: brandPrimary }}
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : null}
          {isEnterprise
            ? t('pricing.cta.enterprise')
            : loading ? t('ws.redirecting') : t('ws.changePlan')}
        </button>
      )}
    </div>
  )
}

export default function WorkspaceBillingView() {
  const { brand, setHeader, context } = useWorkspaceOutletContext()
  const { t } = useI18n()

  const [status, setStatus] = useState<BillingStatus | null>(null)
  const [plans, setPlans] = useState<PlanInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    setHeader(t('ws.billing'), '')
  }, [setHeader])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        setLoading(true)
        const [statusResponse, plansResponse] = await Promise.all([
          billingApi.getBillingStatus(),
          billingApi.getPlans(),
        ])
        if (cancelled) return
        setStatus(statusResponse)
        setPlans(plansResponse || [])
        setError(null)
      } catch (err: any) {
        if (cancelled) return
        setError(err?.response?.data?.detail || 'No se pudo cargar la información de facturación.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const handleOpenPortal = async () => {
    setPortalLoading(true)
    setActionError(null)
    try {
      const url = await billingApi.createPortal(window.location.href)
      window.location.href = url
    } catch (err: any) {
      setPortalLoading(false)
      setActionError(
        err?.response?.data?.detail || 'No se pudo abrir el portal de facturación. Probá de nuevo.',
      )
    }
  }

  const handleCheckout = async (planTier: string) => {
    setCheckoutLoading(planTier)
    setActionError(null)
    try {
      const successUrl = `${window.location.origin}/workspace/billing?checkout=success`
      const cancelUrl = `${window.location.origin}/workspace/billing?checkout=cancel`
      const url = await billingApi.createCheckout(planTier, successUrl, cancelUrl, false)
      window.location.href = url
    } catch (err: any) {
      setCheckoutLoading(null)
      setActionError(
        err?.response?.data?.detail ||
          'No se pudo iniciar el checkout. Revisá que el plan esté disponible y probá de nuevo.',
      )
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white p-12">
        <Loader2 className="h-7 w-7 animate-spin text-indigo-600" />
        <p className="text-sm text-gray-500">Cargando información de facturación...</p>
      </div>
    )
  }

  if (error || !status) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
        <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-medium">No se pudo cargar tu facturación</p>
          <p className="mt-1 text-xs text-rose-600">{error || 'Volvé a intentar en unos segundos.'}</p>
        </div>
      </div>
    )
  }

  const plan = status.plan_config
  const badge = subscriptionBadge(status.subscription_status)
  const effectiveTier = String(plan.tier || status.plan || '').toLowerCase()

  return (
    <>
      <div
        className="relative mb-6 overflow-hidden rounded-xl p-6 text-white"
        style={{ background: `linear-gradient(135deg, ${brand.primary}, ${brand.primaryDark})` }}
      >
        <div className="absolute right-0 top-0 h-40 w-40 opacity-10">
          <svg viewBox="0 0 200 200" className="h-full w-full">
            <circle cx="100" cy="100" r="80" fill="none" stroke="white" strokeWidth="0.5" />
            <circle cx="100" cy="100" r="60" fill="none" stroke="white" strokeWidth="0.5" />
            <circle cx="100" cy="100" r="40" fill="none" stroke="white" strokeWidth="0.5" />
          </svg>
        </div>
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white/90 backdrop-blur-sm">
              <CreditCard size={10} />
              Suscripción
            </span>
            <h2 className="mt-3 text-xl font-semibold">Plan {plan.display_name}</h2>
            <p className="mt-1 max-w-2xl text-sm text-blue-100">
              {formatCurrency(plan.price_monthly_usd)} / mes · Organización {context.workspace.name}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold ring-1 ${badge.className}`}>
                {badge.label}
              </span>
              {status.current_period_end && (
                <span className="rounded-full bg-white/15 px-2 py-0.5 text-white/80 backdrop-blur-sm">
                  Renueva el {formatDate(status.current_period_end)}
                </span>
              )}
              {status.trial_end && (
                <span className="rounded-full bg-white/15 px-2 py-0.5 text-white/80 backdrop-blur-sm">
                  Trial hasta {formatDate(status.trial_end)}
                </span>
              )}
              {status.cancel_at_period_end && (
                <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-amber-100 backdrop-blur-sm">
                  Cancelación programada
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => void handleOpenPortal()}
            disabled={portalLoading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-gray-900 shadow-sm transition-shadow hover:shadow-md disabled:opacity-70"
          >
            {portalLoading ? <Loader2 size={16} className="animate-spin" /> : <Receipt size={16} />}
            {portalLoading ? 'Abriendo portal...' : 'Gestionar facturación'}
            {!portalLoading && <ExternalLink size={12} className="opacity-70" />}
          </button>
        </div>
      </div>

      {actionError && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Error al procesar la acción</p>
            <p className="mt-1 text-xs text-rose-600">{actionError}</p>
          </div>
        </div>
      )}

      <div className="mb-6 grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">{t('ws.currentUsage')}</h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-600">
              <TrendingUp size={12} />
              {t('ws.resetsEachCycle')}
            </span>
          </div>
          <div className="space-y-5">
            <UsageBar
              label={t('ws.validationsGenerated')}
              used={status.usage.pocs_generated}
              limit={status.usage.pocs_limit}
              color={brand.primary}
            />
            <UsageBar
              label={t('ws.activeUsers')}
              used={status.usage.users_used}
              limit={
                hasUnlimitedSeats(effectiveTier, status.usage.users_limit)
                  ? 'unlimited'
                  : status.usage.users_limit
              }
              color={brand.primary}
            />
          </div>

          <div className="mt-6 rounded-lg border border-gray-100 bg-gray-50 p-4 text-xs text-gray-500">
            <p className="flex items-center gap-2 font-semibold text-gray-700">
              <Sparkles size={12} className="text-indigo-500" />
              {t('ws.needMoreCapacity')}
            </p>
            <p className="mt-1">
              {t('ws.upgradeMessage')}
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-semibold text-gray-900">{t('ws.planSummary')}</h3>
            <div className="mt-4 space-y-1">
              <FeatureRow label={`${formatLimit(plan.pocs_per_month)} ${t('ws.validationsPerMonth')}`} enabled />
              <FeatureRow
                label={
                  hasUnlimitedSeats(plan.tier, plan.max_users_per_org)
                    ? t('ws.unlimitedUsers')
                    : `${plan.max_users_per_org} ${t('ws.users')}`
                }
                enabled
              />
              <FeatureRow label={t('ws.shareablePreview')} enabled />
              <FeatureRow label={t('ws.zipDownload')} enabled={plan.can_download_zip} />
              <FeatureRow label={t('ws.apiAccess')} enabled={plan.can_api_access} />
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg"
                style={{ background: `${brand.primary}15`, color: brand.primary }}
              >
                <Users size={16} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900">{t('ws.support')} {plan.support_level}</h4>
                <p className="text-xs text-gray-400">{t('ws.includedWithPlan')}</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {plans.length > 0 && (
        <div className="mb-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-gray-900">{t('ws.availablePlans')}</h3>
              <p className="text-xs text-gray-500">{t('ws.scalePlans')}</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {plans.map((item) => {
              const itemTier = String(item.tier).toLowerCase()
              const isCurrent = itemTier === effectiveTier
              const isLowerThanCurrent = tierRank(itemTier) < tierRank(effectiveTier)
              return (
                <PlanCard
                  key={item.tier}
                  plan={item}
                  isCurrent={isCurrent}
                  hideButton={isLowerThanCurrent}
                  onSelect={() => void handleCheckout(item.tier)}
                  disabled={checkoutLoading !== null}
                  loading={checkoutLoading === item.tier}
                  brandPrimary={brand.primary}
                  t={t}
                />
              )
            })}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg"
              style={{ background: `${brand.primary}15`, color: brand.primary }}
            >
              <Receipt size={18} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">{t('ws.invoicesPayment')}</h4>
              <p className="mt-0.5 text-xs text-gray-500">
                {t('ws.invoicesDescription')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void handleOpenPortal()}
            disabled={portalLoading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium text-gray-700 transition-colors hover:border-blue-200 hover:text-blue-600 disabled:opacity-60"
          >
            {portalLoading ? <Loader2 size={12} className="animate-spin" /> : <ExternalLink size={12} />}
            {portalLoading ? t('ws.opening') : t('ws.openStripePortal')}
          </button>
        </div>
      </div>
    </>
  )
}
