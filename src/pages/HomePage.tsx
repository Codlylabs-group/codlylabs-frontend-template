import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Globe,
  ChevronDown,
  ArrowRight,
  Clock,
  ShieldCheck,
  TrendingUp,
  Zap,
  FileText,
  CheckCircle2,
  Layers,
  Map as MapIcon,
  AlertTriangle,
  Wallet,
  XCircle,
  ClipboardCheck,
  Lightbulb,
  Building2,
  ShoppingCart,
  HeartPulse,
  FileCheck,
  Send,
  Rocket,
  Settings,
} from 'lucide-react'
import Footer from '../components/landing/Footer'
import ValidationWizard from '../components/landing/ValidationWizard'
import { useI18n } from '../i18n'

export default function HomePage() {
  const { language, setLanguage } = useI18n()
  const es = language !== 'en'
  const t = (esText: string, enText: string) => (es ? esText : enText)

  const [isLangOpen, setIsLangOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const langRef = useRef<HTMLDivElement>(null)

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

  const scrollTo = (id: string) => () => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const valueProps = [
    { icon: Zap, label: t('Velocidad de decisión', 'Decision speed') },
    { icon: ShieldCheck, label: t('Reducción de riesgo', 'Risk reduction') },
    { icon: Rocket, label: t('Aceleración hacia producción', 'Faster path to production') },
  ]

  const problems = [
    { icon: Clock, text: t('Las consultoras tardan semanas.', 'Consultancies take weeks.') },
    { icon: AlertTriangle, text: t('Los equipos internos no tienen capacidad.', "Internal teams don't have the capacity.") },
    { icon: XCircle, text: t('Se construye antes de validar.', 'Teams build before validating.') },
  ]

  const results = [
    { icon: Clock, text: t('Tiempo perdido', 'Time wasted') },
    { icon: Wallet, text: t('Presupuesto desperdiciado', 'Budget wasted') },
    { icon: XCircle, text: t('Proyectos abandonados', 'Abandoned projects') },
  ]

  const examples = [
    t('Copiloto comercial', 'Sales copilot'),
    t('Automatización documental', 'Document automation'),
    t('Fraude', 'Fraud'),
    t('Atención al cliente', 'Customer support'),
    t('Forecasting', 'Forecasting'),
  ]

  const analysis = [
    t('ROI esperado', 'Expected ROI'),
    t('Riesgo', 'Risk'),
    t('Factibilidad técnica', 'Technical feasibility'),
    t('Compliance', 'Compliance'),
    t('Arquitectura', 'Architecture'),
  ]

  const packageItems = [
    { icon: FileText, title: t('Executive Summary', 'Executive Summary'), desc: t('¿Vale la pena construirlo?', 'Is it worth building?') },
    { icon: TrendingUp, title: t('ROI Analysis', 'ROI Analysis'), desc: t('Impacto esperado.', 'Expected impact.') },
    { icon: Layers, title: t('Arquitectura propuesta', 'Proposed architecture'), desc: t('Cómo se construye.', 'How it gets built.') },
    { icon: Zap, title: t('PoC funcional', 'Functional PoC'), desc: t('Demostración funcional.', 'Working demonstration.') },
    { icon: ClipboardCheck, title: t('MVP Readiness Report', 'MVP Readiness Report'), desc: t('Qué falta para producción.', "What's missing for production.") },
    { icon: MapIcon, title: t('Production Roadmap', 'Production Roadmap'), desc: t('Plan completo de ejecución.', 'Full execution plan.') },
  ]

  const pipeline = [
    { icon: Lightbulb, name: t('Idea', 'Idea'), desc: '' },
    { icon: ShieldCheck, name: 'AI Validation', desc: t('Validamos. Gratis. 24 hs.', 'We validate. Free. 24h.'), highlight: true },
    { icon: Zap, name: 'PoC', desc: t('Evidencia funcional.', 'Functional evidence.') },
    { icon: Layers, name: 'MVP Factory', desc: t('PoC → MVP funcional.', 'PoC → working MVP.') },
    { icon: Rocket, name: 'Production Factory', desc: t('A producción.', 'To production.') },
    { icon: Settings, name: 'AI Operations', desc: t('Operamos y evolucionamos.', 'We operate and evolve.') },
  ]

  const useCases = [
    { icon: Building2, sector: t('Banca', 'Banking'), items: ['Fraude', 'AML', 'Scoring'] },
    { icon: ShoppingCart, sector: 'Retail', items: ['Forecasting', 'Pricing', t('Inventario', 'Inventory')] },
    { icon: HeartPulse, sector: t('Salud', 'Healthcare'), items: ['Copilots', t('Documentación', 'Documentation'), t('Diagnóstico asistido', 'Assisted diagnosis')] },
    { icon: FileCheck, sector: t('Seguros', 'Insurance'), items: ['Claims', t('Riesgo', 'Risk'), t('Automatización', 'Automation')] },
  ]

  const differential = [
    t('qué construir', 'what to build'),
    t('cómo construirlo', 'how to build it'),
    t('cuánto costará', 'how much it will cost'),
    t('cuánto valor generará', 'how much value it will create'),
  ]

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Navbar */}
      <nav
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          scrolled ? 'bg-white/80 shadow-sm backdrop-blur-xl' : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex h-20 max-w-[1440px] items-center gap-8 px-8 xl:gap-12 xl:px-10">
          <Link
            to="/"
            className="flex shrink-0 items-center gap-2 text-2xl font-bold tracking-tight text-indigo-600"
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            <img src="/symbol.svg" alt="" className="h-7 w-7" />
            <span>CodlyLabs</span>
          </Link>

          <div className="hidden flex-1 items-center justify-center gap-6 lg:gap-8 xl:gap-10 md:flex">
            <a href="#como-funciona" className="text-sm font-semibold text-slate-600 transition-colors hover:text-indigo-600">
              {t('Cómo funciona', 'How it works')}
            </a>
            <a href="#que-recibis" className="text-sm font-semibold text-slate-600 transition-colors hover:text-indigo-600">
              {t('Qué recibís', 'What you get')}
            </a>
            <a href="#casos-de-uso" className="text-sm font-semibold text-slate-600 transition-colors hover:text-indigo-600">
              {t('Casos de uso', 'Use cases')}
            </a>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-4">
            <div ref={langRef} className="relative">
              <button
                type="button"
                onClick={() => setIsLangOpen((prev) => !prev)}
                className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                <Globe className="h-4 w-4" />
                <span className="text-sm font-medium uppercase">{language}</span>
                <ChevronDown className={`h-3 w-3 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
              </button>
              {isLangOpen && (
                <div className="absolute right-0 mt-2 w-32 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
                  <button
                    type="button"
                    onClick={() => {
                      setLanguage('es')
                      setIsLangOpen(false)
                    }}
                    className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-gray-50 ${
                      es ? 'bg-indigo-50 font-semibold text-indigo-600' : 'text-gray-700'
                    }`}
                  >
                    Espanol
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLanguage('en')
                      setIsLangOpen(false)
                    }}
                    className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-gray-50 ${
                      !es ? 'bg-indigo-50 font-semibold text-indigo-600' : 'text-gray-700'
                    }`}
                  >
                    English
                  </button>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={scrollTo('validar')}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-base font-semibold text-white shadow-sm transition-all hover:bg-indigo-500"
            >
              {t('Solicitar AI Validation', 'Request AI Validation')}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section
        className="relative overflow-hidden pt-32 pb-20 md:pt-44 md:pb-28"
        style={{ background: 'radial-gradient(circle at 70% 30%, #e4dfff 0%, #f8f9fa 60%)' }}
      >
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/70 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-indigo-700"
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            <Zap className="h-3.5 w-3.5" />
            AI Validation Studio
          </p>
          <h1
            className="mb-6 text-5xl font-extrabold leading-[1.05] tracking-tight text-gray-900 sm:text-6xl md:text-[4.25rem]"
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            <span className="text-indigo-600">{t('Validá iniciativas de IA en 24 horas.', 'Validate AI initiatives in 24 hours.')}</span>
            <span className="mt-2 block text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl">
              {t('Antes de invertir meses y miles de dólares en desarrollo.', 'Before investing months and thousands of dollars in development.')}
            </span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-xl leading-relaxed text-gray-700 md:text-2xl">
            {t(
              'Enviános tu idea. Te devolvemos un análisis estratégico, una PoC funcional y un roadmap completo hacia MVP y producción.',
              'Send us your idea. We return a strategic analysis, a working PoC and a full roadmap to MVP and production.'
            )}
          </p>

          <div className="mb-10 flex flex-wrap items-center justify-center gap-3">
            {valueProps.map((vp) => {
              const Icon = vp.icon
              return (
                <span
                  key={vp.label}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/80 px-4 py-2 text-sm font-semibold text-gray-700"
                >
                  <Icon className="h-4 w-4 text-indigo-600" />
                  {vp.label}
                </span>
              )
            })}
          </div>

          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={scrollTo('validar')}
              className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-500"
            >
              {t('Solicitar AI Validation gratuita', 'Request free AI Validation')}
              <ArrowRight className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={scrollTo('que-recibis')}
              className="inline-flex items-center gap-2 rounded-2xl border border-gray-300 bg-white px-8 py-4 text-lg font-semibold text-gray-700 transition-all hover:bg-gray-50"
            >
              {t('Ver ejemplo de validación', 'See a sample validation')}
            </button>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            {t('Sin tarjeta. Sin compromiso. Recibís el acceso por email.', 'No card. No commitment. You get access by email.')}
          </p>
        </div>
      </section>

      {/* Sección 2: El problema */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-14 text-center">
            <span className="text-sm font-bold uppercase tracking-widest text-indigo-600">{t('El problema', 'The problem')}</span>
            <h2 className="mt-3 text-3xl font-bold text-gray-900 md:text-4xl" style={{ fontFamily: 'Manrope, sans-serif' }}>
              {t('El 80% de las iniciativas de IA nunca llegan a producción.', '80% of AI initiatives never reach production.')}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
              {t('Las empresas invierten semanas evaluando ideas que nunca generan impacto.', 'Companies spend weeks evaluating ideas that never create impact.')}
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {problems.map((p) => {
              const Icon = p.icon
              return (
                <div key={p.text} className="rounded-2xl border border-gray-100 bg-gray-50/60 p-6">
                  <Icon className="mb-3 h-6 w-6 text-indigo-500" />
                  <p className="font-medium text-gray-800">{p.text}</p>
                </div>
              )
            })}
          </div>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            {results.map((r) => {
              const Icon = r.icon
              return (
                <span key={r.text} className="inline-flex items-center gap-2 rounded-full bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-700">
                  <Icon className="h-4 w-4" />
                  {r.text}
                </span>
              )
            })}
          </div>
        </div>
      </section>

      {/* Sección 3: Cómo funciona */}
      <section id="como-funciona" className="py-24" style={{ background: 'linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%)' }}>
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 text-center">
            <span className="text-sm font-bold uppercase tracking-widest text-indigo-600">{t('Cómo funciona', 'How it works')}</span>
            <h2 className="mt-3 text-3xl font-bold text-gray-900 md:text-4xl" style={{ fontFamily: 'Manrope, sans-serif' }}>
              {t('En 24 horas pasás de una idea a un plan ejecutable.', 'In 24 hours you go from idea to an executable plan.')}
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50">
                <Send className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
                {t('1. Enviás tu iniciativa', '1. Send your initiative')}
              </h3>
              <p className="mb-4 text-gray-600">{t('Describí tu problema.', 'Describe your problem.')}</p>
              <div className="flex flex-wrap gap-2">
                {examples.map((ex) => (
                  <span key={ex} className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                    {ex}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50">
                <ShieldCheck className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
                {t('2. CodlyLabs la valida', '2. CodlyLabs validates it')}
              </h3>
              <p className="mb-4 text-gray-600">{t('Analizamos cada dimensión clave:', 'We analyze every key dimension:')}</p>
              <div className="space-y-2">
                {analysis.map((a) => (
                  <div key={a} className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    {a}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50">
                <FileText className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
                {t('3. Recibís un AI Validation Package', '3. You get an AI Validation Package')}
              </h3>
              <p className="text-gray-600">
                {t(
                  'Análisis estratégico, PoC funcional y roadmap completo hacia producción.',
                  'Strategic analysis, working PoC and a full roadmap to production.'
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sección 4: Qué recibe el cliente (AI Validation Package) */}
      <section id="que-recibis" className="bg-white py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-14 text-center">
            <span className="text-sm font-bold uppercase tracking-widest text-indigo-600">{t('Qué recibís', 'What you get')}</span>
            <h2 className="mt-3 text-3xl font-bold text-gray-900 md:text-4xl" style={{ fontFamily: 'Manrope, sans-serif' }}>
              {t('Tu AI Validation Package', 'Your AI Validation Package')}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
              {t(
                'Todo lo que necesitás para decidir si vale la pena invertir en tu iniciativa de IA.',
                'Everything you need to decide whether your AI initiative is worth the investment.'
              )}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {packageItems.map((d) => {
              const Icon = d.icon
              return (
                <div key={d.title} className="rounded-2xl border border-gray-100 bg-gray-50/60 p-6">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm">
                    <Icon className="h-5 w-5 text-indigo-600" />
                  </div>
                  <p className="font-bold text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>{d.title}</p>
                  <p className="mt-1 text-sm text-gray-600">{d.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Sección 5: El verdadero diferencial */}
      <section className="py-24" style={{ background: 'radial-gradient(circle at 30% 20%, #e4dfff 0%, #f8f9fa 55%)' }}>
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 md:text-5xl" style={{ fontFamily: 'Manrope, sans-serif' }}>
            {t('No entregamos prototipos.', "We don't deliver prototypes.")}
            <span className="block text-indigo-600">{t('Entregamos decisiones.', 'We deliver decisions.')}</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-700">
            {t(
              'Mientras otras herramientas generan código, CodlyLabs te ayuda a decidir:',
              'While other tools generate code, CodlyLabs helps you decide:'
            )}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {differential.map((d) => (
              <span key={d} className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white px-5 py-2.5 text-sm font-semibold text-indigo-700">
                <CheckCircle2 className="h-4 w-4 text-indigo-500" />
                {d}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Sección 6: De la idea a producción (pipeline) */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 text-center">
            <span className="text-sm font-bold uppercase tracking-widest text-indigo-600">{t('De la idea a producción', 'From idea to production')}</span>
            <h2 className="mt-3 text-3xl font-bold text-gray-900 md:text-4xl" style={{ fontFamily: 'Manrope, sans-serif' }}>
              {t('Un proceso completo, no una herramienta suelta.', 'A complete process, not a standalone tool.')}
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {pipeline.map((stage, i) => {
              const Icon = stage.icon
              return (
                <div
                  key={stage.name}
                  className={`relative rounded-2xl border p-5 text-center ${
                    stage.highlight ? 'border-indigo-300 bg-indigo-50' : 'border-gray-100 bg-gray-50/60'
                  }`}
                >
                  <div
                    className={`mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl ${
                      stage.highlight ? 'bg-indigo-600' : 'bg-white shadow-sm'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${stage.highlight ? 'text-white' : 'text-indigo-600'}`} />
                  </div>
                  <p className="text-sm font-bold text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>{stage.name}</p>
                  {stage.desc && <p className="mt-1 text-xs text-gray-500">{stage.desc}</p>}
                  {i === 0 && (
                    <span className="mt-2 inline-block text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                      {t('empezás acá', 'you start here')}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
          <p className="mt-8 text-center text-sm text-gray-500">
            {t('La validación es gratis. El resto del camino lo construimos con vos.', 'Validation is free. We build the rest of the path with you.')}
          </p>
        </div>
      </section>

      {/* Sección 7: Casos de uso */}
      <section id="casos-de-uso" className="py-24" style={{ background: 'linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%)' }}>
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 text-center">
            <span className="text-sm font-bold uppercase tracking-widest text-indigo-600">{t('Casos de uso', 'Use cases')}</span>
            <h2 className="mt-3 text-3xl font-bold text-gray-900 md:text-4xl" style={{ fontFamily: 'Manrope, sans-serif' }}>
              {t('Resolvemos problemas, no vendemos tecnología.', 'We solve problems, we don\'t sell technology.')}
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {useCases.map((uc) => {
              const Icon = uc.icon
              return (
                <div key={uc.sector} className="rounded-3xl border border-gray-100 bg-white p-7 shadow-sm">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50">
                    <Icon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <h3 className="mb-4 text-xl font-bold text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>{uc.sector}</h3>
                  <div className="space-y-2">
                    {uc.items.map((it) => (
                      <div key={it} className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                        {it}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Sección 8: Tiempo */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-3xl px-6">
          <div className="mb-12 text-center">
            <span className="text-sm font-bold uppercase tracking-widest text-indigo-600">{t('Tiempo', 'Time')}</span>
            <h2 className="mt-3 text-3xl font-bold text-gray-900 md:text-4xl" style={{ fontFamily: 'Manrope, sans-serif' }}>
              {t('La diferencia es brutal.', 'The difference is brutal.')}
            </h2>
          </div>
          <div className="overflow-hidden rounded-2xl border border-gray-200">
            {[
              { method: t('Consultora tradicional', 'Traditional consultancy'), time: t('4-8 semanas', '4-8 weeks') },
              { method: t('Equipo interno', 'In-house team'), time: t('2-6 semanas', '2-6 weeks') },
              { method: 'CodlyLabs', time: t('Menos de 24 horas', 'Under 24 hours'), highlight: true },
            ].map((row) => (
              <div
                key={row.method}
                className={`flex items-center justify-between border-b border-gray-100 px-6 py-5 last:border-b-0 ${
                  row.highlight ? 'bg-indigo-600' : 'bg-white'
                }`}
              >
                <span className={`font-semibold ${row.highlight ? 'text-white' : 'text-gray-700'}`}>{row.method}</span>
                <span
                  className={`text-lg font-extrabold ${row.highlight ? 'text-white' : 'text-gray-900'}`}
                  style={{ fontFamily: 'Manrope, sans-serif' }}
                >
                  {row.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Wizard / formulario */}
      <section
        id="validar"
        className="py-24"
        style={{ background: 'radial-gradient(circle at 30% 20%, #e4dfff 0%, #f8f9fa 55%)' }}
      >
        <div className="mx-auto max-w-3xl px-6">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl" style={{ fontFamily: 'Manrope, sans-serif' }}>
              {t('¿Tenés una iniciativa de IA?', 'Got an AI initiative?')}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-lg text-gray-600">
              {t(
                'Enviála hoy. Mañana sabrás si vale la pena construirla — y exactamente cómo llevarla a producción.',
                "Send it today. Tomorrow you'll know if it's worth building — and exactly how to take it to production."
              )}
            </p>
          </div>
          <ValidationWizard />
        </div>
      </section>

      <Footer />
    </div>
  )
}
