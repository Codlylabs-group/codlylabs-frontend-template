import { useMemo, useState } from 'react'
import { Activity, AlertTriangle, BarChart3, Clock, GitBranch, Shield, Sparkles } from 'lucide-react'

import type { DiagnosisResponse, KPI, UseCaseCategory } from '../types/diagnosis'
import { ReasoningTimeline } from './ReasoningTimeline'
import { useI18n } from '../i18n'

interface DiagnosisResultsProps {
  data: DiagnosisResponse
}

export function DiagnosisResults({ data }: DiagnosisResultsProps) {
  const { t } = useI18n()
  const [showDetails, setShowDetails] = useState(false)

  const diagnosis = data.diagnosis

  const confidenceLabel = useMemo(() => {
    const score = diagnosis.confidence_score
    if (score >= 0.85) return 'Alta confianza'
    if (score >= 0.7) return 'Confianza media-alta'
    if (score >= 0.5) return 'Confianza moderada'
    return 'Baja confianza - requiere revisión'
  }, [diagnosis.confidence_score])

  const primaryCategory: UseCaseCategory | null = useMemo(() => {
    const raw = diagnosis.category.split('+')[0].trim().toLowerCase()
    if (!raw) return null
    const allowed: UseCaseCategory[] = [
      'generation',
      'automation',
      'analysis',
      'prediction',
      'vision',
      'audio',
      'multimodal',
      'agents',
    ]
    return allowed.includes(raw as UseCaseCategory) ? (raw as UseCaseCategory) : null
  }, [diagnosis.category])

  const categoryExplanation = useMemo(() => {
    if (!primaryCategory) return ''
    const base: Record<UseCaseCategory, string> = {
      generation:
        'Generación de contenido con IA (texto, imágenes u otros formatos) para acelerar tareas creativas o de comunicación.',
      automation:
        'Automatización de procesos y tareas repetitivas, reduciendo trabajo manual y tiempos de ciclo.',
      analysis:
        'Análisis inteligente de información (documentos, texto libre, feedback) para extraer insights accionables.',
      prediction:
        'Modelos predictivos basados en datos históricos que anticipan demanda, riesgo, churn u otros eventos clave.',
      vision:
        'Análisis de imágenes o vídeo para detectar patrones, anomalías o eventos relevantes (por ejemplo inspección visual).',
      audio:
        'Transcripción y análisis de audio y voz (llamadas, conversaciones) para entender motivos, calidad y satisfacción.',
      multimodal:
        'Combinación de varios tipos de datos (texto, imágenes, sensores, etc.) para decisiones más ricas.',
      agents:
        'Agentes inteligentes que coordinan tareas, llaman APIs y orquestan flujos de trabajo de negocio.',
    }

    const description = base[primaryCategory] ?? ''
    if (!description) return ''

    return `${description} En tu caso concreto, la iniciativa se centra en: “${diagnosis.use_case_title}”.`
  }, [primaryCategory, diagnosis.use_case_title])

  const impactLabel = useMemo(() => {
    const level = diagnosis.complexity.technical
    if (level === 'High' || level === 'Very High') {
      return t('diagnosis.kpis.impactHigh')
    }
    if (level === 'Medium') {
      return t('diagnosis.kpis.impactMedium')
    }
    return t('diagnosis.kpis.impactDefault')
  }, [diagnosis.complexity.technical, t])

  const mapKpiToGauge = (kpi: KPI) => {
    const match = kpi.target.match(/(\d{1,3})\s*%/)
    const rawValue = match ? parseInt(match[1], 10) : 60
    const value = Math.max(10, Math.min(rawValue, 100))
    const label = match ? `${value}%` : undefined
    return { value, label }
  }

  const timelineEntries = useMemo(
    () => Object.entries(diagnosis.estimated_timeline || {}),
    [diagnosis.estimated_timeline],
  )

  const hasLowConfidence = diagnosis.confidence_score < 0.7

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Columna principal */}
      <div className="lg:col-span-2 space-y-6">
        {/* Use case summary */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-5 h-5 text-brand-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              {t('diagnosis.useCase.title')}
            </h2>
          </div>
          <p className="text-sm text-gray-500 mb-1">
            {t('diagnosis.useCase.category')}{' '}
            <span className="font-medium text-gray-900">
              {diagnosis.category}
            </span>
            {diagnosis.is_hybrid && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-purple-50 text-purple-700">
                Híbrido
              </span>
            )}
          </p>
          <p className="text-xl font-semibold text-gray-900 mt-2">
            {diagnosis.use_case_title}
          </p>
          <p className="mt-3 text-sm text-gray-600 whitespace-pre-line">
            {diagnosis.use_case_description}
          </p>
          {categoryExplanation && (
            <p className="mt-3 text-xs text-gray-500 whitespace-pre-line">
              {categoryExplanation}
            </p>
          )}
        </div>

        {/* KPIs */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-5 h-5 text-brand-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              {t('diagnosis.kpis.title')}
            </h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            {impactLabel}
          </p>
          <div className="mt-3 space-y-3">
            {diagnosis.kpis.map((kpi) => {
              const { value, label } = mapKpiToGauge(kpi)
              return (
                <div key={kpi.metric}>
                  <div className="flex justify-between items-baseline">
                    <p className="text-xs font-medium text-gray-700">
                      {kpi.metric}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      {kpi.baseline} → <span className="font-semibold text-gray-800">{kpi.target}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full shadow-sm"
                        style={{
                          width: `${value}%`,
                          background: 'linear-gradient(90deg, #4F46E5 0%, #A855F7 100%)',
                        }}
                      />
                    </div>
                    {label && (
                      <span className="min-w-[3rem] text-right text-xs font-semibold text-gray-700">
                        {label}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-[11px] text-gray-500">
                    {kpi.measurement}
                    {kpi.timeline && ` · Horizonte: ${kpi.timeline}`}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Reasoning timeline (explica el diagnóstico sin exponer stack técnico) */}
        <ReasoningTimeline reasoning={diagnosis.reasoning} />

        {/* Alternatives considered */}
        {diagnosis.alternatives_considered.length > 0 && (
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <GitBranch className="w-5 h-5 text-brand-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Alternativas consideradas
              </h2>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Otras rutas evaluadas por el agente antes de elegir la recomendación final.
            </p>
            <div className="space-y-3">
              {diagnosis.alternatives_considered.map((alt) => (
                <div key={alt.option} className="border border-gray-200 rounded-xl p-3 bg-gray-50">
                  <p className="text-sm font-semibold text-gray-900">
                    {alt.option}
                  </p>
                  {alt.why_considered && (
                    <p className="mt-1 text-xs text-gray-600">
                      <span className="font-medium">Por qué se consideró:</span> {alt.why_considered}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-600">
                    <span className="font-medium">Por qué no fue la opción final:</span> {alt.why_not_final}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Columna lateral */}
      <div className="space-y-6">
        {/* Confidence card */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="w-5 h-5 text-brand-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Confianza del diagnóstico
              </h3>
              <p className="text-xs text-gray-500">
                Transparencia sobre cuán seguro está el agente.
              </p>
            </div>
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <p className="text-3xl font-bold text-gray-900">
              {Math.round(diagnosis.confidence_score * 100)}%
            </p>
            <p className="text-xs font-medium text-brand-700 bg-brand-50 px-2 py-1 rounded-full">
              {confidenceLabel}
            </p>
          </div>
          <p className="text-xs text-gray-600">
            {diagnosis.confidence_reasoning}
          </p>
          {hasLowConfidence && (
            <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-amber-800">
                  Confianza moderada o baja
                </p>
                <p className="text-xs text-amber-800 mt-0.5">
                  Te recomendamos revisar este diagnóstico con tu equipo antes de tomar decisiones clave.
                </p>
              </div>
            </div>
          )}
          {diagnosis.missing_information && diagnosis.missing_information.length > 0 && (
            <div className="mt-3">
              <button
                type="button"
                onClick={() => setShowDetails((prev) => !prev)}
                className="text-xs text-brand-700 hover:text-brand-900 font-medium"
              >
                {showDetails ? 'Ocultar detalles' : 'Ver información faltante y siguientes pasos'}
              </button>
              {showDetails && (
                <div className="mt-2 space-y-2">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
                    <p className="text-[11px] font-semibold text-amber-800 mb-1">
                      Información faltante
                    </p>
                    <ul className="text-[11px] text-amber-800 list-disc list-inside space-y-0.5">
                      {diagnosis.missing_information.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  {diagnosis.next_steps_before_implementation && diagnosis.next_steps_before_implementation.length > 0 && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-2">
                      <p className="text-[11px] font-semibold text-gray-800 mb-1">
                        Siguientes pasos recomendados antes de implementar
                      </p>
                      <ul className="text-[11px] text-gray-700 list-disc list-inside space-y-0.5">
                        {diagnosis.next_steps_before_implementation.map((step) => (
                          <li key={step}>{step}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Complexity breakdown */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t('diagnosis.complexity.title')}
          </h3>
          <dl className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-gray-500">Complejidad técnica</dt>
              <dd className="font-medium text-gray-900">{diagnosis.complexity.technical}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-gray-500">Complejidad organizacional</dt>
              <dd className="font-medium text-gray-900">{diagnosis.complexity.organizational}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-gray-500">Complejidad de datos</dt>
              <dd className="font-medium text-gray-900">{diagnosis.complexity.data}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-gray-500">Complejidad de integración</dt>
              <dd className="font-medium text-gray-900">{diagnosis.complexity.integration}</dd>
            </div>
          </dl>
        </div>

        {/* Timeline */}
        {timelineEntries.length > 0 && (
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="w-5 h-5 text-brand-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Horizonte de implementación
              </h3>
            </div>
            <ul className="space-y-2 text-sm">
              {timelineEntries.map(([phase, duration]) => (
                <li key={phase} className="flex items-center justify-between">
                  <span className="font-medium text-gray-800 uppercase text-xs">
                    {phase}
                  </span>
                  <span className="text-gray-700 text-sm">
                    {duration}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Risks */}
        {diagnosis.risks.length > 0 && (
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="w-5 h-5 text-brand-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Riesgos y mitigaciones
              </h3>
            </div>
            <div className="space-y-3">
              {diagnosis.risks.map((risk) => (
                <div key={risk.risk} className="border border-gray-200 rounded-xl p-3 bg-gray-50">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-gray-900">
                      {risk.risk}
                    </p>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-700">
                      {risk.severity}
                    </span>
                  </div>
                  <p className="text-xs text-gray-700">
                    <span className="font-medium">Mitigación:</span> {risk.mitigation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
