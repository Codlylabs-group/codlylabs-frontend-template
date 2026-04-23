import { useState, useRef, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import HeroSection from '../components/landing/HeroSection'
import TrustBar from '../components/landing/TrustBar'
import WhyModelSection from '../components/landing/WhyModelSection'
import WhatIsSection from '../components/landing/WhatIsSection'
import HowItWorks from '../components/landing/HowItWorks'
import ProductionReadySection from '../components/landing/ProductionReadySection'
import BenefitsSection from '../components/landing/BenefitsSection'
import VerticalsSection from '../components/landing/VerticalsSection'
import ComplianceOnPremSection from '../components/landing/ComplianceOnPremSection'
import Footer from '../components/landing/Footer'
import AuthModal from '../components/AuthModal'
import { useI18n } from '../i18n'
import { Globe, ChevronDown, LayoutGrid } from 'lucide-react'
import { useAppSelector } from '../store/hooks'

export default function HomePage() {
  const { language, setLanguage, t } = useI18n()
  const isAuthenticated = useAppSelector((state) => state.user.tokens !== null)
  const currentUser = useAppSelector((state) => state.user.user)
  const [isLangOpen, setIsLangOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [authModal, setAuthModal] = useState<{ open: boolean; mode: 'login' | 'register' }>({ open: false, mode: 'login' })
  const langRef = useRef<HTMLDivElement>(null)

  const displayName =
    currentUser?.full_name?.trim() ||
    currentUser?.email?.split('@')[0] ||
    'Usuario'
  const displayEmail = currentUser?.email?.trim() || ''
  const avatarLabel = displayName.charAt(0).toUpperCase()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setIsLangOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelectLanguage = (lang: 'en' | 'es') => {
    setLanguage(lang)
    setIsLangOpen(false)
  }

  const closeAuthModal = useCallback(() => {
    setAuthModal({ open: false, mode: 'login' })
  }, [])

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/80 backdrop-blur-xl shadow-sm' : 'bg-transparent'
      }`}>
        <div className="mx-auto flex h-20 max-w-[1440px] items-center gap-8 px-8 xl:gap-12 xl:px-10">
          <Link to="/" className="shrink-0 text-2xl font-bold text-indigo-600 tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>
            CodlyLabs
          </Link>

          <div className="hidden flex-1 items-center justify-center gap-6 lg:gap-8 xl:gap-10 md:flex">
            <a href="#what-is" className="text-slate-600 hover:text-indigo-600 transition-colors font-semibold text-sm">
              {t('nav.whatIs')}
            </a>
            <a href="#why-model" className="text-slate-600 hover:text-indigo-600 transition-colors font-semibold text-sm">
              {t('nav.benefits')}
            </a>
            <a href="#how-it-works" className="text-slate-600 hover:text-indigo-600 transition-colors font-semibold text-sm">
              {t('nav.howItWorks')}
            </a>
            <a href="#verticals" className="text-slate-600 hover:text-indigo-600 transition-colors font-semibold text-sm">
              {t('nav.verticals')}
            </a>
            <Link to="/pricing" className="text-slate-600 hover:text-indigo-600 transition-colors font-semibold text-sm">
              {t('nav.pricing')}
            </Link>
            <a href="#compliance" className="text-slate-600 hover:text-indigo-600 transition-colors font-semibold text-sm">
              {t('nav.security')}
            </a>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-4">
            {/* Workspace button (authenticated users, all plans) */}
            {isAuthenticated && (
              <Link
                to="/workspace"
                className="hidden md:inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 transition-all hover:bg-indigo-100"
              >
                <LayoutGrid className="h-4 w-4" />
                {t('nav.workspace')}
              </Link>
            )}
            {/* Language Switcher */}
            <div ref={langRef} className="relative">
              <button
                type="button"
                onClick={() => setIsLangOpen(prev => !prev)}
                className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 transition-colors px-2 py-1.5 rounded-lg hover:bg-slate-100"
              >
                <Globe className="w-4 h-4" />
                <span className="text-sm font-medium uppercase">{language}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
              </button>
              {isLangOpen && (
                <div className="absolute right-0 mt-2 w-32 rounded-xl border border-gray-100 bg-white shadow-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => handleSelectLanguage('es')}
                    className={`w-full px-3 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2 ${
                      language === 'es' ? 'font-semibold text-indigo-600 bg-indigo-50' : 'text-gray-700'
                    }`}
                  >
                    Espanol
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectLanguage('en')}
                    className={`w-full px-3 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2 ${
                      language === 'en' ? 'font-semibold text-indigo-600 bg-indigo-50' : 'text-gray-700'
                    }`}
                  >
                    English
                  </button>
                </div>
              )}
            </div>
            {!isAuthenticated && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setAuthModal({ open: true, mode: 'login' })}
                  className="inline-flex items-center gap-2.5 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-base font-semibold text-slate-700 transition-all hover:bg-slate-50"
                >
                  {t('nav.login')}
                </button>
                <button
                  type="button"
                  onClick={() => setAuthModal({ open: true, mode: 'register' })}
                  className="inline-flex items-center gap-2.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-base font-semibold text-white shadow-sm transition-all hover:bg-indigo-500"
                >
                  {t('nav.getStarted')}
                </button>
              </div>
            )}
            {isAuthenticated && currentUser && (
              <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white/90 px-3 py-2 shadow-sm">
                {currentUser.profile_picture ? (
                  <img
                    src={currentUser.profile_picture}
                    alt={displayName}
                    className="h-10 w-10 rounded-full border border-indigo-100 object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                    {avatarLabel}
                  </div>
                )}
                <div className="hidden min-w-0 md:block">
                  <p className="truncate text-sm font-semibold text-slate-900">{displayName}</p>
                  <p className="truncate text-xs text-slate-500">{displayEmail}</p>
                </div>
              </div>
            )}

          </div>
        </div>
      </nav>

      <HeroSection />
      <TrustBar />
      <WhyModelSection />
      <WhatIsSection />
      <HowItWorks />
      <ProductionReadySection />
      <BenefitsSection />
      <ComplianceOnPremSection />
      <VerticalsSection />
      <Footer />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModal.open}
        initialMode={authModal.mode}
        onClose={closeAuthModal}
      />
    </div>
  )
}
