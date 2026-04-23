import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Code, Eye, Brain, Cpu, Bot } from 'lucide-react'
import { useI18n } from '../../i18n'

interface DemoTemplate {
  id: string
  name: string
  description: string
}

interface Category {
  id: string
  label: string
  icon: typeof Code
  templates: DemoTemplate[]
}

const CATEGORIES: Category[] = [
  {
    id: 'code-generation',
    label: 'Code Gen',
    icon: Code,
    templates: [
      { id: 'python-function-gen', name: 'Generador de funciones Python', description: 'Genera funciones documentadas a partir de un prompt' },
      { id: 'api-builder', name: 'API Builder', description: 'Crea endpoints REST completos con FastAPI' },
      { id: 'cli-tool-gen', name: 'CLI Tool Generator', description: 'Genera herramientas de línea de comandos' },
    ],
  },
  {
    id: 'vision',
    label: 'Vision',
    icon: Eye,
    templates: [
      { id: 'object-detection', name: 'Object Detection', description: 'Detecta objetos en tiempo real con la cámara' },
      { id: 'landmark-recognition', name: 'Landmark Recognition', description: 'Identifica monumentos y lugares famosos' },
      { id: 'quality-inspection', name: 'Quality Inspection', description: 'Inspección visual de calidad industrial' },
    ],
  },
  {
    id: 'rag',
    label: 'RAG / NLP',
    icon: Brain,
    templates: [
      { id: 'pdf-qa', name: 'PDF Q&A', description: 'Chatea con tus documentos PDF usando RAG' },
      { id: 'knowledge-base', name: 'Knowledge Base', description: 'Base de conocimiento con búsqueda semántica' },
      { id: 'document-classifier', name: 'Clasificador de Documentos', description: 'Clasifica documentos automáticamente' },
    ],
  },
  {
    id: 'ml',
    label: 'ML',
    icon: Cpu,
    templates: [
      { id: 'churn-prediction', name: 'Churn Prediction', description: 'Predice qué clientes van a abandonar' },
      { id: 'demand-forecast', name: 'Demand Forecast', description: 'Pronóstico de demanda con series de tiempo' },
      { id: 'anomaly-detection', name: 'Anomaly Detection', description: 'Detecta anomalías en datos transaccionales' },
    ],
  },
  {
    id: 'agents',
    label: 'Agents',
    icon: Bot,
    templates: [
      { id: 'api-agent', name: 'API Navigator Agent', description: 'Agente que navega APIs y responde preguntas' },
      { id: 'data-analyst-agent', name: 'Data Analyst Agent', description: 'Analiza datasets y genera visualizaciones' },
      { id: 'code-reviewer-agent', name: 'Code Review Agent', description: 'Revisa código y sugiere mejoras' },
    ],
  },
]

export default function InteractiveDemoSection() {
  const { t } = useI18n()
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id)
  const activeCat = CATEGORIES.find((c) => c.id === activeCategory) || CATEGORIES[0]

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-7">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-3">
          {t('interactiveDemo.title')}
        </h2>
        <p className="text-lg text-gray-500 text-center mb-4 max-w-2xl mx-auto">
          {t('interactiveDemo.subtitle')}
        </p>
        <p className="text-sm font-medium text-brand-600 text-center mb-10">
          {t('interactiveDemo.freeLabel')}
        </p>

        {/* Category tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon
            const isActive = cat.id === activeCategory
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-300 hover:text-brand-600'
                }`}
              >
                <Icon size={16} />
                {cat.label}
              </button>
            )
          })}
        </div>

        {/* Template cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {activeCat.templates.map((tmpl) => (
            <div
              key={tmpl.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5 flex flex-col"
            >
              <h3 className="font-semibold text-gray-900 mb-1">{tmpl.name}</h3>
              <p className="text-sm text-gray-500 mb-4 flex-1">{tmpl.description}</p>
              <Link
                to={`/try?template=${tmpl.id}`}
                className="inline-flex items-center text-sm font-medium text-brand-600 hover:text-brand-800 transition-colors"
              >
                {t('interactiveDemo.tryFree')}
                <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
