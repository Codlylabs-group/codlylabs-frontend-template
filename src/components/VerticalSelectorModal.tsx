import { Landmark, ShoppingCart, HeartPulse, Layers, X } from 'lucide-react'

export type SelectableVertical = 'fintech' | 'retail' | 'healthcare' | 'general'

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
    description: 'Diagnóstico, historias clínicas, salud digital, compliance HIPAA.',
    icon: HeartPulse,
  },
  {
    id: 'general',
    title: 'Otro / General',
    description: 'Cualquier otro vertical o caso de uso transversal.',
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
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
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

        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto">
          {OPTIONS.map((opt) => {
            const Icon = opt.icon
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onSelect(opt.id)}
                className="group text-left p-5 rounded-xl border border-gray-200 hover:border-indigo-400 hover:bg-indigo-50/40 transition-all duration-200 active:scale-[0.99]"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">
                      {opt.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 leading-relaxed">{opt.description}</p>
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
