import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  Building2,
  Check,
  ChevronRight,
  CreditCard,
  Globe,
  KeyRound,
  Loader2,
  LogOut,
  Mail,
  Palette,
  Shield,
  UserCircle,
} from 'lucide-react'

import { authApi } from '../../services/auth'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { clearAuth } from '../../store/userSlice'
import { useI18n } from '../../i18n'
import { useWorkspaceOutletContext } from './WorkspaceLayout'

function initialsFromName(name: string): string {
  const cleaned = name.trim()
  if (!cleaned) return 'US'
  const parts = cleaned.split(/\s+/).filter(Boolean)
  if (parts.length === 1) return cleaned.slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

function SectionCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof Shield
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-3 border-b border-gray-100 pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          <Icon size={18} />
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <p className="mt-0.5 text-xs text-gray-500">{description}</p>
        </div>
      </div>
      <div className="pt-5">{children}</div>
    </section>
  )
}

function InfoRow({
  label,
  value,
  mono = false,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <span className="text-xs font-medium text-gray-500">{label}</span>
      <span className={`text-right text-xs ${mono ? 'font-mono' : ''} text-gray-900`}>{value}</span>
    </div>
  )
}

function ActionRow({
  icon: Icon,
  label,
  description,
  onClick,
  danger,
}: {
  icon: typeof Shield
  label: string
  description?: string
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-lg border border-gray-100 px-4 py-3 text-left transition-colors hover:border-gray-200 ${
        danger ? 'hover:bg-rose-50' : 'hover:bg-gray-50'
      }`}
    >
      <div
        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${
          danger ? 'bg-rose-50 text-rose-500' : 'bg-gray-100 text-gray-500'
        }`}
      >
        <Icon size={16} />
      </div>
      <div className="flex-1">
        <p className={`text-sm font-medium ${danger ? 'text-rose-600' : 'text-gray-900'}`}>{label}</p>
        {description && <p className="mt-0.5 text-xs text-gray-500">{description}</p>}
      </div>
      <ChevronRight size={14} className="text-gray-300" />
    </button>
  )
}

function ChangePasswordForm({ onClose, t }: { onClose: () => void; t: (key: string) => string }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (pending) return
    setError(null)
    if (newPassword.length < 8) {
      setError(t('ws.passwordMinError'))
      return
    }
    if (newPassword !== confirmPassword) {
      setError(t('ws.passwordMismatchError'))
      return
    }
    setPending(true)
    try {
      await authApi.changePassword({ currentPassword, newPassword, confirmPassword })
      setSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      window.setTimeout(() => {
        setSuccess(false)
        onClose()
      }, 1800)
    } catch (err: any) {
      setError(err?.response?.data?.detail || t('ws.passwordChangeError'))
    } finally {
      setPending(false)
    }
  }

  const inputClass =
    'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-colors focus:border-blue-300'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
          {t('ws.currentPassword')}
        </label>
        <input
          type="password"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          className={inputClass}
          required
        />
      </div>
      <div className="space-y-1.5">
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
          {t('ws.newPassword')}
        </label>
        <input
          type="password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          className={inputClass}
          minLength={8}
          required
        />
        <p className="text-[11px] text-gray-400">{t('ws.minChars')}</p>
      </div>
      <div className="space-y-1.5">
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
          {t('ws.confirmNewPassword')}
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          className={inputClass}
          minLength={8}
          required
        />
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
          <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700">
          <Check size={12} className="mt-0.5 flex-shrink-0" />
          <span>{t('ws.passwordUpdated')}</span>
        </div>
      )}

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          {t('ws.cancel')}
        </button>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
        >
          {pending && <Loader2 size={12} className="animate-spin" />}
          {t('ws.savePassword')}
        </button>
      </div>
    </form>
  )
}

export default function WorkspaceSettingsView() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { t } = useI18n()
  const userData = useAppSelector((state) => state.user.user)
  const { context, brand, setHeader } = useWorkspaceOutletContext()
  const [passwordOpen, setPasswordOpen] = useState(false)

  useEffect(() => {
    setHeader(t('ws.settingsTitle'), t('ws.settingsSubtitle'))
  }, [setHeader, t])

  const displayName = userData?.full_name || context.user.full_name || context.user.email.split('@')[0]
  const email = userData?.email || context.user.email
  const initials = useMemo(() => initialsFromName(displayName), [displayName])
  const userRole = (context.user.role || 'member').toLowerCase()
  const isAdminOrOwner = userRole === 'owner' || userRole === 'admin'

  const handleLogout = () => {
    authApi.clearTokens()
    dispatch(clearAuth())
    navigate('/', { replace: true })
  }

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
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {userData?.profile_picture ? (
              <img
                src={userData.profile_picture}
                alt={displayName}
                className="h-14 w-14 rounded-full border-2 border-white/30 object-cover"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/30 bg-white/15 text-lg font-bold">
                {initials}
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold">{displayName}</h2>
              <p className="text-sm text-blue-100">{email}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 font-semibold text-white/90 backdrop-blur-sm">
                  <Building2 size={10} />
                  {context.workspace.display_name || context.workspace.name}
                </span>
                <span className="rounded-full bg-white/15 px-2 py-0.5 font-semibold text-white/90 backdrop-blur-sm">
                  {context.workspace.plan_label}
                </span>
                <span className="rounded-full bg-white/15 px-2 py-0.5 font-semibold capitalize text-white/90 backdrop-blur-sm">
                  {context.user.role}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard icon={UserCircle} title={t('ws.accountSection')} description={t('ws.accountDescription')}>
          <div className="space-y-1 divide-y divide-gray-100">
            <InfoRow label={t('ws.name')} value={displayName} />
            <InfoRow label={t('ws.email')} value={email} />
            <InfoRow label={t('ws.roleInWorkspace')} value={context.user.role} />
            {userData?.id && <InfoRow label={t('ws.userId')} value={userData.id.slice(0, 8)} mono />}
          </div>
          <div className="mt-5 rounded-lg border border-gray-100 bg-gray-50 p-4 text-xs text-gray-500">
            <p>
              {t('ws.editProfileHint')}
            </p>
          </div>
        </SectionCard>

        <SectionCard
          icon={Shield}
          title={t('ws.securitySection')}
          description={t('ws.securityDescription')}
        >
          {!passwordOpen ? (
            <div className="space-y-2.5">
              <ActionRow
                icon={KeyRound}
                label={t('ws.changePassword')}
                description={t('ws.changePasswordDesc')}
                onClick={() => setPasswordOpen(true)}
              />
              <ActionRow
                icon={Mail}
                label={t('ws.recoveryEmail')}
                description={t('ws.recoveryEmailDesc').replace('{email}', email)}
                onClick={() => navigate('/auth/forgot-password')}
              />
              <ActionRow
                icon={LogOut}
                label={t('ws.logoutDevice')}
                description={t('ws.logoutDeviceDesc')}
                onClick={handleLogout}
                danger
              />
            </div>
          ) : (
            <ChangePasswordForm onClose={() => setPasswordOpen(false)} t={t} />
          )}
        </SectionCard>

        {isAdminOrOwner && <SectionCard
          icon={Building2}
          title={t('ws.workspaceSection')}
          description={t('ws.workspaceDescription')}
        >
          <div className="space-y-1 divide-y divide-gray-100">
            <InfoRow label={t('ws.name')} value={context.workspace.name} />
            <InfoRow label={t('ws.plan')} value={context.workspace.plan_label} />
            <InfoRow
              label={t('ws.subscriptionStatus')}
              value={context.workspace.subscription_status || t('ws.undefined')}
            />
            <InfoRow label={t('ws.slug')} value={context.workspace.slug} mono />
            <InfoRow label={t('ws.id')} value={context.workspace.id.slice(0, 8)} mono />
          </div>
          <div className="mt-5 space-y-2.5">
            <ActionRow
              icon={CreditCard}
              label={t('ws.billingAndPlans')}
              description={t('ws.billingAndPlansDesc')}
              onClick={() => navigate('/workspace/billing')}
            />
            <ActionRow
              icon={Palette}
              label={t('ws.brandingSection')}
              description={t('ws.brandingDesc')}
              onClick={() => {
                /* no-op por ahora */
              }}
            />
          </div>
        </SectionCard>}

        <SectionCard
          icon={Globe}
          title={t('ws.preferencesSection')}
          description={t('ws.preferencesDesc')}
        >
          <div className="space-y-3">
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-900">{t('ws.languageSetting')}</p>
                  <p className="mt-0.5 text-[11px] text-gray-500">{t('ws.languageDesc')}</p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-gray-700 ring-1 ring-gray-200">
                  Español
                </span>
              </div>
            </div>

            <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-900">{t('ws.timezoneSetting')}</p>
                  <p className="mt-0.5 text-[11px] text-gray-500">
                    {t('ws.timezoneDesc')}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-gray-700 ring-1 ring-gray-200">
                  {t('ws.automatic')}
                </span>
              </div>
            </div>

            <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-900">{t('ws.emailNotifications')}</p>
                  <p className="mt-0.5 text-[11px] text-gray-500">
                    {t('ws.emailNotificationsDesc')}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
                  {t('ws.notificationsActive')}
                </span>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </>
  )
}
