import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../../i18n'
import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Clock,
  Code2,
  Eye,
  FolderKanban,
  Minus,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'

import { type StatChange, type WorkspaceContextResponse } from '../../services/workspace'
import { useWorkspaceOutletContext } from './WorkspaceLayout'
import { resolveWorkspaceBrand } from '../../utils/platformBranding'
import { TENANT_STATIC_BRANDING } from '../../constants/tenantBranding'

type IconType = LucideIcon

function StatCard({
  icon: Icon,
  label,
  value,
  change,
  color,
}: {
  icon: IconType
  label: string
  value: string
  change?: StatChange | null
  color: string
}) {
  const renderChange = () => {
    if (!change) return null
    const ArrowIcon = change.direction === 'flat' ? Minus : change.direction === 'up' ? TrendingUp : TrendingDown
    const colorClass =
      change.direction === 'flat'
        ? 'text-gray-400'
        : change.positive
          ? 'text-emerald-600'
          : 'text-red-500'
    return (
      <span
        className={`flex items-center gap-0.5 text-xs font-medium ${colorClass}`}
        title={`${change.label} vs período anterior (30d)`}
      >
        <ArrowIcon size={12} />
        {change.label}
      </span>
    )
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: `${color}15` }}>
          <Icon size={20} style={{ color }} />
        </div>
        {renderChange()}
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="mt-0.5 text-xs text-gray-400">{label}</div>
    </div>
  )
}

function ActivityFeed({
  activity,
}: {
  activity: WorkspaceContextResponse['activity']
}) {
  const { t } = useI18n()
  const iconMap: Record<string, IconType> = {
    project: CheckCircle2,
    preview: Eye,
    workspace: Sparkles,
  }
  const colorMap: Record<string, string> = {
    project: '#10B981',
    preview: '#0EA5E9',
    workspace: '#7C3AED',
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-900">{t('ws.recentActivity')}</h3>
      </div>
      <div className="space-y-3">
        {activity.map((item) => {
          const Icon = iconMap[item.type] || Sparkles
          const color = colorMap[item.type] || '#7C3AED'
          return (
            <div key={item.id} className="group flex items-start gap-3">
              <div
                className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                style={{ background: `${color}12` }}
              >
                <Icon size={16} style={{ color }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="leading-snug text-sm text-gray-700">{item.text}</p>
                <div className="mt-0.5 flex items-center gap-2">
                  <span className="text-xs text-gray-400">{item.time_label}</span>
                  <span className="text-xs text-gray-300">·</span>
                  <span className="text-xs text-gray-500">{item.actor}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ActivePreviews({ previews }: { previews: WorkspaceContextResponse['active_previews'] }) {
  const { t } = useI18n()
  const displayedLimit = 5
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">{t('ws.activePreviews')}</h3>
        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600">
          {previews.length}/{displayedLimit}
        </span>
      </div>
      <div className="space-y-3">
        {previews.length === 0 ? (
          <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-500">
            {t('ws.noActivePreviews')}
          </div>
        ) : (
          previews.map((preview) => (
            <Link
              key={preview.poc_id}
              to={preview.preview_url}
              className="group flex cursor-pointer items-center gap-3 rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100"
            >
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-gray-900">{preview.name}</div>
                <div className="mt-0.5 flex items-center gap-2">
                  <span className="text-xs text-gray-400">{preview.vertical}</span>
                  <span className="text-xs text-gray-300">·</span>
                  <span className="text-xs text-gray-400">
                    <Clock size={10} className="mr-0.5 inline" />
                    {preview.uptime}
                  </span>
                </div>
              </div>
              <ArrowUpRight size={16} className="text-gray-300 transition-colors group-hover:text-blue-500" />
            </Link>
          ))
        )}
      </div>
    </div>
  )
}

function TeamOverview({
  members,
  onInvite,
}: {
  members: WorkspaceContextResponse['members']
  onInvite: () => void
}) {
  const { t } = useI18n()
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">{t('ws.team')}</h3>
        <button onClick={onInvite} className="text-xs font-medium text-blue-600 hover:text-blue-700">
          {t('ws.invite')}
        </button>
      </div>
      <div className="space-y-2.5">
        {members.length === 0 ? (
          <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-500">
            {t('ws.noTeamMembers')}
          </div>
        ) : (
          members.slice(0, 4).map((member) => (
            <div key={member.id} className="flex items-center gap-3">
              <div className="relative">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                  {member.initials}
                </div>
                <div
                  className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white ${
                    member.status === 'online'
                      ? 'bg-emerald-500'
                      : member.status === 'away'
                        ? 'bg-amber-400'
                        : 'bg-gray-300'
                  }`}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm text-gray-700">{member.name}</div>
              </div>
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                  member.role === 'owner' || member.role === 'admin'
                    ? 'bg-purple-50 text-purple-600'
                    : member.role === 'member'
                      ? 'bg-blue-50 text-blue-600'
                      : 'bg-gray-50 text-gray-500'
                }`}
              >
                {member.role === 'owner' ? 'Owner' : member.role === 'admin' ? 'Admin' : 'Member'}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function UsageBar({
  label,
  used,
  total,
  unit,
  color,
}: {
  label: string
  used: number
  total: number | 'unlimited'
  unit: string
  color: string
}) {
  const { t } = useI18n()
  const isUnlimited = total === 'unlimited'
  const pct = !isUnlimited && total > 0 ? Math.round((used / total) * 100) : 0
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">{label}</span>
        {isUnlimited ? (
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500">
              {used} {t('ws.inUse')}
            </span>
            <span className="text-xs font-medium text-emerald-600">Unlimited</span>
          </div>
        ) : (
          <span className="text-xs text-gray-400">
            {used}/{total} {unit}
          </span>
        )}
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
        {isUnlimited ? (
          <div
            className="h-full w-full rounded-full opacity-35"
            style={{ background: `linear-gradient(90deg, ${color}, ${color}33)` }}
          />
        ) : (
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.min(pct, 100)}%`,
              background: pct > 80 ? '#EF4444' : pct > 60 ? '#F59E0B' : color,
            }}
          />
        )}
      </div>
    </div>
  )
}

function UsagePanel({
  usage,
  brand,
}: {
  usage: WorkspaceContextResponse['usage']
  brand: WorkspaceContextResponse['workspace']['brand']
}) {
  const { t } = useI18n()
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">{t('ws.planUsage')}</h3>
        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">{usage.plan_label}</span>
      </div>
      <div className="space-y-3">
        <UsageBar label={t('ws.pocsGenerated')} used={usage.pocs_used} total={usage.pocs_limit} unit="mes" color={brand.primary} />
        <UsageBar label={t('ws.previewsActive')} used={usage.previews_used} total={usage.previews_limit} unit="" color={brand.primary} />
        <UsageBar label={t('ws.seats')} used={usage.seats_used} total={usage.seats_limit} unit="" color={brand.primary} />
      </div>
    </div>
  )
}

export default function WorkspaceDashboardView() {

  const { context, openInviteModal, setHeader } = useWorkspaceOutletContext()
  const { t } = useI18n()

  useEffect(() => {
    setHeader('Dashboard', t('ws.overviewSubtitle'))
  }, [setHeader, t])

  // On the CodlyLabs central workspace, always render with the platform
  // palette — a tenant admin editing their draft branding must not see their
  // colors bleed into the CodlyLabs UI they're editing from. On a tenant
  // subdomain / dedicated build, use the brand as-is.
  const brand = useMemo(
    () => resolveWorkspaceBrand(context.workspace.brand, {
      isTenantBuild: TENANT_STATIC_BRANDING !== null,
    }),
    [context.workspace.brand],
  )

  const statCards = useMemo(
    () => [
      {
        icon: FolderKanban,
        label: t('ws.activeProjects'),
        value: String(context.stats.active_projects),
        change: context.stats.active_projects_change,
        color: brand.primary,
      },
      {
        icon: Code2,
        label: t('ws.generatedPocs'),
        value: String(context.stats.generated_pocs),
        change: context.stats.generated_pocs_change,
        color: '#7C3AED',
      },
      {
        icon: Activity,
        label: t('ws.successRate'),
        value: `${context.stats.success_rate}%`,
        change: context.stats.success_rate_change,
        color: '#10B981',
      },
      {
        icon: BarChart3,
        label: t('ws.avgTime'),
        value: `${context.stats.average_generation_minutes}m`,
        change: context.stats.average_generation_minutes_change,
        color: '#0EA5E9',
      },
    ],
    [context, t],
  )

  return (
    <>
      <div
        className="relative mb-6 overflow-hidden rounded-xl p-6 text-white"
        style={{
          background: `linear-gradient(135deg, ${brand.primary}, ${brand.primaryDark})`,
        }}
      >
        <div className="absolute right-0 top-0 h-64 w-64 opacity-10">
          <svg viewBox="0 0 200 200" className="h-full w-full">
            <circle cx="100" cy="100" r="80" fill="none" stroke="white" strokeWidth="0.5" />
            <circle cx="100" cy="100" r="60" fill="none" stroke="white" strokeWidth="0.5" />
            <circle cx="100" cy="100" r="40" fill="none" stroke="white" strokeWidth="0.5" />
          </svg>
        </div>
        <div className="relative">
          <h2 className="mb-1 text-xl font-semibold">{t('ws.welcomeTo')} {context.workspace.name}</h2>
          <p className="text-sm text-blue-100">
            {t('ws.youHave')} {context.summary.pending_recommendations} {t('ws.pendingRecs')}{' '}
            {context.summary.active_previews} {t('ws.activePreviewsSuffix')}
          </p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-4">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <ActivityFeed activity={context.activity} />
        </div>

        <div className="space-y-6">
          <div id="workspace-active-previews" className="scroll-mt-24 rounded-xl transition-shadow">
            <ActivePreviews previews={context.active_previews} />
          </div>
          <div id="workspace-team" className="scroll-mt-24 rounded-xl transition-shadow">
            <TeamOverview members={context.members} onInvite={openInviteModal} />
          </div>
          <UsagePanel usage={context.usage} brand={brand} />
        </div>
      </div>
    </>
  )
}
