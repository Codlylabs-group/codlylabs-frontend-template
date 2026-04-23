import { useMemo } from 'react'
import { CheckCircle2, HelpCircle, Lightbulb, Network, Target } from 'lucide-react'

import type { ReasoningOutput } from '../types/diagnosis'

interface ReasoningTimelineProps {
  reasoning: ReasoningOutput['reasoning']
}

const STEP_ICON: Record<string, JSX.Element> = {
  problem_analysis: <Target className="w-4 h-4" />,
  solution_exploration: <Lightbulb className="w-4 h-4" />,
  viability_evaluation: <CheckCircle2 className="w-4 h-4" />,
  tech_stack_selection: <Network className="w-4 h-4" />,
  success_definition: <CheckCircle2 className="w-4 h-4" />,
}

const STEP_LABEL: Record<string, string> = {
  problem_analysis: 'Análisis del problema',
  solution_exploration: 'Exploración de soluciones',
  viability_evaluation: 'Evaluación de viabilidad',
  tech_stack_selection: 'Selección de tech stack',
  success_definition: 'Definición de éxito',
}

const DEFAULT_ORDER = [
  'problem_analysis',
  'solution_exploration',
  'viability_evaluation',
  'tech_stack_selection',
  'success_definition',
]

export function ReasoningTimeline({ reasoning }: ReasoningTimelineProps) {
  const steps = useMemo(() => {
    const entries = Object.entries(reasoning || {})
    if (!entries.length) return []

    // Order known steps first, keep unknown steps at the end
    const ordered: Array<{ key: string; title: string; content: string }> = []
    DEFAULT_ORDER.forEach((key) => {
      const found = entries.find(([k]) => k === key)
      if (found) {
        ordered.push({ key, title: STEP_LABEL[key] ?? key, content: found[1] })
      }
    })

    entries.forEach(([key, value]) => {
      if (!DEFAULT_ORDER.includes(key)) {
        ordered.push({
          key,
          title: STEP_LABEL[key] ?? key.replace(/_/g, ' '),
          content: value,
        })
      }
    })

    return ordered
  }, [reasoning])

  if (!steps.length) return null

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Cómo llegó el agente a esta recomendación
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        Cadena de razonamiento paso a paso. Puedes revisar cada etapa para entender las decisiones del agente.
      </p>

      <ol className="relative border-l border-gray-200 pl-4 space-y-4">
        {steps.map((step, index) => (
          <li key={step.key} className="ml-2">
            <div className="absolute -left-3 flex items-center justify-center w-6 h-6 rounded-full bg-brand-50 border border-brand-100">
              {STEP_ICON[step.key] ?? <HelpCircle className="w-3 h-3 text-brand-600" />}
            </div>
            <div className="ml-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-semibold">
                  {index + 1}
                </span>
                <h4 className="text-sm font-semibold text-gray-900">
                  {step.title}
                </h4>
              </div>
              <p className="mt-2 text-sm text-gray-700 whitespace-pre-line">
                {step.content}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
