import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  Building2,
  CalendarClock,
  Database,
  FileText,
  Printer,
  Rocket,
  ShieldCheck,
  Target,
  type LucideIcon,
} from 'lucide-react'

import { discoveryService } from '../../services/discovery'
import type { DiscoverySummary } from '../../types/discovery'
import { ONBOARDING_STORAGE_KEY } from '../../utils/onboardingStorage'
import { useWorkspaceOutletContext } from './WorkspaceLayout'

function compactList(value?: string[]): string[] {
  return Array.isArray(value) ? value.filter((item) => String(item || '').trim().length > 0) : []
}

function SummaryBlock({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon
  title: string
  children: ReactNode
}) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          <Icon size={17} />
        </div>
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      </div>
      {children}
    </section>
  )
}

export default function WorkspaceDiscoverySummaryView() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { brand, setHeader } = useWorkspaceOutletContext()
  const sessionId = searchParams.get('session') || ''
  const selectedTier = (searchParams.get('tier') || 'poc').toLowerCase()
  const tierQuery = selectedTier !== 'poc' ? `&tier=${selectedTier}` : ''
  const [summary, setSummary] = useState<DiscoverySummary | null>(null)
  const [isLoading, setIsLoading] = useState(Boolean(sessionId))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setHeader('Resumen del Discovery', 'Revision ejecutiva antes de generar la PoC')
  }, [setHeader])

  useEffect(() => {
    if (!sessionId) {
      setIsLoading(false)
      return
    }

    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const raw = window.localStorage.getItem(ONBOARDING_STORAGE_KEY)
        if (raw) {
          const parsed = JSON.parse(raw)
          if (parsed?.sessionId === sessionId && parsed?.discoverySummary) {
            setSummary(parsed.discoverySummary)
          }
        }
      } catch {
        // Server state below is authoritative enough.
      }

      try {
        const session = await discoveryService.getSession(sessionId)
        if (cancelled) return
        if (session?.discovery_summary) {
          setSummary(session.discovery_summary)
        } else {
          setError('No encontramos el resumen confirmado para esta sesion.')
        }
      } catch {
        if (!cancelled) setError('No se pudo cargar el resumen del Discovery.')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [sessionId])

  const generateUrl = useMemo(
    () => `/workspace/poc-generator?session=${sessionId}${tierQuery}`,
    [sessionId, tierQuery],
  )

  if (!sessionId) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-white p-10 text-center">
        <FileText className="mx-auto text-gray-300" size={34} />
        <h2 className="mt-4 text-base font-semibold text-gray-900">No hay una sesion de Discovery activa</h2>
        <Link
          to="/workspace/discovery"
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white"
        >
          <ArrowLeft size={14} />
          Volver al Discovery
        </Link>
      </div>
    )
  }

  if (isLoading && !summary) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-sm text-gray-500 shadow-sm">
        Cargando resumen...
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 p-8 text-sm text-red-700">
        {error || 'No se pudo cargar el resumen.'}
      </div>
    )
  }

  const dataSources = compactList(summary.data_landscape?.data_sources)
  const compliance = compactList(summary.constraints?.compliance_requirements)
  const painPoints = compactList(summary.additional_context?.pain_points)
  const successMetrics = compactList(summary.additional_context?.success_metrics)
  const confidence = Math.round((summary.conversation_metadata?.confidence_score || 0) * 100)

  return (
    <>
      <div
        className="relative mb-6 overflow-hidden rounded-xl p-6 text-white print:bg-white print:text-gray-900"
        style={{ background: `linear-gradient(135deg, ${brand.primary}, ${brand.primaryDark})` }}
      >
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white/90 print:text-gray-500">
              <FileText size={10} />
              Resumen confirmado
            </span>
            <h2 className="mt-3 text-2xl font-semibold">Discovery listo para decision</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-blue-100 print:text-gray-600">
              {summary.narrative || 'Resumen consolidado del relevamiento.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 print:hidden">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/25"
            >
              <Printer size={15} />
              Imprimir
            </button>
            <button
              type="button"
              onClick={() => navigate(generateUrl)}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-indigo-700 transition-colors hover:bg-blue-50"
            >
              <Rocket size={15} />
              Generar PoC
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <SummaryBlock icon={Target} title="Problema y objetivo">
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Problema</dt>
                <dd className="mt-1 text-gray-700">{summary.business_problem || 'No especificado'}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Objetivo</dt>
                <dd className="mt-1 text-gray-700">{summary.business_objective || 'No especificado'}</dd>
              </div>
            </dl>
          </SummaryBlock>

          <SummaryBlock icon={Database} title="Datos y fuentes">
            <div className="flex flex-wrap gap-2">
              {dataSources.length > 0 ? dataSources.map((source) => (
                <span key={source} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  {source}
                </span>
              )) : <span className="text-sm text-gray-500">Sin fuentes detalladas.</span>}
            </div>
            {summary.data_landscape?.volume_indicators && (
              <p className="mt-4 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
                Volumen: {summary.data_landscape.volume_indicators.value} {summary.data_landscape.volume_indicators.metric}
              </p>
            )}
          </SummaryBlock>

          {(painPoints.length > 0 || successMetrics.length > 0) && (
            <SummaryBlock icon={ShieldCheck} title="Criterios operativos">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Puntos de dolor</h4>
                  <ul className="mt-2 space-y-2 text-sm text-gray-600">
                    {(painPoints.length > 0 ? painPoints : ['No especificados']).map((item) => (
                      <li key={item}>- {item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Metricas de exito</h4>
                  <ul className="mt-2 space-y-2 text-sm text-gray-600">
                    {(successMetrics.length > 0 ? successMetrics : ['No especificadas']).map((item) => (
                      <li key={item}>- {item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </SummaryBlock>
          )}
        </div>

        <aside className="space-y-6">
          <SummaryBlock icon={Building2} title="Organizacion">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-gray-500">Industria</dt>
                <dd className="font-medium text-gray-900">{summary.organization_context?.industry || 'No especificada'}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-gray-500">Tamano</dt>
                <dd className="font-medium text-gray-900">{summary.organization_context?.company_size || 'No especificado'}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-gray-500">Madurez</dt>
                <dd className="font-medium text-gray-900">{summary.organization_context?.maturity_level || 'No especificada'}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-gray-500">Confianza</dt>
                <dd className="font-medium text-gray-900">{confidence}%</dd>
              </div>
            </dl>
          </SummaryBlock>

          <SummaryBlock icon={CalendarClock} title="Restricciones">
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-gray-500">Timeline</dt>
                <dd className="mt-1 font-medium text-gray-900">{summary.constraints?.timeline || 'No especificado'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Presupuesto</dt>
                <dd className="mt-1 font-medium text-gray-900">{summary.constraints?.budget_level || 'No especificado'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Compliance</dt>
                <dd className="mt-2 flex flex-wrap gap-2">
                  {compliance.length > 0 ? compliance.map((item) => (
                    <span key={item} className="rounded-full bg-gray-100 px-2 py-1 text-[11px] font-semibold text-gray-700">
                      {item}
                    </span>
                  )) : <span className="text-gray-500">Sin requisitos indicados.</span>}
                </dd>
              </div>
            </dl>
          </SummaryBlock>

          <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-6 shadow-sm print:hidden">
            <h3 className="text-sm font-semibold text-indigo-950">Siguiente paso</h3>
            <p className="mt-2 text-sm leading-6 text-indigo-800">
              Podes conservar este resumen o avanzar a la configuracion de generacion.
            </p>
            <div className="mt-5 space-y-3">
              <button
                type="button"
                onClick={() => navigate(generateUrl)}
                className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-sm"
                style={{ background: `linear-gradient(135deg, ${brand.primary}, ${brand.primaryDark})` }}
              >
                <Rocket size={15} />
                Generar PoC
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-white px-4 py-3 text-sm font-semibold text-indigo-700"
              >
                <Printer size={15} />
                Imprimir resumen
              </button>
            </div>
          </div>
        </aside>
      </div>
    </>
  )
}
