export interface RoiOracleCase {
  id: string
  title: string
  vertical: string
  summary: string
  roiMin: number
  roiMax: number
  paybackMonths: number
  timeline: string
  riskLevel: 'Low' | 'Medium' | 'High'
  confidence: 'Low' | 'Medium' | 'High'
  dataAssets: string[]
  reasoningHighlights: string[]
  estimatedWeeks: number
}
