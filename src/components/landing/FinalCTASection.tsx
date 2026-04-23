import { Link } from 'react-router-dom'
import { useI18n } from '../../i18n'

export default function FinalCTASection() {
  const { t } = useI18n()

  return (
    <section id="final-cta" className="scroll-mt-28 py-20 px-6">
      <div className="max-w-5xl mx-auto bg-indigo-600 text-white rounded-[2rem] p-12 md:p-20 text-center relative overflow-hidden">
        {/* Background blurs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mb-32 blur-3xl" />

        <div className="relative z-10">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6" style={{ fontFamily: 'Manrope, sans-serif' }}>
            {t('finalCTA.title')}
          </h2>
          <p className="text-indigo-200 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
            {t('finalCTA.subtitle')}
          </p>
          <Link
            to="/free-diagnostic"
            className="inline-flex items-center justify-center bg-white text-indigo-600 px-10 py-5 rounded-xl font-extrabold text-lg md:text-xl shadow-2xl hover:bg-indigo-50 transition-all active:scale-95"
          >
            {t('finalCTA.button')}
          </Link>
        </div>
      </div>
    </section>
  )
}
