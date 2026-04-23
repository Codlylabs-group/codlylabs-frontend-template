import { roiOracleCases } from '../data/roiOracleCases'

const formatShortCost = (value: number) => {
  const thousands = value / 1000
  const normalized = Number.isInteger(thousands) ? `${thousands}` : thousands.toFixed(1)
  return `$${normalized}K`
}

const parseTimelineWeeks = (timeline: string) => {
  const rangeMatch = timeline.match(/(\d+(?:\.\d+)?)\s*[-–—]\s*(\d+(?:\.\d+)?)/)
  if (rangeMatch) {
    return {
      min: parseFloat(rangeMatch[1]),
      max: parseFloat(rangeMatch[2]),
    }
  }

  const singleMatch = timeline.match(/(\d+(?:\.\d+)?)/)
  if (singleMatch) {
    const weekValue = parseFloat(singleMatch[1])
    return { min: weekValue, max: weekValue }
  }

  return { min: 0, max: 0 }
}

export function formatRoiCostLabel(caseId: string) {
  const roiCase = roiOracleCases.find((item) => item.id === caseId)
  if (!roiCase) {
    return 'N/A'
  }

  const { min, max } = parseTimelineWeeks(roiCase.timeline)
  const minWeeks = min || roiCase.estimatedWeeks
  const maxWeeks = max || roiCase.estimatedWeeks
  const minCost = Math.round(minWeeks * 2500)
  const maxCost = Math.round(maxWeeks * 2500)

  if (minCost === maxCost) {
    return formatShortCost(minCost)
  }

  return `${formatShortCost(minCost)} – ${formatShortCost(maxCost)}`
}
