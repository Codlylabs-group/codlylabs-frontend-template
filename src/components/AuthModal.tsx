import { FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2, Mail, Linkedin, X, Eye, EyeOff } from 'lucide-react'

import { authApi, saveExplicitAuthReturnUrl } from '../services/auth'
import { authStorage } from '../services/authStorage'
import { useAppDispatch } from '../store/hooks'
import { setAuthData } from '../store/userSlice'
import { useI18n } from '../i18n'

type AuthMode = 'login' | 'register'

interface AuthModalProps {
  isOpen: boolean
  initialMode: AuthMode
  onClose: () => void
  // Override the post-login redirect. Default: '/workspace'. Use this when
  // opening the modal from a non-landing page (ej. /vertical-pack/:slug)
  // so the user is returned to where they were after authenticating.
  returnUrl?: string
}

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

export default function AuthModal({ isOpen, initialMode, onClose, returnUrl }: AuthModalProps) {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { t } = useI18n()

  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isOAuthLoading, setIsOAuthLoading] = useState<'linkedin' | 'google' | null>(null)
  const [error, setError] = useState('')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode)
      setShowEmailForm(false)
      setError('')
      setEmail('')
      setPassword('')
      setFullName('')
      setConfirmPassword('')
      setShowPassword(false)
      setShowConfirmPassword(false)
      saveExplicitAuthReturnUrl(returnUrl || '/workspace')
    }
  }, [isOpen, initialMode])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

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
      const providerName = provider === 'linkedin' ? 'LinkedIn' : 'Google'
      setError(err?.response?.data?.detail || `${t('authOverlay.oauthError')} ${providerName}`)
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
      setError(err?.response?.data?.detail || t('authOverlay.loginError'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRegister = async (event: FormEvent) => {
    event.preventDefault()
    if (password !== confirmPassword) {
      setError(t('authOverlay.passwordMismatch'))
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
        organizationName: email.split('@')[1]?.split('.')[0] || 'Mi Workspace',
      })
      persistAuth(response, dispatch)
      redirectAfterAuth()
    } catch (err: any) {
      setError(err?.response?.data?.detail || t('authOverlay.registerError'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const isLogin = mode === 'login'

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-[480px] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-2 -right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Card */}
        <div className="rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.15)] px-10 py-9 max-h-[90vh] overflow-y-auto" style={{ background: 'radial-gradient(ellipse at 50% 0%, #E7E4FE 0%, #f0eefe 35%, #ffffff 70%)' }}>
          <h1 className="text-2xl font-bold text-slate-900 text-center">
            {isLogin ? t('authOverlay.loginTitle') : t('authOverlay.registerTitle')}
          </h1>
          <p className="mt-2 text-sm text-slate-500 text-center">
            {isLogin ? t('authOverlay.loginSubtitle') : t('authOverlay.registerSubtitle')}
          </p>

          {error && (
            <div className="mt-4 rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-xs text-rose-700">
              {error}
            </div>
          )}

          {/* OAuth buttons */}
          {!showEmailForm && (
            <div className="mt-8 space-y-3">
              <button
                type="button"
                onClick={() => handleOAuth('linkedin')}
                disabled={isOAuthLoading !== null}
                className="w-full flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isOAuthLoading === 'linkedin' ? (
                  <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                ) : (
                  <Linkedin className="h-5 w-5 text-[#0a66c2]" />
                )}
                {t('authOverlay.continueLinkedIn')}
              </button>

              <button
                type="button"
                onClick={() => handleOAuth('google')}
                disabled={isOAuthLoading !== null}
                className="w-full flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isOAuthLoading === 'google' ? (
                  <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                ) : (
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                )}
                {t('authOverlay.continueGoogle')}
              </button>

              {/* Divider */}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-4 text-slate-400">{t('authOverlay.or')}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowEmailForm(true)}
                className="w-full flex items-center justify-center gap-3 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-500"
              >
                <Mail className="h-5 w-5" />
                {t('authOverlay.continueEmail')}
              </button>
            </div>
          )}

          {/* Email form */}
          {showEmailForm && (
            <form className="mt-8 space-y-4" onSubmit={isLogin ? handleLogin : handleRegister}>
              {!isLogin && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('authOverlay.name')}</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t('authOverlay.namePlaceholder')}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('authOverlay.email')}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('authOverlay.emailPlaceholder')}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  {isLogin ? t('authOverlay.password') : t('authOverlay.createPassword')}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isLogin ? t('authOverlay.passwordPlaceholder') : t('authOverlay.passwordMinPlaceholder')}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 pr-10 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('authOverlay.confirmPassword')}</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={t('authOverlay.confirmPlaceholder')}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 pr-10 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}

              {isLogin && (
                <div className="flex justify-end">
                  <Link to="/auth/forgot-password" onClick={onClose} className="text-sm text-indigo-600 hover:text-indigo-700 transition-colors">
                    {t('authOverlay.recoverAccess')}
                  </Link>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isLogin ? t('authOverlay.loginButton') : t('authOverlay.registerButton')}
              </button>

              <button
                type="button"
                onClick={() => { setShowEmailForm(false); setError('') }}
                className="w-full text-sm text-slate-500 hover:text-slate-700 transition-colors py-1"
              >
                {t('authOverlay.backToOptions')}
              </button>
            </form>
          )}

          {/* Toggle login/register */}
          <p className="mt-6 text-center text-sm text-slate-500">
            {isLogin ? (
              <>
                {t('authOverlay.noAccount')}{' '}
                <button
                  type="button"
                  onClick={() => { setMode('register'); setError(''); setShowEmailForm(false) }}
                  className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  {t('authOverlay.signUp')}
                </button>
              </>
            ) : (
              <>
                {t('authOverlay.hasAccount')}{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(''); setShowEmailForm(false) }}
                  className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  {t('authOverlay.signIn')}
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
