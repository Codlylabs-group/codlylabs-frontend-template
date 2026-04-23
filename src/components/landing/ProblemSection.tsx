import { AlertCircle, TrendingDown, Clock } from 'lucide-react'
import { useI18n } from '../../i18n'

export default function ProblemSection() {
  const { t } = useI18n()

  const problems = [
    {
      icon: AlertCircle,
      title: t('problem.item1.title'),
      description: t('problem.item1.description')
    },
    {
      icon: TrendingDown,
      title: t('problem.item2.title'),
      description: t('problem.item2.description')
    },
    {
      icon: Clock,
      title: t('problem.item3.title'),
      description: t('problem.item3.description')
    }
  ]

  return (
    <section className="py-24 bg-white">
      <div className="max-w-screen-2xl mx-auto px-2 sm:px-3 lg:px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {t('problem.title')}
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed max-w-[72ch] mx-auto">
            {t('problem.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {problems.map((problem, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-xl p-8 border border-gray-200 hover:border-gray-300 transition-colors"
            >
              <div className="bg-red-100 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <problem.icon className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {problem.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {problem.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
