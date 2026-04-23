import { useI18n } from '../../i18n'

export default function TrustBar() {
  const { t } = useI18n()

  const stats = [
    { value: '+200', label: t('trustBar.pilots') },
    { value: '20+', label: t('trustBar.verticals') },
    { value: '5', label: t('trustBar.qualityGates') },
    { value: '6', label: t('trustBar.compliance') },
    { value: '< 10 min', label: t('trustBar.avgTime') },
  ]

  return (
    <div className="py-8 bg-[#f8f9fa]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-wrap justify-center md:justify-around gap-6 md:gap-4 items-center py-6 bg-white/70 backdrop-blur-xl border border-gray-200/15 rounded-2xl">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="text-center md:text-left">
                <p className="font-bold text-2xl text-indigo-600 tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  {stat.value}
                </p>
                <p className="text-xs uppercase tracking-widest text-gray-400 font-medium">
                  {stat.label}
                </p>
              </div>
              {index < stats.length - 1 && (
                <div className="w-px h-8 bg-gray-200/50 hidden md:block ml-4" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
