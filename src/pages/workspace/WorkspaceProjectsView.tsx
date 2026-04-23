import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Code2,
  FolderKanban,
  Layers,
  Loader2,
  Plus,
  Rocket,
  Search,
  Sparkles,
  Trash2,
  XCircle,
} from 'lucide-react'

import type { WorkspaceContextResponse } from '../../services/workspace'
import { projectsApi } from '../../services/projects'
import { API_BASE_URL } from '../../services/api'
import { useWorkspaceOutletContext } from './WorkspaceLayout'
import { useI18n } from '../../i18n'

type Project = WorkspaceContextResponse['projects'][number]

function formatRelative(iso: string | null | undefined, t: (key: string) => string): string {
  if (!iso) return t('ws.noDate')
  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) return t('ws.noDate')
  const seconds = Math.max(0, Math.round((Date.now() - parsed.getTime()) / 1000))
  if (seconds < 60) return t('ws.justNow')
  if (seconds < 3600) return t('ws.minutesAgo').replace('{n}', String(Math.round(seconds / 60)))
  if (seconds < 86400) return t('ws.hoursAgo').replace('{n}', String(Math.round(seconds / 3600)))
  if (seconds < 86400 * 30) return t('ws.daysAgo').replace('{n}', String(Math.round(seconds / 86400)))
  return parsed.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
}

function prettify(value?: string | null): string {
  if (!value) return ''
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^\w/u, (char) => char.toUpperCase())
}

function initialsFromName(name: string): string {
  const cleaned = name.trim()
  if (!cleaned) return 'PR'
  const parts = cleaned.split(/\s+/).filter(Boolean)
  if (parts.length === 1) {
    return cleaned.slice(0, 2).toUpperCase()
  }
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

interface DeploymentBadgeSpec {
  icon: LucideIcon
  label: string
  tone: 'success' | 'warning' | 'danger' | 'muted'
}

function deploymentSpec(status: string | null | undefined, t: (key: string) => string): DeploymentBadgeSpec | null {
  if (!status) return null
  const normalized = status.toLowerCase()
  if (['ready', 'deployed', 'completed', 'success', 'live'].some((key) => normalized.includes(key))) {
    return { icon: CheckCircle2, label: t('ws.deployed'), tone: 'success' }
  }
  if (['building', 'queued', 'running', 'generating', 'in_progress'].some((key) => normalized.includes(key))) {
    return { icon: Rocket, label: t('ws.generating'), tone: 'warning' }
  }
  if (['failed', 'error', 'cancelled'].some((key) => normalized.includes(key))) {
    return { icon: XCircle, label: t('ws.error'), tone: 'danger' }
  }
  return { icon: Sparkles, label: prettify(status), tone: 'muted' }
}

const deploymentToneClasses: Record<DeploymentBadgeSpec['tone'], string> = {
  success: 'bg-emerald-50 text-emerald-600 ring-emerald-200',
  warning: 'bg-amber-50 text-amber-600 ring-amber-200',
  danger: 'bg-rose-50 text-rose-600 ring-rose-200',
  muted: 'bg-gray-100 text-gray-500 ring-gray-200',
}

function ProjectCard({
  project,
  accent,
  onDelete,
  deleting,
}: {
  project: Project
  accent: string
  onDelete: () => void
  deleting: boolean
}) {
  const { t } = useI18n()
  const title = project.name || t('ws.untitledProject')
  const subtitleParts = [prettify(project.poc_type), prettify(project.vertical)].filter(Boolean)
  const badge = deploymentSpec(project.latest_deployment_status, t)
  const previewHref = project.current_poc_id ? `/preview/${project.current_poc_id}` : null
  const initials = initialsFromName(title)

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-md">
      <div
        className="relative h-28 w-full overflow-hidden"
        style={{
          background: project.thumbnail_url
            ? undefined
            : `linear-gradient(135deg, ${accent}, ${accent}CC)`,
        }}
      >
        {project.thumbnail_url ? (
          <img src={`${API_BASE_URL}${project.thumbnail_url}`} alt={title} className="h-full w-full object-cover" />
        ) : (
          <>
            <div className="absolute inset-0 opacity-20">
              <svg viewBox="0 0 200 80" className="h-full w-full">
                <circle cx="160" cy="20" r="48" fill="none" stroke="white" strokeWidth="0.6" />
                <circle cx="160" cy="20" r="32" fill="none" stroke="white" strokeWidth="0.6" />
                <circle cx="160" cy="20" r="16" fill="none" stroke="white" strokeWidth="0.6" />
              </svg>
            </div>
            <div className="absolute left-4 top-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-sm font-semibold text-white backdrop-blur-sm">
              {initials}
            </div>
          </>
        )}
        {badge && (
          <span
            className={`absolute right-3 top-3 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ${deploymentToneClasses[badge.tone]}`}
          >
            <badge.icon size={10} />
            {badge.label}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-sm font-semibold text-gray-900">{title}</h3>
        {subtitleParts.length > 0 && (
          <p className="mt-1 truncate text-[11px] text-gray-400">{subtitleParts.join(' · ')}</p>
        )}

        <div className="mt-3 flex items-center gap-3 text-[11px] text-gray-500">
          <span className="inline-flex items-center gap-1">
            <Layers size={12} className="text-gray-400" />
            {project.iterations_count} iter.
          </span>
          <span className="inline-flex items-center gap-1">
            <Rocket size={12} className="text-gray-400" />
            {project.deployments_count} deploy
          </span>
          <span className="ml-auto inline-flex items-center gap-1 text-gray-400">
            <Clock size={11} />
            {formatRelative(project.updated_at, t)}
          </span>
        </div>

        <div className="mt-4 flex items-center gap-2">
          {previewHref ? (
            <Link
              to={previewHref}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:border-blue-200 hover:text-blue-600"
            >
              {t('ws.openPreview')}
              <ArrowUpRight size={12} />
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-dashed border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-400"
              title={t('ws.noPreviewYet')}
            >
              {t('ws.noPreview')}
            </button>
          )}
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            title={t('ws.deleteProject')}
            className="inline-flex items-center justify-center rounded-lg border border-gray-200 p-1.5 text-gray-400 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
          >
            {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
          </button>
        </div>
      </div>
    </div>
  )
}

function EmptyState({ onCreate, brandPrimary }: { onCreate: () => void; brandPrimary: string }) {
  const { t } = useI18n()
  return (
    <div className="rounded-xl border border-dashed border-gray-200 bg-white p-10 text-center">
      <div
        className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{ background: `${brandPrimary}15`, color: brandPrimary }}
      >
        <FolderKanban size={24} />
      </div>
      <h3 className="mt-4 text-base font-semibold text-gray-900">{t('ws.noProjectsYet')}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500">
        {t('ws.noProjectsDescription')}
      </p>
      <button
        type="button"
        onClick={onCreate}
        className="mt-5 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm transition-shadow hover:shadow-md"
        style={{ background: brandPrimary }}
      >
        <Plus size={14} />
        {t('ws.createProject')}
      </button>
    </div>
  )
}

export default function WorkspaceProjectsView() {
  const navigate = useNavigate()
  const { t } = useI18n()
  const { context, brand, setHeader, refreshContext } = useWorkspaceOutletContext()
  const [query, setQuery] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  useEffect(() => {
    setHeader(t('ws.projects'), t('ws.allProjects'))
  }, [setHeader, t])

  const projects = context.projects
  const totalProjects = projects.length

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return projects
    return projects.filter((project) => {
      const haystack = [project.name, project.poc_type, project.vertical, project.archetype]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(normalized)
    })
  }, [projects, query])

  const handleCreate = () => {
    navigate('/workspace/poc-generator')
  }

  const handleDeleteConfirm = async () => {
    if (!confirmDeleteId) return
    try {
      setDeletingId(confirmDeleteId)
      setConfirmDeleteId(null)
      await projectsApi.deleteProject(confirmDeleteId)
      await refreshContext()
    } catch {
      // silently fail — the project list will refresh anyway
    } finally {
      setDeletingId(null)
    }
  }

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
          <h2 className="text-xl font-semibold">
            {`${totalProjects} ${t('ws.projects').toLowerCase()}`}
          </h2>
          <p className="mt-1 text-sm text-blue-100">
            {t('ws.projectsSubtitle')}
          </p>
        </div>
        <div className="relative flex items-center gap-2">
          <button
            type="button"
            onClick={handleCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm transition-shadow hover:shadow-md"
          >
            <Plus size={14} />
            {t('ws.newProject')}
          </button>
        </div>
      </div>

      {totalProjects === 0 ? (
        <EmptyState onCreate={handleCreate} brandPrimary={brand.primary} />
      ) : (
        <>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t('ws.searchProjects')}
                className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-700 placeholder:text-gray-400 outline-none transition-colors focus:border-blue-300"
              />
            </div>
            <div className="text-xs text-gray-400">
              {t('ws.showingOf').replace('{shown}', String(filtered.length)).replace('{total}', String(totalProjects))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
              <Code2 size={18} className="mx-auto mb-2 text-gray-300" />
              {t('ws.noProjectsMatch').replace('{query}', query)}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  accent={brand.primary}
                  onDelete={() => setConfirmDeleteId(project.id)}
                  deleting={deletingId === project.id}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Delete confirmation modal */}
      {confirmDeleteId && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          onClick={() => setConfirmDeleteId(null)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-[0_24px_80px_rgba(0,0,0,0.15)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50">
              <AlertTriangle className="h-7 w-7 text-rose-500" />
            </div>
            <h3 className="mt-5 text-center text-xl font-bold text-slate-900">
              {t('ws.deleteProjectTitle')}
            </h3>
            <p className="mt-3 text-center text-sm text-slate-500 leading-relaxed">
              {t('ws.deleteProjectMessage')}
            </p>
            <div className="mt-8 flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                {t('ws.cancel')}
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="flex-1 rounded-xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-rose-500"
              >
                {t('ws.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
