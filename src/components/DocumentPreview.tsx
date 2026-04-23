import type { RecommendationResponse } from '../services/recommendation'
import { useI18n } from '../i18n'
// import { ImpactMatrix } from './ImpactMatrix'

interface DocumentPreviewProps {
  recommendation: RecommendationResponse
}

function renderInlineMarkdown(text: string) {
  if (!text) return null

  // Split by lines to handle headers and lists
  const lines = text.split('\n')
  const elements: JSX.Element[] = []
  let keyCounter = 0
  let currentList: JSX.Element[] = []
  let inList = false
  let listType: 'ul' | 'ol' | null = null
  let inCodeBlock = false
  let codeBlockLines: string[] = []

  const flushList = () => {
    if (currentList.length > 0 && listType) {
      const ListTag = listType === 'ul' ? 'ul' : 'ol'
      elements.push(
        <ListTag key={`list-${keyCounter++}`} className="list-disc list-inside mb-2 space-y-1 ml-4">
          {currentList}
        </ListTag>
      )
      currentList = []
      inList = false
      listType = null
    }
  }

  const flushCodeBlock = () => {
    if (codeBlockLines.length > 0) {
      elements.push(
        <pre key={`code-${keyCounter++}`} className="bg-gray-100 rounded-lg p-4 mb-2 overflow-x-auto text-xs text-gray-800 font-mono">
          {codeBlockLines.join('\n')}
        </pre>
      )
      codeBlockLines = []
    }
  }

  lines.forEach((line) => {
    const trimmed = line.trim()

    // Code blocks (``` ... ```)
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        flushCodeBlock()
        inCodeBlock = false
      } else {
        flushList()
        inCodeBlock = true
      }
      return
    }
    if (inCodeBlock) {
      codeBlockLines.push(line)
      return
    }

    // Headers (###)
    if (trimmed.startsWith('###')) {
      flushList()
      const headerText = trimmed.replace(/^###+\s*/, '')
      const headerLevel = trimmed.match(/^#+/)?.[0].length || 3
      const HeaderTag = headerLevel === 1 ? 'h1' : headerLevel === 2 ? 'h2' : 'h3'
      elements.push(
        <HeaderTag 
          key={`h-${keyCounter++}`} 
          className={`${headerLevel === 1 ? 'text-xl' : headerLevel === 2 ? 'text-lg' : 'text-base'} font-semibold text-gray-900 mt-4 mb-2`}
        >
          {renderBoldText(headerText)}
        </HeaderTag>
      )
      return
    }
    
    // Bullet points (- or *)
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (!inList || listType !== 'ul') {
        flushList()
        inList = true
        listType = 'ul'
      }
      const content = trimmed.substring(2)
      currentList.push(
        <li key={`li-${keyCounter++}`} className="text-gray-700">
          {renderBoldText(content)}
        </li>
      )
      return
    }
    
    // Numbered lists
    if (/^\d+\.\s/.test(trimmed)) {
      if (!inList || listType !== 'ol') {
        flushList()
        inList = true
        listType = 'ol'
      }
      const content = trimmed.replace(/^\d+\.\s/, '')
      currentList.push(
        <li key={`li-${keyCounter++}`} className="text-gray-700">
          {renderBoldText(content)}
        </li>
      )
      return
    }
    
    // Regular paragraph or empty line
    flushList()
    
    if (trimmed) {
      // Check if line has bold text
      if (trimmed.includes('**')) {
        elements.push(
          <p key={`p-${keyCounter++}`} className="mb-2 text-gray-700">
            {renderBoldText(trimmed)}
          </p>
        )
      } else {
        elements.push(
          <p key={`p-${keyCounter++}`} className="mb-2 text-gray-700">
            {trimmed}
          </p>
        )
      }
    } else {
      // Empty line for spacing
      elements.push(<div key={`spacer-${keyCounter++}`} className="mb-1" />)
    }
  })

  flushCodeBlock()
  flushList()

  return <div className="text-sm leading-relaxed">{elements}</div>
}

function renderBoldText(text: string): JSX.Element[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={`bold-${index}`} className="font-semibold text-gray-900">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return <span key={`text-${index}`}>{part}</span>
  })
}

export default function DocumentPreview({ recommendation }: DocumentPreviewProps) {
  const { t } = useI18n()
  const {
    executive_summary,
    business_context,
    value_proposition,
    technical_details,
    use_cases_specific,
    implementation_roadmap: _implementation_roadmap,
    comparison_before_after,
    risks,
    mitigation,
    next_steps: _next_steps,
  } = recommendation

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Main document sections */}
      <div className="lg:col-span-2 space-y-6">
        {/* Executive Summary */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            {t('docPreview.executiveSummary')}
          </h2>
          <div className="text-gray-800">
            {renderInlineMarkdown(executive_summary)}
          </div>
        </div>

        {/* Business Context */}
        {business_context && (
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
            <div className="text-gray-800">
              {renderInlineMarkdown(business_context)}
            </div>
          </div>
        )}

        {/* Value Proposition */}
        {value_proposition && (
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
            <div className="text-gray-800">
              {renderInlineMarkdown(value_proposition)}
            </div>
          </div>
        )}

        {/* Technical Details */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            {t('docPreview.technicalDetails')}
          </h2>
          <div className="text-gray-800">
            {renderInlineMarkdown(technical_details)}
          </div>
        </div>

        {/* Specific Use Cases */}
        {use_cases_specific && (
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
            <div className="text-gray-800">
              {renderInlineMarkdown(use_cases_specific)}
            </div>
          </div>
        )}

        {/* Implementation Roadmap — hidden, user navigates to PoC generator instead */}

        {/* Next Steps — hidden, replaced by "Generar PoC" CTA */}
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Comparison Before/After */}
        {comparison_before_after && (
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              {comparison_before_after.title}
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-medium text-gray-800 mb-2">{t('docPreview.beforeAI')}</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  {comparison_before_after.before.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-medium text-gray-800 mb-2">{t('docPreview.afterAI')}</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  {comparison_before_after.after.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <p className="font-medium text-green-700 mb-2">{t('docPreview.expectedImprovements')}</p>
                <ul className="list-disc list-inside text-green-600 space-y-1">
                  {comparison_before_after.improvements.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Impact Matrix */}
        {/* {impact_matrix && (
          <ImpactMatrix
            items={[
              {
                id: 'high_impact_low_effort',
                label: impact_matrix.impacto_alto_complejidad_baja || 'Quick wins de alto impacto',
                impact: 0.9,
                effort: 0.3,
              },
              {
                id: 'high_impact_high_effort',
                label: impact_matrix.impacto_alto_complejidad_alta || 'Proyectos estratégicos de alto impacto',
                impact: 0.9,
                effort: 0.8,
              },
              {
                id: 'medium_impact_low_effort',
                label: impact_matrix.impacto_medio_complejidad_baja || 'Mejoras incrementales',
                impact: 0.6,
                effort: 0.3,
              },
              {
                id: 'medium_impact_high_effort',
                label: impact_matrix.impacto_medio_complejidad_alta || 'Transformación por fases',
                impact: 0.6,
                effort: 0.8,
              },
            ]}
          />
        )} */}

        {/* Risks and Mitigation */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">
            {t('docPreview.risksAndMitigation')}
          </h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-medium text-gray-800 mb-1">{t('docPreview.keyRisks')}</p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                {risks.map((risk, idx) => (
                  <li key={idx}>{risk}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-medium text-gray-800 mb-1">{t('docPreview.mitigationStrategies')}</p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                {mitigation.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
