import type { RoadmapPhase } from '../services/roadmap'

interface RoadmapGanttProps {
  phases: RoadmapPhase[]
}

function estimateDays(duration: string): number {
  const text = duration.toLowerCase()
  if (text.includes('semana')) {
    if (text.includes('1-2')) return 14
    if (text.includes('2-3')) return 21
    if (text.includes('2-4')) return 28
    return 14
  }
  if (text.includes('mes')) {
    if (text.includes('1-3')) return 90
    if (text.includes('2-4')) return 120
    return 60
  }
  if (text.includes('continuo')) {
    return 180
  }
  return 30
}

export function RoadmapGantt({ phases }: RoadmapGanttProps) {
  if (!phases.length) return null

  const durations = phases.map((phase) => estimateDays(phase.duration))
  const total = durations.reduce((acc, d) => acc + d, 0)

  let offset = 0

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">
            Roadmap Gantt
          </h2>
          <p className="text-[11px] text-gray-500">
            Vista simplificada de las fases en el tiempo.
          </p>
        </div>
      </div>
      <div className="space-y-3">
        {phases.map((phase, index) => {
          const widthPercent = (durations[index] / total) * 100
          const startPercent = (offset / total) * 100
          offset += durations[index]

          return (
            <div key={phase.name} className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-gray-600">
                <span className="font-medium text-gray-800">{phase.name}</span>
                <span>{phase.duration}</span>
              </div>
              <div className="relative h-3 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="absolute h-3 rounded-full bg-brand-500"
                  style={{
                    left: `${startPercent}%`,
                    width: `${widthPercent}%`,
                  }}
                  title={`${phase.name} · ${phase.duration}`}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

