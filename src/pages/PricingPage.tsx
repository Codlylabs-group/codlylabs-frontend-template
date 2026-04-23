import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check, Star, ArrowLeft, Loader2, Minus } from 'lucide-react'
import { useI18n } from '../i18n'
import { billingApi } from '../services/billing'
import { ACCESS_TOKEN_KEY } from '../services/authStorage'
import { saveExplicitAuthReturnUrl } from '../services/auth'
import Footer from '../components/landing/Footer'

interface PlanDef {
  name: string
  tier: string
  price: number
  period: string
  description: string
  popular: boolean
  cta: string
  pocs: string
  users: string
  unlimitedUsers: boolean
  highlights: string[]
  segmentLabel: string
  segmentProblem: string
  segmentMessage: string
}

export default function PricingPage() {
  const navigate = useNavigate()
  const { language } = useI18n()
  const [annual, setAnnual] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
  const [selectedTier, setSelectedTier] = useState('team')

  const isLoggedIn = !!localStorage.getItem(ACCESS_TOKEN_KEY)
  const es = language === 'es'

  const handleSelectPlan = async (tier: string) => {
    if (tier === 'free') {
      navigate('/register')
      return
    }
    if (tier === 'enterprise') {
      window.location.href = 'mailto:contact@codlylabs.ai?subject=Enterprise Plan'
      return
    }
    if (!isLoggedIn) {
      saveExplicitAuthReturnUrl(`/pricing?plan=${tier}`)
      navigate('/login')
      return
    }
    try {
      setCheckoutLoading(tier)
      const url = await billingApi.createCheckout(
        tier,
        `${window.location.origin}/billing?success=true`,
        `${window.location.origin}/pricing`,
        annual,
      )
      window.location.href = url
    } catch {
      setCheckoutLoading(null)
    }
  }

  const plans: PlanDef[] = [
    {
      name: 'Free',
      tier: 'free',
      price: 0,
      period: '',
      description: es
        ? 'Explorá la plataforma y generá tu primera validación de IA'
        : 'Explore the platform and generate your first AI validation',
      popular: false,
      cta: es ? 'Empezar gratis' : 'Start free',
      pocs: '3',
      users: '1',
      unlimitedUsers: false,
      highlights: es
        ? ['Sin tarjeta de crédito', 'Acceso al workspace completo']
        : ['No credit card required', 'Full workspace access'],
      segmentLabel: es ? 'Exploración' : 'Exploration',
      segmentProblem: es ? '"Quiero ver si esto sirve para mi caso"' : '"I want to see if this works for my case"',
      segmentMessage: es
        ? 'Probá la plataforma sin compromiso y validá tu primera idea de IA.'
        : 'Try the platform with no commitment and validate your first AI idea.',
    },
    {
      name: 'Starter',
      tier: 'starter',
      price: annual ? 179 : 199,
      period: es ? '/mes' : '/mo',
      description: es
        ? 'Validá tu primera iniciativa de IA antes de invertir'
        : 'Validate your first AI initiative before investing',
      popular: false,
      cta: es ? 'Empezar a validar' : 'Start validating',
      pocs: '5',
      users: es ? 'Ilimitados' : 'Unlimited',
      unlimitedUsers: true,
      highlights: es
        ? ['Validá impacto de negocio en minutos', 'Reducí costos de experimentación desde el día uno']
        : ['Validate business impact in minutes', 'Reduce experimentation cost from day one'],
      segmentLabel: es ? 'Individual / Startups' : 'Individual / Startups',
      segmentProblem: es ? '"Necesito validar antes de invertir"' : '"I need to validate before I invest"',
      segmentMessage: es
        ? 'Antes de construir nada, validá tu idea de IA en minutos.'
        : 'Before building anything, validate your AI idea in minutes.',
    },
    {
      name: 'Builder',
      tier: 'builder',
      price: annual ? 359 : 399,
      period: es ? '/mes' : '/mo',
      description: es
        ? 'Probá y priorizá múltiples iniciativas de IA'
        : 'Test and prioritize multiple AI initiatives',
      popular: false,
      cta: es ? 'Empezar a construir' : 'Start building',
      pocs: '12',
      users: es ? 'Ilimitados' : 'Unlimited',
      unlimitedUsers: true,
      highlights: es
        ? ['Priorizá inversiones en IA con datos', 'Compará ROI entre casos de uso']
        : ['Prioritize AI investments with data', 'Compare ROI across use cases'],
      segmentLabel: es ? 'Product Teams' : 'Product Teams',
      segmentProblem: es ? '"Necesitamos datos para priorizar inversiones en IA"' : '"We need data to prioritize AI investments"',
      segmentMessage: es
        ? 'Probá múltiples casos de uso de IA antes de comprometer recursos de ingeniería.'
        : 'Test multiple AI use cases before committing engineering resources.',
    },
    {
      name: 'Team',
      tier: 'team',
      price: annual ? 719 : 799,
      period: es ? '/mes' : '/mo',
      description: es
        ? 'Validación sistemática de IA en toda tu organización'
        : 'Systematic AI validation across your organization',
      popular: true,
      cta: es ? 'Escalar validación' : 'Scale your validation',
      pocs: '30',
      users: es ? 'Ilimitados' : 'Unlimited',
      unlimitedUsers: true,
      highlights: es
        ? ['Ejecutá experimentos de IA en paralelo a escala', 'Inteligencia de decisión IA para toda la organización']
        : ['Run parallel AI experiments at scale', 'Organization-wide AI decision intelligence'],
      segmentLabel: es ? 'Empresas' : 'Companies',
      segmentProblem: es ? '"Necesitamos descubrir oportunidades de IA sistemáticamente"' : '"We need systematic AI opportunity discovery"',
      segmentMessage: es
        ? 'Identificá y validá oportunidades de IA de alto impacto en toda tu organización.'
        : 'Identify and validate high-impact AI opportunities across your organization.',
    },
    {
      name: 'Growth',
      tier: 'growth',
      price: annual ? 1349 : 1499,
      period: es ? '/mes' : '/mo',
      description: es
        ? 'Experimentación de IA a escala enterprise para consultoras'
        : 'Enterprise-scale AI experimentation for consultancies',
      popular: false,
      cta: es ? 'Escalar operaciones' : 'Scale your operations',
      pocs: '75',
      users: es ? 'Ilimitados' : 'Unlimited',
      unlimitedUsers: true,
      highlights: es
        ? ['Entregá estrategias de IA validadas a clientes', 'Ganá deals con validaciones production-ready']
        : ['Deliver validated AI strategies to clients', 'Win deals with production-ready validations'],
      segmentLabel: es ? 'Consultoras / Integradores' : 'Consultancies / Integrators',
      segmentProblem: es ? '"Necesitamos demostrar ROI de IA a clientes rápido"' : '"We need to prove AI ROI to clients fast"',
      segmentMessage: es
        ? 'Generá prototipos funcionales de IA en minutos para cerrar deals más rápido.'
        : 'Generate working AI prototypes in minutes to win deals faster.',
    },
    {
      name: 'Enterprise',
      tier: 'enterprise',
      price: -1,
      period: '',
      description: es
        ? 'Infraestructura completa de validación IA con workflows custom'
        : 'Full AI validation infrastructure with custom workflows',
      popular: false,
      cta: es ? 'Hablar con ventas' : 'Talk to sales',
      pocs: 'Custom',
      users: es ? 'Ilimitados' : 'Unlimited',
      unlimitedUsers: true,
      highlights: es
        ? ['Experimentación paralela ilimitada', 'Workflows custom, SSO e integración API']
        : ['Unlimited parallel experimentation', 'Custom workflows, SSO, and API integration'],
      segmentLabel: 'Enterprise',
      segmentProblem: es ? '"Necesitamos infraestructura enterprise de validación IA"' : '"We need enterprise AI validation infrastructure"',
      segmentMessage: es
        ? 'Estandarizá la validación de IA en toda tu organización.'
        : 'Standardize AI validation across your organization.',
    },
  ]

  // ── Comparison table data ──
  type CellValue = string | boolean
  interface FeatureRow {
    label: string
    values: CellValue[] // one per plan, same order as `plans`
  }

  const features: FeatureRow[] = [
    {
      label: es ? 'Validaciones IA (PoCs)' : 'AI validations (PoCs)',
      values: ['3', '5', '12', '30', '75', 'Custom'],
    },
    {
      label: es ? 'Usuarios por Workspace' : 'Users per Workspace',
      values: [
        '1',
        es ? 'Ilimitados' : 'Unlimited',
        es ? 'Ilimitados' : 'Unlimited',
        es ? 'Ilimitados' : 'Unlimited',
        es ? 'Ilimitados' : 'Unlimited',
        es ? 'Ilimitados' : 'Unlimited',
      ],
    },
    {
      label: es ? 'Preview compartible' : 'Shareable preview',
      values: [true, true, true, true, true, true],
    },
    {
      label: es ? 'Descarga ZIP' : 'ZIP download',
      values: [false, true, true, true, true, true],
    },
    {
      label: 'API access',
      values: [false, false, false, false, es ? 'Básico' : 'Basic', es ? 'Avanzada' : 'Advanced'],
    },
    {
      label: es ? 'Soporte' : 'Support',
      values: [false, 'Online', 'Online', 'Online', 'Online', 'Online'],
    },
    {
      label: 'Codly-GPT',
      values: [false, false, false, false, false, true],
    },
  ]

  const renderCell = (value: CellValue) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="w-4 h-4 text-emerald-500 mx-auto" />
      ) : (
        <Minus className="w-4 h-4 text-gray-300 mx-auto" />
      )
    }
    return <span className="text-sm font-medium text-gray-700">{value}</span>
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">{es ? 'Inicio' : 'Home'}</span>
          </Link>
          <Link to="/" className="text-xl font-bold text-indigo-600" style={{ fontFamily: 'Manrope, sans-serif' }}>
            CodlyLabs
          </Link>
          <div className="w-20" />
        </div>
      </header>

      <main className="flex-1 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Heading */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
              {es
                ? 'Validá ideas de IA en minutos — antes de invertir miles en desarrollo.'
                : 'Validate AI ideas in minutes — before investing thousands in development.'}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              {es
                ? 'De idea a prototipo funcional de IA en minutos. Sin necesidad de equipo técnico.'
                : 'From idea to working AI prototype in minutes. No team required.'}
            </p>
          </div>

          {/* Annual toggle */}
          <div className="flex items-center justify-center gap-3 mb-12">
            <span className={`text-sm font-medium ${!annual ? 'text-gray-900' : 'text-gray-500'}`}>
              {es ? 'Mensual' : 'Monthly'}
            </span>
            <button
              type="button"
              onClick={() => setAnnual(!annual)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${annual ? 'bg-indigo-600' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${annual ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
            <span className={`text-sm font-medium ${annual ? 'text-gray-900' : 'text-gray-500'}`}>
              {es ? 'Anual' : 'Annual'}
            </span>
            {annual && (
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                -10%
              </span>
            )}
          </div>

          {/* Plan cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 max-w-7xl mx-auto">
            {plans.map((plan) => {
              const isSelected = selectedTier === plan.tier
              return (
              <div
                key={plan.tier}
                onClick={() => setSelectedTier(plan.tier)}
                className={`relative bg-white rounded-2xl shadow-sm border flex flex-col transition-all hover:shadow-lg cursor-pointer ${
                  isSelected
                    ? 'border-indigo-600 ring-2 ring-indigo-600/20 scale-[1.02]'
                    : 'border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-600 text-white text-xs font-semibold shadow-md">
                      <Star className="w-3 h-3 fill-white" />
                      {es ? 'Más Popular' : 'Most Popular'}
                    </span>
                  </div>
                )}

                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
                    {plan.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{plan.description}</p>

                  {plan.price === -1 ? (
                    <div className="flex-1 flex items-center justify-center my-4">
                      <span className="text-3xl font-bold text-gray-900">Custom</span>
                    </div>
                  ) : (
                    <>
                      <div className="mt-4 mb-1">
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold text-gray-900">
                            ${plan.price.toLocaleString()}
                          </span>
                          <span className="text-gray-500 text-xs">{plan.period}</span>
                        </div>
                      </div>

                      <div className="border-t border-gray-100 my-4" />

                      <p className="text-sm text-gray-500 text-center">
                        <span className="font-semibold">{plan.pocs}</span>{' '}
                        {es ? 'validaciones' : 'validations'}
                      </p>
                      {plan.unlimitedUsers ? (
                        <p className="text-sm text-gray-500 text-center mt-1">
                          <span className="font-semibold">
                            {es ? 'Usuarios ilimitados' : 'Unlimited users'}
                          </span>
                        </p>
                      ) : (
                        <p className="text-sm text-gray-500 text-center mt-1">
                          <span className="font-semibold">{plan.users}</span>{' '}
                          {es ? 'usuarios' : 'users'}
                        </p>
                      )}
                    </>
                  )}
                  {plan.price === -1 && (
                    <p className="text-sm text-gray-500 text-center -mt-2 mb-2">
                      <span className="font-semibold">
                        {es ? 'Usuarios ilimitados' : 'Unlimited users'}
                      </span>
                    </p>
                  )}

                  <ul className="mt-4 space-y-2 flex-1">
                    {plan.highlights.map((h) => (
                      <li key={h} className="flex items-start gap-2 text-xs text-gray-600">
                        <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    disabled={checkoutLoading === plan.tier}
                    onClick={(e) => { e.stopPropagation(); handleSelectPlan(plan.tier) }}
                    className={`mt-6 w-full py-3 px-4 rounded-xl text-sm font-semibold transition-all disabled:opacity-60 ${
                      isSelected
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'
                        : 'border-2 border-gray-200 text-gray-900 hover:border-indigo-600 hover:text-indigo-600'
                    }`}
                  >
                    {checkoutLoading === plan.tier ? (
                      <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                    ) : (
                      plan.cta
                    )}
                  </button>

                </div>
              </div>
              )
            })}
          </div>

          {/* Segment cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 max-w-7xl mx-auto mt-4">
            {plans.map((plan) => (
              <div
                key={`seg-${plan.tier}`}
                className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100/50 text-center"
              >
                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-1">{plan.segmentLabel}</p>
                <p className="text-xs text-gray-400 italic mb-1.5">{plan.segmentProblem}</p>
                <p className="text-xs text-gray-600 leading-relaxed">{plan.segmentMessage}</p>
              </div>
            ))}
          </div>

          {/* ── Comparison table ── */}
          <div className="mt-20">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8" style={{ fontFamily: 'Manrope, sans-serif' }}>
              {es ? 'Compará los planes' : 'Compare plans'}
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left text-sm font-medium text-gray-500 py-4 px-5 w-[220px]">
                      {es ? 'Característica' : 'Feature'}
                    </th>
                    {plans.map((plan) => (
                      <th
                        key={plan.tier}
                        className={`text-center text-sm font-bold py-4 px-3 transition-colors ${
                          selectedTier === plan.tier ? 'text-indigo-600 bg-indigo-50/50' : 'text-gray-900'
                        }`}
                      >
                        {plan.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {features.map((row, i) => (
                    <tr
                      key={row.label}
                      className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}`}
                    >
                      <td className="text-sm text-gray-700 py-3.5 px-5 font-medium">
                        {row.label}
                      </td>
                      {row.values.map((val, j) => (
                        <td
                          key={j}
                          className={`text-center py-3.5 px-3 transition-colors ${
                            selectedTier === plans[j]?.tier ? 'bg-indigo-50/30' : ''
                          }`}
                        >
                          {renderCell(val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom note */}
          <div className="text-center mt-12">
            <p className="text-gray-500 text-sm max-w-2xl mx-auto">
              {es
                ? 'Todos los planes incluyen pipeline multi-agente, quality gates, compliance por industria, Docker, CI/CD y documentación. Precios en USD. Cancelá en cualquier momento.'
                : 'All plans include multi-agent AI pipeline, quality gates, industry compliance, Docker, CI/CD, and documentation. Prices in USD. Cancel anytime.'}
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
