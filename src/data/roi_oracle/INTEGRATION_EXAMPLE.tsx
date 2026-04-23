/**
 * ROI Oracle - Integration Example
 *
 * Real-world React component demonstrating how to use the ROI Oracle data
 * in your POC Generator application.
 */

import { useState, useMemo } from 'react'
import {
  findComparableCases,
  predictROIFromComparables,
  getAverageROIByIndustry,
  getBestROICases,
  searchCases,
  type ROICase
} from '@/data/roi_oracle'

// ============================================================================
// Example 1: ROI Prediction Component for Onboarding Flow
// ============================================================================

interface ROIPredictionProps {
  industry: string
  segment?: string
  companySize: 'SMB' | 'Mid-Market' | 'Enterprise'
  onComplete: (prediction: any) => void
}

export function ROIPredictionWidget({
  industry,
  segment,
  companySize,
  onComplete
}: ROIPredictionProps) {
  // Find comparable cases
  const comparables = useMemo(() => {
    return findComparableCases(industry, segment, companySize, 10)
  }, [industry, segment, companySize])

  // Calculate prediction
  const prediction = useMemo(() => {
    if (comparables.length === 0) return null
    return predictROIFromComparables(comparables)
  }, [comparables])

  // Calculate additional metrics
  const avgInvestment = useMemo(() => {
    if (comparables.length === 0) return 0
    return Math.round(
      comparables.reduce((sum, c) =>
        sum + c.investment.total, 0
      ) / comparables.length
    )
  }, [comparables])

  const avgPayback = useMemo(() => {
    if (comparables.length === 0) return 0
    return Math.round(
      comparables.reduce((sum, c) => sum + c.paybackMonths, 0) / comparables.length
    )
  }, [comparables])

  if (!prediction) {
    return (
      <div className="roi-widget empty">
        <p>No comparable cases found for {industry} ({companySize})</p>
        <p>Try selecting a different industry or company size.</p>
      </div>
    )
  }

  return (
    <div className="roi-widget">
      <div className="header">
        <h3>Expected ROI</h3>
        <span className="badge">{comparables.length} similar cases</span>
      </div>

      <div className="roi-range">
        <div className="roi-bar">
          <div className="bar-segment conservative" style={{ width: '33%' }}>
            <span className="label">Conservative</span>
            <span className="value">{prediction.conservative}%</span>
          </div>
          <div className="bar-segment realistic" style={{ width: '33%' }}>
            <span className="label">Realistic</span>
            <span className="value">{prediction.realistic}%</span>
          </div>
          <div className="bar-segment optimistic" style={{ width: '34%' }}>
            <span className="label">Optimistic</span>
            <span className="value">{prediction.optimistic}%</span>
          </div>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric">
          <span className="label">Typical Investment</span>
          <span className="value">${(avgInvestment / 1000).toFixed(0)}K</span>
        </div>
        <div className="metric">
          <span className="label">Payback Period</span>
          <span className="value">{avgPayback} months</span>
        </div>
        <div className="metric">
          <span className="label">Confidence</span>
          <span className="value">{Math.round(prediction.confidence * 100)}%</span>
        </div>
      </div>

      <div className="sample-cases">
        <h4>Based on similar implementations:</h4>
        <ul>
          {comparables.slice(0, 3).map(c => (
            <li key={c.id}>
              <strong>{c.useCase}</strong>
              <span className="roi-tag">{c.roi.realistic}% ROI</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={() => onComplete({ prediction, comparables, avgInvestment, avgPayback })}
        className="continue-btn"
      >
        Continue with this estimate
      </button>
    </div>
  )
}

// ============================================================================
// Example 2: Industry Benchmarking Dashboard
// ============================================================================

export function IndustryBenchmarkDashboard() {
  const industries = ['Retail', 'Financial Services', 'Healthcare']

  const benchmarks = industries.map(industry => {
    const avgROI = getAverageROIByIndustry(industry)
    const topCases = getBestROICases(5).filter(c => c.industry === industry)

    return {
      industry,
      avgROI,
      topCases
    }
  })

  return (
    <div className="benchmark-dashboard">
      <h2>Industry Benchmarks</h2>

      <div className="benchmark-grid">
        {benchmarks.map(({ industry, avgROI, topCases }) => (
          <div key={industry} className="benchmark-card">
            <h3>{industry}</h3>

            <div className="avg-roi">
              <span className="label">Average ROI</span>
              <span className="value">{avgROI.realistic}%</span>
              <span className="range">
                ({avgROI.conservative}% - {avgROI.optimistic}%)
              </span>
            </div>

            <div className="top-cases">
              <h4>Top Use Cases:</h4>
              <ol>
                {topCases.map(c => (
                  <li key={c.id}>
                    {c.useCase}
                    <span className="roi">{c.roi.realistic}%</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// Example 3: Case Explorer with Search
// ============================================================================

export function CaseExplorer() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIndustry, setSelectedIndustry] = useState('')
  const [selectedSize, setSelectedSize] = useState<'' | 'SMB' | 'Mid-Market' | 'Enterprise'>('')
  const [minROI, setMinROI] = useState(0)

  const filteredCases = useMemo(() => {
    let cases = searchQuery ? searchCases(searchQuery) : []

    if (selectedIndustry) {
      cases = cases.filter(c =>
        c.industry.toLowerCase().includes(selectedIndustry.toLowerCase())
      )
    }

    if (selectedSize) {
      cases = cases.filter(c => c.companySize === selectedSize)
    }

    if (minROI > 0) {
      cases = cases.filter(c => c.roi.realistic >= minROI)
    }

    return cases.slice(0, 20) // Limit to 20 results
  }, [searchQuery, selectedIndustry, selectedSize, minROI])

  return (
    <div className="case-explorer">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search cases (e.g., 'fraud detection', 'forecasting')..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="filters">
        <select
          value={selectedIndustry}
          onChange={e => setSelectedIndustry(e.target.value)}
        >
          <option value="">All Industries</option>
          <option value="Retail">Retail</option>
          <option value="Financial Services">Financial Services</option>
          <option value="Healthcare">Healthcare</option>
        </select>

        <select
          value={selectedSize}
          onChange={e => setSelectedSize(e.target.value as any)}
        >
          <option value="">All Sizes</option>
          <option value="Enterprise">Enterprise</option>
          <option value="Mid-Market">Mid-Market</option>
          <option value="SMB">SMB</option>
        </select>

        <div className="slider">
          <label>Min ROI: {minROI}%</label>
          <input
            type="range"
            min="0"
            max="2000"
            step="100"
            value={minROI}
            onChange={e => setMinROI(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="results">
        <p>{filteredCases.length} cases found</p>

        <div className="cases-list">
          {filteredCases.map(c => (
            <CaseCard key={c.id} case={c} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Supporting Component: Case Card
// ============================================================================

function CaseCard({ case: c }: { case: ROICase }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={`case-card ${expanded ? 'expanded' : ''}`}>
      <div className="case-header" onClick={() => setExpanded(!expanded)}>
        <h4>{c.useCase}</h4>
        <div className="meta">
          <span className="industry">{c.industry}</span>
          <span className="size">{c.companySize}</span>
        </div>
      </div>

      <div className="case-metrics">
        <div className="metric">
          <span className="label">ROI</span>
          <span className="value">{c.roi.realistic}%</span>
        </div>
        <div className="metric">
          <span className="label">Investment</span>
          <span className="value">
            ${(c.investment.total / 1000).toFixed(0)}K
          </span>
        </div>
        <div className="metric">
          <span className="label">Payback</span>
          <span className="value">{c.paybackMonths}mo</span>
        </div>
        <div className="metric">
          <span className="label">Confidence</span>
          <span className="value">{Math.round(c.confidence * 100)}%</span>
        </div>
      </div>

      {expanded && (
        <div className="case-details">
          <div className="section">
            <h5>Problem</h5>
            <p>{c.problem}</p>
          </div>

          <div className="section">
            <h5>Solution</h5>
            <p>{c.solution}</p>
          </div>

          <div className="section">
            <h5>Annual Benefit Breakdown</h5>
            <div className="breakdown">
              <div className="item">
                <span>Annual Savings</span>
                <span>${(c.benefits.annualSavings / 1000).toFixed(0)}K</span>
              </div>
              <div className="item">
                <span>Revenue Increase</span>
                <span>${(c.benefits.revenueIncrease / 1000).toFixed(0)}K</span>
              </div>
              <div className="item">
                <span>Efficiency Gains</span>
                <span>${(c.benefits.efficiencyGains / 1000).toFixed(0)}K</span>
              </div>
            </div>
          </div>

          <div className="section">
            <h5>Timeline</h5>
            <div className="timeline">
              <div>POC: {c.timeline.poc}</div>
              <div>MVP: {c.timeline.mvp}</div>
              <div>Production: {c.timeline.production}</div>
            </div>
          </div>

          <div className="tags">
            {c.tags.map((tag: string) => (
              <span key={tag} className="tag">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Example 4: ROI Calculator with Real Benchmarks
// ============================================================================

interface ROICalculatorProps {
  defaultIndustry?: string
  defaultCompanySize?: 'SMB' | 'Mid-Market' | 'Enterprise'
}

export function ROICalculatorWithBenchmarks({
  defaultIndustry = 'Retail',
  defaultCompanySize = 'Enterprise'
}: ROICalculatorProps) {
  const [inputs, setInputs] = useState({
    industry: defaultIndustry,
    companySize: defaultCompanySize,
    investment: 250000,
    currentAnnualCosts: 1000000
  })

  const comparables = findComparableCases(
    inputs.industry,
    undefined,
    inputs.companySize,
    10
  )

  const prediction = predictROIFromComparables(comparables)

  // Calculate projected results
  const annualBenefit = inputs.investment * (prediction.realistic / 100)
  const netBenefit = annualBenefit - inputs.investment
  const costReduction = (annualBenefit / inputs.currentAnnualCosts) * 100
  const threeYearValue = netBenefit * 3

  return (
    <div className="roi-calculator">
      <h2>ROI Calculator</h2>
      <p className="subtitle">Based on {comparables.length} similar implementations</p>

      <div className="calculator-grid">
        <div className="inputs-panel">
          <h3>Your Details</h3>

          <div className="input-group">
            <label>Industry</label>
            <select
              value={inputs.industry}
              onChange={e => setInputs({ ...inputs, industry: e.target.value })}
            >
              <option value="Retail">Retail & E-Commerce</option>
              <option value="Financial Services">Financial Services</option>
              <option value="Healthcare">Healthcare</option>
            </select>
          </div>

          <div className="input-group">
            <label>Company Size</label>
            <select
              value={inputs.companySize}
              onChange={e => setInputs({ ...inputs, companySize: e.target.value as any })}
            >
              <option value="Enterprise">Enterprise</option>
              <option value="Mid-Market">Mid-Market</option>
              <option value="SMB">SMB</option>
            </select>
          </div>

          <div className="input-group">
            <label>Planned Investment</label>
            <input
              type="number"
              value={inputs.investment}
              onChange={e => setInputs({ ...inputs, investment: Number(e.target.value) })}
            />
          </div>

          <div className="input-group">
            <label>Current Annual Costs</label>
            <input
              type="number"
              value={inputs.currentAnnualCosts}
              onChange={e => setInputs({ ...inputs, currentAnnualCosts: Number(e.target.value) })}
            />
          </div>
        </div>

        <div className="results-panel">
          <h3>Projected Results</h3>

          <div className="result-cards">
            <div className="result-card primary">
              <span className="label">Expected ROI</span>
              <span className="value">{prediction.realistic}%</span>
              <span className="range">
                Range: {prediction.conservative}% - {prediction.optimistic}%
              </span>
            </div>

            <div className="result-card">
              <span className="label">Annual Benefit</span>
              <span className="value">
                ${(annualBenefit / 1000000).toFixed(2)}M
              </span>
            </div>

            <div className="result-card">
              <span className="label">Net Benefit (Year 1)</span>
              <span className="value">
                ${(netBenefit / 1000000).toFixed(2)}M
              </span>
            </div>

            <div className="result-card">
              <span className="label">Cost Reduction</span>
              <span className="value">{costReduction.toFixed(1)}%</span>
            </div>

            <div className="result-card">
              <span className="label">3-Year Value</span>
              <span className="value">
                ${(threeYearValue / 1000000).toFixed(2)}M
              </span>
            </div>

            <div className="result-card">
              <span className="label">Confidence Score</span>
              <span className="value">
                {Math.round(prediction.confidence * 100)}%
              </span>
            </div>
          </div>

          <div className="disclaimer">
            <p>
              Estimates based on {comparables.length} similar cases from {inputs.industry}.
              Actual results may vary based on implementation quality and business context.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// CSS Styles (Example)
// ============================================================================

export const roiOracleStyles = `
.roi-widget {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.roi-range {
  margin: 20px 0;
}

.roi-bar {
  display: flex;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
}

.bar-segment {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  font-weight: 600;
}

.bar-segment.conservative { background: #ef4444; }
.bar-segment.realistic { background: #10b981; }
.bar-segment.optimistic { background: #3b82f6; }

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin: 20px 0;
}

.metric {
  text-align: center;
  padding: 16px;
  background: #f3f4f6;
  border-radius: 6px;
}

.metric .label {
  display: block;
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
}

.metric .value {
  display: block;
  font-size: 20px;
  font-weight: 700;
  color: #111827;
}

.case-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.case-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}

.result-card.primary {
  grid-column: span 2;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.result-card.primary .value {
  font-size: 48px;
}
`
