import { Link, useLocation } from 'react-router-dom'
import { LayoutGrid, LogOut } from 'lucide-react'

import { useI18n } from '../i18n'
import { useAppSelector } from '../store/hooks'
import { useLogout } from '../hooks/useLogout'

export default function GlobalWorkspaceShortcut() {
  const location = useLocation()
  const { t } = useI18n()
  const isAuthenticated = useAppSelector((state) => state.user.tokens !== null)
  const logout = useLogout()

  const orgPlan = typeof window !== 'undefined' ? localStorage.getItem('org_plan') || '' : ''
  const isFree = orgPlan === 'free'

  // Only show on these specific pages
  const allowedPaths = ['/', '/onboarding', '/poc-generator', '/workspace']
  const visible =
    isAuthenticated &&
    allowedPaths.some(p => location.pathname === p)

  if (!visible) {
    return null
  }

  const isWorkspace = location.pathname === '/workspace'

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[60] flex justify-center px-4 md:hidden">
      <div className="pointer-events-auto inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-white/95 px-1.5 py-1.5 shadow-[0_18px_40px_rgba(79,70,229,0.16)] backdrop-blur-xl">
        {!isWorkspace && !isFree && (
          <>
            <Link
              to="/workspace"
              className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-bold text-indigo-700 transition-all hover:bg-indigo-50"
            >
              <LayoutGrid className="h-4 w-4" />
              {t('nav.workspace')}
            </Link>
            <div className="h-5 w-px bg-slate-200" />
          </>
        )}
        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold text-slate-500 transition-all hover:bg-rose-50 hover:text-rose-600"
        >
          <LogOut className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
