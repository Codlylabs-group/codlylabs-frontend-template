import { Building2, ShieldCheck, ShoppingCart, Truck, Heart, GraduationCap, Factory, Landmark } from 'lucide-react'
import { useI18n } from '../../i18n'

export default function IndustriesSection() {
  const { t } = useI18n()

  const industries = [
    {
      icon: Building2,
      name: t('industries.item1.name'),
      example: t('industries.item1.example')
    },
    {
      icon: ShieldCheck,
      name: t('industries.item2.name'),
      example: t('industries.item2.example')
    },
    {
      icon: ShoppingCart,
      name: t('industries.item3.name'),
      example: t('industries.item3.example')
    },
    {
      icon: Truck,
      name: t('industries.item4.name'),
      example: t('industries.item4.example')
    },
    {
      icon: Factory,
      name: t('industries.item5.name'),
      example: t('industries.item5.example')
    },
    {
      icon: GraduationCap,
      name: t('industries.item6.name'),
      example: t('industries.item6.example')
    },
    {
      icon: Heart,
      name: t('industries.item7.name'),
      example: t('industries.item7.example')
    },
    {
      icon: Landmark,
      name: t('industries.item8.name'),
      example: t('industries.item8.example')
    }
  ]

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-7">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {t('industries.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('industries.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {industries.map((industry, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-6 border border-gray-200 hover:border-brand-300 hover:shadow-lg transition-all group"
            >
              <div className="flex items-start gap-4 mb-3">
                <div className="bg-brand-50 p-3 rounded-lg group-hover:bg-brand-100 transition-colors">
                  <industry.icon className="w-6 h-6 text-brand-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mt-2">
                  {industry.name}
                </h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {industry.example}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
