import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Loader2, UserCircle } from 'lucide-react'

import { authApi, type UserProfileResponse } from '../../services/auth'
import { useWorkspaceOutletContext } from './WorkspaceLayout'
import { useI18n } from '../../i18n'

const formatDate = (value: string | null | undefined, t: (key: string) => string): string => {
  if (!value) return t('ws.noData')
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('es-AR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function WorkspaceProfileView() {
  const navigate = useNavigate()
  const { t } = useI18n()
  const { setHeader, brand } = useWorkspaceOutletContext()
  const [profile, setProfile] = useState<UserProfileResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setHeader(t('ws.profileTitle'), t('ws.profileSubtitle'))
  }, [setHeader, t])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        setLoading(true)
        const response = await authApi.getProfile()
        if (!cancelled) {
          setProfile(response)
          setError(null)
        }
      } catch (err: any) {
        if (!cancelled) setError(err?.response?.data?.detail || t('ws.profileLoadError'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => { cancelled = true }
  }, [t])

  const roleLabel = useMemo(() => {
    if (!profile) return ''
    return `${profile.roles.effective_role} (${profile.roles.organization_role})`
  }, [profile])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white p-12">
        <Loader2 className="h-7 w-7 animate-spin text-indigo-600" />
        <p className="text-sm text-gray-500">{t('ws.loadingProfile')}</p>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
        <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-medium">{t('ws.profileLoadError')}</p>
          <p className="mt-1 text-xs text-rose-600">{error || t('ws.retryProfile')}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* User info */}
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
        <div className="relative flex items-center gap-5">
          {profile.user.profile_picture ? (
            <img
              src={profile.user.profile_picture}
              alt={profile.user.full_name || ''}
              className="h-16 w-16 rounded-full border-2 border-white/30 object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
              <UserCircle className="h-8 w-8 text-white/80" />
            </div>
          )}
          <div>
            <h2 className="text-xl font-semibold">{profile.user.full_name || profile.user.email}</h2>
            <p className="mt-0.5 text-sm text-blue-100">{profile.user.email}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold text-white/90 backdrop-blur-sm">
                Rol: {roleLabel}
              </span>
              <span className="inline-flex items-center rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold text-white/90 backdrop-blur-sm">
                Plan: {profile.organization.plan}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        {/* Account details */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900">{t('ws.accountDetails')}</h3>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-xs text-gray-500">{t('ws.name')}</span>
              <span className="text-sm font-medium text-gray-900">{profile.user.full_name || '-'}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-xs text-gray-500">{t('ws.email')}</span>
              <span className="text-sm font-medium text-gray-900">{profile.user.email}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-xs text-gray-500">{t('ws.organization')}</span>
              <span className="text-sm font-medium text-gray-900">{profile.organization.name}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-xs text-gray-500">{t('ws.lastLogin')}</span>
              <span className="text-sm font-medium text-gray-900">{formatDate(profile.user.last_login, t)}</span>
            </div>
          </div>
        </div>

        {/* Projects */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">
              {`${t('ws.projects')} (${profile.totals.projects})`}
            </h3>
          </div>
          <div className="mt-4 space-y-2">
            {profile.projects.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">{t('ws.noProjectsProfile')}</p>
            ) : (
              profile.projects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between rounded-lg border border-gray-100 p-3 hover:border-gray-200 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{project.name}</p>
                    <p className="text-[11px] text-gray-400">{project.poc_type} - {project.vertical}</p>
                  </div>
                  {project.current_poc_id && (
                    <button
                      type="button"
                      onClick={() => navigate(`/preview/${project.current_poc_id}`)}
                      className="ml-3 shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-colors"
                      style={{ background: brand.primary }}
                    >
                      {t('ws.open')}
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  )
}
