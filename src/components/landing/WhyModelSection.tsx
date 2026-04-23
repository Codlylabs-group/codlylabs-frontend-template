import { useI18n } from '../../i18n'

export default function WhyModelSection() {
  const { t } = useI18n()

  const points = [
    t('whyModel.point1'),
    t('whyModel.point2'),
    t('whyModel.point3'),
    t('whyModel.point4'),
  ]

  return (
    <section
      id="why-model"
      className="py-24"
      style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)' }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-5xl mb-14">
          <p
            className="text-sm md:text-base font-semibold uppercase tracking-[0.18em] text-indigo-700/80 mb-5"
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            {t('whyModel.eyebrow')}
          </p>
          <h2
            className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-[0.95] tracking-tight text-indigo-600"
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            {t('whyModel.title')}
          </h2>
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] items-stretch">
          <div
            className="rounded-[2rem] p-8 md:p-10 text-white border border-indigo-400/20"
            style={{
              background: 'linear-gradient(135deg, #5844ED 0%, #4F46E5 45%, #3730A3 100%)',
              boxShadow: '0 24px 60px rgba(79, 70, 229, 0.22)',
            }}
          >
            <h3
              className="text-3xl md:text-4xl font-extrabold text-white mb-8"
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              {t('whyModel.cardTitle')}
            </h3>

            <ul className="space-y-5 text-lg md:text-2xl leading-relaxed text-indigo-50">
              {points.map((point) => (
                <li key={point} className="flex items-start gap-4">
                  <span className="mt-3 h-2.5 w-2.5 rounded-full bg-white flex-shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            <p
              className="mt-10 text-2xl md:text-3xl font-extrabold text-white"
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              {t('whyModel.cardConclusion')}
            </p>
          </div>

          <div
            className="rounded-[2rem] border p-8 md:p-10 flex flex-col justify-center"
            style={{
              borderColor: 'rgba(79, 70, 229, 0.12)',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(238,242,255,0.62) 100%)',
              boxShadow: '0 16px 40px rgba(15, 23, 42, 0.05)',
            }}
          >
            <p
              className="text-2xl md:text-3xl font-bold text-gray-900 mb-5"
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              {t('whyModel.rightTitle')}
            </p>
            <p
              className="text-3xl md:text-5xl font-extrabold leading-tight text-indigo-700 mb-6"
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              {t('whyModel.rightHighlight')}
            </p>
            <p className="text-lg md:text-2xl leading-relaxed text-gray-600 max-w-2xl">
              {t('whyModel.rightBody')}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
