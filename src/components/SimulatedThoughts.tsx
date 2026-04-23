
import { useEffect, useRef } from 'react'
import { BrainCircuit, Cpu } from 'lucide-react'

import type { GenerationProgressStep } from '../services/pocGenerator'

type SimulatedThoughtsProps = {
  t: (key: string, params?: Record<string, string | number>) => string
  steps?: GenerationProgressStep[]
  status?: string
}

function renderMessage(
  step: GenerationProgressStep,
  t: (key: string, params?: Record<string, string | number>) => string,
): string {
  if (step.key) {
    const translated = t(step.key, step.params)
    // If the key is missing from the dictionary the i18n helper returns the
    // key itself — in that case fall back to the raw message so the user
    // still sees something readable.
    if (translated && translated !== step.key) return translated
  }
  return step.message
}

function renderTitle(
  step: GenerationProgressStep,
  t: (key: string, params?: Record<string, string | number>) => string,
): string | null {
  if (step.title_key) {
    const translated = t(step.title_key, step.title_params)
    if (translated && translated !== step.title_key) return translated
  }
  return step.title ?? null
}

export function SimulatedThoughts({ t, steps = [], status = 'in_progress' }: SimulatedThoughtsProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [steps.length, status])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm transition-all duration-500">
      <div className="bg-white rounded-2xl shadow-2xl px-8 py-8 flex flex-col items-center gap-6 border border-brand-100 max-w-md w-full mx-4 relative overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-500 via-purple-500 to-brand-500 animate-shimmer" />

        <div className="relative">
           <div className="absolute inset-0 bg-brand-100 rounded-full animate-ping opacity-25" />
           <div className="bg-brand-50 p-4 rounded-full relative">
             <BrainCircuit className="w-8 h-8 text-brand-600 animate-pulse" />
           </div>
        </div>

        <div className="text-center space-y-2">
           <h3 className="text-lg font-semibold text-gray-900">
             {t('pocGenerator.generating')}
           </h3>
           <p className="text-sm text-gray-600">
             {status === 'error'
               ? t('thoughts.error')
               : t('thoughts.subtitle')}
           </p>
        </div>

        <div className="w-full max-h-64 overflow-y-auto rounded-xl border border-gray-100 bg-gray-50/70 px-4 py-3 text-left text-sm text-gray-700">
          {steps.length === 0 ? (
            <div className="flex flex-col gap-2 text-gray-500">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 animate-pulse" />
                <span>{t('thoughts.connecting')}</span>
              </div>
              <p className="text-xs text-gray-400 ml-6">
                {t('thoughts.waitMessage')}
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {steps.map((step, idx) => {
                const resolvedTitle = renderTitle(step, t)
                const resolvedMessage = renderMessage(step, t)
                return (
                  <li key={`${step.timestamp || idx}`} className="flex gap-3">
                    <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand-100 text-[10px] font-semibold text-brand-700">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-brand-500">
                        {step.source === 'model' ? t('thoughts.source.model') : t('thoughts.source.system')}{resolvedTitle ? ` • ${resolvedTitle}` : ''}
                      </p>
                      <p className="text-sm text-gray-700 whitespace-pre-line">{resolvedMessage}</p>
                    </div>
                  </li>
                )
              })}
              <div ref={bottomRef} />
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
