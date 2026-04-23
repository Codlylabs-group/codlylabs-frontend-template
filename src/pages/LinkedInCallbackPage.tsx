import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { authApi, getAndClearAuthReturnUrl } from '../services/auth'
import { authStorage } from '../services/authStorage'
import { useAppDispatch } from '../store/hooks'
import { setAuthData } from '../store/userSlice'

type CallbackStatus = 'loading' | 'success' | 'error'

export default function LinkedInCallbackPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<CallbackStatus>('loading')
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code')
      const state = searchParams.get('state')
      // Detect provider from: query param, URL path, or JWT state payload
      let provider: 'linkedin' | 'google' = 'linkedin'
      const providerParam = (searchParams.get('provider') || '').toLowerCase()
      if (providerParam === 'google' || location.pathname.includes('/auth/google/callback')) {
        provider = 'google'
      } else if (state) {
        try {
          const payload = JSON.parse(atob(state.split('.')[1]))
          if (payload?.provider === 'google') provider = 'google'
        } catch { /* ignore decode errors */ }
      }
      const error = searchParams.get('error')
      const errorDescription = searchParams.get('error_description')

      if (error) {
        setStatus('error')
        setErrorMessage(errorDescription || `OAuth error: ${error}`)
        return
      }

      if (!code || !state) {
        setStatus('error')
        setErrorMessage('Missing authorization code or state parameter')
        return
      }

      try {
        const response = provider === 'google'
          ? await authApi.exchangeGoogleCode(code, state)
          : await authApi.exchangeLinkedInCode(code, state)

        if (!response?.user || !response?.tokens) {
          throw new Error('Invalid authentication response from server')
        }

        authStorage.saveTokens(response.tokens.access_token, response.tokens.refresh_token)
        authStorage.saveUserData({
          id: response.user.id,
          email: response.user.email,
          full_name: response.user.full_name,
          profile_picture: response.user.profile_picture,
        })
        try { localStorage.setItem('org_plan', response.organization?.plan || 'free') } catch {}

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
          }
        }))

        setStatus('success')

        const returnUrl = getAndClearAuthReturnUrl()
        setTimeout(() => {
          navigate(returnUrl || '/workspace', { replace: true })
        }, 1500)

      } catch (err: any) {
        console.error('OAuth callback error:', err)
        setStatus('error')
        setErrorMessage(
          err.response?.data?.detail ||
          err.message ||
          'Failed to complete authentication'
        )
      }
    }

    handleCallback()
  }, [searchParams, location.pathname, navigate, dispatch])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto" />
            <h2 className="mt-6 text-xl font-semibold text-gray-900">
              Completing sign in...
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Please wait while we set up your account
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h2 className="mt-6 text-xl font-semibold text-gray-900">
              Welcome!
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Authentication successful. Redirecting...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
            <h2 className="mt-6 text-xl font-semibold text-gray-900">
              Authentication Failed
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              {errorMessage}
            </p>
            <div className="mt-6 space-y-3">
              <button
                onClick={() => navigate('/', { replace: true })}
                className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
              >
                Try Again
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
