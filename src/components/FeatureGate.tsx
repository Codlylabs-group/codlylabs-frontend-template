/**
 * Feature Gate — Conditionally renders routes based on feature flags.
 *
 * R-01: Controls which feature blocks are active in the frontend.
 * Routes wrapped in <FeatureGate> show a "coming soon" page when their
 * feature is disabled, instead of a broken experience.
 *
 * Usage:
 *   <Route path="/marketplace" element={
 *     <FeatureGate feature="marketplace"><MarketplacePage /></FeatureGate>
 *   } />
 */

import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Lock, ArrowLeft } from 'lucide-react'
import { useI18n } from '../i18n'

/**
 * Feature flags — mirrors backend ENABLE_* flags.
 * In the future, these could be fetched from a /api/v1/features endpoint.
 * For now, they're controlled via environment variables at build time.
 */
const FEATURE_FLAGS: Record<string, boolean> = {
  marketplace:     import.meta.env.VITE_ENABLE_MARKETPLACE === 'true',
  billing:         import.meta.env.VITE_ENABLE_BILLING === 'true',
  admin_advanced:  import.meta.env.VITE_ENABLE_ADMIN_ADVANCED === 'true',
  sales_tools:     import.meta.env.VITE_ENABLE_SALES_TOOLS === 'true',
}

export function isFeatureEnabled(feature: string): boolean {
  return FEATURE_FLAGS[feature] ?? false
}

interface FeatureGateProps {
  feature: string
  children: ReactNode
}

function ComingSoonFallback() {
  const { t } = useI18n()

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="mx-auto w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center">
          <Lock className="w-8 h-8 text-brand-500" aria-hidden="true" />
        </div>
        <h1 className="text-xl font-bold text-neutral-900">
          {t('featureGate.title') || 'Funcionalidad próximamente'}
        </h1>
        <p className="text-sm text-neutral-500">
          {t('featureGate.description') || 'Esta sección está en desarrollo y estará disponible pronto. Mientras tanto, puedes usar el generador de PoCs.'}
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            to="/try"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition focus-ring"
          >
            Generar una PoC
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-neutral-200 text-neutral-700 text-sm font-medium hover:bg-neutral-50 transition focus-ring"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            {t('featureGate.back') || 'Volver al inicio'}
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function FeatureGate({ feature, children }: FeatureGateProps) {
  if (isFeatureEnabled(feature)) {
    return <>{children}</>
  }
  return <ComingSoonFallback />
}
