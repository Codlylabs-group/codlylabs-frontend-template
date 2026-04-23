/**
 * Empty State
 *
 * Contextual empty state component for when a section has no data.
 * Provides a consistent pattern across all pages with customizable
 * icon, title, description and optional action.
 *
 * Usage:
 *   <EmptyState
 *     icon={<Inbox className="w-12 h-12" />}
 *     title="Sin PoCs generadas"
 *     description="Crea tu primera Proof-of-Concept para empezar."
 *     actionLabel="Crear PoC"
 *     onAction={() => navigate('/onboarding')}
 *   />
 */

import { memo, type ReactNode } from 'react'
import { PackageOpen } from 'lucide-react'

interface EmptyStateProps {
  /** Custom icon (defaults to PackageOpen) */
  icon?: ReactNode
  /** Main heading */
  title: string
  /** Supporting description */
  description?: string
  /** Optional CTA button label */
  actionLabel?: string
  /** CTA click handler */
  onAction?: () => void
  /** Additional class names */
  className?: string
}

function EmptyStateComponent({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 py-16 px-6 text-center ${className}`}
      role="status"
    >
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 text-neutral-400">
        {icon ?? <PackageOpen className="w-8 h-8" aria-hidden="true" />}
      </div>

      <div className="space-y-1 max-w-sm">
        <h3 className="text-base font-semibold text-neutral-900">{title}</h3>
        {description && (
          <p className="text-sm text-neutral-500">{description}</p>
        )}
      </div>

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition focus-ring"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export const EmptyState = memo(EmptyStateComponent)
export default EmptyState
