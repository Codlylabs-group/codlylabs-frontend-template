// Fase 4 rediseñada: control para elevar un PoC a MVP o App.
// Muestra el tier actual y ofrece los upgrades disponibles.
// El workspace clonado preserva ediciones del editor interactivo del PoC original.

import { useCallback, useState } from 'react'
import { ArrowUpRight, Loader2, Layers } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { pocGeneratorApi, type TargetTier } from '@/services/pocGenerator'

interface TierUpgradeControlProps {
  pocId: string
  currentTier?: string | null // "poc" | "mvp" | "app"
  pocName?: string
}

const TIER_ORDER: TargetTier[] = ['poc', 'mvp', 'app']

const TIER_LABELS: Record<TargetTier, { label: string; description: string }> = {
  poc: {
    label: 'PoC',
    description: 'Validación técnica: dashboard + operación.',
  },
  mvp: {
    label: 'MVP',
    description: 'Demo a clientes: landing + detalle + reportes + settings + navegación.',
  },
  app: {
    label: 'App',
    description: 'Producto operable: auth + admin + perfil + deploy kit.',
  },
}

export default function TierUpgradeControl({ pocId, currentTier, pocName }: TierUpgradeControlProps) {
  const navigate = useNavigate()
  const normalizedTier = (currentTier || 'poc').toLowerCase() as TargetTier
  const currentIdx = TIER_ORDER.indexOf(normalizedTier)
  const upgradableTo = currentIdx >= 0 ? TIER_ORDER.slice(currentIdx + 1) : []

  const [selectedTarget, setSelectedTarget] = useState<TargetTier | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [inFlight, setInFlight] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const openModal = useCallback((target: TargetTier) => {
    setSelectedTarget(target)
    setErrorMessage(null)
    setModalOpen(true)
  }, [])

  const confirmUpgrade = useCallback(async () => {
    if (!selectedTarget) return
    setInFlight(true)
    setErrorMessage(null)
    try {
      const result = await pocGeneratorApi.upgradeTier(pocId, selectedTarget)
      // Redirige al nuevo PoC recién creado.
      navigate(`/preview/${result.new_poc_id}`)
    } catch (err: any) {
      const detail = err?.response?.data?.detail
      setErrorMessage(typeof detail === 'string' ? detail : err?.message || 'No se pudo elevar el tier')
    } finally {
      setInFlight(false)
    }
  }, [pocId, selectedTarget, navigate])

  if (upgradableTo.length === 0) {
    // Ya es App: no hay upgrades disponibles.
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-2.5 py-1 text-xs font-medium text-violet-800 dark:bg-violet-900/30 dark:text-violet-300">
        <Layers className="h-3 w-3" />
        App
      </span>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {/* Badge de tier actual */}
      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
        <Layers className="h-3 w-3" />
        {TIER_LABELS[normalizedTier].label}
      </span>

      {/* Botones de upgrade */}
      {upgradableTo.map((target) => (
        <button
          key={target}
          type="button"
          onClick={() => openModal(target)}
          className="inline-flex items-center gap-1 rounded border border-indigo-200 bg-white px-2.5 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-50 dark:border-indigo-900 dark:bg-slate-900 dark:text-indigo-300"
        >
          <ArrowUpRight className="h-3 w-3" />
          Elevar a {TIER_LABELS[target].label}
        </button>
      ))}

      {/* Modal de confirmación */}
      {modalOpen && selectedTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Elevar a {TIER_LABELS[selectedTarget].label}
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {TIER_LABELS[selectedTarget].description}
            </p>
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
              <p>
                <strong>Se va a crear una PoC nueva</strong> derivada de
                {pocName ? ` "${pocName}"` : ' esta PoC'}, preservando los cambios que hiciste en el editor.
              </p>
              <p className="mt-2">
                La PoC original queda intacta y podés compararlas lado a lado.
              </p>
            </div>
            {errorMessage && (
              <div className="mt-3 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
                {errorMessage}
              </div>
            )}
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                disabled={inFlight}
                className="rounded px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmUpgrade}
                disabled={inFlight}
                className="inline-flex items-center gap-2 rounded bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-900"
              >
                {inFlight && <Loader2 className="h-3 w-3 animate-spin" />}
                {inFlight ? 'Elevando...' : `Elevar a ${TIER_LABELS[selectedTarget].label} →`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
