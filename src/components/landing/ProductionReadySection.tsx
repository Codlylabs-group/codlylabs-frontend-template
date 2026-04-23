import { Code2, Container, FileText, BookOpen, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { useI18n } from '../../i18n'

export default function ProductionReadySection() {
  const { t } = useI18n()

  const items = [
    { icon: Code2, title: t('productionReady.item1.title'), desc: t('productionReady.item1.desc') },
    { icon: Container, title: t('productionReady.item2.title'), desc: t('productionReady.item2.desc') },
    { icon: FileText, title: t('productionReady.item3.title'), desc: t('productionReady.item3.desc') },
    { icon: BookOpen, title: t('productionReady.item4.title'), desc: t('productionReady.item4.desc') },
    { icon: CheckCircle2, title: t('productionReady.item5.title'), desc: t('productionReady.item5.desc') },
    { icon: ShieldCheck, title: t('productionReady.item6.title'), desc: t('productionReady.item6.desc') },
  ]

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-indigo-600 font-bold tracking-widest uppercase text-sm">
            {t('productionReady.label')}
          </span>
          <h2
            className="text-3xl md:text-4xl font-bold mt-3 text-gray-900"
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            {t('productionReady.title')}
          </h2>
          <p className="text-lg text-gray-500 mt-4 max-w-2xl mx-auto">
            {t('productionReady.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <div
              key={i}
              className="group relative bg-[#f8f9fa] border border-gray-100 rounded-2xl p-7 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300"
            >
              <div className="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-600 transition-colors">
                <item.icon className="w-5 h-5 text-indigo-600 group-hover:text-white transition-colors" />
              </div>
              <h4
                className="text-lg font-bold text-gray-900 mb-2"
                style={{ fontFamily: 'Manrope, sans-serif' }}
              >
                {item.title}
              </h4>
              <p className="text-gray-500 text-sm leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
