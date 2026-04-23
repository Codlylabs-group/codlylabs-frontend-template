import type { RoadmapPhase } from '../services/roadmap'
import { useI18n } from '../i18n'

interface RoadmapTimelineProps {
  phases: RoadmapPhase[]
}

export default function RoadmapTimeline({ phases }: RoadmapTimelineProps) {
  const { t } = useI18n()
  
  if (!phases.length) return null

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {phases.map((phase) => (
        <div
          key={phase.name}
          className="bg-white rounded-2xl shadow-md border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {phase.name}
            </h3>
            <span className="text-xs font-medium text-brand-600 bg-brand-50 px-2 py-1 rounded-full">
              {phase.duration}
            </span>
          </div>
          <p className="text-sm text-gray-700 mb-3">
            {phase.description}
          </p>
          <p className="text-xs text-gray-500 mb-3">
            {t('roadmap.timeline.objective')} {phase.objective}
          </p>
          <div className="grid md:grid-cols-2 gap-4 text-xs">
            <div>
              <p className="font-semibold text-gray-800 mb-1">
                {t('roadmap.timeline.keyActivities')}
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                {phase.key_activities.slice(0, 4).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-semibold text-gray-800 mb-1">
                {t('roadmap.timeline.deliverables')}
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                {phase.deliverables.slice(0, 3).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
          {phase.dependencies && phase.dependencies.length > 0 && (
            <p className="mt-3 text-[11px] text-gray-500">
              {t('roadmap.timeline.dependencies')} {phase.dependencies.join(', ')}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
