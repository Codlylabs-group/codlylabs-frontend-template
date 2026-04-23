import { Lock, Cloud, Server, Database, Unlock, ShieldCheck, Plug } from 'lucide-react'
import { useI18n } from '../../i18n'

const complianceModes = [
  {
    icon: Cloud,
    titleKey: 'compliance.modeDataFree.title',
    descriptionKey: 'compliance.modeDataFree.description',
    featureKeys: [
      'compliance.modeDataFree.feature1',
      'compliance.modeDataFree.feature2',
      'compliance.modeDataFree.feature3',
    ],
  },
  {
    icon: Server,
    titleKey: 'compliance.modeOnPrem.title',
    descriptionKey: 'compliance.modeOnPrem.description',
    featureKeys: [
      'compliance.modeOnPrem.feature1',
      'compliance.modeOnPrem.feature2',
      'compliance.modeOnPrem.feature3',
    ],
  },
]

export default function ComplianceOnPremSection() {
  const { t } = useI18n()

  return (
    <section id="compliance" className="py-24 bg-gradient-to-br from-gray-900 to-brand-900 text-white">
      <div className="relative max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-7">
        <div className="absolute inset-0 opacity-30">
          <div className="bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_65%)] h-full w-full" />
        </div>
        <div className="relative space-y-6">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-brand-300 font-semibold mb-2">
              {t('compliance.badge')}
            </p>
            <h2 className="text-4xl md:text-5xl font-bold leading-tight max-w-3xl">
              {t('compliance.title')}
            </h2>
            <p className="mt-4 text-lg text-brand-100 max-w-3xl">
              {t('compliance.description')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {complianceModes.map((mode) => (
              <article
                key={mode.titleKey}
                className="rounded-2xl border border-white/20 bg-white/5 p-6 shadow-lg backdrop-blur"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-white/20 p-2 rounded-full">
                    <mode.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">
                    {t(mode.titleKey)}
                  </h3>
                </div>
                <p className="text-sm text-brand-100 leading-relaxed mb-4">
                  {t(mode.descriptionKey)}
                </p>
                <ul className="space-y-2 text-sm">
                  {mode.featureKeys.map((featureKey) => (
                    <li key={featureKey} className="flex items-start gap-2">
                      <span className="w-2 h-2 mt-1 rounded-full bg-white" />
                      <span>{t(featureKey)}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </div>
      {/* Enterprise Trust Pillars */}
      <div className="relative max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-7 mt-10">
        <p className="text-center text-sm uppercase tracking-[0.3em] text-white/70 font-semibold mb-6">
          {t('compliance.trustTitle')}
        </p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { icon: Cloud, key: 'compliance.trust.onprem' },
            { icon: Database, key: 'compliance.trust.dataOwnership' },
            { icon: Unlock, key: 'compliance.trust.noLockIn' },
            { icon: ShieldCheck, key: 'compliance.trust.secureArch' },
            { icon: Plug, key: 'compliance.trust.api' },
          ].map((item) => (
            <div key={item.key} className="flex flex-col items-center text-center gap-2 p-4 rounded-xl bg-white/5 border border-white/10">
              <item.icon className="w-6 h-6 text-white/80" />
              <span className="text-sm text-white/80 leading-snug">{t(item.key)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/30 rounded-full text-xs uppercase tracking-[0.3em] text-white">
          <Lock className="w-4 h-4" />
          {t('compliance.cta')}
        </div>
      </div>

      {/* Legal disclaimer */}
      <div className="relative max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-7 mt-6">
        <p className="text-center text-xs text-white/60 italic max-w-3xl mx-auto leading-relaxed">
          {t('compliance.disclaimer')}
        </p>
      </div>
    </section>
  )
}
