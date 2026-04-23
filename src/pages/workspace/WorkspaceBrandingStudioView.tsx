import { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Sparkles, User, Palette, Lock, Layers, Link2, Upload, Image as ImageIcon,
  Check, Circle, Loader2, AlertTriangle, Clock, ExternalLink, Github, Rocket, RefreshCw,
} from 'lucide-react'
import { brandingApi, type BrandingConfig, type BrandingConfigPayload, type VercelStatus, type ProvisioningStatus } from '../../services/branding'
import { authApi } from '../../services/auth'
import { useBranding } from '../../hooks/useBranding'
import { usePageTitle } from '../../hooks/usePageTitle'

const DEFAULT_COLORS = {
  primary: '#6366f1',
  primaryDark: '#4f46e5',
  accent: '#7C3AED',
  surface: '#ffffff',
  textPrimary: '#111827',
  textSecondary: '#4b5563',
}

export default function WorkspaceBrandingStudioView() {
  const navigate = useNavigate()
  const tenant = useBranding()
  const [config, setConfig] = useState<BrandingConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewTab, setPreviewTab] = useState<'login' | 'workspace'>('login')
  const [contrastWarning, setContrastWarning] = useState<string | null>(null)

  // Auto-extraction state
  const [extracting, setExtracting] = useState(false)
  const [extractError, setExtractError] = useState<string | null>(null)
  const [extractSuccess, setExtractSuccess] = useState(false)

  usePageTitle('White Label', tenant.loading ? null : tenant.brandName)

  // Logo upload state
  const [logoError, setLogoError] = useState<string | null>(null)

  // Password gate for publishing: OAuth-only owners (no password) must set
  // one before their white-label goes live, or they won't be able to log in
  // to {slug}.codlylabs.ai (tenant frontends don't support OAuth yet).
  const [passwordStatus, setPasswordStatus] = useState<{ email: string; has_password: boolean } | null>(null)
  const [accessPassword, setAccessPassword] = useState('')
  const [accessPasswordConfirm, setAccessPasswordConfirm] = useState('')
  const [accessPasswordSaving, setAccessPasswordSaving] = useState(false)
  const [accessPasswordError, setAccessPasswordError] = useState<string | null>(null)
  const [accessPasswordSaved, setAccessPasswordSaved] = useState(false)

  // Local form state
  const [form, setForm] = useState<BrandingConfigPayload>({
    brand_name: '',
    tagline: '',
    subdomain_slug: '',
    initials: '',
    colors: { ...DEFAULT_COLORS },
    border_radius: 'rounded',
    login_title: '',
    login_subtitle: '',
    login_hero_title: '',
    login_hero_description: '',
    badge_config: { position: 'sidebar_footer', style: 'full' },
    links: {},
  })

  const loadConfig = useCallback(async () => {
    try {
      const data = await brandingApi.get()
      if (data) {
        setConfig(data)
        setForm({
          brand_name: data.brand_name || '',
          tagline: data.tagline || '',
          subdomain_slug: data.subdomain_slug || '',
          initials: data.initials || '',
          colors: { ...DEFAULT_COLORS, ...data.colors },
          border_radius: data.border_radius || 'rounded',
          login_title: data.login_title || '',
          login_subtitle: data.login_subtitle || '',
          login_hero_title: data.login_hero_title || '',
          login_hero_description: data.login_hero_description || '',
          badge_config: data.badge_config || { position: 'sidebar_footer', style: 'full' },
          links: data.links || {},
        })
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Error cargando configuracion')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void loadConfig() }, [loadConfig])

  // Load password status once on mount. If the owner already has a password,
  // the Access section hides the input.
  useEffect(() => {
    let alive = true
    authApi.getPasswordStatus()
      .then(data => { if (alive) setPasswordStatus(data) })
      .catch(() => { /* fall through — publish attempt will surface the gate */ })
    return () => { alive = false }
  }, [])

  const needsPasswordSet = passwordStatus !== null && !passwordStatus.has_password && !accessPasswordSaved

  const saveOrCreate = async () => {
    setSaving(true)
    setError(null)
    try {
      const payload = { ...form }
      // Clean empty strings
      if (!payload.subdomain_slug) delete payload.subdomain_slug
      if (!payload.brand_name) delete payload.brand_name

      let result: BrandingConfig
      if (config) {
        result = await brandingApi.update(payload)
      } else {
        result = await brandingApi.create(payload)
      }
      setConfig(result)
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Error guardando')
    } finally {
      setSaving(false)
    }
  }

  // Polls BrandingConfig to surface in-flight provisioning state while the
  // /publish request is still open (backend runs the full pipeline inline, so
  // the UI needs periodic reads to render the live stepper).
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current)
      pollTimerRef.current = null
    }
  }, [])
  useEffect(() => () => stopPolling(), [stopPolling])

  const handleSetAccessPassword = async () => {
    setAccessPasswordError(null)
    if (accessPassword.length < 8) {
      setAccessPasswordError('La contraseña debe tener al menos 8 caracteres.')
      return false
    }
    if (accessPassword !== accessPasswordConfirm) {
      setAccessPasswordError('Las contraseñas no coinciden.')
      return false
    }
    setAccessPasswordSaving(true)
    try {
      await authApi.setPassword(accessPassword)
      setAccessPasswordSaved(true)
      setPasswordStatus(prev => prev ? { ...prev, has_password: true } : prev)
      setAccessPassword('')
      setAccessPasswordConfirm('')
      return true
    } catch (err: any) {
      setAccessPasswordError(err?.response?.data?.detail || 'No se pudo guardar la contraseña.')
      return false
    } finally {
      setAccessPasswordSaving(false)
    }
  }

  const handlePublish = async () => {
    // Password gate: if the owner signed in via OAuth and hasn't picked a
    // password yet, force them to set one here first — the tenant frontend
    // at {slug}.codlylabs.ai only does email/password login.
    if (needsPasswordSet) {
      const ok = await handleSetAccessPassword()
      if (!ok) {
        setError('Antes de publicar, configurá una contraseña para ingresar a tu plataforma.')
        return
      }
    }
    if (!config) {
      await saveOrCreate()
    }
    setPublishing(true)
    setError(null)
    stopPolling()

    // Start background polling every 3s so the progress banner updates while
    // the POST /publish is still in flight.
    pollTimerRef.current = setInterval(async () => {
      try {
        const refreshed = await brandingApi.get()
        if (refreshed) setConfig(refreshed)
      } catch {
        // network blip — ignore, next tick retries
      }
    }, 3000)

    try {
      await saveOrCreate()
      const result = await brandingApi.publish()
      setConfig(result)
    } catch (err: any) {
      // Publish errors often wrap raw GitHub/Vercel API responses — body
      // text, request IDs, hundreds of characters. We do NOT show them to
      // the admin. The ProvisioningStatusBanner has a friendly failure
      // message and the full detail stays in backend logs for ops.
      // One exception: the password gate error (from the backend) starts
      // with the `password_required:` sentinel and is short + actionable.
      const raw = err?.response?.data?.detail
      if (typeof raw === 'string' && raw.startsWith('password_required:')) {
        setError(raw.replace('password_required:', '').trim())
      } else {
        setError(null)
      }
      // Backend persists provisioning_status/error even when publish fails —
      // reload so the banner switches to `failed`.
      try {
        const refreshed = await brandingApi.get()
        if (refreshed) setConfig(refreshed)
      } catch {
        // ignore
      }
    } finally {
      stopPolling()
      setPublishing(false)
    }
  }

  const handleRestore = async () => {
    if (!config) return
    try {
      await brandingApi.remove()
      setConfig(null)
      setForm({
        brand_name: '', tagline: '', subdomain_slug: '', initials: '',
        colors: { ...DEFAULT_COLORS }, border_radius: 'rounded',
        login_title: '', login_subtitle: '', login_hero_title: '', login_hero_description: '',
        badge_config: { position: 'sidebar_footer', style: 'full' }, links: {},
      })
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Error restaurando')
    }
  }

  const updateField = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const updateColor = (key: string, value: string) => {
    setForm(prev => ({
      ...prev,
      colors: { ...prev.colors, [key]: value },
    }))
    // Check contrast for primary on white
    if (key === 'primary') {
      checkContrastLocal(value, '#ffffff')
    }
  }

  const checkContrastLocal = (bg: string, fg: string) => {
    try {
      const lum = (hex: string) => {
        const [r, g, b] = [1, 3, 5].map(i => {
          const c = parseInt(hex.slice(i, i + 2), 16) / 255
          return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
        })
        return 0.2126 * r + 0.7152 * g + 0.0722 * b
      }
      const l1 = lum(bg), l2 = lum(fg)
      const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
      setContrastWarning(ratio < 3.0 ? `Contraste bajo (${ratio.toFixed(1)}:1). Texto blanco sobre este color puede ser dificil de leer.` : null)
    } catch {
      setContrastWarning(null)
    }
  }

  const handleLogoUpload = (file: File) => {
    setLogoError(null)
    const maxBytes = 500 * 1024 // 500KB
    if (file.size > maxBytes) {
      setLogoError(`Imagen demasiado grande (${(file.size / 1024).toFixed(0)}KB). Maximo 500KB.`)
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : ''
      if (dataUrl) updateField('logo_url', dataUrl)
    }
    reader.onerror = () => setLogoError('No se pudo leer la imagen')
    reader.readAsDataURL(file)
  }

  const handleExtractBranding = async (file: File) => {
    if (!file) return
    setExtracting(true)
    setExtractError(null)
    setExtractSuccess(false)
    try {
      const suggestion = await brandingApi.extractBranding(file)
      if (suggestion.brand_name) updateField('brand_name', suggestion.brand_name)
      if (suggestion.tagline) updateField('tagline', suggestion.tagline)
      if (suggestion.logo_url) updateField('logo_url', suggestion.logo_url)
      if (suggestion.favicon_url) updateField('favicon_url', suggestion.favicon_url)
      if (suggestion.initials) updateField('initials', suggestion.initials)
      if (suggestion.font_family) updateField('font_family', suggestion.font_family)
      if (suggestion.login_title) updateField('login_title', suggestion.login_title)
      if (suggestion.login_subtitle) updateField('login_subtitle', suggestion.login_subtitle)
      if (suggestion.colors) {
        const c = suggestion.colors as Record<string, string>
        Object.entries(c).forEach(([key, value]) => {
          if (value) updateColor(key, value)
        })
      }
      setExtractSuccess(true)
      setTimeout(() => setExtractSuccess(false), 5000)
    } catch (err: any) {
      setExtractError(err?.response?.data?.detail || 'Error extrayendo la marca')
    } finally {
      setExtracting(false)
    }
  }

  // Derived values
  const colors = form.colors || DEFAULT_COLORS
  const primary = colors.primary || DEFAULT_COLORS.primary
  const primaryDark = colors.primaryDark || DEFAULT_COLORS.primaryDark
  const accent = colors.accent || DEFAULT_COLORS.accent
  const gradient = `linear-gradient(135deg, ${primary}, ${primaryDark})`
  const gradientAccent = `linear-gradient(135deg, ${primary}, ${accent})`
  const initials = form.initials || (form.brand_name || 'WS').substring(0, 2).toUpperCase()
  const brandName = form.brand_name || 'Mi Workspace'
  const slug = form.subdomain_slug || 'empresa'
  const readiness = config?.readiness
  const vercelStatus = config?.vercel_status ?? null

  function hexToRgba(hex: string, alpha: number) {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Top Bar ── */}
      <div className="sticky top-0 z-50 h-14 bg-white border-b border-gray-200 flex items-center px-5 gap-4">
        <button
          onClick={() => navigate('/workspace')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={16} />
          Volver al workspace
        </button>
        <div className="w-px h-7 bg-gray-200" />
        <div className="flex items-center gap-2 flex-1">
          <Sparkles size={18} className="text-indigo-500" />
          <h1 className="text-sm font-semibold text-gray-900">White Label</h1>
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
            config?.status === 'published'
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-amber-100 text-amber-700'
          }`}>
            {config?.status === 'published' ? 'Published' : 'Draft'}
          </span>
        </div>
        {/* Short, user-safe errors only (load/save). Publish errors surface
            their friendly version in the ProvisioningStatusBanner, not here,
            because they include raw GitHub/Vercel request IDs and bodies. */}
        {error && error.length <= 120 && (
          <span className="text-xs text-red-500 mr-2 truncate max-w-[40ch]">{error}</span>
        )}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRestore}
            className="px-4 py-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Restaurar
          </button>
          <button
            onClick={saveOrCreate}
            disabled={saving}
            className="px-4 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar draft'}
          </button>
          <button
            onClick={handlePublish}
            disabled={publishing}
            className="px-4 py-1.5 text-sm font-medium text-white rounded-lg transition-all hover:shadow-md disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
          >
            {publishing ? 'Publicando...' : 'Publicar cambios'}
          </button>
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div className="grid grid-cols-[380px_1fr] min-h-[calc(100vh-56px)]">

        {/* ── Config Panel (left sidebar) ── */}
        <div className="bg-white border-r border-gray-200 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 56px)' }}>

          {/* Tenant-frontend provisioning status (GitHub repo + Vercel project) */}
          {config && (
            <ProvisioningStatusBanner
              config={config}
              publishing={publishing}
              ownerEmail={passwordStatus?.email || null}
            />
          )}

          {/* Legacy "subdominio activo" banner — only shown on the legacy
              CSS-vars flow (when there is no dedicated tenant provisioning
              in play). Under the new flow the ProvisioningStatusBanner
              above already reports DNS health, so we mute this one to
              avoid two competing messages stacked on top of each other. */}
          {vercelStatus && (!config?.provisioning_status || config.provisioning_status === 'idle') && (
            <VercelStatusBanner status={vercelStatus} />
          )}

          {/* Credenciales de ingreso a la plataforma del tenant.
              Primero porque es el blocker más importante para el cliente no técnico:
              "¿con qué usuario y contraseña entro?". Va arriba de todo. */}
          {passwordStatus && (
            <div className="m-4 p-4 rounded-xl border-2 border-indigo-200 bg-indigo-50/40">
              <div className="flex items-start gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center text-white">
                  <Lock size={14} />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900">Cómo vas a entrar a tu plataforma</h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Una vez publicada, vas a ingresar en <strong className="text-gray-700">{form.subdomain_slug || 'tu-subdominio'}.codlylabs.ai</strong> con estos datos.
                  </p>
                </div>
              </div>

              <div className="mb-2">
                <label className="block text-[11px] font-semibold text-gray-600 mb-1 uppercase tracking-wider">Tu usuario (email)</label>
                <div className="flex items-center gap-2 px-3 py-2 bg-white border border-indigo-200 rounded-lg text-sm text-gray-800 font-mono">
                  {passwordStatus.email}
                </div>
              </div>

              {passwordStatus.has_password ? (
                <>
                  <div className="mb-2">
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1 uppercase tracking-wider">Tu contraseña</label>
                    <div className="px-3 py-2 bg-white border border-indigo-200 rounded-lg text-sm text-gray-400">
                      ••••••••  (la que configuraste previamente)
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-700">
                    <Check size={12} className="mt-0.5 flex-shrink-0" />
                    Tu acceso ya está listo. Si olvidaste la contraseña, podés usar "¿Olvidaste tu contraseña?" desde la pantalla de login de tu plataforma.
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-2">
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1 uppercase tracking-wider">Elegí tu contraseña</label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 border border-indigo-200 rounded-lg text-sm outline-none focus:border-indigo-500 transition-colors bg-white"
                      value={accessPassword}
                      onChange={e => setAccessPassword(e.target.value)}
                      placeholder="mínimo 8 caracteres"
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1 uppercase tracking-wider">Repetila para confirmar</label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 border border-indigo-200 rounded-lg text-sm outline-none focus:border-indigo-500 transition-colors bg-white"
                      value={accessPasswordConfirm}
                      onChange={e => setAccessPasswordConfirm(e.target.value)}
                      autoComplete="new-password"
                    />
                  </div>
                  {accessPasswordError && (
                    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-red-50 border border-red-200 text-[11px] text-red-600 mb-2">
                      <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" />
                      {accessPasswordError}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => void handleSetAccessPassword()}
                    disabled={accessPasswordSaving || !accessPassword || !accessPasswordConfirm}
                    className="w-full py-2.5 text-xs font-semibold text-white rounded-lg transition-all hover:shadow-sm disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
                  >
                    {accessPasswordSaving ? 'Guardando...' : 'Guardar mi contraseña'}
                  </button>
                  <p className="text-[11px] text-gray-500 mt-2 leading-relaxed">
                    <strong className="text-gray-700">Importante:</strong> esta contraseña solo se usa para ingresar a <strong>tu plataforma</strong>, no cambia tu acceso a CodlyLabs.
                  </p>
                </>
              )}
            </div>
          )}

          {/* Auto-extract */}
          <Section icon={<ImageIcon size={13} />} title="Extraer desde captura de pantalla">
            <p className="text-[11px] text-gray-500 mb-3">
              Subi una captura del sitio web de tu empresa y detectamos automaticamente la marca, colores y tipografia.
            </p>
            <div className="mb-2">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="brand-screenshot-upload"
                onChange={e => {
                  const f = e.target.files?.[0]
                  if (f) handleExtractBranding(f)
                  e.target.value = ''
                }}
                disabled={extracting}
              />
              <label
                htmlFor="brand-screenshot-upload"
                className={`w-full h-12 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center gap-2 text-gray-400 text-xs transition-colors ${
                  extracting ? 'opacity-50 cursor-wait' : 'cursor-pointer hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50/30'
                }`}
              >
                {extracting ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                {extracting ? 'Analizando...' : 'Subir captura de pantalla'}
              </label>
            </div>
            {extractError && (
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-red-50 border border-red-200 text-[11px] text-red-600">
                <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" />
                {extractError}
              </div>
            )}
            {extractSuccess && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-700">
                <Check size={12} />
                Marca detectada. Revisa y ajusta los campos antes de guardar.
              </div>
            )}
          </Section>

          {/* Readiness Score */}
          {readiness && (
            <div className="m-4 p-3.5 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex justify-between items-center mb-2.5">
                <span className="text-xs font-semibold text-gray-700">Brand Readiness</span>
                <span className="text-lg font-bold text-indigo-500">{readiness.score}%</span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${readiness.score}%`, background: 'linear-gradient(90deg, #6366f1, #7c3aed)' }}
                />
              </div>
              <div className="mt-3 space-y-1">
                {readiness.items.map((item) => (
                  <div key={item.key} className="flex items-center gap-2 text-[11px] text-gray-500">
                    {item.done ? (
                      <span className="w-4 h-4 rounded flex items-center justify-center bg-emerald-100 text-emerald-600"><Check size={10} /></span>
                    ) : (
                      <span className="w-4 h-4 rounded flex items-center justify-center bg-gray-100 text-gray-400"><Circle size={8} /></span>
                    )}
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* (Moved to the top of the sidebar — see PlatformAccessCard) */}

          {/* Identidad */}
          <Section icon={<User size={13} />} title="Identidad">
            <Field label="Nombre del workspace" value={form.brand_name || ''} onChange={v => updateField('brand_name', v)} />
            <Field label="Tagline" value={form.tagline || ''} onChange={v => updateField('tagline', v)} />
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">Subdominio</label>
              <div className="flex">
                <input
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-l-lg text-sm outline-none focus:border-indigo-400 transition-colors"
                  value={form.subdomain_slug || ''}
                  onChange={e => updateField('subdomain_slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="acme"
                />
                <span className="px-3 py-2 bg-gray-50 border border-l-0 border-gray-200 rounded-r-lg text-xs text-gray-500 whitespace-nowrap">
                  .codlylabs.ai
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Tu workspace sera accesible en este subdominio</p>
            </div>
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">Logo</label>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                className="hidden"
                id="brand-logo-upload"
                onChange={e => {
                  const f = e.target.files?.[0]
                  if (f) handleLogoUpload(f)
                  e.target.value = ''
                }}
              />
              <label
                htmlFor="brand-logo-upload"
                className="w-full h-16 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center gap-2 text-gray-400 text-xs cursor-pointer hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50/30 transition-colors overflow-hidden"
              >
                {form.logo_url ? (
                  <img src={form.logo_url} alt="Logo" className="max-h-full max-w-full object-contain" />
                ) : (
                  <>
                    <Upload size={14} />
                    Arrastra tu logo o haz click para subir
                  </>
                )}
              </label>
              {form.logo_url && (
                <button
                  type="button"
                  onClick={() => updateField('logo_url', '')}
                  className="mt-1 text-[11px] text-gray-400 hover:text-red-500 transition-colors"
                >
                  Quitar logo
                </button>
              )}
              {logoError && (
                <div className="mt-1 text-[11px] text-red-500">{logoError}</div>
              )}
            </div>
            <Field label="Iniciales (fallback)" value={form.initials || ''} onChange={v => updateField('initials', v.toUpperCase().slice(0, 4))} width="w-20" center />
          </Section>

          {/* Colores */}
          <Section icon={<Palette size={13} />} title="Sistema visual">
            <ColorPicker label="Primary" value={primary} onChange={v => updateColor('primary', v)} />
            <ColorPicker label="Primary Dark" value={primaryDark} onChange={v => updateColor('primaryDark', v)} />
            <ColorPicker label="Accent" value={accent} onChange={v => updateColor('accent', v)} />
            {contrastWarning && (
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200 mb-3">
                <AlertTriangle size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
                <span className="text-[11px] text-amber-700">{contrastWarning}</span>
              </div>
            )}
            <div className="mt-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">Bordes</label>
              <div className="flex gap-1.5">
                {(['rounded', 'sharp', 'pill'] as const).map(opt => (
                  <button
                    key={opt}
                    onClick={() => updateField('border_radius', opt)}
                    className={`px-3 py-1.5 rounded-md text-xs transition-colors ${
                      form.border_radius === opt
                        ? 'bg-indigo-50 text-indigo-600 border border-indigo-300 font-medium'
                        : 'border border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {opt === 'rounded' ? 'Rounded' : opt === 'sharp' ? 'Sharp' : 'Pill'}
                  </button>
                ))}
              </div>
            </div>
          </Section>

          {/* Login */}
          <Section icon={<Lock size={13} />} title="Pantalla de login">
            <Field label="Titulo" value={form.login_title || ''} onChange={v => updateField('login_title', v)} placeholder="Bienvenido a..." />
            <Field label="Subtitulo" value={form.login_subtitle || ''} onChange={v => updateField('login_subtitle', v)} placeholder="Accede a tu plataforma..." />
            <Field label="Panel derecho — titulo" value={form.login_hero_title || ''} onChange={v => updateField('login_hero_title', v)} />
            <Field label="Panel derecho — descripcion" value={form.login_hero_description || ''} onChange={v => updateField('login_hero_description', v)} />
          </Section>

          {/* Badge */}
          <Section icon={<Layers size={13} />} title='Badge "Powered by CodlyLabs"'>
            <div className="mb-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Posicion</label>
              <div className="flex gap-1.5">
                {[
                  { value: 'sidebar_footer', label: 'Sidebar footer' },
                  { value: 'login', label: 'Solo login' },
                  { value: 'both', label: 'Ambos' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setForm(prev => ({ ...prev, badge_config: { ...prev.badge_config!, position: opt.value as any } }))}
                    className={`px-3 py-1.5 rounded-md text-xs transition-colors ${
                      form.badge_config?.position === opt.value
                        ? 'bg-indigo-50 text-indigo-600 border border-indigo-300 font-medium'
                        : 'border border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Estilo</label>
              <div className="flex gap-1.5">
                {[
                  { value: 'full', label: 'Completo' },
                  { value: 'compact', label: 'Compacto' },
                  { value: 'icon_only', label: 'Solo icono' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setForm(prev => ({ ...prev, badge_config: { ...prev.badge_config!, style: opt.value as any } }))}
                    className={`px-3 py-1.5 rounded-md text-xs transition-colors ${
                      form.badge_config?.style === opt.value
                        ? 'bg-indigo-50 text-indigo-600 border border-indigo-300 font-medium'
                        : 'border border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </Section>

          {/* Links */}
          <Section icon={<Link2 size={13} />} title="Links y soporte">
            <Field
              label="URL de soporte" placeholder="https://..."
              value={form.links?.support_url || ''}
              onChange={v => setForm(prev => ({ ...prev, links: { ...prev.links, support_url: v } }))}
            />
            <Field
              label="Politica de privacidad" placeholder="https://..."
              value={form.links?.privacy_url || ''}
              onChange={v => setForm(prev => ({ ...prev, links: { ...prev.links, privacy_url: v } }))}
            />
            <Field
              label="Terminos y condiciones" placeholder="https://..."
              value={form.links?.terms_url || ''}
              onChange={v => setForm(prev => ({ ...prev, links: { ...prev.links, terms_url: v } }))}
            />
          </Section>

          {/* Change History */}
          {config && config.change_history.length > 0 && (
            <Section icon={<Clock size={13} />} title="Historial de cambios">
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {[...config.change_history].reverse().slice(0, 10).map((entry, i) => (
                  <div key={i} className="flex items-start gap-2 text-[11px] text-gray-500">
                    <span className={`mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      entry.action === 'publish' ? 'bg-emerald-400' : 'bg-gray-300'
                    }`} />
                    <div>
                      <span className="font-medium text-gray-600">
                        {entry.action === 'publish' ? 'Publicado' : 'Actualizado'}
                      </span>
                      {entry.fields && (
                        <span className="text-gray-400"> — {entry.fields.join(', ')}</span>
                      )}
                      <div className="text-[10px] text-gray-400">
                        {new Date(entry.timestamp).toLocaleString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>

        {/* ── Preview Panel (right) ── */}
        <div className="bg-gray-100 p-5 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 56px)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-700">Preview en vivo</span>
              <div className="flex bg-white border border-gray-200 rounded-lg p-0.5">
                <button
                  onClick={() => setPreviewTab('login')}
                  className={`px-3.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    previewTab === 'login' ? 'bg-indigo-500 text-white' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => setPreviewTab('workspace')}
                  className={`px-3.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    previewTab === 'workspace' ? 'bg-indigo-500 text-white' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  Workspace
                </button>
              </div>
            </div>
            <span className="text-[11px] text-gray-400">Los cambios se aplican en tiempo real</span>
          </div>

          {/* Browser frame */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            {/* Browser bar */}
            <div className="bg-gray-50 px-3.5 py-2.5 border-b border-gray-200 flex items-center gap-2.5">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>
              <div className="flex-1 bg-white px-3 py-1 rounded-md border border-gray-200 text-[11px] text-gray-500 font-mono">
                {slug}.codlylabs.ai{previewTab === 'login' ? '/login' : '/workspace/dashboard'}
              </div>
            </div>

            {/* ── Login Preview ── */}
            {previewTab === 'login' && (
              <div className="grid grid-cols-2 min-h-[420px]">
                <div className="p-10 flex flex-col justify-center">
                  {form.logo_url ? (
                    <img src={form.logo_url} alt={brandName} className="h-11 mb-6 object-contain self-start" />
                  ) : (
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-lg mb-6"
                      style={{ background: gradient }}
                    >
                      {initials}
                    </div>
                  )}
                  <div className="text-xl font-bold text-gray-900 mb-1.5">{form.login_title || `Bienvenido a ${brandName}`}</div>
                  <div className="text-sm text-gray-500 mb-7">{form.login_subtitle || 'Accede a tu plataforma'}</div>
                  <div className="w-full py-2.5 px-3 border border-gray-200 rounded-lg text-xs text-gray-400 mb-2.5">email@empresa.com</div>
                  <div className="w-full py-2.5 px-3 border border-gray-200 rounded-lg text-xs text-gray-400 mb-4">••••••••</div>
                  <button className="w-full py-2.5 rounded-lg text-white text-sm font-semibold" style={{ background: gradient }}>
                    Iniciar sesion
                  </button>
                  <div className="mt-7 text-center text-[11px] text-gray-400">
                    Powered by <span className="font-semibold"><span className="text-indigo-500">Codly</span><span className="text-purple-500">Labs</span></span>
                  </div>
                </div>
                <div className="flex items-center justify-center relative overflow-hidden" style={{ background: gradientAccent }}>
                  <div className="absolute w-64 h-64 rounded-full bg-white/10 -top-16 -right-16" />
                  <div className="absolute w-40 h-40 rounded-full bg-white/10 -bottom-12 -left-8" />
                  <div className="text-center text-white z-10 px-8">
                    <h2 className="text-2xl font-bold mb-2.5">{form.login_hero_title || 'Innovacion con IA'}</h2>
                    <p className="text-sm opacity-85 leading-relaxed">{form.login_hero_description || 'Genera prototipos funcionales en minutos.'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* ── Workspace Preview ── */}
            {previewTab === 'workspace' && (
              <div className="flex min-h-[420px]">
                {/* Sidebar */}
                <div className="w-48 border-r border-gray-200 p-3 flex flex-col">
                  <div className="flex items-center gap-2 pb-3 border-b border-gray-100 mb-2.5">
                    {form.logo_url ? (
                      <img src={form.logo_url} alt={brandName} className="w-8 h-8 rounded-lg object-contain" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ background: gradient }}>
                        {initials}
                      </div>
                    )}
                    <div>
                      <div className="text-xs font-semibold text-gray-900 truncate max-w-[100px]">{brandName}</div>
                      <div className="text-[10px] text-gray-400">Enterprise</div>
                    </div>
                  </div>
                  <div className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-1 px-1">Principal</div>
                  {['Dashboard', 'Generar PoC', 'Proyectos'].map((item, i) => (
                    <div
                      key={item}
                      className={`px-2 py-1.5 rounded-md text-xs mb-0.5 ${
                        i === 0 ? 'text-white font-medium' : 'text-gray-500'
                      }`}
                      style={i === 0 ? { background: gradient } : undefined}
                    >
                      {item}
                    </div>
                  ))}
                  <div className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mt-3 mb-1 px-1">Configuracion</div>
                  {['Miembros', 'Ajustes'].map(item => (
                    <div key={item} className="px-2 py-1.5 rounded-md text-xs text-gray-500 mb-0.5">{item}</div>
                  ))}
                  <div className="mt-auto pt-3 border-t border-gray-100 text-[10px] text-gray-400">
                    Powered by <span className="font-semibold"><span className="text-indigo-500">Codly</span><span className="text-purple-500">Labs</span></span>
                  </div>
                </div>

                {/* Main */}
                <div className="flex-1 p-5 bg-gray-50">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <div className="text-base font-semibold text-gray-900">Dashboard</div>
                      <div className="text-[11px] text-gray-400">Resumen de actividad</div>
                    </div>
                    <button className="px-3 py-1.5 rounded-lg text-white text-[11px] font-medium flex items-center gap-1.5" style={{ background: gradient }}>
                      + Nueva PoC
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2.5 mb-4">
                    {[
                      { label: 'PoCs generadas', value: '24', change: '+8 este mes' },
                      { label: 'Previews activos', value: '3', change: '2 esta semana' },
                      { label: 'Miembros', value: '12', change: '+2 nuevos' },
                    ].map(stat => (
                      <div key={stat.label} className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="text-[10px] text-gray-400 mb-1">{stat.label}</div>
                        <div className="text-lg font-bold" style={{ color: primary }}>{stat.value}</div>
                        <div className="text-[10px] text-emerald-500 mt-0.5">{stat.change}</div>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs font-semibold text-gray-700 mb-2">Proyectos recientes</div>
                  {[
                    { name: 'Detector de fraude', type: 'ML Predictive', status: 'Listo', statusColor: 'bg-emerald-100 text-emerald-700' },
                    { name: 'Chatbot regulaciones', type: 'RAG Documental', status: 'En progreso', statusColor: 'bg-amber-100 text-amber-700' },
                  ].map(proj => (
                    <div key={proj.name} className="flex items-center gap-2.5 bg-white rounded-lg p-2.5 border border-gray-200 mb-1.5">
                      <div className="w-7 h-7 rounded-md flex items-center justify-center text-sm" style={{ background: hexToRgba(primary, 0.1), color: primary }}>
                        &#9889;
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-medium text-gray-900">{proj.name}</div>
                        <div className="text-[10px] text-gray-400">{proj.type}</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${proj.statusColor}`}>
                        {proj.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Reusable sub-components ──

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="px-5 py-4 border-b border-gray-100">
      <div className="flex items-center gap-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
        <span className="text-indigo-500">{icon}</span>
        {title}
      </div>
      {children}
    </div>
  )
}

function Field({ label, value, onChange, placeholder, width, center }: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  width?: string
  center?: boolean
}) {
  return (
    <div className="mb-3">
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      <input
        className={`${width || 'w-full'} px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-indigo-400 transition-colors ${center ? 'text-center font-bold' : ''}`}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  )
}

function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2.5 mb-2">
      <div className="w-8 h-8 rounded-lg border-2 border-gray-200 relative overflow-hidden cursor-pointer flex-shrink-0" style={{ background: value }}>
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="absolute -top-2 -left-2 w-12 h-12 border-none cursor-pointer"
        />
      </div>
      <span className="text-xs text-gray-700 flex-1">{label}</span>
      <span className="text-[11px] text-gray-400 font-mono">{value}</span>
    </div>
  )
}

function VercelStatusBanner({ status }: { status: VercelStatus }) {
  const { ok, verified, domain, error, verification } = status
  const tone = ok && verified
    ? { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', iconColor: 'text-emerald-500' }
    : ok
      ? { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', iconColor: 'text-amber-500' }
      : { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', iconColor: 'text-red-500' }

  const title = ok && verified
    ? 'Subdominio activo'
    : ok
      ? 'Subdominio creado — verificando DNS'
      : 'No se pudo publicar en Vercel'

  const message = ok && verified
    ? `${domain} ya esta sirviendo el workspace.`
    : ok
      ? `Agregamos ${domain} a Vercel, pero el DNS aun no responde. Puede tardar unos minutos si el wildcard ya esta configurado.`
      : error || 'Error desconocido'

  const records = (verification || []).filter(r => r && (r.type || r.value))

  return (
    <div className={`m-4 p-3.5 rounded-xl border ${tone.bg} ${tone.border}`}>
      <div className="flex items-start gap-2">
        {ok && verified
          ? <Check size={14} className={`mt-0.5 flex-shrink-0 ${tone.iconColor}`} />
          : <AlertTriangle size={14} className={`mt-0.5 flex-shrink-0 ${tone.iconColor}`} />}
        <div className="flex-1 min-w-0">
          <div className={`text-xs font-semibold ${tone.text}`}>{title}</div>
          <div className={`text-[11px] mt-0.5 ${tone.text} opacity-90 break-words`}>{message}</div>
          {records.length > 0 && (
            <div className="mt-2 space-y-1">
              <div className={`text-[10px] font-semibold uppercase tracking-wider ${tone.text}`}>Registros DNS requeridos</div>
              {records.map((r, i) => (
                <div key={i} className="text-[10px] font-mono bg-white/60 border border-white rounded p-1.5 text-gray-700 break-all">
                  {r.type && <span className="font-semibold mr-1">{r.type}</span>}
                  {r.domain && <span>{r.domain} → </span>}
                  {r.value && <span>{r.value}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const PROVISIONING_STEPS: { key: ProvisioningStatus; label: string; icon: typeof Rocket }[] = [
  { key: 'building', label: 'Generando archivos', icon: Layers },
  { key: 'pushing_repo', label: 'Subiendo a GitHub', icon: Github },
  { key: 'creating_project', label: 'Creando proyecto Vercel', icon: Rocket },
  { key: 'deploying', label: 'Desplegando', icon: RefreshCw },
  { key: 'ready', label: 'Listo', icon: Check },
]

function ProvisioningStatusBanner({
  config,
  publishing,
  ownerEmail,
}: {
  config: BrandingConfig
  publishing: boolean
  ownerEmail: string | null
}) {
  const status = config.provisioning_status || 'idle'
  if (status === 'idle' && !publishing) return null

  const currentIdx = PROVISIONING_STEPS.findIndex(s => s.key === status)
  const isFailed = status === 'failed'
  const isReady = status === 'ready'

  const tone = isFailed
    ? { bg: 'bg-red-50', border: 'border-red-200', title: 'text-red-700', body: 'text-red-600' }
    : isReady
      ? { bg: 'bg-emerald-50', border: 'border-emerald-200', title: 'text-emerald-700', body: 'text-emerald-700' }
      : { bg: 'bg-indigo-50', border: 'border-indigo-200', title: 'text-indigo-700', body: 'text-indigo-600' }

  const title = isFailed
    ? 'No se pudo desplegar el frontend del tenant'
    : isReady
      ? 'Tu plataforma está lista'
      : 'Desplegando tu plataforma...'

  return (
    <div className={`m-4 p-2.5 rounded-xl border ${tone.bg} ${tone.border}`}>
      <div className="flex items-start gap-2">
        {isFailed
          ? <AlertTriangle size={14} className={`mt-0.5 flex-shrink-0 ${tone.title}`} />
          : isReady
            ? <Check size={14} className={`mt-0.5 flex-shrink-0 ${tone.title}`} />
            : <Loader2 size={14} className={`mt-0.5 flex-shrink-0 animate-spin ${tone.title}`} />}
        <div className="flex-1 min-w-0">
          <div className={`text-xs font-semibold ${tone.title}`}>{title}</div>

          {/* Stepper — while the deploy is in flight we show every step so
              the admin can see progress. Once ready, there's no value in a
              5-row checklist ("everything is done"), so we collapse it. */}
          {!isReady && !isFailed && (
            <div className="mt-2 space-y-0.5">
              {PROVISIONING_STEPS.map((step, idx) => {
                const done = idx < currentIdx
                const active = idx === currentIdx
                const pending = !done && !active
                const Icon = step.icon
                return (
                  <div key={step.key} className="flex items-center gap-2 text-[11px]">
                    {done ? (
                      <Check size={10} className="text-emerald-500 flex-shrink-0" />
                    ) : active ? (
                      <Loader2 size={10} className="animate-spin text-indigo-500 flex-shrink-0" />
                    ) : (
                      <Circle size={10} className="text-gray-300 flex-shrink-0" />
                    )}
                    <Icon size={10} className={pending ? 'text-gray-300' : tone.body} />
                    <span className={pending ? 'text-gray-400' : tone.body}>{step.label}</span>
                  </div>
                )
              })}
            </div>
          )}

          {/* Failed → short, user-friendly message. The raw backend error
              (GitHub request IDs, Vercel API bodies, etc.) lives in the
              container logs for Codlylabs ops to consult; the tenant admin
              only needs to know the publish didn't go through and that a
              retry usually resolves it. */}
          {isFailed && (
            <div className="mt-2 text-[11px] text-red-700/80">
              Intentá nuevamente en unos minutos. Si persiste, contactanos.
            </div>
          )}

          {/* Ready → user-facing tenant URL + compact email reminder. The
              GitHub repo and Vercel project that back it are Codlylabs
              infrastructure and must not leak into the admin UI. */}
          {isReady && config.subdomain_slug && (
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <a
                href={`https://${config.subdomain_slug}.codlylabs.ai`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-md bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
              >
                <ExternalLink size={12} />
                Abrir mi plataforma
              </a>
              {ownerEmail && (
                <span className="text-[10px] text-emerald-700/80">
                  Ingresás con <strong className="font-mono">{ownerEmail}</strong>
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
