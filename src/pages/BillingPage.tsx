import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { CreditCard, ExternalLink, ArrowUpRight, Shield, ArrowLeft, Loader2, CheckCircle2, AlertTriangle, Info, Check, Palette, Key, Copy, Lock, Trash2 } from 'lucide-react'
import { billingApi, BillingStatus, BrandingInfo, ApiKeySummary } from '../services/billing'
import { verticalPacksApi, ActiveVerticalsInfo } from '../services/verticalPacks'
import { useI18n } from '../i18n'

function UsageMeter({ label, used, limit }: { label: string; used: number; limit: number | string }) {
  const isUnlimited = limit === -1 || limit === 'unlimited'
  const pct = isUnlimited ? 0 : (used / (limit as number)) * 100
  const { t } = useI18n()

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm text-gray-600">{label}</span>
        <span className="text-sm font-semibold text-gray-900">
          {used} / {isUnlimited ? t('pricing.unlimited') : limit}
        </span>
      </div>
      {!isUnlimited && (
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-brand-600'
            }`}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
      )}
    </div>
  )
}

export default function BillingPage() {
  const navigate = useNavigate()
  const { t } = useI18n()
  const [searchParams] = useSearchParams()
  const [billing, setBilling] = useState<BillingStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)
  const [verticalsInfo, setVerticalsInfo] = useState<ActiveVerticalsInfo | null>(null)
  const [selectedVerticals, setSelectedVerticals] = useState<string[]>([])
  const [verticalsSaving, setVerticalsSaving] = useState(false)
  const [verticalsMsg, setVerticalsMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  // Branding
  const [branding, setBranding] = useState<BrandingInfo | null>(null)
  const [brandName, setBrandName] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [colorPrimary, setColorPrimary] = useState('#6366f1')
  const [colorSecondary, setColorSecondary] = useState('#8b5cf6')
  const [colorAccent, setColorAccent] = useState('#f59e0b')
  const [brandingSaving, setBrandingSaving] = useState(false)
  const [brandingMsg, setBrandingMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  // API Keys
  const [apiKeys, setApiKeys] = useState<ApiKeySummary[]>([])
  const [newKeyName, setNewKeyName] = useState('')
  const [createdKey, setCreatedKey] = useState<string | null>(null)
  const [keyCreating, setKeyCreating] = useState(false)
  const [keyCopied, setKeyCopied] = useState(false)
  const showSuccess = searchParams.get('success') === 'true'

  useEffect(() => {
    billingApi
      .getBillingStatus()
      .then((data) => {
        setBilling(data)
        // Also load verticals info
        verticalPacksApi
          .getActiveVerticals()
          .then((vi) => {
            setVerticalsInfo(vi)
            setSelectedVerticals(vi.active_verticals)
          })
          .catch(() => {})
        // Load branding
        billingApi.getBranding().then((b) => {
          setBranding(b)
          setBrandName(b.brand_name || '')
          setLogoUrl(b.logo_url || '')
          setColorPrimary(b.brand_colors?.primary || '#6366f1')
          setColorSecondary(b.brand_colors?.secondary || '#8b5cf6')
          setColorAccent(b.brand_colors?.accent || '#f59e0b')
        }).catch(() => {})
        // Load API keys
        billingApi.listApiKeys().then(setApiKeys).catch(() => {})
      })
      .catch(() => navigate('/onboarding'))
      .finally(() => setLoading(false))
  }, [navigate])

  const handleManageSubscription = async () => {
    setPortalLoading(true)
    try {
      const url = await billingApi.createPortal(`${window.location.origin}/billing`)
      window.location.href = url
    } catch {
      setPortalLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
      </div>
    )
  }

  if (!billing) return null

  const { plan_config: plan, usage } = billing
  const trialDaysLeft = billing.trial_end
    ? Math.max(0, Math.ceil((new Date(billing.trial_end).getTime() - Date.now()) / 86400000))
    : 0

  const statusLabels: Record<string, string> = {
    active: t('billing.statusActive'),
    trialing: t('billing.statusTrialing'),
    past_due: t('billing.statusPastDue'),
    canceled: t('billing.statusCanceled'),
    none: t('billing.statusFree'),
  }

  const statusStyles: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    trialing: 'bg-blue-100 text-blue-700',
    past_due: 'bg-amber-100 text-amber-700',
    canceled: 'bg-red-100 text-red-700',
    none: 'bg-gray-100 text-gray-600',
  }

  const statusLabel = statusLabels[billing.subscription_status] || billing.subscription_status
  const statusStyle = statusStyles[billing.subscription_status] || 'bg-gray-100 text-gray-600'
  const usageLabel = t('billing.pocsGenerated')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link to="/profile" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">{t('billing.back')}</span>
          </Link>
          <h1 className="text-lg font-bold text-gray-900">{t('billing.title')}</h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Success banner */}
        {showSuccess && (
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-sm text-green-800">
              {t('billing.successBanner')} <span className="font-semibold">{plan.display_name}</span>.
            </p>
          </div>
        )}

        {/* Past due warning */}
        {billing.subscription_status === 'past_due' && (
          <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-800">{t('billing.pastDue')}</p>
          </div>
        )}

        {/* Cancel notice */}
        {billing.cancel_at_period_end && (
          <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <p className="text-sm text-blue-800">
              {t('billing.cancelNotice')}{' '}
              ({billing.current_period_end ? new Date(billing.current_period_end).toLocaleDateString() : t('billing.cancelNoticeSoon')}).
            </p>
          </div>
        )}

        {/* Current Plan Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-brand-100 p-2.5 rounded-lg">
                <Shield className="w-5 h-5 text-brand-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{plan.display_name} {t('billing.plan')}</h2>
                <p className="text-sm text-gray-500">{billing.organization_name}</p>
              </div>
            </div>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyle}`}>
              {statusLabel}
            </span>
          </div>

          {/* Trial countdown */}
          {billing.subscription_status === 'trialing' && trialDaysLeft > 0 && (
            <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg mb-4">
              <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <p className="text-sm text-blue-700">
                {t('billing.trialEnds')}{' '}
                <span className="font-semibold">
                  {trialDaysLeft} {trialDaysLeft !== 1 ? t('billing.trialDays') : t('billing.trialDay')}
                </span>
                {billing.trial_end && ` (${new Date(billing.trial_end).toLocaleDateString()})`}
              </p>
            </div>
          )}

          {plan.price_monthly_usd > 0 && (
            <p className="text-sm text-gray-500">
              ${plan.price_monthly_usd}{t('pricing.perMonth')}
              {billing.current_period_end && (
                <> &middot; {t('billing.nextBilling')} {new Date(billing.current_period_end).toLocaleDateString()}</>
              )}
            </p>
          )}
        </div>

        {/* Usage */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">{t('billing.usageTitle')}</h3>
          <UsageMeter label={usageLabel} used={usage.pocs_generated} limit={usage.pocs_limit} />
        </div>

        {/* Active Verticals */}
        {verticalsInfo && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-1">{t('billing.verticalsTitle')}</h3>
            {verticalsInfo.max_verticals === 'unlimited' ? (
              <p className="text-sm text-gray-500 mb-4">{t('billing.verticalsUnlimited')}</p>
            ) : (
              <p className="text-sm text-gray-500 mb-4">
                {t('billing.verticalsLimit').replace('{max}', String(verticalsInfo.max_verticals))}
              </p>
            )}

            <div className="flex flex-wrap gap-2 mb-4">
              {verticalsInfo.available_verticals.map((v) => {
                const isSelected = selectedVerticals.includes(v)
                const isUnlimited = verticalsInfo.max_verticals === 'unlimited'
                const atLimit = !isUnlimited && !isSelected && selectedVerticals.length >= (verticalsInfo.max_verticals as number)

                return (
                  <button
                    key={v}
                    type="button"
                    disabled={atLimit}
                    onClick={() => {
                      setVerticalsMsg(null)
                      setSelectedVerticals((prev) =>
                        isSelected ? prev.filter((s) => s !== v) : [...prev, v],
                      )
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                      isSelected
                        ? 'bg-brand-100 text-brand-700 border-brand-300'
                        : atLimit
                          ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300 hover:text-brand-600'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    {v}
                  </button>
                )
              })}
            </div>

            {verticalsMsg && (
              <div className={`text-sm mb-3 ${verticalsMsg.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {verticalsMsg.text}
              </div>
            )}

            <button
              type="button"
              disabled={verticalsSaving}
              onClick={async () => {
                setVerticalsSaving(true)
                setVerticalsMsg(null)
                try {
                  const res = await verticalPacksApi.setActiveVerticals(selectedVerticals)
                  setSelectedVerticals(res.active_verticals)
                  setVerticalsMsg({ type: 'success', text: t('billing.verticalsSaved') })
                } catch {
                  setVerticalsMsg({ type: 'error', text: t('billing.verticalsError') })
                } finally {
                  setVerticalsSaving(false)
                }
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors disabled:opacity-60"
            >
              {verticalsSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {t('billing.verticalsSave')}
            </button>
          </div>
        )}

        {/* Custom Branding */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
            <Palette className="w-5 h-5 text-brand-600" />
            {t('billing.brandingTitle')}
          </h3>
          {branding && !branding.can_custom_branding ? (
            <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg mt-3">
              <Lock className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">{t('billing.brandingLocked')}</p>
                <button
                  type="button"
                  onClick={() => navigate('/pricing')}
                  className="text-sm text-brand-600 font-semibold hover:underline mt-1"
                >
                  {t('billing.upgradePlan')}
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-3 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('billing.brandName')}</label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="My Company"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('billing.logoUrl')}</label>
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Primary</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={colorPrimary} onChange={(e) => setColorPrimary(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
                    <input type="text" value={colorPrimary} onChange={(e) => setColorPrimary(e.target.value)} className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs font-mono" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Secondary</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={colorSecondary} onChange={(e) => setColorSecondary(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
                    <input type="text" value={colorSecondary} onChange={(e) => setColorSecondary(e.target.value)} className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs font-mono" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Accent</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={colorAccent} onChange={(e) => setColorAccent(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
                    <input type="text" value={colorAccent} onChange={(e) => setColorAccent(e.target.value)} className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs font-mono" />
                  </div>
                </div>
              </div>
              {brandingMsg && (
                <div className={`text-sm ${brandingMsg.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {brandingMsg.text}
                </div>
              )}
              <button
                type="button"
                disabled={brandingSaving}
                onClick={async () => {
                  setBrandingSaving(true)
                  setBrandingMsg(null)
                  try {
                    const res = await billingApi.updateBranding({
                      brand_name: brandName || null,
                      logo_url: logoUrl || null,
                      brand_colors: { primary: colorPrimary, secondary: colorSecondary, accent: colorAccent },
                    })
                    setBranding({ ...branding!, ...res, can_custom_branding: true })
                    setBrandingMsg({ type: 'success', text: t('billing.brandingSaved') })
                  } catch {
                    setBrandingMsg({ type: 'error', text: t('billing.brandingError') })
                  } finally {
                    setBrandingSaving(false)
                  }
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors disabled:opacity-60"
              >
                {brandingSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {t('billing.brandingSave')}
              </button>
            </div>
          )}
        </div>

        {/* API Keys */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
            <Key className="w-5 h-5 text-brand-600" />
            {t('billing.apiKeysTitle')}
          </h3>
          {plan && !plan.can_api_access ? (
            <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg mt-3">
              <Lock className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">{t('billing.apiKeysLocked')}</p>
                <button
                  type="button"
                  onClick={() => navigate('/pricing')}
                  className="text-sm text-brand-600 font-semibold hover:underline mt-1"
                >
                  {t('billing.upgradePlan')}
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-3 space-y-4">
              {/* Created key banner */}
              {createdKey && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-semibold text-green-800 mb-2">{t('billing.apiKeyCreated')}</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 bg-white border border-green-300 rounded text-xs font-mono text-gray-800 break-all">
                      {createdKey}
                    </code>
                    <button
                      type="button"
                      onClick={() => { navigator.clipboard.writeText(createdKey); setKeyCopied(true); setTimeout(() => setKeyCopied(false), 2000) }}
                      className="p-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
                    >
                      {keyCopied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-green-700 mt-2">{t('billing.apiKeyWarning')}</p>
                </div>
              )}

              {/* Key list */}
              {apiKeys.length > 0 && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-gray-600">
                        <th className="text-left px-4 py-2 font-medium">Name</th>
                        <th className="text-left px-4 py-2 font-medium">Key</th>
                        <th className="text-center px-4 py-2 font-medium">Requests</th>
                        <th className="text-center px-4 py-2 font-medium">Status</th>
                        <th className="px-4 py-2" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {apiKeys.map((k) => (
                        <tr key={k.id} className={!k.is_active ? 'opacity-50' : ''}>
                          <td className="px-4 py-3 font-medium text-gray-900">{k.name}</td>
                          <td className="px-4 py-3 font-mono text-xs text-gray-500">{k.key_prefix}...</td>
                          <td className="px-4 py-3 text-center text-gray-600">{k.total_requests}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${k.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                              {k.is_active ? 'Active' : 'Revoked'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {k.is_active && (
                              <button
                                type="button"
                                onClick={async () => {
                                  await billingApi.revokeApiKey(k.id)
                                  setApiKeys((prev) => prev.map((ak) => ak.id === k.id ? { ...ak, is_active: false } : ak))
                                }}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Revoke"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Create new key */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder={t('billing.apiKeyNamePlaceholder')}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
                <button
                  type="button"
                  disabled={keyCreating || !newKeyName.trim()}
                  onClick={async () => {
                    setKeyCreating(true)
                    setCreatedKey(null)
                    try {
                      const res = await billingApi.createApiKey(newKeyName.trim())
                      setCreatedKey(res.key)
                      setNewKeyName('')
                      const keys = await billingApi.listApiKeys()
                      setApiKeys(keys)
                    } catch {
                      // handled by 402
                    } finally {
                      setKeyCreating(false)
                    }
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors disabled:opacity-60"
                >
                  {keyCreating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {t('billing.apiKeyCreate')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          {billing.subscription_status !== 'none' && billing.plan !== 'free' && (
            <button
              type="button"
              onClick={handleManageSubscription}
              disabled={portalLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border-2 border-gray-200 text-gray-700 text-sm font-semibold hover:border-gray-300 transition-colors disabled:opacity-60"
            >
              <CreditCard className="w-4 h-4" />
              {t('billing.manageSubscription')}
              {portalLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ExternalLink className="w-3.5 h-3.5" />
              )}
            </button>
          )}

          <button
            type="button"
            onClick={() => navigate('/pricing')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors shadow-md shadow-brand-200"
          >
            {billing.plan === 'free' ? t('billing.upgradePlan') : t('billing.changePlan')}
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </main>
    </div>
  )
}
