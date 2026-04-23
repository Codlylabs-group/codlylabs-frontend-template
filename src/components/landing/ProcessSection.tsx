import { useI18n } from '../../i18n'

export default function ProcessSection() {
  const { t } = useI18n()

  const steps = [
    {
      number: '01',
      title: t('process.step1.title'),
      description: t('process.step1.description')
    },
    {
      number: '02',
      title: t('process.step2.title'),
      description: t('process.step2.description')
    },
    {
      number: '03',
      title: 'PoC',
      description: t('process.step3.description')
    },
    {
      number: '04',
      title: t('process.step4.title'),
      description: t('process.step4.description')
    }
  ]

  return (
    <section className="py-24 bg-white">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-7">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {t('process.title')}
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connecting Line - Hidden on mobile */}
          <div className="hidden lg:block absolute top-20 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-200 via-brand-400 to-brand-200"
               style={{ width: 'calc(100% - 8rem)', marginLeft: '4rem' }} />

          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-white rounded-xl p-8 border-2 border-gray-200 hover:border-brand-300 transition-colors relative z-10">
                <div className="text-6xl font-bold text-brand-100 mb-4">
                  {step.number}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
