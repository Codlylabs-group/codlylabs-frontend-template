import { MessageCircle, Compass, Code2, ShieldCheck, Package } from 'lucide-react'
import { useI18n } from '../../i18n'

export default function HowItWorks() {
  const { t } = useI18n()

  const steps = [
    {
      icon: MessageCircle,
      title: t('howItWorks.step1.title'),
      description: t('howItWorks.step1.description'),
      color: 'indigo',
    },
    {
      icon: Compass,
      title: t('howItWorks.step2.title'),
      description: t('howItWorks.step2.description'),
      color: 'violet',
    },
    {
      icon: Code2,
      title: t('howItWorks.step3.title'),
      description: t('howItWorks.step3.description'),
      color: 'emerald',
    },
    {
      icon: ShieldCheck,
      title: t('howItWorks.step4.title'),
      description: t('howItWorks.step4.description'),
      color: 'amber',
    },
    {
      icon: Package,
      title: t('howItWorks.step5.title'),
      description: t('howItWorks.step5.description'),
      color: 'indigo',
    },
  ]

  const colorMap: Record<string, { bg: string; icon: string; ring: string }> = {
    indigo: { bg: 'bg-indigo-50', icon: 'text-indigo-600', ring: 'ring-indigo-200' },
    violet: { bg: 'bg-violet-50', icon: 'text-violet-600', ring: 'ring-violet-200' },
    emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', ring: 'ring-emerald-200' },
    amber: { bg: 'bg-amber-50', icon: 'text-amber-600', ring: 'ring-amber-200' },
  }

  return (
    <section id="how-it-works" className="py-24" style={{ background: 'linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%)' }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-indigo-600 font-bold tracking-widest uppercase text-sm">
            {t('howItWorks.label')}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-3 text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
            {t('howItWorks.title')}
          </h2>
        </div>

        {/* Desktop: horizontal pipeline */}
        <div className="hidden lg:block relative">
          {/* Connector line */}
          <div className="absolute top-14 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-indigo-200 via-emerald-200 to-indigo-200" />

          <div className="grid grid-cols-5 gap-6">
            {steps.map((step, index) => {
              const colors = colorMap[step.color]
              return (
                <div key={index} className="flex flex-col items-center text-center relative">
                  <div className={`w-[4.5rem] h-[4.5rem] ${colors.bg} rounded-full flex items-center justify-center mb-5 shadow-lg shadow-slate-900/5 relative z-10 ring-4 ring-white`}>
                    <step.icon className={`w-7 h-7 ${colors.icon}`} />
                  </div>
                  <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
                    {step.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed max-w-[200px]">
                    {step.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Mobile/Tablet: vertical timeline */}
        <div className="lg:hidden space-y-8">
          {steps.map((step, index) => {
            const colors = colorMap[step.color]
            return (
              <div key={index} className="flex gap-5">
                <div className="flex flex-col items-center">
                  <div className={`w-14 h-14 ${colors.bg} rounded-full flex items-center justify-center shadow-md flex-shrink-0`}>
                    <step.icon className={`w-6 h-6 ${colors.icon}`} />
                  </div>
                  {index < steps.length - 1 && (
                    <div className="w-0.5 flex-1 bg-gradient-to-b from-indigo-200 to-transparent mt-2" />
                  )}
                </div>
                <div className="pb-6">
                  <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1" style={{ fontFamily: 'Manrope, sans-serif' }}>
                    {step.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
