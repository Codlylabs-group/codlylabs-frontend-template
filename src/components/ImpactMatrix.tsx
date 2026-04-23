import { useMemo } from 'react'

type QuadrantKey =
  | 'high_impact_low_effort'
  | 'high_impact_high_effort'
  | 'medium_impact_low_effort'
  | 'medium_impact_high_effort'

export interface ImpactMatrixProps {
  items: Array<{
    id: string
    label: string
    impact: number
    effort: number
  }>
}

const quadrantOrder: Array<{ key: QuadrantKey; title: string }> = [
  { key: 'high_impact_high_effort', title: 'Alto impacto · Alta complejidad' },
  { key: 'high_impact_low_effort', title: 'Alto impacto · Baja complejidad' },
  { key: 'medium_impact_high_effort', title: 'Impacto medio · Alta complejidad' },
  { key: 'medium_impact_low_effort', title: 'Impacto medio · Baja complejidad' },
]

export function ImpactMatrix({ items }: ImpactMatrixProps) {
  const quadrants = useMemo(() => {
    const buckets: Record<QuadrantKey, string[]> = {
      high_impact_low_effort: [],
      high_impact_high_effort: [],
      medium_impact_low_effort: [],
      medium_impact_high_effort: [],
    }

    items.forEach((item) => {
      const impactKey = item.impact >= 0.5 ? 'high' : 'medium'
      const effortKey = item.effort >= 0.5 ? 'high' : 'low'
      const key = `${impactKey}_impact_${effortKey}_effort` as QuadrantKey
      buckets[key].push(item.label)
    })

    return buckets
  }, [items])

  const handleExportSvg = () => {
    const svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" width="520" height="360">
        <rect x="0" y="0" width="100%" height="100%" fill="#f8fafc" rx="24" stroke="#e5e7eb" />
        <text x="260" y="32" text-anchor="middle" font-size="14" font-weight="600" fill="#0f172a">
          Matriz de impacto vs esfuerzo
        </text>
      </svg>
    `
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'impact_matrix.svg'
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  }

  const quadrantLabels = (key: QuadrantKey) =>
    quadrants[key].length > 0 ? quadrants[key] : ['Sin iniciativas asignadas']

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div>
          <p className="text-xs font-semibold text-gray-900">Matriz de impacto vs esfuerzo</p>
          <p className="text-sm text-gray-500">Impacto de negocio contra complejidad técnica por iniciativa.</p>
        </div>
        <button
          type="button"
          onClick={handleExportSvg}
          className="px-3 py-1.5 rounded-full border border-gray-300 text-xs font-semibold text-gray-600 hover:bg-gray-50"
        >
          Exportar imagen (SVG)
        </button>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 p-4">
        <div className="absolute inset-6 flex">
          <div className="w-1/2 border-r border-dashed border-gray-200" />
          <div className="w-1/2 border-l border-dashed border-gray-200" />
        </div>
        <div className="absolute inset-y-6 flex flex-col">
          <div className="h-1/2 border-b border-dashed border-gray-200" />
          <div className="h-1/2 border-t border-dashed border-gray-200" />
        </div>

        <div className="grid md:grid-cols-2 gap-4 relative z-10">
          {quadrantOrder.map(({ key, title }) => (
            <article key={key} className="rounded-2xl border border-gray-200 bg-white/70 p-5 shadow-sm">
              <p className="text-sm font-semibold text-gray-700 mb-3">{title}</p>
              <ul className="space-y-1 text-xs text-gray-600 list-disc list-inside">
                {quadrantLabels(key).map((label) => (
                  <li key={`${key}-${label}`}>{label}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="absolute -left-10 top-1/2 -translate-y-1/2 -rotate-90 text-[11px] text-gray-500 font-medium">
          Impacto de Negocio (ROI Potencial)
        </div>
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[11px] text-gray-500 font-medium">
          Complejidad Técnica
        </div>
      </div>
    </div>
  )
}
