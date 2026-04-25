import { Link } from 'react-router-dom'
import { useI18n } from '../../i18n'

export default function Footer() {
  const { t } = useI18n()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-white rounded-t-xl">
      <div className="flex flex-col md:flex-row justify-between items-center py-12 px-8 max-w-7xl mx-auto gap-8">
        <div className="text-xl font-bold text-white tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>
          CodlyLabs
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          <Link to="/policies" className="text-slate-400 hover:text-white transition-colors text-sm">
            {t('footer.policies')}
          </Link>
          <Link to="/about-platform" className="text-slate-400 hover:text-white transition-colors text-sm">
            {t('footer.about')}
          </Link>
          <Link to="/contact" className="text-slate-400 hover:text-white transition-colors text-sm">
            {t('footer.contact')}
          </Link>
        </div>
        <div className="text-slate-400 text-sm">
          {t('footer.copyright', { year: currentYear })}
        </div>
      </div>

      {/* Legal compliance disclaimer */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <p className="text-slate-500 text-xs leading-relaxed italic">
            {t('footer.complianceDisclaimer')}
          </p>
        </div>
      </div>
    </footer>
  )
}
