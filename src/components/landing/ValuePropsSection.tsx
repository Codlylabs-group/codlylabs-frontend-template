import { Search, Target, FileText, Rocket } from 'lucide-react'
import { useI18n } from '../../i18n'

export default function ValuePropsSection() {
  const { t } = useI18n()

  const valueProps = [
    {
      icon: Search,
      title: t('valueProps.item1.title'),
      description: t('valueProps.item1.description')
    },
    {
      icon: Target,
      title: t('valueProps.item2.title'),
      description: t('valueProps.item2.description')
    },
    {
      icon: FileText,
      title: t('valueProps.item3.title'),
      description: t('valueProps.item3.description')
    },
    {
      icon: Rocket,
      title: t('valueProps.item4.title'),
      description: t('valueProps.item4.description')
    }
  ]

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-7">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {t('valueProps.title')}
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {valueProps.map((prop, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="bg-brand-100 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <prop.icon className="w-7 h-7 text-brand-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {prop.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {prop.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
