import { MessageSquare, Brain, Package, Shield, FileCheck, TrendingUp } from 'lucide-react'
import { useI18n } from '../../i18n'
import { Link } from 'react-router-dom'

export default function PlatformSection() {
  const { t } = useI18n()

  const features = [
    {
      icon: MessageSquare,
      text: t('platform.feature1'),
    },
    {
      icon: Brain,
      text: t('platform.feature2'),
    },
    {
      icon: Package,
      text: t('platform.feature3'),
    },
    {
      icon: Shield,
      text: t('platform.feature4'),
    },
    {
      icon: FileCheck,
      text: t('platform.feature5'),
    },
    {
      icon: TrendingUp,
      text: t('platform.feature6'),
    },
  ]

  return (
    <section id="platform" className="py-24 bg-white">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-7">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {t('platform.title')}
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 items-center">
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="bg-brand-100 p-3 rounded-lg flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-brand-600" />
                </div>
                <p className="text-lg text-gray-700 leading-relaxed mt-2">
                  {feature.text}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-br from-brand-50 to-purple-50 rounded-2xl p-6 border border-brand-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {t('platform.example.title')}
            </h3>

            <div className="bg-white rounded-lg p-6 shadow-sm mb-4">
              <h4 className="font-semibold text-gray-900 mb-3">
                {t('platform.example.useCases')}
              </h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  {t('platform.example.useCase1')}
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  {t('platform.example.useCase2')}
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  {t('platform.example.useCase3')}
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-3">
                {t('platform.example.kpis')}
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">
                    {t('platform.example.costReduction')}
                  </p>
                  <p className="text-2xl font-bold text-green-600">-35%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    {t('platform.example.responseTime')}
                  </p>
                  <p className="text-2xl font-bold text-blue-600">-60%</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                to="/roi-oracle"
                className="inline-flex items-center justify-center px-5 py-2 rounded-full border border-brand-600 text-sm font-semibold text-brand-600 hover:bg-brand-50 transition-colors"
              >
                {t('platform.roiCta')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
