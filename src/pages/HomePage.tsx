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
  Lightbulb,
  Building2,
  ShoppingCart,
  HeartPulse,
  FileCheck,
  Send,
  Rocket,
  Settings,
  Search,
  UserCheck,
  Box,
  Compass,
  PlayCircle,
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
  const [isPocVideoOpen, setIsPocVideoOpen] = useState(false)
  const [isPocVideoVisible, setIsPocVideoVisible] = useState(false)
  const langRef = useRef<HTMLDivElement>(null)
  const pocFunctionalVideo = {
    src: '/media/poc-funcional-demo.mp4',
    poster: '/media/poc-funcional-demo-poster.jpg',
  }

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

  const openPocVideo = () => {
    setIsPocVideoOpen(true)
    window.requestAnimationFrame(() => setIsPocVideoVisible(true))
  }

  const closePocVideo = () => {
    setIsPocVideoVisible(false)
    window.setTimeout(() => setIsPocVideoOpen(false), 180)
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
    { icon: Layers, title: t('Arquitectura propuesta', 'Proposed architecture'), desc: t('Cómo se construye.', "How it's built.") },
    {
      icon: Zap,
      title: t('PoC Funcional', 'Functional PoC'),
      desc: t('Demostración funcional.', 'Functional demonstration.'),
      video: pocFunctionalVideo,
    },
    { icon: FileCheck, title: t('MVP Readiness Report', 'MVP Readiness Report'), desc: t('Qué falta para producción.', "What's missing for production.") },
    { icon: MapIcon, title: t('Production Roadmap', 'Production Roadmap'), desc: t('Plan completo de ejecución.', 'Full execution plan.') },
  ]

  const pipeline = [
    { icon: Lightbulb, name: t('Idea', 'Idea'), desc: '' },
    { icon: ShieldCheck, name: 'AI Validation', desc: t('Validamos. Gratis. 24 hs.', 'We validate. Free. 24h.'), highlight: true },
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

  const comparison = [
    {
      method: t('Consultora tradicional', 'Traditional consultancy'),
      time: t('6 semanas', '6 weeks'),
      cost: 'USD 50.000 — 200.000',
      result: t('Slides o mockups', 'Slides or mockups'),
    },
    {
      method: t('Consultora boutique', 'Boutique consultancy'),
      time: t('2-4 semanas', '2-4 weeks'),
      cost: 'USD 20.000 — 80.000',
      result: t('Prototipo parcial', 'Partial prototype'),
    },
    {
      method: t('Equipo interno', 'In-house team'),
      time: t('Semanas o meses', 'Weeks or months'),
      cost: t('Costo de oportunidad alto', 'High opportunity cost'),
      result: t('Variable e incierto', 'Variable and uncertain'),
    },
    {
      method: 'CodlyLabs',
      time: t('Menos de 24 horas', 'Under 24 hours'),
      cost: t('Sin costo inicial', 'No upfront cost'),
      result: t('Sistema funcional + plan completo', 'Working system + full plan'),
      highlight: true,
    },
  ]

  const pillars = [
    { icon: ShieldCheck, name: 'VALIDATE', desc: t('Tu iniciativa de IA validada con evidencia funcional en menos de 24 horas.', 'Your AI initiative validated with functional evidence in under 24 hours.') },
    { icon: Layers, name: 'BUILD', desc: t('El producto construido sobre esa validación. En semanas, no en meses.', 'The product built on that validation. In weeks, not months.') },
    { icon: Settings, name: 'OPERATE', desc: t('El producto operando, monitoreado y evolucionando continuamente.', 'The product running, monitored and continuously evolving.') },
  ]

  const validationAgents = [
    {
      icon: Search,
      title: t('Agentes de Discovery', 'Discovery agents'),
      desc: t('Analizan el desafío de negocio.', 'Analyze the business challenge.'),
    },
    {
      icon: Layers,
      title: t('Agentes de Arquitectura', 'Architecture agents'),
      desc: t('Diseñan la solución.', 'Design the solution.'),
    },
    {
      icon: ShieldCheck,
      title: t('Agentes de Validación', 'Validation agents'),
      desc: t('Evalúan factibilidad, riesgos, compliance y ROI esperado.', 'Assess feasibility, risks, compliance and expected ROI.'),
    },
    {
      icon: Rocket,
      title: t('Agentes de Generación', 'Generation agents'),
      desc: t('Construyen prototipos funcionales que demuestran el concepto.', 'Build functional prototypes that demonstrate the concept.'),
    },
  ]

  const validationOutcomes = [
    { icon: CheckCircle2, label: t('Iniciativa de IA validada', 'Validated AI initiative') },
    { icon: Box, label: t('Prueba de concepto funcional', 'Functional proof of concept') },
    { icon: MapIcon, label: t('Roadmap a producción', 'Production roadmap') },
    { icon: Compass, label: t('Recomendación clara', 'Clear recommendation') },
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
            <div className="relative">
              <span className="absolute -right-1.5 -top-2 z-10 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm ring-2 ring-white">
                {t('Gratis', 'Free')}
              </span>
              <button
                type="button"
                onClick={scrollTo('validar')}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-base font-semibold text-white shadow-sm transition-all hover:bg-indigo-500"
              >
                {t('Solicitar mi validación', 'Request my validation')}
              </button>
            </div>
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
            AI Innovation Studio
          </p>
          <h1
            className="mb-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-gray-900 sm:text-5xl md:text-[3.75rem]"
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            <span className="text-gray-900">{t('La IA que imaginás,', 'The AI you imagine,')}</span>
            <span className="block text-indigo-600">{t('construida con precisión.', 'built with precision.')}</span>
          </h1>
          <p className="mb-6 text-xl font-bold text-gray-900 md:text-2xl" style={{ fontFamily: 'Manrope, sans-serif' }}>
            {t('Sin fricciones. Con impacto.', 'No friction. With impact.')}
          </p>
          <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-gray-700 md:text-xl">
            {t(
              'Transformación empresarial con IA. Validada, construida y operada con precisión. Nosotros en cada paso.',
              'Enterprise transformation with AI. Validated, built and operated with precision. Us at every step.'
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
            <div className="relative">
              <span className="absolute -right-2 -top-2 z-10 rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-sm ring-2 ring-white">
                {t('Gratis', 'Free')}
              </span>
              <button
                type="button"
                onClick={scrollTo('validar')}
                className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-500"
              >
                {t('Solicitar mi validación', 'Request my validation')}
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            {t('Sin tarjeta. Sin compromiso. Recibís el acceso por email.', 'No card. No commitment. You get access by email.')}
          </p>
        </div>
      </section>

      {/* Sección 1b: Cómo validamos iniciativas de IA (manifiesto) */}
      <section className="border-t border-gray-100 bg-white py-24">
        <div className="mx-auto max-w-5xl px-6">
          {/* Encabezado + lead */}
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-sm font-bold uppercase tracking-widest text-indigo-600">
              {t('Cómo validamos iniciativas de IA', 'How we validate AI initiatives')}
            </span>
            <h2
              className="mx-auto mt-3 max-w-2xl text-3xl font-bold leading-[1.2] text-gray-900 md:text-4xl"
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              {t(
                'La mayoría de las empresas fallan porque eligen las iniciativas equivocadas.',
                'Most companies fail because they choose the wrong initiatives.'
              )}
            </h2>
            <p className="mx-auto mt-5 text-lg leading-relaxed text-gray-600">
              {t(
                'Subestiman la complejidad, pasan por alto los requisitos de compliance o invierten en proyectos que nunca llegan a producción. CodlyLabs fue creado para resolver ese problema.',
                'They underestimate complexity, overlook compliance requirements, or invest in projects that never reach production. CodlyLabs was created to solve that problem.'
              )}
            </p>
          </div>

          {/* Banda manifiesto: hybrid intelligence */}
          <div className="mx-auto mt-12 max-w-3xl border-y border-gray-200 py-8 text-center">
            <p className="text-xl font-medium leading-relaxed text-gray-900 md:text-2xl" style={{ fontFamily: 'Manrope, sans-serif' }}>
              {t(
                'Detrás de cada validación hay un sistema de inteligencia híbrida: agentes de IA especializados en múltiples verticales trabajando junto a expertos en tecnología con experiencia real.',
                'Behind every validation is a hybrid intelligence system — specialized AI agents across multiple verticals working alongside experienced technology experts.'
              )}
            </p>
          </div>

          {/* Los 4 agentes */}
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {validationAgents.map((agent) => {
              const Icon = agent.icon
              return (
                <div key={agent.title} className="rounded-2xl border border-gray-100 bg-gray-50/60 p-6">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm">
                    <Icon className="h-5 w-5 text-indigo-600" />
                  </div>
                  <p className="font-bold text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
                    {agent.title}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{agent.desc}</p>
                </div>
              )
            })}
          </div>

          {/* Human-in-the-loop */}
          <div className="mt-6 flex items-start gap-4 rounded-2xl border border-indigo-100 bg-indigo-50 p-6 md:p-8">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600">
              <UserCheck className="h-5 w-5 text-white" />
            </div>
            <p className="text-base leading-relaxed text-indigo-900 md:text-lg">
              {t(
                'Luego, expertos humanos revisan cada resultado, garantizando que las recomendaciones sean técnicamente sólidas, comercialmente viables y alineadas con la realidad de la empresa. Esta combinación nos permite entregar en horas lo que tradicionalmente requiere semanas de consultoría.',
                'Human experts then review every outcome, ensuring that recommendations are technically sound, commercially viable, and aligned with enterprise realities. This combination allows us to deliver in hours what traditionally requires weeks of consulting engagements.'
              )}
            </p>
          </div>

          {/* The outcome */}
          <div className="mt-16 text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-gray-400">
              {t('El resultado no es un slide deck.', 'The outcome is not a slide deck.')}
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {validationOutcomes.map((o) => {
                const Icon = o.icon
                return (
                  <div key={o.label} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <Icon className="mx-auto mb-3 h-6 w-6 text-indigo-600" />
                    <p className="text-sm font-bold text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
                      {o.label}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Cierre manifiesto */}
          <div className="mx-auto mt-16 max-w-3xl text-center">
            <p className="text-2xl font-bold leading-snug text-gray-900 md:text-[1.75rem]" style={{ fontFamily: 'Manrope, sans-serif' }}>
              {t(
                'El futuro de la IA no se trata de generar más software. Se trata de ayudar a las organizaciones a tomar mejores decisiones, más rápido.',
                "The future of AI is not about generating more software. It's about helping organizations make better decisions, faster."
              )}
            </p>
            <p className="mt-5 text-lg font-semibold text-indigo-600" style={{ fontFamily: 'Manrope, sans-serif' }}>
              {t('Eso es lo que hace CodlyLabs.', 'That is what CodlyLabs does.')}
            </p>
          </div>
        </div>
      </section>

      {/* Sección 8: La Categoría — AI Innovation Studio (movida debajo de Cómo validamos) */}
      <section className="py-24" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}>
        <div className="mx-auto max-w-5xl px-6 text-center text-white">
          <h2 className="text-3xl font-extrabold leading-tight md:text-[2.75rem]" style={{ fontFamily: 'Manrope, sans-serif' }}>
            {t('No somos una consultora. No somos una herramienta.', "We're not a consultancy. We're not a tool.")}
            <span className="block">{t('Somos algo que no existía.', "We're something that didn't exist before.")}</span>
          </h2>
          <p className="mt-5 text-xl font-semibold text-indigo-100" style={{ fontFamily: 'Manrope, sans-serif' }}>
            {t('Somos un AI Innovation Studio.', "We're an AI Innovation Studio.")}
          </p>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-indigo-50">
            {t(
              'Las empresas que transforman su industria con IA necesitan más que una herramienta que genera código. Necesitan un socio que valide la idea, construya el producto y lo opere con precisión. Eso es lo que hacemos. De principio a fin. Sin que el cliente cambie de proveedor en ningún paso.',
              'Companies that transform their industry with AI need more than a tool that generates code. They need a partner that validates the idea, builds the product and operates it with precision. That is what we do. End to end. Without the client switching providers at any step.'
            )}
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {pillars.map((p) => {
              const Icon = p.icon
              return (
                <div key={p.name} className="rounded-3xl border border-white/20 bg-white/10 p-7 text-left backdrop-blur">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-lg font-extrabold tracking-wide" style={{ fontFamily: 'Manrope, sans-serif' }}>{p.name}</p>
                  <p className="mt-2 text-sm leading-relaxed text-indigo-50">{p.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Sección 2: El problema — OCULTA (envuelta en {false &&} para reactivar fácil) */}
      {false && (
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
      )}

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
                {t('1. Describí tu iniciativa de IA', '1. Describe your AI initiative')}
              </h3>
              <p className="mb-4 text-gray-600">{t('Contanos el problema que querés resolver.', 'Tell us the problem you want to solve.')}</p>
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
                {t('2. La validamos con inteligencia real', '2. We validate it with real intelligence')}
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
                {t('3. Recibís tu AI Validation Package', '3. You get your AI Validation Package')}
              </h3>
              <p className="text-gray-600">
                {t(
                  'Análisis estratégico, PoC funcional y roadmap completo. En menos de 24 horas.',
                  'Strategic analysis, a functional PoC and a full roadmap. In under 24 hours.'
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
            <p className="mx-auto mt-4 max-w-3xl text-lg text-gray-600">
              {t(
                'Todo lo que necesitás para decidir si vale la pena invertir en tu iniciativa de IA.',
                'Everything you need to decide whether your AI initiative is worth investing in.'
              )}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {packageItems.map((d) => {
              const Icon = d.icon
              const isVideoCard = Boolean(d.video)
              const CardTag = isVideoCard ? 'button' : 'div'
              return (
                <CardTag
                  key={d.title}
                  type={isVideoCard ? 'button' : undefined}
                  onClick={isVideoCard ? openPocVideo : undefined}
                  className={`group rounded-2xl border border-gray-100 bg-gray-50/60 p-6 text-left transition-all ${
                    isVideoCard ? 'cursor-pointer hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-white hover:shadow-lg' : ''
                  }`}
                >
                  {d.video ? (
                    <div className="mb-4 overflow-hidden rounded-xl border border-gray-100 bg-gray-100 shadow-sm">
                      <div className="relative aspect-video">
                        <img
                          src={d.video.poster}
                          alt=""
                          className="h-full w-full object-cover"
                          onError={(event) => {
                            event.currentTarget.style.display = 'none'
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/20">
                          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-indigo-600 shadow-lg transition-transform group-hover:scale-105">
                            <PlayCircle className="h-5 w-5" />
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm">
                      <Icon className="h-5 w-5 text-indigo-600" />
                    </div>
                  )}
                  <p className="font-bold text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>{d.title}</p>
                  <p className="mt-1 text-sm text-gray-600">{d.desc}</p>
                </CardTag>
              )
            })}
          </div>
        </div>
      </section>

      {isPocVideoOpen && (
        <div
          className={`fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/75 px-4 py-8 backdrop-blur-sm transition-opacity duration-200 ease-out ${
            isPocVideoVisible ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={closePocVideo}
        >
          <div
            className={`w-full max-w-5xl overflow-hidden rounded-2xl bg-black shadow-2xl transition-all duration-200 ease-out ${
              isPocVideoVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
            }`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 bg-slate-950 px-4 py-3">
              <p className="text-sm font-bold text-white" style={{ fontFamily: 'Manrope, sans-serif' }}>
                {t('PoC Funcional', 'Functional PoC')}
              </p>
              <button
                type="button"
                onClick={closePocVideo}
                className="rounded-lg px-3 py-1.5 text-sm font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                {t('Cerrar', 'Close')}
              </button>
            </div>
            <video
              src={pocFunctionalVideo.src}
              poster={pocFunctionalVideo.poster}
              controls
              autoPlay
              className="aspect-video w-full bg-black object-contain"
            />
          </div>
        </div>
      )}

      {/* Sección 5: De la idea a producción (pipeline) */}
      <section className="py-24" style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)' }}>
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 text-center">
            <span className="text-sm font-bold uppercase tracking-widest text-indigo-600">{t('De la idea a producción', 'From idea to production')}</span>
            <h2 className="mt-3 text-3xl font-bold text-gray-900 md:text-4xl" style={{ fontFamily: 'Manrope, sans-serif' }}>
              {t('Un proceso completo, no una herramienta suelta.', 'A complete process, not a standalone tool.')}
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {pipeline.map((stage, i) => {
              const Icon = stage.icon
              return (
                <div
                  key={stage.name}
                  className={`relative rounded-2xl border p-5 text-center ${
                    stage.highlight ? 'border-indigo-300 bg-indigo-50' : 'border-gray-100 bg-white'
                  }`}
                >
                  <div
                    className={`mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl ${
                      stage.highlight ? 'bg-indigo-600' : 'bg-gray-50'
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

      {/* Sección 6: Casos de uso */}
      <section id="casos-de-uso" className="bg-white py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 text-center">
            <span className="text-sm font-bold uppercase tracking-widest text-indigo-600">{t('Casos de uso', 'Use cases')}</span>
            <h2 className="mt-3 text-3xl font-bold text-gray-900 md:text-4xl" style={{ fontFamily: 'Manrope, sans-serif' }}>
              {t('Resolvemos problemas, no vendemos tecnología.', "We solve problems, we don't sell technology.")}
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {useCases.map((uc) => {
              const Icon = uc.icon
              return (
                <div key={uc.sector} className="rounded-3xl border border-gray-100 bg-gray-50/60 p-7">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
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

      {/* Sección 7: Comparativa de velocidad + costo */}
      <section className="py-24" style={{ background: 'linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%)' }}>
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-12 text-center">
            <span className="text-sm font-bold uppercase tracking-widest text-indigo-600">{t('Tiempo y costo', 'Time and cost')}</span>
            <h2 className="mx-auto mt-3 max-w-3xl text-3xl font-bold text-gray-900 md:text-4xl" style={{ fontFamily: 'Manrope, sans-serif' }}>
              {t('Mientras otros debaten si una idea funciona, vos ya tenés la respuesta.', 'While others debate whether an idea works, you already have the answer.')}
            </h2>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-5 py-3 font-semibold">{t('Método', 'Method')}</th>
                  <th className="px-5 py-3 font-semibold">{t('Tiempo', 'Time')}</th>
                  <th className="px-5 py-3 font-semibold">{t('Costo estimado', 'Estimated cost')}</th>
                  <th className="px-5 py-3 font-semibold">{t('Resultado', 'Result')}</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row) => (
                  <tr
                    key={row.method}
                    className={`border-b border-gray-100 last:border-b-0 ${row.highlight ? 'bg-indigo-600' : ''}`}
                  >
                    <td className={`px-5 py-4 font-bold ${row.highlight ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: 'Manrope, sans-serif' }}>
                      {row.method}
                    </td>
                    <td className={`px-5 py-4 ${row.highlight ? 'font-semibold text-white' : 'text-gray-700'}`}>{row.time}</td>
                    <td className={`px-5 py-4 ${row.highlight ? 'font-semibold text-white' : 'text-gray-700'}`}>{row.cost}</td>
                    <td className={`px-5 py-4 ${row.highlight ? 'text-indigo-100' : 'text-gray-500'}`}>{row.result}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Formulario / wizard */}
      <section
        id="validar"
        className="py-24"
        style={{ background: 'radial-gradient(circle at 30% 20%, #e4dfff 0%, #f8f9fa 55%)' }}
      >
        <div className="mx-auto max-w-3xl px-6">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl" style={{ fontFamily: 'Manrope, sans-serif' }}>
              {t('Iniciá tu transformación de IA', 'Start your AI transformation')}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-lg text-gray-600">
              {t(
                'Completá el formulario. En menos de 24 horas recibís tu AI Validation Package con el prototipo funcional, el business case y el plan completo para construirlo.',
                'Fill out the form. In under 24 hours you receive your AI Validation Package with the working prototype, the business case and the full plan to build it.'
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
