import { FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Loader2, Lock, Mail, User2 } from 'lucide-react'

import { authStorage } from '../services/authStorage'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { setAuthData } from '../store/userSlice'
import { workspaceApi, type ResolvedInvitationResponse } from '../services/workspace'

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

export default function InviteAcceptPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const currentUser = useAppSelector((state) => state.user.user)
  const { token = '' } = useParams()

  const [invitation, setInvitation] = useState<ResolvedInvitationResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        setLoading(true)
        const response = await workspaceApi.resolveInvitation(token)
        if (cancelled) return
        setInvitation(response)
        setEmail(response.email || currentUser?.email || '')
      } catch (err: any) {
        if (cancelled) return
        setError(err?.response?.data?.detail || 'No se pudo validar la invitación')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [token, currentUser?.email])

  const handleAccept = async (event: FormEvent) => {
    event.preventDefault()
    if (!token) return
    if (!currentUser && password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    try {
      setSubmitting(true)
      setError('')
      const response = await workspaceApi.acceptInvitation({
        token,
        email: currentUser ? undefined : email.trim(),
        password: currentUser ? undefined : password,
        confirm_password: currentUser ? undefined : confirmPassword,
        full_name: currentUser ? undefined : fullName.trim(),
      })
      persistAuth(response, dispatch)
      navigate('/workspace', { replace: true })
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'No se pudo aceptar la invitación')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f6fb]">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
          <span className="text-sm font-medium">Validando invitación...</span>
        </div>
      </div>
    )
  }

  if (!invitation) {
    return (
      <div className="min-h-screen bg-[#f4f6fb] px-4 py-10">
        <div className="mx-auto max-w-lg rounded-[2rem] border border-rose-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-950">Invitación inválida</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">{error || 'La invitación no existe o ya no está disponible.'}</p>
          <Link to="/login" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700">
            <ArrowLeft className="h-4 w-4" />
            Ir a login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f4f6fb] px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_32px_80px_rgba(15,23,42,0.08)] lg:grid-cols-[1fr_0.95fr]">
          <section className="hidden bg-slate-950 px-10 py-12 text-white lg:block">
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-white/70 hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              Volver al sitio
            </Link>
            <p className="mt-16 text-xs font-semibold uppercase tracking-[0.26em] text-sky-300">Powered by CodlyLabs</p>
            <h1 className="mt-5 text-4xl font-bold tracking-tight">Te invitaron al workspace de {invitation.workspace.display_name}.</h1>
            <p className="mt-5 max-w-md text-base leading-7 text-white/72">
              Acepta la invitación para entrar al workspace corporativo y usar uno de los seats del plan contratado.
            </p>
          </section>

          <section className="px-6 py-8 sm:px-10 sm:py-12">
            <div className="mx-auto max-w-md">
              <h2 className="text-3xl font-bold tracking-tight text-slate-950">Aceptar invitación</h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Workspace: <span className="font-semibold text-slate-700">{invitation.workspace.display_name}</span> · Rol: <span className="font-semibold text-slate-700">{invitation.role}</span>
              </p>

              {error && (
                <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              )}

              <form className="mt-8 space-y-4" onSubmit={handleAccept}>
                {!currentUser && (
                  <>
                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-slate-700">Nombre completo</span>
                      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                        <User2 className="h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          value={fullName}
                          onChange={(event) => setFullName(event.target.value)}
                          placeholder="Tu nombre"
                          className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                        />
                      </div>
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-slate-700">Email</span>
                      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          placeholder="tu@empresa.com"
                          className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                          required
                        />
                      </div>
                    </label>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className="mb-2 block text-sm font-semibold text-slate-700">Password</span>
                        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                          <Lock className="h-4 w-4 text-slate-400" />
                          <input
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="Min. 8 caracteres"
                            className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                            required
                          />
                        </div>
                      </label>

                      <label className="block">
                        <span className="mb-2 block text-sm font-semibold text-slate-700">Confirmar password</span>
                        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                          <Lock className="h-4 w-4 text-slate-400" />
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.target.value)}
                            placeholder="Repite tu password"
                            className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                            required
                          />
                        </div>
                      </label>
                    </div>
                  </>
                )}

                {currentUser && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    Estás aceptando la invitación como <span className="font-semibold text-slate-900">{currentUser.email}</span>.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-400"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Entrar al workspace
                </button>
              </form>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
