# ROI Oracle - Ejemplos de Uso

Guía práctica con ejemplos reales de cómo usar la base de datos de ROI Oracle.

## 🎯 Caso de Uso 1: Predicción de ROI para Nuevo Cliente

Un cliente del sector Retail (Enterprise) quiere implementar un sistema de detección de fraude.

```typescript
import {
  findComparableCases,
  predictROIFromComparables,
  searchCasesByTags
} from '@/data/roi_oracle'

// 1. Buscar casos de fraude en retail
const fraudCases = searchCasesByTags(['fraud-detection', 'retail'])
console.log(`Found ${fraudCases.length} fraud detection cases in retail`)

// 2. Filtrar por empresa Enterprise
const enterpriseFraud = fraudCases.filter(c => c.companySize === 'Enterprise')

// 3. Obtener predicción de ROI
const prediction = predictROIFromComparables(enterpriseFraud)

console.log('ROI Prediction:', {
  conservative: `${prediction.conservative}%`,
  realistic: `${prediction.realistic}%`,
  optimistic: `${prediction.optimistic}%`,
  confidence: `${Math.round(prediction.confidence * 100)}%`
})

// Resultado ejemplo:
// ROI Prediction: {
//   conservative: '287%',
//   realistic: '494%',
//   optimistic: '853%',
//   confidence: '91%'
// }
```

## 🎯 Caso de Uso 2: Benchmarking por Industria

Comparar ROI promedio entre diferentes industrias.

```typescript
import {
  getAverageROIByIndustry,
  getAverageInvestmentByIndustry,
  getAveragePaybackByIndustry
} from '@/data/roi_oracle'

const industries = ['Retail', 'Financial Services', 'Healthcare']

const benchmarks = industries.map(industry => ({
  industry,
  avgROI: getAverageROIByIndustry(industry),
  avgInvestment: getAverageInvestmentByIndustry(industry),
  avgPayback: getAveragePaybackByIndustry(industry)
}))

console.table(benchmarks)

// Output:
// ┌─────────┬─────────────────────┬──────────────┬────────────┬────────────┐
// │ (index) │ industry            │ avgROI       │ avgInvest  │ avgPayback │
// ├─────────┼─────────────────────┼──────────────┼────────────┼────────────┤
// │    0    │ 'Retail'            │ { realistic: │ { avg:     │     4      │
// │         │                     │    485 }     │  195000 }  │            │
// │    1    │ 'Financial Services'│ { realistic: │ { avg:     │     2      │
// │         │                     │    950 }     │  315000 }  │            │
// │    2    │ 'Healthcare'        │ { realistic: │ { avg:     │     2      │
// │         │                     │    1034 }    │  285000 }  │            │
// └─────────┴─────────────────────┴──────────────┴────────────┴────────────┘
```

## 🎯 Caso de Uso 3: Quick ROI Estimate

Mostrar estimado rápido al usuario durante onboarding.

```typescript
import {
  findCasesByIndustry,
  getCasesByPaybackPeriod
} from '@/data/roi_oracle'

function getQuickEstimate(industry: string, companySize: string) {
  // Casos en la industria
  let cases = findCasesByIndustry(industry)

  // Filtrar por tamaño si aplica
  if (companySize) {
    cases = cases.filter(c => c.companySize === companySize)
  }

  // Solo casos con payback rápido (< 4 meses)
  const fastPayback = getCasesByPaybackPeriod(4)
  cases = cases.filter(c => fastPayback.find(f => f.id === c.id))

  if (cases.length === 0) {
    return null
  }

  // Calcular promedios
  const avgROI = Math.round(
    cases.reduce((sum, c) => sum + c.roi.realistic, 0) / cases.length
  )

  const avgInvestment = Math.round(
    cases.reduce((sum, c) => sum + (c.investment.min + c.investment.max) / 2, 0) / cases.length
  )

  const avgBenefit = Math.round(
    cases.reduce((sum, c) => sum + (c.annualBenefit.min + c.annualBenefit.max) / 2, 0) / cases.length
  )

  return {
    roi: `${avgROI}%`,
    investment: `$${(avgInvestment / 1000).toFixed(0)}K`,
    annualBenefit: `$${(avgBenefit / 1000000).toFixed(1)}M`,
    payback: '2-4 months',
    sampleSize: cases.length
  }
}

// Ejemplo de uso
const estimate = getQuickEstimate('Healthcare', 'Enterprise')
console.log(estimate)

// Output:
// {
//   roi: '1034%',
//   investment: '$350K',
//   annualBenefit: '$4.8M',
//   payback: '2-4 months',
//   sampleSize: 28
// }
```

## 🎯 Caso de Uso 4: Filtro Interactivo de Casos

Componente React para filtrar casos en tiempo real.

```typescript
import { useState, useMemo } from 'react'
import {
  allROICases,
  findCasesByIndustry,
  getCasesByROIRange,
  searchCasesByTags
} from '@/data/roi_oracle'

export function CaseExplorer() {
  const [filters, setFilters] = useState({
    industry: '',
    minROI: 0,
    maxROI: 10000,
    tags: [] as string[]
  })

  const filteredCases = useMemo(() => {
    let cases = allROICases

    // Filtrar por industria
    if (filters.industry) {
      cases = findCasesByIndustry(filters.industry)
    }

    // Filtrar por ROI
    cases = cases.filter(c =>
      c.roi.realistic >= filters.minROI &&
      c.roi.realistic <= filters.maxROI
    )

    // Filtrar por tags
    if (filters.tags.length > 0) {
      cases = cases.filter(c =>
        filters.tags.some(tag => c.tags.includes(tag))
      )
    }

    return cases
  }, [filters])

  return (
    <div>
      <h2>Case Explorer ({filteredCases.length} cases)</h2>

      <div className="filters">
        <select
          value={filters.industry}
          onChange={e => setFilters({ ...filters, industry: e.target.value })}
        >
          <option value="">All Industries</option>
          <option value="Retail">Retail</option>
          <option value="Financial Services">Financial Services</option>
          <option value="Healthcare">Healthcare</option>
        </select>

        <input
          type="range"
          min="0"
          max="3000"
          value={filters.minROI}
          onChange={e => setFilters({ ...filters, minROI: Number(e.target.value) })}
        />
        <span>Min ROI: {filters.minROI}%</span>
      </div>

      <div className="cases">
        {filteredCases.map(c => (
          <div key={c.id} className="case-card">
            <h3>{c.title}</h3>
            <p>{c.industry} - {c.companySize}</p>
            <div className="metrics">
              <span>ROI: {c.roi.realistic}%</span>
              <span>Payback: {c.paybackMonths}mo</span>
              <span>Investment: ${(c.investment.min / 1000).toFixed(0)}K - ${(c.investment.max / 1000).toFixed(0)}K</span>
            </div>
            <p className="problem">{c.problem}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

## 🎯 Caso de Uso 5: Top Performers Dashboard

Mostrar los mejores casos por diferentes métricas.

```typescript
import {
  getBestROICases,
  getFastestPaybackCases,
  getHighestConfidenceCases
} from '@/data/roi_oracle'

export function TopPerformers() {
  const topROI = getBestROICases(5)
  const fastestPayback = getFastestPaybackCases(5)
  const mostReliable = getHighestConfidenceCases(5)

  return (
    <div className="dashboard">
      <div className="section">
        <h3>Top 5 ROI</h3>
        <ul>
          {topROI.map(c => (
            <li key={c.id}>
              {c.title} - <strong>{c.roi.realistic}%</strong>
              <span className="industry">{c.industry}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="section">
        <h3>Fastest Payback</h3>
        <ul>
          {fastestPayback.map(c => (
            <li key={c.id}>
              {c.title} - <strong>{c.paybackMonths} months</strong>
              <span className="industry">{c.industry}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="section">
        <h3>Most Reliable</h3>
        <ul>
          {mostReliable.map(c => (
            <li key={c.id}>
              {c.title} - <strong>{Math.round(c.confidence * 100)}%</strong>
              <span className="industry">{c.industry}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
```

## 🎯 Caso de Uso 6: Similar Cases Recommendation

Mostrar casos similares cuando el usuario ve un caso específico.

```typescript
import { useState } from 'react'
import {
  getCaseById,
  findSimilarCases
} from '@/data/roi_oracle'

export function CaseDetail({ caseId }: { caseId: string }) {
  const currentCase = getCaseById(caseId)
  const similarCases = findSimilarCases(caseId, 3)

  if (!currentCase) {
    return <div>Case not found</div>
  }

  return (
    <div className="case-detail">
      <h1>{currentCase.title}</h1>

      <div className="metrics-grid">
        <div className="metric">
          <span className="label">ROI</span>
          <span className="value">{currentCase.roi.realistic}%</span>
        </div>
        <div className="metric">
          <span className="label">Investment</span>
          <span className="value">
            ${(currentCase.investment.min / 1000).toFixed(0)}K -
            ${(currentCase.investment.max / 1000).toFixed(0)}K
          </span>
        </div>
        <div className="metric">
          <span className="label">Payback</span>
          <span className="value">{currentCase.paybackMonths} months</span>
        </div>
        <div className="metric">
          <span className="label">Confidence</span>
          <span className="value">{Math.round(currentCase.confidence * 100)}%</span>
        </div>
      </div>

      <section>
        <h2>Problem</h2>
        <p>{currentCase.problem}</p>
      </section>

      <section>
        <h2>Solution</h2>
        <p>{currentCase.solution}</p>
      </section>

      <section>
        <h2>Similar Cases</h2>
        <div className="similar-cases">
          {similarCases.map(c => (
            <div key={c.id} className="similar-case">
              <h4>{c.title}</h4>
              <p>{c.industry} - ROI: {c.roi.realistic}%</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
```

## 🎯 Caso de Uso 7: ROI Calculator with Real Data

Calculadora de ROI usando datos reales como baseline.

```typescript
import { useState } from 'react'
import { findComparableCases, predictROIFromComparables } from '@/data/roi_oracle'

export function ROICalculator() {
  const [inputs, setInputs] = useState({
    industry: 'Retail',
    companySize: 'Enterprise' as const,
    investment: 250000,
    currentCosts: 1000000
  })

  // Obtener casos comparables
  const comparables = findComparableCases(
    inputs.industry,
    undefined,
    inputs.companySize,
    10
  )

  const prediction = predictROIFromComparables(comparables)

  // Calcular beneficio estimado basado en el ROI predicho
  const estimatedBenefit = inputs.investment * (prediction.realistic / 100)
  const netBenefit = estimatedBenefit - inputs.investment
  const savingsPercent = (estimatedBenefit / inputs.currentCosts) * 100

  return (
    <div className="roi-calculator">
      <h2>ROI Calculator</h2>

      <div className="inputs">
        <label>
          Industry:
          <select
            value={inputs.industry}
            onChange={e => setInputs({ ...inputs, industry: e.target.value })}
          >
            <option value="Retail">Retail</option>
            <option value="Financial Services">Financial Services</option>
            <option value="Healthcare">Healthcare</option>
          </select>
        </label>

        <label>
          Company Size:
          <select
            value={inputs.companySize}
            onChange={e => setInputs({ ...inputs, companySize: e.target.value as any })}
          >
            <option value="SMB">SMB</option>
            <option value="Mid-Market">Mid-Market</option>
            <option value="Enterprise">Enterprise</option>
          </select>
        </label>

        <label>
          Investment:
          <input
            type="number"
            value={inputs.investment}
            onChange={e => setInputs({ ...inputs, investment: Number(e.target.value) })}
          />
        </label>

        <label>
          Current Annual Costs:
          <input
            type="number"
            value={inputs.currentCosts}
            onChange={e => setInputs({ ...inputs, currentCosts: Number(e.target.value) })}
          />
        </label>
      </div>

      <div className="results">
        <h3>Projected Results</h3>

        <div className="result-card">
          <span className="label">Expected ROI</span>
          <span className="value">{prediction.realistic}%</span>
          <span className="range">
            ({prediction.conservative}% - {prediction.optimistic}%)
          </span>
        </div>

        <div className="result-card">
          <span className="label">Annual Benefit</span>
          <span className="value">
            ${(estimatedBenefit / 1000000).toFixed(2)}M
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
          <span className="value">{savingsPercent.toFixed(1)}%</span>
        </div>

        <div className="confidence">
          Based on {comparables.length} similar cases
          (Confidence: {Math.round(prediction.confidence * 100)}%)
        </div>
      </div>
    </div>
  )
}
```

## 🎯 Caso de Uso 8: Tag Cloud / Popular Technologies

Mostrar las tecnologías y soluciones más populares.

```typescript
import { getTopTags } from '@/data/roi_oracle'

export function TechnologyTrends() {
  const topTags = getTopTags(30)

  // Calcular tamaño de fuente basado en frecuencia
  const maxCount = topTags[0].count
  const minCount = topTags[topTags.length - 1].count

  const getFontSize = (count: number) => {
    const normalized = (count - minCount) / (maxCount - minCount)
    return 12 + normalized * 24 // 12px to 36px
  }

  return (
    <div className="tag-cloud">
      <h2>Popular Technologies & Use Cases</h2>
      <div className="tags">
        {topTags.map(({ tag, count }) => (
          <span
            key={tag}
            className="tag"
            style={{ fontSize: `${getFontSize(count)}px` }}
            title={`${count} cases`}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}
```

## 🎯 Caso de Uso 9: Statistics Dashboard

Dashboard completo con estadísticas generales.

```typescript
import { getStatisticsSummary } from '@/data/roi_oracle'

export function StatsDashboard() {
  const stats = getStatisticsSummary()

  return (
    <div className="stats-dashboard">
      <h2>ROI Oracle Statistics</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Cases</h3>
          <div className="value">{stats.totalCases}</div>
        </div>

        <div className="stat-card">
          <h3>Average ROI</h3>
          <div className="value">{stats.avgROI}%</div>
        </div>

        <div className="stat-card">
          <h3>Average Investment</h3>
          <div className="value">
            ${(stats.avgInvestment / 1000).toFixed(0)}K
          </div>
        </div>

        <div className="stat-card">
          <h3>Average Payback</h3>
          <div className="value">{stats.avgPayback} months</div>
        </div>

        <div className="stat-card">
          <h3>Industries Covered</h3>
          <div className="value">{stats.industries}</div>
        </div>

        <div className="stat-card">
          <h3>ROI Range</h3>
          <div className="value">
            {stats.minROI}% - {stats.maxROI}%
          </div>
        </div>
      </div>

      <div className="company-size-distribution">
        <h3>Distribution by Company Size</h3>
        <div className="distribution">
          <div className="bar">
            <span className="label">Enterprise</span>
            <div
              className="fill"
              style={{
                width: `${(stats.companySize.Enterprise / stats.totalCases) * 100}%`
              }}
            />
            <span className="count">{stats.companySize.Enterprise}</span>
          </div>
          <div className="bar">
            <span className="label">Mid-Market</span>
            <div
              className="fill"
              style={{
                width: `${(stats.companySize['Mid-Market'] / stats.totalCases) * 100}%`
              }}
            />
            <span className="count">{stats.companySize['Mid-Market']}</span>
          </div>
          <div className="bar">
            <span className="label">SMB</span>
            <div
              className="fill"
              style={{
                width: `${(stats.companySize.SMB / stats.totalCases) * 100}%`
              }}
            />
            <span className="count">{stats.companySize.SMB}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
```

## 🎯 Caso de Uso 10: API Response Format

Formato para responder a solicitudes de API con casos de ROI.

```typescript
import {
  findComparableCases,
  predictROIFromComparables,
  getCaseById
} from '@/data/roi_oracle'

// API endpoint example
export async function POST_estimate_roi(request: Request) {
  const { industry, segment, companySize, useCase } = await request.json()

  // Find comparable cases
  const comparables = findComparableCases(industry, segment, companySize, 10)

  if (comparables.length === 0) {
    return Response.json({
      success: false,
      error: 'No comparable cases found',
      suggestion: 'Try broadening your search criteria'
    }, { status: 404 })
  }

  // Predict ROI
  const prediction = predictROIFromComparables(comparables)

  // Calculate additional metrics
  const avgInvestment = Math.round(
    comparables.reduce((sum, c) =>
      sum + (c.investment.min + c.investment.max) / 2, 0
    ) / comparables.length
  )

  const avgPayback = Math.round(
    comparables.reduce((sum, c) => sum + c.paybackMonths, 0) / comparables.length
  )

  return Response.json({
    success: true,
    prediction: {
      roi: prediction,
      investment: {
        typical: avgInvestment,
        range: {
          min: Math.min(...comparables.map(c => c.investment.min)),
          max: Math.max(...comparables.map(c => c.investment.max))
        }
      },
      paybackMonths: avgPayback,
      confidence: Math.round(prediction.confidence * 100)
    },
    comparables: comparables.map(c => ({
      id: c.id,
      title: c.title,
      roi: c.roi.realistic,
      investment: (c.investment.min + c.investment.max) / 2,
      payback: c.paybackMonths,
      dataSource: c.dataSource
    })),
    metadata: {
      totalCases: comparables.length,
      industries: [...new Set(comparables.map(c => c.industry))],
      dataSources: {
        customerCases: comparables.filter(c => c.dataSource === 'customer_case').length,
        benchmarks: comparables.filter(c => c.dataSource === 'industry_benchmark').length,
        predictions: comparables.filter(c => c.dataSource === 'model_prediction').length
      }
    }
  })
}
```

---

Estos ejemplos demuestran las capacidades principales del sistema ROI Oracle. Cada uno puede adaptarse según las necesidades específicas de tu aplicación.
