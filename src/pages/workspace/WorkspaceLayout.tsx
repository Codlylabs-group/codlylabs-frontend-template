import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react'
import { Link, Outlet, useLocation, useNavigate, useOutletContext } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import {
  Bell,
  Building2,
  Check,
  ChevronDown,
  Code2,
  CreditCard,
  Eye,
  FolderKanban,
  Globe,
  Layers,
  LayoutDashboard,
  Lightbulb,
  Loader2,
  LogOut,
  Mail,
  Menu,
  Package,
  Palette,
  Plus,
  Settings,
  Shield,
  UserCircle,
  Users,
  X,
} from 'lucide-react'

import { authApi, saveAuthReturnUrl, type UserOrganizationSummary } from '../../services/auth'
import {
  workspaceApi,
  type WorkspaceContextResponse,
  type WorkspaceInvitationSummary,
} from '../../services/workspace'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { clearAuth, setAuthData } from '../../store/userSlice'
import { useI18n } from '../../i18n'
import { clearOnboardingState } from '../../utils/onboardingStorage'
import { buildDocumentTitle, isTenantSubdomainHost, resolveWorkspaceBrand } from '../../utils/platformBranding'
import { TENANT_STATIC_BRANDING } from '../../constants/tenantBranding'

type IconType = LucideIcon

interface NavItem {
  icon: IconType
  label: string
  to?: string
  scrollTo?: string
  disabled?: boolean
  badge?: string
  matchPaths?: string[]
}

interface NavSection {
  label: string
  items: NavItem[]
}

export interface WorkspaceHeader {
  title: string
  subtitle?: string
}

export interface WorkspaceOutletContext {
  context: WorkspaceContextResponse
  setContext: Dispatch<SetStateAction<WorkspaceContextResponse | null>>
  refreshContext: () => Promise<void>
  openInviteModal: () => void
  scrollToAnchor: (anchorId: string) => void
  setHeader: (title: string, subtitle?: string) => void
  brand: WorkspaceContextResponse['workspace']['brand']
}

export function useWorkspaceOutletContext(): WorkspaceOutletContext {
  return useOutletContext<WorkspaceOutletContext>()
}

function PoweredByBadge({ variant = 'light' }: { variant?: 'light' | 'dark' }) {
  return (
    <div className={`flex items-center gap-1.5 text-xs ${variant === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>
      <span>Powered by</span>
      <span className="font-semibold text-gray-600" style={{ letterSpacing: '-0.02em' }}>
        Codly<span style={{ color: '#7C3AED' }}>Labs</span>
      </span>
    </div>
  )
}

function buildNavSections(context: WorkspaceContextResponse | null, t: (key: string) => string): NavSection[] {
  const activeProjects = context?.stats.active_projects ?? 0
  const memberCount = context?.members.length ?? 0
  const billingEnabled = (import.meta.env.VITE_ENABLE_BILLING ?? 'true') !== 'false'
  const userRole = (context?.user.role || 'member').toLowerCase()
  const isAdminOrOwner = userRole === 'owner' || userRole === 'admin'
  // White Label is a CodlyLabs-only feature: tenants (users on {slug}.codlylabs.ai
  // or dedicated tenant builds with TENANT_STATIC_BRANDING baked in) must not see
  // it — otherwise they'd try to white-label inside their own white-label.
  const isTenantWorkspace = TENANT_STATIC_BRANDING !== null || isTenantSubdomainHost()

  return [
    {
      label: t('ws.principal'),
      items: [
        { icon: LayoutDashboard, label: t('ws.dashboard'), to: '/workspace' },
        { icon: Code2, label: 'Generar PoC', to: '/workspace/discovery?tier=poc' },
        { icon: Layers, label: t('ws.verticals'), to: '/workspace/verticals' },
        {
          icon: FolderKanban,
          label: t('ws.projects'),
          to: '/workspace/projects',
          badge: activeProjects > 0 ? String(activeProjects) : undefined,
        },
        { icon: Package, label: t('ws.marketplace'), disabled: true },
      ],
    },
    ...(isAdminOrOwner
      ? [
          {
            label: '',
            items: [
              {
                icon: Users,
                label: t('ws.members'),
                to: '/workspace/members',
                badge: memberCount > 0 ? String(memberCount) : undefined,
              },
              { icon: Shield, label: t('ws.rolesPermissions'), disabled: true },
            ],
          } as NavSection,
        ]
      : []),
    {
      label: '',
      items: [
        ...(isAdminOrOwner && !isTenantWorkspace
          ? [{ icon: Palette, label: 'White Label', disabled: true } as NavItem]
          : []),
        ...(isAdminOrOwner && billingEnabled
          ? [{ icon: CreditCard, label: t('ws.billing'), to: '/workspace/billing' } as NavItem]
          : []),
        { icon: Settings, label: t('ws.settings'), to: '/workspace/settings' },
      ],
    },
  ]
}

function Sidebar({
  collapsed,
  onToggle,
  workspace,
  brand,
  user,
  sections,
  currentPath,
  onScrollTo,
}: {
  collapsed: boolean
  onToggle: () => void
  workspace: WorkspaceContextResponse['workspace']
  brand: WorkspaceContextResponse['workspace']['brand']
  user: WorkspaceContextResponse['user']
  sections: NavSection[]
  currentPath: string
  onScrollTo: (anchorId: string) => void
}) {
  const { t } = useI18n()
  const userLabel = user.full_name?.trim() || user.email.split('@')[0]
  const userInitials =
    userLabel
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('') || 'US'
  const rawWorkspaceName = workspace.name?.trim() || ''
  const isDefaultWorkspaceName = rawWorkspaceName.toLowerCase() === 'mi workspace'
  const workspaceLabel = !rawWorkspaceName || isDefaultWorkspaceName
    ? userLabel
    : rawWorkspaceName
  const workspaceSubLabel = workspace.plan_label?.trim() || 'Workspace empresarial'

  const isItemActive = (item: NavItem): boolean => {
    if (!item.to) return false
    if (item.to === '/workspace') return currentPath === '/workspace'
    if (currentPath === item.to) return true
    if (currentPath.startsWith(`${item.to}/`)) return true
    if (item.matchPaths?.some((path) => currentPath.startsWith(path))) return true
    return false
  }

  return (
    <aside
      className={`fixed left-0 top-0 z-30 flex h-screen flex-col border-r border-gray-200 bg-white transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}
    >
      <div className="flex h-16 items-center gap-3 border-b border-gray-100 px-4">
        <div
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
          style={{ background: `linear-gradient(135deg, ${brand.primary}, ${brand.accent})` }}
        >
          {userInitials}
        </div>
        {!collapsed && (
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-semibold text-gray-900">{workspaceLabel}</span>
            <span className="text-xs text-gray-400">{workspaceSubLabel}</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="ml-auto flex-shrink-0 text-gray-400 hover:text-gray-600"
          aria-label={t('ws.toggleSidebar')}
        >
          {collapsed ? <Menu size={18} /> : <X size={18} />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {sections.map((section, sectionIndex) => (
          <div key={`${section.label}-${sectionIndex}`} className="mb-4">
            {!collapsed && (
              <div className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                {section.label}
              </div>
            )}
            {section.items.map((item) => {
              const active = isItemActive(item)
              const baseClasses = `group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all`
              const stateClasses = item.disabled
                ? 'cursor-not-allowed text-gray-300'
                : active
                  ? 'font-medium text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              const className = `${baseClasses} ${stateClasses}`
              const style = active
                ? { background: `linear-gradient(135deg, ${brand.primary}, ${brand.primaryDark})` }
                : undefined
              const Icon = item.icon

              const inner = (
                <>
                  <Icon
                    size={18}
                    className={
                      item.disabled
                        ? 'text-gray-300'
                        : active
                          ? 'text-white'
                          : 'text-gray-400 group-hover:text-gray-600'
                    }
                  />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.disabled && (
                        <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-gray-400">
                          {item.badge || t('ws.comingSoon')}
                        </span>
                      )}
                      {item.badge && !item.disabled && (
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                            active
                              ? 'bg-white/20 text-white'
                              : item.badge === 'Nuevo'
                                ? 'bg-purple-100 text-purple-600'
                                : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </>
              )

              const titleAttr = collapsed
                ? item.disabled
                  ? `${item.label} ${t('ws.comingSoonFull')}`
                  : item.label
                : item.disabled
                  ? t('ws.comingSoon')
                  : undefined

              if (item.disabled) {
                return (
                  <button
                    key={item.label}
                    type="button"
                    disabled
                    className={className}
                    title={titleAttr}
                    aria-disabled="true"
                  >
                    {inner}
                  </button>
                )
              }

              if (item.scrollTo) {
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => onScrollTo(item.scrollTo!)}
                    className={className}
                    title={titleAttr}
                  >
                    {inner}
                  </button>
                )
              }

              if (item.to) {
                return (
                  <Link key={item.label} to={item.to} className={className} style={style} title={titleAttr}>
                    {inner}
                  </Link>
                )
              }

              return (
                <button key={item.label} type="button" className={className} title={titleAttr}>
                  {inner}
                </button>
              )
            })}
          </div>
        ))}
      </nav>

      <div className={`border-t border-gray-100 p-4 ${collapsed ? 'flex justify-center' : ''}`}>
        {collapsed ? (
          <div className="flex h-6 w-6 items-center justify-center rounded" style={{ background: '#7C3AED' }}>
            <span className="text-[8px] font-bold text-white">CL</span>
          </div>
        ) : (
          <PoweredByBadge />
        )}
      </div>
    </aside>
  )
}

interface NotificationItem {
  id: string
  icon: IconType
  iconColor: string
  title: string
  description: string
  href?: string
  onClick?: () => void
}

function useClickOutside<T extends HTMLElement>(active: boolean, onOutside: () => void) {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    if (!active) return
    const handle = (event: MouseEvent) => {
      if (!ref.current) return
      if (event.target instanceof Node && !ref.current.contains(event.target)) {
        onOutside()
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [active, onOutside])

  return ref
}

function NotificationsMenu({
  notifications,
  onNavigate,
  onClose,
}: {
  notifications: NotificationItem[]
  onNavigate: (href: string) => void
  onClose: () => void
}) {
  const { t } = useI18n()
  return (
    <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <h4 className="text-sm font-semibold text-gray-900">{t('ws.notifications')}</h4>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
          {notifications.length}
        </span>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-gray-400">
            {t('ws.noNotifications')}
          </div>
        ) : (
          notifications.map((item) => {
            const Icon = item.icon
            const handleClick = () => {
              if (item.onClick) item.onClick()
              if (item.href) onNavigate(item.href)
              onClose()
            }
            return (
              <button
                key={item.id}
                type="button"
                onClick={handleClick}
                className="flex w-full items-start gap-3 border-b border-gray-50 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-gray-50"
              >
                <div
                  className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                  style={{ background: `${item.iconColor}15` }}
                >
                  <Icon size={16} style={{ color: item.iconColor }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-800">{item.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">{item.description}</p>
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}

function UserMenu({
  user,
  workspaceLabel,
  planLabel,
  currentOrganizationId,
  organizations,
  organizationsLoading,
  switchingOrganizationId,
  onSwitchOrganization,
  onNavigate,
  onLogout,
  onClose,
}: {
  user: WorkspaceContextResponse['user']
  workspaceLabel: string
  planLabel: string
  currentOrganizationId: string
  organizations: UserOrganizationSummary[]
  organizationsLoading: boolean
  switchingOrganizationId: string | null
  onSwitchOrganization: (organizationId: string) => void
  onNavigate: (href: string) => void
  onLogout: () => void
  onClose: () => void
}) {
  const { t } = useI18n()
  const items: Array<{ icon: IconType; label: string; href?: string; danger?: boolean; onClick?: () => void }> = [
    { icon: UserCircle, label: t('ws.myProfile'), href: '/workspace/profile' },
    { icon: CreditCard, label: t('ws.billing'), href: '/workspace/billing' },
    { icon: Settings, label: t('ws.settings'), href: '/workspace/settings' },
    { icon: LogOut, label: t('ws.logout'), onClick: onLogout, danger: true },
  ]

  const hasMultipleOrgs = organizations.length > 1
  const showOrgsSection = organizationsLoading || organizations.length > 0

  return (
    <div className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
      <div className="border-b border-gray-100 px-4 py-3">
        <p className="truncate text-sm font-semibold text-gray-900">{user.full_name || user.email}</p>
        <p className="truncate text-xs text-gray-400">{user.email}</p>
        <div className="mt-2 flex items-center gap-2">
          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-600">{planLabel}</span>
          <span className="truncate text-[11px] text-gray-500">{workspaceLabel}</span>
        </div>
      </div>

      {showOrgsSection && (
        <div className="border-b border-gray-100 py-2">
          <div className="flex items-center justify-between px-4 pb-1.5 pt-0.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              {hasMultipleOrgs ? t('ws.switchWorkspace') : t('ws.yourWorkspace')}
            </span>
            {organizationsLoading && <Loader2 size={10} className="animate-spin text-gray-300" />}
          </div>
          <div className="max-h-56 overflow-y-auto">
            {organizations.map((organization) => {
              const isCurrent = organization.id === currentOrganizationId
              const isSwitching = switchingOrganizationId === organization.id
              return (
                <button
                  key={organization.id}
                  type="button"
                  onClick={() => {
                    if (isCurrent || isSwitching) return
                    onSwitchOrganization(organization.id)
                  }}
                  disabled={isCurrent || isSwitching || switchingOrganizationId !== null}
                  className={`flex w-full items-start gap-3 px-4 py-2 text-left transition-colors ${
                    isCurrent
                      ? 'cursor-default bg-blue-50/60'
                      : 'hover:bg-gray-50 disabled:opacity-60'
                  }`}
                >
                  <div
                    className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-[11px] font-semibold ${
                      isCurrent ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    <Building2 size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-gray-900">{organization.display_name}</p>
                    <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-gray-500">
                      <span className="truncate">{organization.plan_label}</span>
                      <span className="text-gray-300">·</span>
                      <span className="truncate capitalize">{organization.role}</span>
                    </div>
                  </div>
                  <div className="mt-1 flex-shrink-0">
                    {isSwitching ? (
                      <Loader2 size={12} className="animate-spin text-blue-500" />
                    ) : isCurrent ? (
                      <Check size={12} className="text-blue-500" />
                    ) : null}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div className="py-1">
        {items.map((item) => {
          const Icon = item.icon
          const handleClick = () => {
            if (item.onClick) item.onClick()
            if (item.href) onNavigate(item.href)
            onClose()
          }
          return (
            <button
              key={item.label}
              type="button"
              onClick={handleClick}
              className={`flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors ${
                item.danger ? 'text-rose-600 hover:bg-rose-50' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon size={16} className={item.danger ? 'text-rose-500' : 'text-gray-400'} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function TopBar({
  sidebarCollapsed,
  brand,
  user,
  workspaceLabel,
  planLabel,
  title,
  subtitle,
  notifications,
  currentOrganizationId,
  organizations,
  organizationsLoading,
  switchingOrganizationId,
  onSwitchOrganization,
  onCreatePoc,
  onNavigate,
  onLogout,
}: {
  sidebarCollapsed: boolean
  brand: WorkspaceContextResponse['workspace']['brand']
  user: WorkspaceContextResponse['user']
  workspaceLabel: string
  planLabel: string
  title: string
  subtitle?: string
  notifications: NotificationItem[]
  currentOrganizationId: string
  organizations: UserOrganizationSummary[]
  organizationsLoading: boolean
  switchingOrganizationId: string | null
  onSwitchOrganization: (organizationId: string) => void
  onCreatePoc: (tier?: 'poc' | 'mvp' | 'app') => void
  onNavigate: (href: string) => void
  onLogout: () => void
}) {
  const userLabel = user.full_name?.trim() || user.email.split('@')[0]
  const userInitials =
    userLabel
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('') || 'US'

  const { language, setLanguage, t } = useI18n()
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)

  const notificationsRef = useClickOutside<HTMLDivElement>(notificationsOpen, () => setNotificationsOpen(false))
  const userMenuRef = useClickOutside<HTMLDivElement>(userMenuOpen, () => setUserMenuOpen(false))
  const langRef = useClickOutside<HTMLDivElement>(langOpen, () => setLangOpen(false))

  return (
    <header
      className="fixed right-0 top-0 z-20 flex h-16 items-center border-b border-gray-200 bg-white/80 px-6 backdrop-blur-sm transition-all duration-300"
      style={{ left: sidebarCollapsed ? 64 : 256 }}
    >
      <div className="flex-1">
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onCreatePoc('poc')}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md"
          style={{ background: `linear-gradient(135deg, ${brand.primary}, ${brand.primaryDark})` }}
        >
          <Plus size={14} />
          Generar PoC
        </button>
        <div className="h-8 w-px bg-gray-200" />

        {/* Language selector */}
        <div ref={langRef} className="relative">
          <button
            type="button"
            onClick={() => { setLangOpen(v => !v); setNotificationsOpen(false); setUserMenuOpen(false) }}
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
          >
            <Globe size={18} />
            <span className="text-xs font-medium uppercase">{language}</span>
            <ChevronDown size={12} className={`transition-transform ${langOpen ? 'rotate-180' : ''}`} />
          </button>
          {langOpen && (
            <div className="absolute right-0 mt-2 w-32 rounded-xl border border-gray-100 bg-white shadow-lg overflow-hidden z-50">
              <button
                type="button"
                onClick={() => { setLanguage('es'); setLangOpen(false) }}
                className={`w-full px-3 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2 ${
                  language === 'es' ? 'font-semibold text-indigo-600 bg-indigo-50' : 'text-gray-700'
                }`}
              >
                Español
              </button>
              <button
                type="button"
                onClick={() => { setLanguage('en'); setLangOpen(false) }}
                className={`w-full px-3 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2 ${
                  language === 'en' ? 'font-semibold text-indigo-600 bg-indigo-50' : 'text-gray-700'
                }`}
              >
                English
              </button>
            </div>
          )}
        </div>

        <div ref={notificationsRef} className="relative">
          <button
            type="button"
            onClick={() => {
              setNotificationsOpen((value) => !value)
              setUserMenuOpen(false)
            }}
            className="relative rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600"
            aria-label={t('ws.notifications')}
          >
            <Bell size={20} />
            {notifications.length > 0 && (
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
            )}
          </button>
          {notificationsOpen && (
            <NotificationsMenu
              notifications={notifications}
              onNavigate={onNavigate}
              onClose={() => setNotificationsOpen(false)}
            />
          )}
        </div>

        <div ref={userMenuRef} className="relative">
          <button
            type="button"
            onClick={() => {
              setUserMenuOpen((value) => !value)
              setNotificationsOpen(false)
            }}
            className="flex cursor-pointer items-center gap-2 rounded-lg pl-2 pr-1 py-1 hover:bg-gray-50"
            aria-label={t('ws.userMenu')}
          >
            {user.profile_picture ? (
              <img src={user.profile_picture} alt={userLabel} className="h-8 w-8 rounded-full object-cover" />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-600">
                {userInitials}
              </div>
            )}
            <ChevronDown size={14} className="text-gray-400" />
          </button>
          {userMenuOpen && (
            <UserMenu
              user={user}
              workspaceLabel={workspaceLabel}
              planLabel={planLabel}
              currentOrganizationId={currentOrganizationId}
              organizations={organizations}
              organizationsLoading={organizationsLoading}
              switchingOrganizationId={switchingOrganizationId}
              onSwitchOrganization={onSwitchOrganization}
              onNavigate={onNavigate}
              onLogout={onLogout}
              onClose={() => setUserMenuOpen(false)}
            />
          )}
        </div>
      </div>
    </header>
  )
}

function InviteModal({
  open,
  onClose,
  onSubmit,
  pending,
  invitationUrl,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (payload: { email: string; role: string }) => Promise<void>
  pending: boolean
  invitationUrl: string
}) {
  const { t } = useI18n()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('member')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) {
      setEmail('')
      setRole('member')
      setError('')
    }
  }, [open])

  if (!open) return null

  const handleSubmit = async () => {
    try {
      setError('')
      await onSubmit({ email, role })
      setEmail('')
    } catch (err: any) {
      setError(err?.response?.data?.detail || t('ws.createInvitation'))
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/25 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-950">{t('ws.inviteModalTitle')}</h3>
            <p className="mt-1 text-sm text-slate-500">{t('ws.inviteModalDesc')}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">{t('ws.inviteEmail')}</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="persona@empresa.com"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-indigo-300"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">{t('ws.inviteRole')}</span>
            <select
              value={role}
              onChange={(event) => setRole(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-indigo-300"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </label>

          {invitationUrl && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-700">
              {t('ws.inviteCreated')} <span className="font-semibold break-all">{invitationUrl}</span>
            </div>
          )}

          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">{error}</div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            {t('ws.close')}
          </button>
          <button
            onClick={() => void handleSubmit()}
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:bg-indigo-400"
          >
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            {t('ws.createInvitation')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function WorkspaceLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const hasSession = useAppSelector((state) => state.user.tokens !== null)
  const { t } = useI18n()

  const [context, setContext] = useState<WorkspaceContextResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [invitePending, setInvitePending] = useState(false)
  const [latestInviteUrl, setLatestInviteUrl] = useState('')
  const [header, setHeaderState] = useState<WorkspaceHeader>({
    title: 'Workspace',
    subtitle: undefined,
  })
  const [organizations, setOrganizations] = useState<UserOrganizationSummary[]>([])
  const [organizationsLoading, setOrganizationsLoading] = useState(false)
  const [switchingOrganizationId, setSwitchingOrganizationId] = useState<string | null>(null)

  const refreshContext = useCallback(async () => {
    try {
      const response = await workspaceApi.getContext()
      setContext(response)
      setError('')
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'No se pudo cargar el workspace')
    }
  }, [])

  const loadOrganizations = useCallback(async () => {
    setOrganizationsLoading(true)
    try {
      const response = await authApi.listOrganizations()
      setOrganizations(response.organizations || [])
    } catch (err) {
      console.error('Failed to load organizations', err)
    } finally {
      setOrganizationsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!hasSession) {
      saveAuthReturnUrl()
      navigate('/login?returnTo=%2Fworkspace', { replace: true })
      return
    }

    let cancelled = false
    const run = async () => {
      try {
        setLoading(true)
        const response = await workspaceApi.getContext()
        if (cancelled) return
        setContext(response)
        setError('')
      } catch (err: any) {
        if (cancelled) return
        setError(err?.response?.data?.detail || 'No se pudo cargar el workspace')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void run()
    void loadOrganizations()

    return () => {
      cancelled = true
    }
  }, [hasSession, navigate, loadOrganizations])

  const handleInvite = useCallback(async (payload: { email: string; role: string }) => {
    setInvitePending(true)
    try {
      const invitation: WorkspaceInvitationSummary = await workspaceApi.createInvitation(payload)
      const absoluteUrl = `${window.location.origin}${invitation.accept_url}`
      setLatestInviteUrl(absoluteUrl)
      setContext((previous) => {
        if (!previous) return previous
        return {
          ...previous,
          pending_invitations: [
            ...previous.pending_invitations,
            { ...invitation, accept_url: invitation.accept_url },
          ],
          usage: {
            ...previous.usage,
            seats_reserved: previous.usage.seats_reserved + 1,
          },
        }
      })
    } finally {
      setInvitePending(false)
    }
  }, [])

  const handleNavigate = useCallback(
    (href: string) => {
      navigate(href)
    },
    [navigate],
  )

  const handleCreatePoc = useCallback(
    (tier: 'poc' | 'mvp' | 'app' = 'poc') => {
      clearOnboardingState()
      navigate(`/workspace/discovery?tier=${tier}`)
    },
    [navigate],
  )

  const performScroll = useCallback((anchorId: string) => {
    const el = document.getElementById(anchorId)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    el.classList.add('ring-2', 'ring-blue-300', 'ring-offset-2')
    window.setTimeout(() => {
      el.classList.remove('ring-2', 'ring-blue-300', 'ring-offset-2')
    }, 1600)
  }, [])

  const handleScrollTo = useCallback(
    (anchorId: string) => {
      if (location.pathname !== '/workspace') {
        navigate(`/workspace#${anchorId}`)
        return
      }
      performScroll(anchorId)
    },
    [location.pathname, navigate, performScroll],
  )

  // Honor hash after navigation into /workspace
  useEffect(() => {
    if (location.pathname !== '/workspace') return
    if (!location.hash) return
    const anchorId = location.hash.slice(1)
    // Wait a frame so the dashboard view has mounted its anchors
    const raf = window.requestAnimationFrame(() => performScroll(anchorId))
    return () => window.cancelAnimationFrame(raf)
  }, [location.pathname, location.hash, performScroll])

  const handleLogout = useCallback(() => {
    authApi.clearTokens()
    try { localStorage.removeItem('org_plan') } catch {}
    dispatch(clearAuth())
    navigate('/', { replace: true })
  }, [dispatch, navigate])

  const handleSwitchOrganization = useCallback(
    async (organizationId: string) => {
      if (!context || switchingOrganizationId) return
      if (organizationId === context.workspace.id) return

      setSwitchingOrganizationId(organizationId)
      setError('')
      try {
        const response = await authApi.switchOrganization(organizationId)
        authApi.saveTokens(response.tokens)
        authApi.saveUserData(response.user)
        try { localStorage.setItem('org_plan', response.organization?.plan || '') } catch {}
        dispatch(
          setAuthData({
            user: response.user,
            tokens: {
              access_token: response.tokens.access_token,
              refresh_token: response.tokens.refresh_token,
            },
          }),
        )
        // Reset the workspace context so the next effect refetches with the new JWT.
        setContext(null)
        setLoading(true)
        const fresh = await workspaceApi.getContext()
        setContext(fresh)
        void loadOrganizations()
        navigate('/workspace', { replace: true })
      } catch (err: any) {
        console.error('Failed to switch organization', err)
        setError(
          err?.response?.data?.detail ||
            'No se pudo cambiar de workspace. Volvé a intentarlo en unos segundos.',
        )
        // Refresh the current context so the UI does not stay in a limbo state.
        try {
          const fallback = await workspaceApi.getContext()
          setContext(fallback)
        } catch {
          // already surfaced via error state
        }
      } finally {
        setSwitchingOrganizationId(null)
        setLoading(false)
      }
    },
    [context, dispatch, loadOrganizations, navigate, switchingOrganizationId],
  )

  const navSections = useMemo(() => buildNavSections(context, t), [context, t])

  const notifications = useMemo<NotificationItem[]>(() => {
    if (!context) return []
    const items: NotificationItem[] = []

    if (context.summary.pending_recommendations > 0) {
      items.push({
        id: 'pending-recommendations',
        icon: Lightbulb,
        iconColor: '#F59E0B',
        title: t('ws.pendingRecsNotif').replace('{count}', String(context.summary.pending_recommendations)),
        description: t('ws.pendingRecsDesc'),
        href: '/workspace/recommendation',
      })
    }

    if (context.summary.active_previews > 0) {
      items.push({
        id: 'active-previews',
        icon: Eye,
        iconColor: '#0EA5E9',
        title: t('ws.activePreviewsNotif').replace('{count}', String(context.summary.active_previews)),
        description: t('ws.activePreviewsDesc'),
        onClick: () => handleScrollTo('workspace-active-previews'),
      })
    }

    if (context.pending_invitations.length > 0) {
      items.push({
        id: 'pending-invitations',
        icon: Mail,
        iconColor: '#7C3AED',
        title: t('ws.pendingInvNotif').replace('{count}', String(context.pending_invitations.length)),
        description: t('ws.pendingInvDesc'),
        onClick: () => handleScrollTo('workspace-team'),
      })
    }

    return items
  }, [context, handleScrollTo])

  useEffect(() => {
    document.title = buildDocumentTitle(header.title, {
      tenantBrandName: context?.workspace.brand.name,
    })
  }, [context?.workspace.brand.name, header.title])

  const setHeader = useCallback((title: string, subtitle?: string) => {
    setHeaderState({ title, subtitle })
  }, [])

  if (!hasSession || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3 text-gray-500">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
          <span className="text-sm font-medium">{t('ws.loadingWorkspace')}</span>
        </div>
      </div>
    )
  }

  if (!context) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="mx-auto max-w-2xl rounded-3xl border border-rose-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-950">{t('ws.workspaceError')}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">{error || t('ws.workspaceRetry')}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 rounded-2xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            {t('ws.retry')}
          </button>
        </div>
      </div>
    )
  }



  // CodlyLabs central workspace uses the platform palette even when the admin
  // is mid-edit of a tenant BrandingConfig. See resolveWorkspaceBrand.
  const brand = resolveWorkspaceBrand(context.workspace.brand, {
    isTenantBuild: TENANT_STATIC_BRANDING !== null,
  })

  const outletContext: WorkspaceOutletContext = {
    context,
    setContext,
    refreshContext,
    openInviteModal: () => setInviteModalOpen(true),
    scrollToAnchor: handleScrollTo,
    setHeader,
    brand,
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((previous) => !previous)}
        workspace={context.workspace}
        brand={brand}
        user={context.user}
        sections={navSections}
        currentPath={location.pathname}
        onScrollTo={handleScrollTo}
      />
      <TopBar
        sidebarCollapsed={sidebarCollapsed}
        brand={brand}
        user={context.user}
        workspaceLabel={context.workspace.display_name || context.workspace.name}
        planLabel={context.workspace.plan_label}
        title={header.title}
        subtitle={header.subtitle}
        notifications={notifications}
        currentOrganizationId={context.workspace.id}
        organizations={organizations}
        organizationsLoading={organizationsLoading}
        switchingOrganizationId={switchingOrganizationId}
        onSwitchOrganization={(organizationId) => void handleSwitchOrganization(organizationId)}
        onCreatePoc={handleCreatePoc}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />

      <main className="pt-16 transition-all duration-300" style={{ marginLeft: sidebarCollapsed ? 64 : 256 }}>
        <div className="mx-auto max-w-7xl p-6">
          {error && (
            <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {error}
            </div>
          )}

          <Outlet context={outletContext} />

          <footer className="mt-10 flex items-center justify-between border-t border-gray-200 pt-4">
            <div className="flex items-center gap-4">
              <PoweredByBadge variant="dark" />
              <span className="text-xs text-gray-300">·</span>
              <span className="text-xs text-gray-400">v2.4.1</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <a href="#" className="hover:text-gray-600">
                {t('ws.footer.docs')}
              </a>
              <a href="#" className="hover:text-gray-600">
                {t('ws.footer.support')}
              </a>
              <a href="#" className="hover:text-gray-600">
                {t('ws.footer.status')}
              </a>
            </div>
          </footer>
        </div>
      </main>

      <InviteModal
        open={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        onSubmit={handleInvite}
        pending={invitePending}
        invitationUrl={latestInviteUrl}
      />
    </div>
  )
}
