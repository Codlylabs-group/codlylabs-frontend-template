/**
 * ROI Oracle - Consolidated Index
 *
 * Centralized access to all 400 ROI cases across 10 industry verticals
 * Based on benchmarks from McKinsey, Gartner, Forrester
 */

import { ROICase } from './types'
import { retailROICases } from './roiOracleRetail'
import { financeROICases } from './roiOracleFinance'
import { healthcareROICases } from './roiOracleHealthcare'
import manufacturingCases from './roiOracleManufacturing'
import marketingCases from './roiOracleMarketing'
import logisticsCases from './roiOracleLogistics'
import hrCases from './roiOracleHR'
import legalCases from './roiOracleLegal'
import cyberCases from './roiOracleCyber'
import realEstateCases from './roiOracleRealEstate'

// Consolidated array of all ROI cases
export const allROICases: ROICase[] = [
  ...retailROICases,           // 80 casos
  ...financeROICases,          // 60 casos
  ...healthcareROICases,       // 60 casos
  ...manufacturingCases,       // 50 casos
  ...marketingCases,           // 40 casos
  ...logisticsCases,           // 30 casos
  ...hrCases,                  // 20 casos
  ...legalCases,               // 20 casos
  ...cyberCases,               // 20 casos
  ...realEstateCases           // 20 casos
  // Total: 400 casos
]

// Export ROICase type for external use
export type { ROICase }

// Export individual vertical arrays for targeted access
export {
  retailROICases,
  financeROICases,
  healthcareROICases,
  manufacturingCases,
  marketingCases,
  logisticsCases,
  hrCases,
  legalCases,
  cyberCases,
  realEstateCases
}

// ============================================================================
// SEARCH & FILTER UTILITIES
// ============================================================================

/**
 * Find cases by industry vertical
 */
export const findCasesByIndustry = (industry: string): ROICase[] => {
  return allROICases.filter(c =>
    c.industry.toLowerCase().includes(industry.toLowerCase())
  )
}

/**
 * Find cases by company size
 */
export const findCasesByCompanySize = (size: 'SMB' | 'Mid-Market' | 'Enterprise'): ROICase[] => {
  return allROICases.filter(c => c.companySize === size)
}

/**
 * Find cases by data source
 */
export const findCasesByDataSource = (
  dataSource: 'customer_case' | 'industry_benchmark' | 'model_prediction'
): ROICase[] => {
  return allROICases.filter(c => c.dataSource === dataSource)
}

/**
 * Find similar cases based on ID
 * Returns cases that are referenced in the similarCases array
 */
export const findSimilarCases = (caseId: string, limit: number = 5): ROICase[] => {
  const targetCase = allROICases.find(c => c.id === caseId)
  if (!targetCase) return []

  // Get cases referenced in similarCases
  const similarIds = targetCase.similarCases.slice(0, limit)
  return allROICases.filter(c => similarIds.includes(c.id))
}

/**
 * Find cases by ROI range (realistic ROI)
 */
export const getCasesByROIRange = (minROI: number, maxROI: number): ROICase[] => {
  return allROICases.filter(
    c => c.roi.realistic >= minROI && c.roi.realistic <= maxROI
  )
}

/**
 * Find cases by investment range
 */
export const getCasesByInvestmentRange = (minInvest: number, maxInvest: number): ROICase[] => {
  return allROICases.filter(
    c => c.investment.total >= minInvest && c.investment.total <= maxInvest
  )
}

/**
 * Find cases by payback period (months)
 */
export const getCasesByPaybackPeriod = (maxMonths: number): ROICase[] => {
  return allROICases.filter(c => c.paybackMonths <= maxMonths)
}

/**
 * Find cases by confidence level
 */
export const getCasesByConfidence = (minConfidence: number): ROICase[] => {
  return allROICases.filter(c => c.confidence >= minConfidence)
}

/**
 * Search cases by tags
 */
export const searchCasesByTags = (tags: string[]): ROICase[] => {
  return allROICases.filter(c =>
    tags.some(tag =>
      c.tags.some(caseTag =>
        caseTag.toLowerCase().includes(tag.toLowerCase())
      )
    )
  )
}

/**
 * Full text search across problem, solution, and useCase
 */
export const searchCases = (query: string): ROICase[] => {
  const lowerQuery = query.toLowerCase()
  return allROICases.filter(c =>
    c.useCase.toLowerCase().includes(lowerQuery) ||
    c.problem.toLowerCase().includes(lowerQuery) ||
    c.solution.toLowerCase().includes(lowerQuery) ||
    c.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  )
}

// ============================================================================
// ANALYTICS UTILITIES
// ============================================================================

/**
 * Get average ROI by industry
 */
export const getAverageROIByIndustry = (industry: string): {
  conservative: number
  realistic: number
  optimistic: number
} => {
  const cases = findCasesByIndustry(industry)
  if (cases.length === 0) return { conservative: 0, realistic: 0, optimistic: 0 }

  const sumROI = cases.reduce(
    (acc, c) => ({
      conservative: acc.conservative + c.roi.conservative,
      realistic: acc.realistic + c.roi.realistic,
      optimistic: acc.optimistic + c.roi.optimistic
    }),
    { conservative: 0, realistic: 0, optimistic: 0 }
  )

  return {
    conservative: Math.round(sumROI.conservative / cases.length),
    realistic: Math.round(sumROI.realistic / cases.length),
    optimistic: Math.round(sumROI.optimistic / cases.length)
  }
}

/**
 * Get average investment by industry
 */
export const getAverageInvestmentByIndustry = (industry: string): number => {
  const cases = findCasesByIndustry(industry)
  if (cases.length === 0) return 0

  const sumInvestment = cases.reduce((acc, c) => acc + c.investment.total, 0)
  return Math.round(sumInvestment / cases.length)
}

/**
 * Get average payback period by industry
 */
export const getAveragePaybackByIndustry = (industry: string): number => {
  const cases = findCasesByIndustry(industry)
  if (cases.length === 0) return 0

  const sum = cases.reduce((acc, c) => acc + c.paybackMonths, 0)
  return Math.round(sum / cases.length)
}

/**
 * Get distribution of company sizes
 */
export const getCompanySizeDistribution = (): {
  SMB: number
  'Mid-Market': number
  Enterprise: number
} => {
  return {
    SMB: allROICases.filter(c => c.companySize === 'SMB').length,
    'Mid-Market': allROICases.filter(c => c.companySize === 'Mid-Market').length,
    Enterprise: allROICases.filter(c => c.companySize === 'Enterprise').length
  }
}

/**
 * Get most common tags across all cases
 */
export const getTopTags = (limit: number = 20): { tag: string; count: number }[] => {
  const tagCounts = new Map<string, number>()

  allROICases.forEach(c => {
    c.tags.forEach(tag => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
    })
  })

  return Array.from(tagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

/**
 * Get statistics summary
 */
export const getStatisticsSummary = () => {
  const totalCases = allROICases.length

  const avgROI = allROICases.reduce((sum, c) => sum + c.roi.realistic, 0) / totalCases
  const avgInvestment = allROICases.reduce((sum, c) => sum + c.investment.total, 0) / totalCases
  const avgPayback = allROICases.reduce((sum, c) => sum + c.paybackMonths, 0) / totalCases
  const avgConfidence = allROICases.reduce((sum, c) => sum + c.confidence, 0) / totalCases

  const minROI = Math.min(...allROICases.map(c => c.roi.realistic))
  const maxROI = Math.max(...allROICases.map(c => c.roi.realistic))

  const industries = [...new Set(allROICases.map(c => c.industry))]

  return {
    totalCases,
    avgROI: Math.round(avgROI),
    avgInvestment: Math.round(avgInvestment),
    avgPayback: Math.round(avgPayback),
    avgConfidence: Math.round(avgConfidence * 100) / 100,
    minROI: Math.round(minROI),
    maxROI: Math.round(maxROI),
    industries: industries.length,
    companySize: getCompanySizeDistribution()
  }
}

/**
 * Find best ROI cases (top performers)
 */
export const getBestROICases = (limit: number = 10): ROICase[] => {
  return [...allROICases]
    .sort((a, b) => b.roi.realistic - a.roi.realistic)
    .slice(0, limit)
}

/**
 * Find fastest payback cases
 */
export const getFastestPaybackCases = (limit: number = 10): ROICase[] => {
  return [...allROICases]
    .sort((a, b) => a.paybackMonths - b.paybackMonths)
    .slice(0, limit)
}

/**
 * Find highest confidence cases
 */
export const getHighestConfidenceCases = (limit: number = 10): ROICase[] => {
  return [...allROICases]
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, limit)
}

/**
 * Get case by ID
 */
export const getCaseById = (id: string): ROICase | undefined => {
  return allROICases.find(c => c.id === id)
}

/**
 * Get random cases (useful for examples/previews)
 */
export const getRandomCases = (count: number = 5): ROICase[] => {
  const shuffled = [...allROICases].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

// ============================================================================
// ML PREDICTION UTILITIES (for future use)
// ============================================================================

/**
 * Find comparable cases for ROI prediction
 * Based on industry, segment, and company size similarity
 */
export const findComparableCases = (
  industry: string,
  segment?: string,
  companySize?: 'SMB' | 'Mid-Market' | 'Enterprise',
  limit: number = 10
): ROICase[] => {
  let filtered = findCasesByIndustry(industry)

  if (segment) {
    filtered = filtered.filter(c =>
      c.subIndustry?.toLowerCase().includes(segment.toLowerCase())
    )
  }

  if (companySize) {
    filtered = filtered.filter(c => c.companySize === companySize)
  }

  // Sort by confidence (highest first)
  return filtered
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, limit)
}

/**
 * Calculate weighted average ROI from comparable cases
 * Weight by confidence score
 */
export const predictROIFromComparables = (
  comparableCases: ROICase[]
): {
  conservative: number
  realistic: number
  optimistic: number
  confidence: number
} => {
  if (comparableCases.length === 0) {
    return { conservative: 0, realistic: 0, optimistic: 0, confidence: 0 }
  }

  const totalConfidence = comparableCases.reduce((sum, c) => sum + c.confidence, 0)

  const weightedROI = comparableCases.reduce(
    (acc, c) => {
      const weight = c.confidence / totalConfidence
      return {
        conservative: acc.conservative + c.roi.conservative * weight,
        realistic: acc.realistic + c.roi.realistic * weight,
        optimistic: acc.optimistic + c.roi.optimistic * weight
      }
    },
    { conservative: 0, realistic: 0, optimistic: 0 }
  )

  return {
    conservative: Math.round(weightedROI.conservative),
    realistic: Math.round(weightedROI.realistic),
    optimistic: Math.round(weightedROI.optimistic),
    confidence: totalConfidence / comparableCases.length
  }
}

// Default export
export default allROICases
