import { Link } from 'react-router-dom'
import { useI18n } from '../../i18n'
import { getVerticalPackStaticData } from '../../data/verticalPack'

export default function VerticalPackHighlight() {
  const { t, language } = useI18n()
  const staticData = getVerticalPackStaticData(language)

  return (
    <section className="bg-[#F9FAFB] py-16 shadow-md">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-7 flex flex-col lg:flex-row items-center gap-8">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">
            {t('verticalPackHighlight.label')}
          </p>
          <h2 className="text-4xl font-bold text-gray-900">{t('verticalPackHighlight.title')}</h2>
          <p className="max-w-2xl text-sm text-gray-600 leading-relaxed">
            {t('verticalPackHighlight.subtitle')}
          </p>
          <div className="flex flex-wrap gap-4">
            <span className="px-3 py-1 rounded-full bg-gray-100 text-xs font-semibold text-gray-700 shadow-sm">
              {t('verticalPackHighlight.statPocs', { count: staticData.summary.pocTemplates })}
            </span>
            <span className="px-3 py-1 rounded-full bg-gray-100 text-xs font-semibold text-gray-700 shadow-sm">
              {t('verticalPackHighlight.statCases', { count: staticData.summary.curatedCases })}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/vertical-pack"
            className="px-6 py-3 rounded-full bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] text-white font-semibold shadow-lg hover:from-[#4338ca] hover:to-[#6d28d9] transition-colors"
          >
            {t('verticalPackHighlight.cta')}
          </Link>
        </div>
      </div>
    </section>
  )
}
