import {
  Building,
  Factory,
  GraduationCap,
  HeartPulse,
  Home,
  Landmark,
  Layers,
  Scale,
  ShieldCheck,
  ShoppingCart,
  Sprout,
  TrendingUp,
  Truck,
  Umbrella,
  Users,
  X,
  Zap,
} from 'lucide-react'

export type SelectableVertical =
  | 'fintech'
  | 'retail'
  | 'healthcare'
  | 'legal'
  | 'sales'
  | 'manufacturing'
  | 'hr'
  | 'logistics'
  | 'cybersecurity'
  | 'realestate'
  | 'insurance'
  | 'education'
  | 'energy'
  | 'public_sector'
  | 'agriculture'
  | 'general'

interface VerticalSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (vertical: SelectableVertical) => void
}

const OPTIONS: Array<{
  id: SelectableVertical
  title: string
  description: string
  icon: typeof Landmark
}> = [
  {
    id: 'fintech',
    title: 'Fintech',
    description: 'Banca, pagos, fraude, crédito, AML/KYC, portfolios.',
    icon: Landmark,
  },
  {
    id: 'retail',
    title: 'Retail / E-commerce',
    description: 'Catálogo, checkout, inventario, pricing, recomendaciones.',
    icon: ShoppingCart,
  },
  {
    id: 'healthcare',
    title: 'Healthcare',
    description: 'Diagnóstico, historias clínicas, salud digital, HIPAA.',
    icon: HeartPulse,
  },
  {
    id: 'legal',
    title: 'Legal',
    description: 'Contratos, due diligence, compliance, e-discovery.',
    icon: Scale,
  },
  {
    id: 'sales',
    title: 'Sales / CRM',
    description: 'CRM, SDR, pipeline, intelligence de llamadas, prospección.',
    icon: TrendingUp,
  },
  {
    id: 'manufacturing',
    title: 'Manufactura',
    description: 'Mantenimiento predictivo, calidad, seguridad, planta.',
    icon: Factory,
  },
  {
    id: 'hr',
    title: 'Recursos Humanos',
    description: 'Reclutamiento, onboarding, performance, retención.',
    icon: Users,
  },
  {
    id: 'logistics',
    title: 'Logística / Supply Chain',
    description: 'Rutas, ETA, flota, depósito, aduana, last mile.',
    icon: Truck,
  },
  {
    id: 'cybersecurity',
    title: 'Cybersecurity',
    description: 'SOC, malware, intrusiones, threat intel, vulnerabilidades.',
    icon: ShieldCheck,
  },
  {
    id: 'realestate',
    title: 'Real Estate',
    description: 'Valuaciones, screening, inspecciones, listings, alquileres.',
    icon: Home,
  },
  {
    id: 'insurance',
    title: 'Seguros',
    description: 'Suscripción, claims triage, fraude, riesgo actuarial.',
    icon: Umbrella,
  },
  {
    id: 'education',
    title: 'Educación',
    description: 'Evaluación, tutoría, plagio, planes de clase, currículo.',
    icon: GraduationCap,
  },
  {
    id: 'energy',
    title: 'Energía',
    description: 'Smart grid, paneles, turbinas, ESG, consumo, leak detection.',
    icon: Zap,
  },
  {
    id: 'public_sector',
    title: 'Sector Público',
    description: 'Trámites, permisos, beneficios, 311, smart city.',
    icon: Building,
  },
  {
    id: 'agriculture',
    title: 'Agro',
    description: 'Cultivos satélite, riego, plagas, ganado, drones.',
    icon: Sprout,
  },
  {
    id: 'general',
    title: 'Otro / Transversal',
    description: 'BI, ETL, dashboards, comparadores, casos transversales.',
    icon: Layers,
  },
]

export function VerticalSelectorModal({ isOpen, onClose, onSelect }: VerticalSelectorModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
              ¿Qué vertical aplica a tu PoC?
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Esto nos ayuda a generar una solución alineada al dominio correcto.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto">
          {OPTIONS.map((opt) => {
            const Icon = opt.icon
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onSelect(opt.id)}
                className="group text-left p-4 rounded-xl border border-gray-200 hover:border-indigo-400 hover:bg-indigo-50/40 transition-all duration-200 active:scale-[0.99]"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 transition-colors flex-shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 group-hover:text-indigo-700 transition-colors text-sm">
                      {opt.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{opt.description}</p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
