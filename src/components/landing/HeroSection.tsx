import { useState, useEffect } from 'react'
import { X, Play } from 'lucide-react'
import { useI18n } from '../../i18n'

export default function HeroSection() {
  const { t } = useI18n()
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (expanded) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [expanded])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpanded(false)
    }
    if (expanded) window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [expanded])

  const videoSrc = '/media/flow.mp4'

  return (
    <>
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-28 overflow-hidden"
        style={{ background: 'radial-gradient(circle at 70% 30%, #e4dfff 0%, #f8f9fa 60%)' }}>
        <div className="max-w-[92rem] mx-auto px-6 grid grid-cols-1 md:grid-cols-[0.92fr_1.08fr] lg:grid-cols-[0.88fr_1.12fr] items-center gap-10 lg:gap-12">
          <div className="z-10">
            <p className="text-sm md:text-base font-semibold uppercase tracking-[0.18em] text-gray-900/70 mb-5"
              style={{ fontFamily: 'Manrope, sans-serif' }}>
              {t('hero.eyebrow')}
            </p>
            <h1 className="text-5xl sm:text-6xl md:text-[4.5rem] font-extrabold text-gray-900 leading-[1.02] tracking-tight mb-6"
              style={{ fontFamily: 'Manrope, sans-serif' }}>
              <span className="text-indigo-600">{t('hero.title.part1')}</span>
              <span className="block text-gray-900">{t('hero.title.part2')}</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 leading-relaxed mb-8 max-w-2xl">
              {t('hero.subtitle')}
            </p>
            <blockquote className="max-w-2xl border-l-4 border-indigo-500 pl-6 text-lg md:text-xl text-gray-700 leading-relaxed mb-10">
              <span dangerouslySetInnerHTML={{ __html: t('hero.quote') }} />
            </blockquote>
          </div>

          {/* Platform Demo Video — click to expand */}
          <div className="relative flex justify-center md:justify-end items-center">
            <div className="relative w-full max-w-xl sm:max-w-2xl md:max-w-none md:w-[115%] lg:w-[122%] xl:w-[128%]">
              <div className="absolute -inset-4 bg-gradient-to-r from-indigo-200 via-purple-100 to-indigo-200 rounded-[2rem] blur-3xl opacity-45" />
              <button
                type="button"
                onClick={() => setExpanded(true)}
                className="relative w-full bg-gray-900 rounded-[2rem] overflow-hidden shadow-2xl border border-white/20 aspect-[16/10] md:aspect-[1.52/1] group cursor-pointer"
              >
                {videoSrc ? (
                  <>
                    <video
                      className="w-full h-full object-cover pointer-events-none"
                      src={videoSrc}
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-slate-950/5 to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center group-hover:bg-white/30 group-hover:scale-110 transition-all border border-white/15">
                        <Play className="w-7 h-7 text-white ml-1" fill="white" />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #5844ED 0%, #3f21d5 100%)' }}>
                    <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center group-hover:bg-white/30 group-hover:scale-110 transition-all">
                      <Play className="w-7 h-7 text-white ml-1" fill="white" />
                    </div>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Fullscreen video overlay */}
      {expanded && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-12"
          onClick={() => setExpanded(false)}
        >
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="absolute top-6 right-6 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors z-10"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <div
            className="w-full max-w-6xl aspect-video rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              className="w-full h-full bg-black"
              src={videoSrc}
              controls
              autoPlay
              muted
              playsInline
              preload="metadata"
            />
          </div>
        </div>
      )}
    </>
  )
}
