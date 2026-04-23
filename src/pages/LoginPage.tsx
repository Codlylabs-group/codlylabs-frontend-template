import { FormEvent, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2, Mail, Linkedin } from 'lucide-react'

import { authApi, saveExplicitAuthReturnUrl } from '../services/auth'
import { authStorage } from '../services/authStorage'
import { useAppDispatch } from '../store/hooks'
import { setAuthData } from '../store/userSlice'
import { useBranding, type TenantBranding } from '../hooks/useBranding'
import { usePageTitle } from '../hooks/usePageTitle'
import { inferWorkspaceNameFromEmail } from '../utils/workspaceNaming'
import { isTenantSubdomainHost } from '../utils/platformBranding'
import { TENANT_STATIC_BRANDING } from '../constants/tenantBranding'

// On a tenant build (dedicated frontend at {slug}.codlylabs.ai) OAuth is not
// available — the Google/LinkedIn redirect URIs live in the backend config
// pinned to the central codlylabs.ai frontend. Tenant owners and members
// auth with email + password only. Also hides the self-register link: on
// tenants, accounts are created via invites from /workspace/members.
const IS_TENANT_BUILD: boolean =
  TENANT_STATIC_BRANDING !== null || isTenantSubdomainHost()

type AuthMode = 'login' | 'register'

function persistAuth(response: any, dispatch: ReturnType<typeof useAppDispatch>) {
  authStorage.saveTokens(response.tokens.access_token, response.tokens.refresh_token)
  authStorage.saveUserData({
    id: response.user.id,
    email: response.user.email,
    full_name: response.user.full_name,
    profile_picture: response.user.profile_picture,
  })
  dispatch(setAuthData({
    user: {
      id: response.user.id,
      email: response.user.email,
      full_name: response.user.full_name,
      profile_picture: response.user.profile_picture,
    },
    tokens: {
      access_token: response.tokens.access_token,
      refresh_token: response.tokens.refresh_token,
    },
  }))
  try { localStorage.setItem('org_plan', response.organization?.plan || 'free') } catch {}
}

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const [searchParams] = useSearchParams()
  // On tenant builds: ignore ?mode=register and /register, stay on login.
  const initialMode: AuthMode = IS_TENANT_BUILD
    ? 'login'
    : ((location.pathname === '/register' || searchParams.get('mode') === 'register') ? 'register' : 'login')

  const tenant = useBranding()
  const [mode, setMode] = useState<AuthMode>(initialMode)
  // Skip the OAuth landing on tenant builds — no OAuth is available, so we
  // go straight to the email/password form.
  const [showEmailForm, setShowEmailForm] = useState<boolean>(IS_TENANT_BUILD)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isOAuthLoading, setIsOAuthLoading] = useState<'linkedin' | 'google' | null>(null)
  const [error, setError] = useState('')

  usePageTitle(mode === 'login' ? 'Iniciar sesion' : 'Crear cuenta', tenant.loading ? null : tenant.brandName)

  // Login fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Register extra fields
  const [fullName, setFullName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    if (!sessionStorage.getItem('auth_return_url')) {
      const returnTo = searchParams.get('returnTo')
      if (returnTo && returnTo.startsWith('/')) {
        saveExplicitAuthReturnUrl(returnTo)
      } else {
        saveExplicitAuthReturnUrl('/workspace')
      }
    }
  }, [searchParams])

  useEffect(() => {
    setMode(initialMode)
  }, [initialMode])

  const redirectAfterAuth = () => {
    const returnUrl = sessionStorage.getItem('auth_return_url')
    if (returnUrl) {
      sessionStorage.removeItem('auth_return_url')
      navigate(returnUrl, { replace: true })
      return
    }
    navigate('/workspace', { replace: true })
  }

  const handleOAuth = async (provider: 'linkedin' | 'google') => {
    try {
      setIsOAuthLoading(provider)
      setError('')
      const url = provider === 'linkedin'
        ? await authApi.getLinkedInAuthUrl()
        : await authApi.getGoogleAuthUrl()
      window.location.href = url
    } catch (err: any) {
      setError(err?.response?.data?.detail || `No se pudo iniciar con ${provider === 'linkedin' ? 'LinkedIn' : 'Google'}`)
      setIsOAuthLoading(null)
    }
  }

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault()
    try {
      setIsSubmitting(true)
      setError('')
      const response = await authApi.login(email.trim(), password)
      persistAuth(response, dispatch)
      redirectAfterAuth()
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'No se pudo iniciar sesion')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRegister = async (event: FormEvent) => {
    event.preventDefault()
    if (password !== confirmPassword) {
      setError('Las contrasenas no coinciden')
      return
    }
    try {
      setIsSubmitting(true)
      setError('')
      const response = await authApi.register({
        email: email.trim(),
        password,
        confirmPassword,
        fullName: fullName.trim() || undefined,
        organizationName: inferWorkspaceNameFromEmail(email),
      })
      persistAuth(response, dispatch)
      redirectAfterAuth()
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'No se pudo crear la cuenta')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isLogin = mode === 'login'

  if (!tenant.loading && tenant.isWhiteLabel) {
    return (
      <TenantLoginLayout
        tenant={tenant}
        isLogin={isLogin}
        mode={mode}
        setMode={setMode}
        showEmailForm={showEmailForm}
        setShowEmailForm={setShowEmailForm}
        isSubmitting={isSubmitting}
        isOAuthLoading={isOAuthLoading}
        error={error}
        setError={setError}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        fullName={fullName}
        setFullName={setFullName}
        confirmPassword={confirmPassword}
        setConfirmPassword={setConfirmPassword}
        handleLogin={handleLogin}
        handleRegister={handleRegister}
        handleOAuth={handleOAuth}
      />
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center px-4">
      <div className="w-full max-w-[720px]">
        {/* Logo */}
        <div className="text-center mb-14">
          {tenant.isWhiteLabel ? (
            <div>
              {tenant.logoUrl ? (
                <img src={tenant.logoUrl} alt={tenant.brandName} className="h-14 mx-auto mb-3" />
              ) : (
                <div
                  className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center text-white text-2xl font-bold"
                  style={{ background: `linear-gradient(135deg, ${tenant.colors.primary}, ${tenant.colors.primaryDark})` }}
                >
                  {tenant.brandName.substring(0, 2).toUpperCase()}
                </div>
              )}
              <div className="text-3xl font-bold tracking-tight" style={{ color: tenant.colors.primary }}>{tenant.brandName}</div>
            </div>
          ) : (
            <Link
              to="/"
              className="text-5xl font-bold text-indigo-600 tracking-tight"
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              CodlyLabs
            </Link>
          )}
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.07)] border border-slate-100 px-16 py-16">
          <h1 className="text-4xl font-bold text-slate-900 text-center">
            {isLogin
              ? (tenant.isWhiteLabel && tenant.loginTitle ? tenant.loginTitle : 'Inicia sesion en tu cuenta')
              : 'Crea tu cuenta'}
          </h1>
          <p className="mt-5 text-xl text-slate-500 text-center">
            {isLogin
              ? (tenant.isWhiteLabel && tenant.loginSubtitle ? tenant.loginSubtitle : 'Elige como quieres acceder')
              : 'Registrate para comenzar'}
          </p>

          {error && (
            <div className="mt-5 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          {/* OAuth buttons */}
          {!showEmailForm && (
            <div className="mt-14 space-y-5">
              <button
                type="button"
                onClick={() => handleOAuth('linkedin')}
                disabled={isOAuthLoading !== null}
                className="w-full flex items-center justify-center gap-4 rounded-2xl border border-slate-200 bg-white px-8 text-xl font-medium text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ paddingTop: '1.35rem', paddingBottom: '1.35rem' }}
              >
                {isOAuthLoading === 'linkedin' ? (
                  <Loader2 className="h-7 w-7 animate-spin text-slate-400" />
                ) : (
                  <Linkedin className="h-7 w-7 text-[#0a66c2]" />
                )}
                Continuar con LinkedIn
              </button>

              <button
                type="button"
                onClick={() => handleOAuth('google')}
                disabled={isOAuthLoading !== null}
                className="w-full flex items-center justify-center gap-4 rounded-2xl border border-slate-200 bg-white px-8 text-xl font-medium text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ paddingTop: '1.35rem', paddingBottom: '1.35rem' }}
              >
                {isOAuthLoading === 'google' ? (
                  <Loader2 className="h-7 w-7 animate-spin text-slate-400" />
                ) : (
                  <svg className="h-7 w-7" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                )}
                Continuar con Google
              </button>

              {/* Divider */}
              <div className="relative my-10">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-lg">
                  <span className="bg-white px-5 text-slate-400">o</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowEmailForm(true)}
                className="w-full flex items-center justify-center gap-4 rounded-2xl bg-indigo-600 px-8 text-xl font-semibold text-white transition-all hover:bg-indigo-500"
                style={{ paddingTop: '1.35rem', paddingBottom: '1.35rem' }}
              >
                <Mail className="h-7 w-7" />
                Continuar con email
              </button>
            </div>
          )}

          {/* Email form */}
          {showEmailForm && (
            <form className="mt-14 space-y-7" onSubmit={isLogin ? handleLogin : handleRegister}>
              {!isLogin && (
                <div>
                  <label className="block text-lg font-semibold text-slate-700 mb-3">Nombre</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Tu nombre completo"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-6 text-xl text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                    style={{ paddingTop: '1.2rem', paddingBottom: '1.2rem' }}
                  />
                </div>
              )}

              <div>
                <label className="block text-lg font-semibold text-slate-700 mb-3">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-6 text-xl text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                  style={{ paddingTop: '1.2rem', paddingBottom: '1.2rem' }}
                  required
                />
              </div>

              <div>
                <label className="block text-lg font-semibold text-slate-700 mb-3">
                  {isLogin ? 'Password' : 'Crea un password'}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isLogin ? 'Tu password' : 'Min. 8 caracteres'}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-6 text-xl text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                  style={{ paddingTop: '1.2rem', paddingBottom: '1.2rem' }}
                  required
                />
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-lg font-semibold text-slate-700 mb-3">Confirmar password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite tu password"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-6 text-xl text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                    style={{ paddingTop: '1.2rem', paddingBottom: '1.2rem' }}
                    required
                  />
                </div>
              )}

              {isLogin && (
                <div className="flex justify-end">
                  <Link to="/auth/forgot-password" className="text-lg text-indigo-600 hover:text-indigo-700 transition-colors">
                    Recuperar acceso
                  </Link>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-3 rounded-2xl bg-indigo-600 px-8 text-xl font-semibold text-white transition-all hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ paddingTop: '1.35rem', paddingBottom: '1.35rem' }}
              >
                {isSubmitting && <Loader2 className="h-6 w-6 animate-spin" />}
                {isLogin ? 'Ingresar' : 'Crear cuenta'}
              </button>

              {/* "Back to OAuth landing" only makes sense when there IS a
                  landing — on tenant builds there isn't. */}
              {!IS_TENANT_BUILD && (
                <button
                  type="button"
                  onClick={() => { setShowEmailForm(false); setError('') }}
                  className="w-full text-lg text-slate-500 hover:text-slate-700 transition-colors py-2"
                >
                  Volver a las opciones de acceso
                </button>
              )}
            </form>
          )}
        </div>

        {/* Toggle login/register — hidden on tenant builds: accounts there
            are created exclusively via workspace/members invites. */}
        {!IS_TENANT_BUILD && (
          <p className="mt-8 text-center text-lg text-slate-500">
            {isLogin ? (
              <>
                No tienes cuenta?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('register'); setError(''); setShowEmailForm(false) }}
                  className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  Registrate
                </button>
              </>
            ) : (
              <>
                Ya tienes cuenta?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(''); setShowEmailForm(false) }}
                  className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  Inicia sesion
                </button>
              </>
            )}
          </p>
        )}

        {/* Powered by badge for white-label tenants */}
        {tenant.isWhiteLabel && (
          <p className="mt-6 text-center text-sm text-gray-400">
            Powered by <span className="font-semibold"><span className="text-indigo-500">Codly</span><span className="text-purple-500">Labs</span></span>
          </p>
        )}
      </div>
    </div>
  )
}

// ── Tenant (white-label) login layout — 2-column split matching the preview
// shown in WorkspaceBrandingStudioView. Keeps the same auth logic and handlers.

interface TenantLoginLayoutProps {
  tenant: TenantBranding
  isLogin: boolean
  mode: AuthMode
  setMode: (m: AuthMode) => void
  showEmailForm: boolean
  setShowEmailForm: (v: boolean) => void
  isSubmitting: boolean
  isOAuthLoading: 'linkedin' | 'google' | null
  error: string
  setError: (s: string) => void
  email: string
  setEmail: (s: string) => void
  password: string
  setPassword: (s: string) => void
  fullName: string
  setFullName: (s: string) => void
  confirmPassword: string
  setConfirmPassword: (s: string) => void
  handleLogin: (event: FormEvent) => Promise<void>
  handleRegister: (event: FormEvent) => Promise<void>
  handleOAuth: (provider: 'linkedin' | 'google') => Promise<void>
}

function TenantLoginLayout(props: TenantLoginLayoutProps) {
  const {
    tenant, isLogin, mode, setMode,
    showEmailForm, setShowEmailForm,
    isSubmitting, isOAuthLoading, error, setError,
    email, setEmail, password, setPassword,
    fullName, setFullName, confirmPassword, setConfirmPassword,
    handleLogin, handleRegister, handleOAuth,
  } = props

  const primary = tenant.colors.primary
  const primaryDark = tenant.colors.primaryDark
  const accent = tenant.colors.accent
  const gradient = `linear-gradient(135deg, ${primary}, ${primaryDark})`
  const gradientAccent = `linear-gradient(135deg, ${primary}, ${accent})`
  const initials = tenant.brandName.substring(0, 2).toUpperCase()

  const title = isLogin
    ? (tenant.loginTitle || `Bienvenido a ${tenant.brandName}`)
    : 'Crea tu cuenta'
  const subtitle = isLogin
    ? (tenant.loginSubtitle || 'Accede a tu plataforma')
    : 'Registrate para comenzar'

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white">
      {/* Left: branded auth form */}
      <div className="flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md">
          {/* Logo / initials */}
          <div className="mb-8">
            {tenant.logoUrl ? (
              <img src={tenant.logoUrl} alt={tenant.brandName} className="h-12 mb-4" />
            ) : (
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg mb-4"
                style={{ background: gradient }}
              >
                {initials}
              </div>
            )}
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          </div>

          {error && (
            <div className="mb-5 rounded-lg bg-rose-50 border border-rose-200 px-3 py-2.5 text-sm text-rose-700">
              {error}
            </div>
          )}

          {/* OAuth buttons */}
          {!showEmailForm && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleOAuth('linkedin')}
                disabled={isOAuthLoading !== null}
                className="w-full flex items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white py-3 px-4 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isOAuthLoading === 'linkedin' ? (
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                ) : (
                  <Linkedin className="h-5 w-5 text-[#0a66c2]" />
                )}
                Continuar con LinkedIn
              </button>

              <button
                type="button"
                onClick={() => handleOAuth('google')}
                disabled={isOAuthLoading !== null}
                className="w-full flex items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white py-3 px-4 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isOAuthLoading === 'google' ? (
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                ) : (
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                )}
                Continuar con Google
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-3 text-gray-400">o</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowEmailForm(true)}
                className="w-full flex items-center justify-center gap-2 rounded-lg py-3 px-4 text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ background: gradient }}
              >
                <Mail className="h-5 w-5" />
                Continuar con email
              </button>
            </div>
          )}

          {/* Email form */}
          {showEmailForm && (
            <form className="space-y-4" onSubmit={isLogin ? handleLogin : handleRegister}>
              {!isLogin && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Nombre</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Tu nombre completo"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-400 transition-all"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-400 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  {isLogin ? 'Password' : 'Crea un password'}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isLogin ? 'Tu password' : 'Min. 8 caracteres'}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-400 transition-all"
                  required
                />
              </div>
              {!isLogin && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Confirmar password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite tu password"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-400 transition-all"
                    required
                  />
                </div>
              )}
              {isLogin && (
                <div className="flex justify-end">
                  <Link to="/auth/forgot-password" className="text-xs font-medium transition-colors hover:opacity-80" style={{ color: primary }}>
                    Recuperar acceso
                  </Link>
                </div>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-lg py-3 px-4 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: gradient }}
              >
                {isSubmitting && <Loader2 className="h-5 w-5 animate-spin" />}
                {isLogin ? 'Iniciar sesion' : 'Crear cuenta'}
              </button>
              {!IS_TENANT_BUILD && (
                <button
                  type="button"
                  onClick={() => { setShowEmailForm(false); setError('') }}
                  className="w-full text-xs text-gray-500 hover:text-gray-700 transition-colors py-1"
                >
                  Volver a las opciones de acceso
                </button>
              )}
            </form>
          )}

          {!IS_TENANT_BUILD && (
            <p className="mt-6 text-center text-sm text-gray-500">
              {isLogin ? (
                <>
                  No tenes cuenta?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('register'); setError(''); setShowEmailForm(false) }}
                    className="font-semibold transition-opacity hover:opacity-80"
                    style={{ color: primary }}
                  >
                    Registrate
                  </button>
                </>
              ) : (
                <>
                  Ya tenes cuenta?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError(''); setShowEmailForm(false) }}
                    className="font-semibold transition-opacity hover:opacity-80"
                    style={{ color: primary }}
                  >
                    Inicia sesion
                  </button>
                </>
              )}
            </p>
          )}

          <p className="mt-6 text-center text-[11px] text-gray-400">
            Powered by <span className="font-semibold"><span className="text-indigo-500">Codly</span><span className="text-purple-500">Labs</span></span>
          </p>
          {/* Silence unused-var warnings for mode in return path (read-only here) */}
          <span className="hidden">{mode}</span>
        </div>
      </div>

      {/* Right: gradient hero */}
      <div
        className="hidden lg:flex items-center justify-center relative overflow-hidden"
        style={{ background: gradientAccent }}
      >
        <div className="absolute w-96 h-96 rounded-full bg-white/10 -top-24 -right-24" />
        <div className="absolute w-64 h-64 rounded-full bg-white/10 -bottom-16 -left-16" />
        <div className="text-center text-white z-10 px-12 max-w-lg">
          <h2 className="text-4xl font-bold mb-4 leading-tight">
            {tenant.loginHeroTitle || 'Innovacion con IA'}
          </h2>
          <p className="text-base opacity-90 leading-relaxed">
            {tenant.loginHeroDescription || 'Genera prototipos funcionales en minutos.'}
          </p>
        </div>
      </div>
    </div>
  )
}
