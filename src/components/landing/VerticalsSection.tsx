import { Shield, ShoppingCart, HeartPulse } from 'lucide-react'
import { useI18n } from '../../i18n'

export default function VerticalsSection() {
  const { t } = useI18n()

  // Las tarjetas son puramente visuales en la landing — no llevan al user
  // fuera de esta página (el acceso real al catálogo es via /workspace/verticals
  // después de login).
  const useCases = [
    { icon: Shield, name: t('verticals.usecase.fintech.name'), count: t('verticals.usecase.fintech.count') },
    { icon: ShoppingCart, name: t('verticals.usecase.retail.name'), count: t('verticals.usecase.retail.count') },
    { icon: HeartPulse, name: t('verticals.usecase.healthcare.name'), count: t('verticals.usecase.healthcare.count') },
  ]

  return (
    <section id="verticals" className="py-24 bg-[#f8f9fa]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-6">
          <span className="text-indigo-600 font-bold tracking-widest uppercase text-sm">
            {t('verticals.label')}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2 text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
            {t('verticals.title')}
          </h2>
        </div>

        <p className="text-gray-500 text-lg mb-10 max-w-3xl">
          {t('verticals.subtitle')}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {useCases.map((useCase, index) => {
            const complianceBadge = useCase.count.split(' · ')[1]
            const industryLabel = useCase.count.split(' · ')[0]
            return (
              <div
                key={index}
                className="bg-white border border-gray-200/60 p-6 rounded-xl flex items-start gap-5"
              >
                <div className="w-14 h-14 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 flex-shrink-0">
                  <useCase.icon className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <h5 className="font-bold text-lg text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
                    {useCase.name}
                  </h5>
                  <p className="text-gray-400 text-sm">
                    {industryLabel}
                  </p>
                  {complianceBadge && (
                    <span className="inline-flex items-center mt-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                      {complianceBadge}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
