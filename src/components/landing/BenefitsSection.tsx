import { Package, ShieldCheck, Brain, Server } from 'lucide-react'
import { useI18n } from '../../i18n'

export default function BenefitsSection() {
  const { t } = useI18n()

  const roiMetrics = [
    { value: t('benefits.roi.metric1.value'), label: t('benefits.roi.metric1.label') },
    { value: t('benefits.roi.metric2.value'), label: t('benefits.roi.metric2.label') },
    { value: t('benefits.roi.metric3.value'), label: t('benefits.roi.metric3.label') },
    { value: t('benefits.roi.metric4.value'), label: t('benefits.roi.metric4.label') },
  ]

  const benefits = [
    { icon: Package, title: t('benefits.item1.title'), description: t('benefits.item1.description') },
    { icon: ShieldCheck, title: t('benefits.item2.title'), description: t('benefits.item2.description') },
    { icon: Brain, title: t('benefits.item3.title'), description: t('benefits.item3.description') },
    { icon: Server, title: t('benefits.item4.title'), description: t('benefits.item4.description') },
  ]

  return (
    <section id="benefits" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-10">
          <span className="text-indigo-600 font-bold tracking-widest uppercase text-sm">
            {t('benefits.label')}
          </span>
          <h2
            className="text-3xl md:text-4xl font-bold mt-3 text-gray-900"
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            {t('benefits.title')}
          </h2>
          <p className="text-gray-500 text-lg mt-3 max-w-2xl mx-auto">
            {t('benefits.roi.subtitle')}
          </p>
        </div>

        {/* ROI Metrics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-14">
          {roiMetrics.map((metric, index) => (
            <div key={index} className="text-center p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <p
                className="text-3xl md:text-4xl font-extrabold text-indigo-600 mb-1"
                style={{ fontFamily: 'Manrope, sans-serif' }}
              >
                {metric.value}
              </p>
              <p className="text-sm text-gray-500 leading-snug">{metric.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 border border-gray-100"
            >
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-5">
                <benefit.icon className="w-6 h-6 text-indigo-600" strokeWidth={1.5} />
              </div>
              <h4 className="text-xl font-bold mb-3 text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
                {benefit.title}
              </h4>
              <p className="text-gray-500 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
