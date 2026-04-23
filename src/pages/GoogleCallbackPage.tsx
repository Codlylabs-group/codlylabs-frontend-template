import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { authApi, getAndClearAuthReturnUrl } from '../services/auth'
import { authStorage } from '../services/authStorage'
import { useAppDispatch } from '../store/hooks'
import { setAuthData } from '../store/userSlice'

type CallbackStatus = 'loading' | 'success' | 'error'

export default function GoogleCallbackPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<CallbackStatus>('loading')
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code')
      const state = searchParams.get('state')
      const error = searchParams.get('error')

      if (error) {
        setStatus('error')
        setErrorMessage(searchParams.get('error_description') || `Google error: ${error}`)
        return
      }

      if (!code || !state) {
        setStatus('error')
        setErrorMessage('Missing authorization code or state parameter')
        return
      }

      try {
        const response = await authApi.exchangeGoogleCode(code, state)

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
        console.error('Google callback error:', err)
        setStatus('error')
        setErrorMessage(
          err.response?.data?.detail ||
          err.message ||
          'Failed to complete authentication'
        )
      }
    }

    handleCallback()
  }, [searchParams, navigate, dispatch])

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8 text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
            <p className="mt-4 text-sm text-slate-500">Completando inicio de sesion...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <p className="mt-4 text-sm text-slate-500">Autenticacion exitosa. Redirigiendo...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <p className="mt-4 text-sm text-slate-500">{errorMessage}</p>
            <button
              onClick={() => navigate('/login', { replace: true })}
              className="mt-6 w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
            >
              Volver a intentar
            </button>
          </>
        )}
      </div>
    </div>
  )
}
