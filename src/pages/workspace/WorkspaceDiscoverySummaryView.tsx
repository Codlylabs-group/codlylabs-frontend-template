import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  Database,
  FileText,
  Gauge,
  Printer,
  Rocket,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Workflow,
  type LucideIcon,
} from 'lucide-react'

import { discoveryService } from '../../services/discovery'
import type {
  DiscoverySummary,
  PainPoint,
  Stakeholder,
} from '../../types/discovery'
import { ONBOARDING_STORAGE_KEY } from '../../utils/onboardingStorage'
import { useWorkspaceOutletContext } from './WorkspaceLayout'

function compactList(value?: string[] | null): string[] {
  return Array.isArray(value)
    ? value.filter((item) => String(item || '').trim().length > 0)
    : []
}

function compactPainPoints(value?: PainPoint[] | null): PainPoint[] {
  return Array.isArray(value)
    ? value.filter((p) => p && String(p.description || '').trim().length > 0)
    : []
}

function compactStakeholders(value?: Stakeholder[] | null): Stakeholder[] {
  return Array.isArray(value)
    ? value.filter((s) => s && String(s.role || '').trim().length > 0)
    : []
}

function splitParagraphs(text?: string | null): string[] {
  if (!text) return []
  return text
    .split(/\n{2,}|\r\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
}

function SummaryBlock({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: LucideIcon
  title: string
  subtitle?: string
  children: ReactNode
}) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm print:break-inside-avoid print:rounded-none print:border-0 print:border-t print:border-gray-200 print:p-0 print:pt-5 print:shadow-none">
      <div className="mb-4 flex items-start gap-3 print:mb-3 print:gap-0">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 print:hidden">
          <Icon size={17} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900 print:text-[13pt] print:uppercase print:tracking-wider">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-0.5 text-xs text-gray-500 print:mt-1 print:text-[10pt] print:normal-case print:tracking-normal">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {children}
    </section>
  )
}

export default function WorkspaceDiscoverySummaryView() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { brand, context, setHeader } = useWorkspaceOutletContext()
  const orgLabel = (context.workspace.display_name || context.workspace.name || '').trim()
  const printDate = useMemo(
    () =>
      new Date().toLocaleDateString('es-AR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
    [],
  )
  const sessionId = searchParams.get('session') || ''
  const selectedTier = (searchParams.get('tier') || 'poc').toLowerCase()
  const tierQuery = selectedTier !== 'poc' ? `&tier=${selectedTier}` : ''
  const [summary, setSummary] = useState<DiscoverySummary | null>(null)
  const [isLoading, setIsLoading] = useState(Boolean(sessionId))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setHeader('Resumen del Discovery', 'Brief ejecutivo para alinear con stakeholders antes de generar la PoC')
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

  const narrativeParagraphs = splitParagraphs(summary.narrative)
  const dataSources = compactList(summary.data_landscape?.data_sources)
  const dataTypes = compactList(summary.data_landscape?.data_types_mentioned)
  const dataQuality = String(summary.data_landscape?.data_quality || '').trim()
  const compliance = compactList(summary.constraints?.compliance_requirements)
  const technicalConstraints = compactList(summary.constraints?.technical_constraints)
  const successMetrics = compactList(summary.additional_context?.success_metrics)
  const expectedImpact = String(summary.additional_context?.expected_impact || '').trim()
  const solutionsTried = compactList(summary.additional_context?.solutions_tried)
  const painPointsDetailed = compactPainPoints(summary.pain_points_detailed)
  const painPointsLegacy = compactList(summary.additional_context?.pain_points)
  const stakeholders = compactStakeholders(summary.stakeholders_detailed)
  const stakeholdersLegacy = compactList(summary.additional_context?.stakeholders_mentioned)
  const currentProcess = summary.current_process || null
  const involvedRoles = compactList(currentProcess?.involved_roles)
  const workflowSteps = compactList(currentProcess?.workflow_steps)
  const currentProcessDescription = String(currentProcess?.description || '').trim()
  const businessProblem = String(summary.business_problem || '').trim()
  const businessObjective = String(summary.business_objective || '').trim()
  const confidence = Math.round((summary.conversation_metadata?.confidence_score || 0) * 100)
  const volume = summary.data_landscape?.volume_indicators

  const hasDataSection =
    dataSources.length > 0 || dataTypes.length > 0 || Boolean(dataQuality) || Boolean(volume)
  const hasCurrentProcess =
    Boolean(currentProcessDescription) || involvedRoles.length > 0 || workflowSteps.length > 0
  const hasOutcomes = Boolean(expectedImpact) || successMetrics.length > 0
  const hasPainPoints = painPointsDetailed.length > 0 || painPointsLegacy.length > 0
  const hasComplianceBlock = compliance.length > 0 || technicalConstraints.length > 0
  const hasStakeholdersBlock = stakeholders.length > 0 || stakeholdersLegacy.length > 0

  return (
    <>
      {/* Hero / Resumen ejecutivo (en pantalla) */}
      <div
        className="relative mb-6 overflow-hidden rounded-xl p-7 text-white print:hidden"
        style={{ background: `linear-gradient(135deg, ${brand.primary}, ${brand.primaryDark})` }}
      >
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white/90">
              <FileText size={10} />
              Brief ejecutivo
            </span>
            <h2 className="mt-3 text-2xl font-semibold">Discovery listo para decision</h2>
            {narrativeParagraphs.length > 0 ? (
              <div className="mt-3 space-y-3 text-sm leading-6 text-blue-100">
                {narrativeParagraphs.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm leading-6 text-blue-100">
                Resumen consolidado del relevamiento.
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
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

      {/* Portada profesional (sólo en impresión) */}
      <header className="hidden print:mb-8 print:block">
        <div className="flex items-baseline justify-between border-b-2 border-gray-900 pb-2">
          <p className="text-[11pt] font-semibold uppercase tracking-[0.18em] text-gray-800">
            {orgLabel || 'Workspace'}
          </p>
          <p className="text-[9pt] uppercase tracking-wider text-gray-500">{printDate}</p>
        </div>
        <h1 className="mt-6 text-[26pt] font-bold leading-tight text-gray-900">
          Resumen del Discovery
        </h1>
        <p className="mt-2 text-[11pt] leading-6 text-gray-600">
          Brief ejecutivo para alinear con stakeholders antes de generar la Prueba de Concepto.
        </p>
        {sessionId && (
          <p className="mt-3 text-[8pt] uppercase tracking-[0.18em] text-gray-400">
            Sesión: {sessionId}
          </p>
        )}
        {narrativeParagraphs.length > 0 && (
          <div className="mt-7 space-y-3 text-[11pt] leading-7 text-gray-800">
            {narrativeParagraphs.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>
        )}
      </header>

      {error && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3 print:!grid-cols-1 print:gap-4">
        {/* ───────── Cuerpo principal ───────── */}
        <div className="space-y-6 lg:col-span-2 print:!col-span-1 print:space-y-4">
          {/* Problema y objetivo */}
          <SummaryBlock
            icon={Target}
            title="Problema y objetivo"
            subtitle="Qué se quiere resolver y para qué"
          >
            <div className="space-y-5 text-sm">
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Problema de negocio
                </h4>
                <p className="mt-2 leading-6 text-gray-700">
                  {businessProblem || 'No especificado.'}
                </p>
              </div>
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Objetivo de la PoC
                </h4>
                <p className="mt-2 leading-6 text-gray-700">
                  {businessObjective || 'No especificado.'}
                </p>
              </div>
              {solutionsTried.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Soluciones intentadas previamente
                  </h4>
                  <ul className="mt-2 space-y-1 text-gray-700">
                    {solutionsTried.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="text-gray-300">—</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </SummaryBlock>

          {/* Resultados esperados */}
          {hasOutcomes && (
            <SummaryBlock
              icon={TrendingUp}
              title="Resultados esperados"
              subtitle="Qué cambia para el negocio si la PoC funciona"
            >
              <div className="space-y-5 text-sm">
                {expectedImpact && (
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Impacto esperado
                    </h4>
                    <p className="mt-2 leading-6 text-gray-700">{expectedImpact}</p>
                  </div>
                )}
                {successMetrics.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Métricas de éxito
                    </h4>
                    <ul className="mt-2 space-y-1.5 text-gray-700">
                      {successMetrics.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </SummaryBlock>
          )}

          {/* Proceso actual */}
          {hasCurrentProcess && (
            <SummaryBlock
              icon={Workflow}
              title="Proceso actual"
              subtitle="Cómo se hace hoy y quiénes participan"
            >
              <div className="space-y-5 text-sm">
                {currentProcessDescription && (
                  <p className="leading-6 text-gray-700">{currentProcessDescription}</p>
                )}
                {workflowSteps.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Flujo actual
                    </h4>
                    <ol className="mt-2 space-y-2 text-gray-700">
                      {workflowSteps.map((step, idx) => (
                        <li key={`${step}-${idx}`} className="flex gap-3">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-[10px] font-semibold text-indigo-700">
                            {idx + 1}
                          </span>
                          <span className="leading-5">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
                {involvedRoles.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Roles involucrados
                    </h4>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {involvedRoles.map((role) => (
                        <span
                          key={role}
                          className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </SummaryBlock>
          )}

          {/* Puntos de dolor */}
          {hasPainPoints && (
            <SummaryBlock
              icon={AlertTriangle}
              title="Puntos de dolor"
              subtitle="Frenos operativos que la PoC busca aliviar"
            >
              {painPointsDetailed.length > 0 ? (
                <ul className="space-y-3 text-sm">
                  {painPointsDetailed.map((p, idx) => (
                    <li
                      key={`${p.description}-${idx}`}
                      className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                    >
                      <p className="font-medium leading-5 text-gray-900">{p.description}</p>
                      {(p.impact || p.frequency) && (
                        <dl className="mt-2 grid gap-2 text-xs text-gray-600 sm:grid-cols-2">
                          {p.impact && (
                            <div>
                              <dt className="font-semibold uppercase tracking-wider text-gray-400">
                                Impacto
                              </dt>
                              <dd className="mt-0.5 leading-5">{p.impact}</dd>
                            </div>
                          )}
                          {p.frequency && (
                            <div>
                              <dt className="font-semibold uppercase tracking-wider text-gray-400">
                                Frecuencia
                              </dt>
                              <dd className="mt-0.5 leading-5">{p.frequency}</dd>
                            </div>
                          )}
                        </dl>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <ul className="space-y-2 text-sm text-gray-700">
                  {painPointsLegacy.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </SummaryBlock>
          )}

          {/* Datos disponibles */}
          {hasDataSection && (
            <SummaryBlock
              icon={Database}
              title="Datos disponibles"
              subtitle="Qué información puede alimentar la solución"
            >
              <div className="space-y-4 text-sm">
                {dataSources.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Fuentes
                    </h4>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {dataSources.map((source) => (
                        <span
                          key={source}
                          className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
                        >
                          {source}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {dataTypes.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Tipos de datos
                    </h4>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {dataTypes.map((t) => (
                        <span
                          key={t}
                          className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {dataQuality && (
                  <p className="rounded-lg bg-gray-50 p-3 leading-5 text-gray-700">
                    {dataQuality}
                  </p>
                )}
                {volume && (
                  <p className="rounded-lg bg-gray-50 p-3 text-gray-600">
                    Volumen estimado: {volume.value} {volume.metric}
                  </p>
                )}
              </div>
            </SummaryBlock>
          )}
        </div>

        {/* ───────── Sidebar ───────── */}
        <aside className="space-y-6 print:space-y-4">
          <SummaryBlock icon={Building2} title="Organización">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-gray-500">Industria</dt>
                <dd className="text-right font-medium text-gray-900">
                  {summary.organization_context?.industry || 'No especificada'}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-gray-500">Tamaño</dt>
                <dd className="text-right font-medium text-gray-900">
                  {summary.organization_context?.company_size || 'No especificado'}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-gray-500">Madurez digital</dt>
                <dd className="text-right font-medium text-gray-900">
                  {summary.organization_context?.maturity_level || 'No especificada'}
                </dd>
              </div>
            </dl>
          </SummaryBlock>

          {hasStakeholdersBlock && (
            <SummaryBlock icon={Users} title="Stakeholders">
              {stakeholders.length > 0 ? (
                <ul className="space-y-3 text-sm">
                  {stakeholders.map((s, idx) => (
                    <li key={`${s.role}-${idx}`} className="border-l-2 border-indigo-100 pl-3">
                      <p className="font-medium text-gray-900">{s.role}</p>
                      {s.involvement && s.involvement !== 'No especificado' && (
                        <p className="mt-0.5 text-xs text-gray-500">{s.involvement}</p>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <ul className="space-y-2 text-sm text-gray-700">
                  {stakeholdersLegacy.map((role) => (
                    <li key={role} className="border-l-2 border-indigo-100 pl-3 font-medium">
                      {role}
                    </li>
                  ))}
                </ul>
              )}
            </SummaryBlock>
          )}

          {hasComplianceBlock && (
            <SummaryBlock icon={ShieldCheck} title="Compliance y restricciones">
              <div className="space-y-4 text-sm">
                {compliance.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Marcos regulatorios
                    </h4>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {compliance.map((item) => (
                        <span
                          key={item}
                          className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {technicalConstraints.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Restricciones operativas
                    </h4>
                    <ul className="mt-2 space-y-1 text-gray-700">
                      {technicalConstraints.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className="text-gray-300">—</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </SummaryBlock>
          )}

          <SummaryBlock icon={Gauge} title="Calidad del relevamiento">
            <div className="space-y-3 text-sm">
              <div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Confianza del análisis</span>
                  <span className="font-semibold text-gray-900">{confidence}%</span>
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-indigo-500"
                    style={{ width: `${Math.max(0, Math.min(100, confidence))}%` }}
                  />
                </div>
              </div>
              <p className="text-xs leading-5 text-gray-500">
                Resultado del análisis de la conversación. Una confianza alta indica que el
                relevamiento captura suficiente contexto del negocio para avanzar con la PoC.
              </p>
            </div>
          </SummaryBlock>

          <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-6 shadow-sm print:hidden">
            <div className="flex items-center gap-2 text-indigo-950">
              <Sparkles size={15} />
              <h3 className="text-sm font-semibold">Siguiente paso</h3>
            </div>
            <p className="mt-2 text-sm leading-6 text-indigo-800">
              Conservá este resumen como referencia o avanzá a la generación de la PoC.
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
