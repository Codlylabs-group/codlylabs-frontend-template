import { useEffect, useMemo, useState } from 'react'
import {
  Check,
  Clock,
  Copy,
  Crown,
  Mail,
  Search,
  Shield,
  ShieldCheck,
  UserPlus,
  Users,
} from 'lucide-react'

import type { WorkspaceContextResponse } from '../../services/workspace'
import { useWorkspaceOutletContext } from './WorkspaceLayout'
import { useI18n } from '../../i18n'

type Member = WorkspaceContextResponse['members'][number]
type Invitation = WorkspaceContextResponse['pending_invitations'][number]

function formatRelative(iso: string | null | undefined, t: (key: string) => string): string {
  if (!iso) return t('ws.never')
  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) return t('ws.never')
  const seconds = Math.max(0, Math.round((Date.now() - parsed.getTime()) / 1000))
  if (seconds < 60) return t('ws.justNow')
  if (seconds < 3600) return t('ws.minutesAgo').replace('{n}', String(Math.round(seconds / 60)))
  if (seconds < 86400) return t('ws.hoursAgo').replace('{n}', String(Math.round(seconds / 3600)))
  if (seconds < 86400 * 30) return t('ws.daysAgo').replace('{n}', String(Math.round(seconds / 86400)))
  return parsed.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatExpiry(iso: string | null | undefined, t: (key: string) => string): string {
  if (!iso) return t('ws.noExpiry')
  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) return t('ws.noExpiry')
  const seconds = Math.round((parsed.getTime() - Date.now()) / 1000)
  if (seconds <= 0) return t('ws.expired')
  if (seconds < 3600) return t('ws.expiresInMin').replace('{n}', String(Math.round(seconds / 60)))
  if (seconds < 86400) return t('ws.expiresInH').replace('{n}', String(Math.round(seconds / 3600)))
  return t('ws.expiresInD').replace('{n}', String(Math.round(seconds / 86400)))
}

const roleStyles: Record<string, { badge: string; icon: typeof Crown; label: string }> = {
  owner: { badge: 'bg-purple-50 text-purple-700 ring-purple-200', icon: Crown, label: 'Owner' },
  admin: { badge: 'bg-indigo-50 text-indigo-700 ring-indigo-200', icon: ShieldCheck, label: 'Admin' },
  member: { badge: 'bg-blue-50 text-blue-600 ring-blue-200', icon: Shield, label: 'Member' },
}

function roleStyle(role?: string | null) {
  const key = (role || 'member').toLowerCase()
  return roleStyles[key] || roleStyles.member
}

function buildPresenceStyles(t: (key: string) => string): Record<string, { dot: string; label: string }> {
  return {
    online: { dot: 'bg-emerald-500', label: t('ws.online') },
    away: { dot: 'bg-amber-400', label: t('ws.away') },
    offline: { dot: 'bg-gray-300', label: t('ws.offline') },
  }
}

function MembersList({ members, query }: { members: Member[]; query: string }) {
  const { t } = useI18n()
  const presenceStyles = useMemo(() => buildPresenceStyles(t), [t])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return members
    return members.filter((member) => {
      const haystack = [member.name, member.full_name, member.email, member.role]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(needle)
    })
  }, [members, query])

  if (filtered.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
        <Users size={18} className="mx-auto mb-2 text-gray-300" />
        {t('ws.noMembersMatch').replace('{query}', query)}
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="hidden items-center border-b border-gray-100 px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400 sm:flex">
        <div className="flex-1">{t('ws.memberCol')}</div>
        <div className="w-32">{t('ws.roleCol')}</div>
        <div className="w-40 text-right">{t('ws.lastAccess')}</div>
      </div>

      <div className="divide-y divide-gray-100">
        {filtered.map((member) => {
          const presence = presenceStyles[member.status] || presenceStyles.offline
          const role = roleStyle(member.role)
          const RoleIcon = role.icon
          return (
            <div
              key={member.id}
              className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-gray-50 sm:flex-row sm:items-center"
            >
              <div className="flex flex-1 items-center gap-3">
                <div className="relative">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
                    {member.initials}
                  </div>
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${presence.dot}`}
                    title={presence.label}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-gray-900">{member.name}</div>
                  <div className="truncate text-xs text-gray-400">{member.email}</div>
                </div>
              </div>
              <div className="w-32">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ${role.badge}`}
                >
                  <RoleIcon size={10} />
                  {role.label}
                </span>
              </div>
              <div className="w-40 text-xs text-gray-400 sm:text-right">
                <Clock size={11} className="mr-1 inline" />
                {formatRelative(member.last_login, t)}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function InvitationRow({ invitation }: { invitation: Invitation }) {
  const { t } = useI18n()
  const [copied, setCopied] = useState(false)
  const role = roleStyle(invitation.role)
  const RoleIcon = role.icon
  const absoluteUrl = `${window.location.origin}${invitation.accept_url}`

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(absoluteUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      // noop — clipboard blocked
    }
  }

  return (
    <div className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-gray-50 sm:flex-row sm:items-center">
      <div className="flex flex-1 items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-500">
          <Mail size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-gray-900">
            {invitation.email || t('ws.openInvitation')}
          </div>
          <div className="truncate text-xs text-gray-400">{formatExpiry(invitation.expires_at, t)}</div>
        </div>
      </div>
      <div className="w-32">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ${role.badge}`}
        >
          <RoleIcon size={10} />
          {role.label}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={copyLink}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-blue-200 hover:text-blue-600"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? t('ws.copied') : t('ws.copyLink')}
        </button>
      </div>
    </div>
  )
}

function PendingInvitationsList({ invitations }: { invitations: Invitation[] }) {
  const { t } = useI18n()

  if (invitations.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
        <Mail size={18} className="mx-auto mb-2 text-gray-300" />
        {t('ws.noPendingInvitations')}
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="divide-y divide-gray-100">
        {invitations.map((invitation) => (
          <InvitationRow key={invitation.id} invitation={invitation} />
        ))}
      </div>
    </div>
  )
}

export default function WorkspaceMembersView() {
  const { t } = useI18n()
  const { context, brand, setHeader, openInviteModal } = useWorkspaceOutletContext()
  const [query, setQuery] = useState('')

  useEffect(() => {
    setHeader(t('ws.teamTitle'), t('ws.teamSubtitle'))
  }, [setHeader, t])

  const members = context.members
  const invitations = context.pending_invitations
  const usage = context.usage
  const seatLabel = usage.seats_limit === 'unlimited' ? t('ws.unlimited') : `${usage.seats_used} ${t('ws.seatsOf')} ${usage.seats_limit}`
  const pendingSeats = usage.seats_reserved > usage.seats_used ? usage.seats_reserved - usage.seats_used : 0

  return (
    <>
      <div
        className="relative mb-6 flex flex-col gap-4 overflow-hidden rounded-xl p-6 text-white sm:flex-row sm:items-center sm:justify-between"
        style={{ background: `linear-gradient(135deg, ${brand.primary}, ${brand.primaryDark})` }}
      >
        <div className="absolute right-0 top-0 h-40 w-40 opacity-10">
          <svg viewBox="0 0 200 200" className="h-full w-full">
            <circle cx="100" cy="100" r="80" fill="none" stroke="white" strokeWidth="0.5" />
            <circle cx="100" cy="100" r="60" fill="none" stroke="white" strokeWidth="0.5" />
            <circle cx="100" cy="100" r="40" fill="none" stroke="white" strokeWidth="0.5" />
          </svg>
        </div>
        <div className="relative">
          <h2 className="text-xl font-semibold">{t('ws.teamInWorkspace')}</h2>
          <p className="mt-1 text-sm text-blue-100">
            {members.length} {members.length === 1 ? t('ws.activeMember') : t('ws.activeMembers')}
            {invitations.length > 0 && ` · ${invitations.length} ${t('ws.pendingInvitations')}`}
            {` · ${seatLabel} seats`}
          </p>
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={openInviteModal}
            className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm transition-shadow hover:shadow-md"
          >
            <UserPlus size={14} />
            {t('ws.inviteMember')}
          </button>
        </div>
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('ws.searchMembers')}
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-700 placeholder:text-gray-400 outline-none transition-colors focus:border-blue-300"
          />
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="inline-flex items-center gap-1">
            <Users size={12} className="text-gray-400" />
            {members.length} {t('ws.membersLabel')}
          </span>
          {pendingSeats > 0 && (
            <span className="inline-flex items-center gap-1">
              <Mail size={12} className="text-gray-400" />
              {pendingSeats} {t('ws.reserved')}
            </span>
          )}
        </div>
      </div>

      <section className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">{t('ws.activeMemList')}</h3>
          <span className="text-[11px] text-gray-400">{members.length} total</span>
        </div>
        <MembersList members={members} query={query} />
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">{t('ws.pendingInvList')}</h3>
          <span className="text-[11px] text-gray-400">{invitations.length} total</span>
        </div>
        <PendingInvitationsList invitations={invitations} />
      </section>
    </>
  )
}
