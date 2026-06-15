import { useState, useEffect, useRef } from 'react'
import {
  Linkedin, Twitter, Facebook, Instagram, Copy, Check, Send,
  Sparkles, RefreshCw, Image as ImageIcon, Link2, AlertCircle, CheckCircle2,
  Wand2, Download, TrendingUp, Search, Anchor, ExternalLink, Globe, Gauge,
  Layers, FileText, Images, Film, Clapperboard,
} from 'lucide-react'
import AdminSidebar from '../components/AdminSidebar'
import { api } from '../services/api'

// ── Tipos ───────────────────────────────────────────────────────────
type NetworkId = 'linkedin' | 'instagram' | 'x' | 'facebook'

interface ServerPost {
  network: string
  text: string
  hashtags: string[]
  image_idea?: string | null
  thread?: string[]
  cta?: string | null
}

interface EditablePost {
  text: string
  hashtags: string
  image_idea?: string | null
  thread: string[]
}

interface PublishResult {
  network: string
  status: string
  url?: string | null
  reason?: string | null
  with_image?: boolean
  carousel?: boolean
}

interface Pillar { id: string; label: string; description: string; topics: string[] }
interface Audience { id: string; label: string }
interface SuggestedTopic { title: string; why: string }

interface QualityItem { score: number | null; verdict: string; issues_fixed: string[] }
interface CarouselSlide { kind: string; data_url: string }
interface CarouselData { slides: CarouselSlide[]; pdf_data_url?: string | null; zip_data_url?: string | null; count: number }
interface TrendSource { title: string; url: string; domain: string; snippet: string }
interface Research {
  audience_id: string
  sector: string
  queries: string[]
  themes: string[]
  hooks: string[]
  format_tips: Record<string, string>
  hashtags: string[]
  sources: TrendSource[]
  used_web_search: boolean
  note?: string | null
}

// Fallback local: si /growth/options aún no responde (backend sin recargar),
// los desplegables igual funcionan. Se reemplazan al llegar la data real.
const FALLBACK_PILLARS: Pillar[] = [
  { id: 'educativo', label: 'Educativo / Tip útil', description: 'Enseñar algo aplicable. Genera confianza.', topics: ['3 tareas de tu pyme que ya podés automatizar con IA', 'Cómo validar una idea de software sin gastar un peso'] },
  { id: 'demo_antes_despues', label: 'Demo / Antes y después', description: 'Mostrar cómo CodlyLabs resuelve un dolor real.', topics: ['De una tarea manual a una app con IA en minutos', 'El antes y después de automatizar con CodlyLabs'] },
  { id: 'prueba_social', label: 'Prueba social / Casos', description: 'Casos y ejemplos por rubro (genéricos).', topics: ['Cómo un comercio podría automatizar con IA'] },
  { id: 'founder_pov', label: 'Founder / Punto de vista', description: 'Opinión en primera persona del founder.', topics: ['Por qué construimos CodlyLabs'] },
  { id: 'insight_industria', label: 'Insight de industria / Dato', description: 'Dato o tendencia que reencuadra el problema.', topics: ['La mayoría de los proyectos de IA mueren antes de producción'] },
  { id: 'oferta_directa', label: 'Oferta directa (probar gratis)', description: 'Invitación clara a probar CodlyLabs gratis.', topics: ['Probá CodlyLabs gratis y validá tu idea con IA'] },
]
const FALLBACK_AUDIENCES: Audience[] = [
  { id: 'pymes', label: 'Pymes y negocios locales' },
  { id: 'founders_startups', label: 'Founders y startups' },
  { id: 'innovation_teams', label: 'Equipos de innovación' },
  { id: 'consultancies', label: 'Consultoras y agencias' },
]

const NETWORKS: { id: NetworkId; label: string; icon: any; color: string; ring: string }[] = [
  { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'text-[#0A66C2]', ring: 'border-[#0A66C2]' },
  { id: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-[#E1306C]', ring: 'border-[#E1306C]' },
  { id: 'x', label: 'X', icon: Twitter, color: 'text-gray-900', ring: 'border-gray-900' },
  { id: 'facebook', label: 'Facebook', icon: Facebook, color: 'text-[#1877F2]', ring: 'border-[#1877F2]' },
]

export default function AdminPocSocialPage() {
  const linkedinCallbackHandledRef = useRef(false)

  // Controles Head of Growth
  const [pillars, setPillars] = useState<Pillar[]>(FALLBACK_PILLARS)
  const [audiences, setAudiences] = useState<Audience[]>(FALLBACK_AUDIENCES)
  const [optionsWarning, setOptionsWarning] = useState(false)
  const [pillar, setPillar] = useState('educativo')
  const [audience, setAudience] = useState('pymes')
  const [topic, setTopic] = useState('')
  const [useResearch, setUseResearch] = useState(true)
  const [useQuality, setUseQuality] = useState(true)
  const [imageStyle, setImageStyle] = useState<'branded' | 'creative'>('branded')
  const [imageMood, setImageMood] = useState<'auto' | 'profesional' | 'casual' | 'wow'>('auto')

  // Temas en tendencia (research por pilar + audiencia)
  const [suggestedTopics, setSuggestedTopics] = useState<SuggestedTopic[]>([])
  const [topicsLoading, setTopicsLoading] = useState(false)
  const [topicsNote, setTopicsNote] = useState<string | null>(null)
  const [topicsWeb, setTopicsWeb] = useState(false)

  // Research de tendencias
  const [research, setResearch] = useState<Research | null>(null)
  // Reporte del control de calidad por red
  const [quality, setQuality] = useState<Record<string, QualityItem>>({})

  // Posts
  const [posts, setPosts] = useState<Record<string, EditablePost>>({})
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState<string | null>(null)
  const [connStatus, setConnStatus] = useState<Record<string, boolean>>({})
  const [linkedinNotice, setLinkedinNotice] = useState<string | null>(null)
  const [linkedinError, setLinkedinError] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [publishing, setPublishing] = useState<string | null>(null)
  const [results, setResults] = useState<Record<string, PublishResult>>({})
  const [images, setImages] = useState<Record<string, string>>({})
  const [imgLoading, setImgLoading] = useState<string | null>(null)
  const [imgError, setImgError] = useState<Record<string, string>>({})

  // Carruseles por red
  const [carousels, setCarousels] = useState<Record<string, CarouselData>>({})
  const [carouselLoading, setCarouselLoading] = useState<string | null>(null)
  const [carouselError, setCarouselError] = useState<Record<string, string>>({})

  // Videos animados por red (placa creativa en movimiento)
  const [videos, setVideos] = useState<Record<string, { video: string; poster: string }>>({})
  const [videoLoading, setVideoLoading] = useState<string | null>(null)
  const [videoError, setVideoError] = useState<Record<string, string>>({})

  // Historias animadas por red (storytelling con personaje founder)
  const [stories, setStories] = useState<Record<string, { video: string; poster: string }>>({})
  const [storyLoading, setStoryLoading] = useState<string | null>(null)
  const [storyError, setStoryError] = useState<Record<string, string>>({})

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    window.location.href = '/admin/login'
  }

  useEffect(() => {
    handleLinkedInCallback()
    handleMetaCallback()
    loadConnStatus()
    loadGrowthOptions()
  }, [])

  const handleMetaCallback = async () => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('state') !== 'meta_connect') return
    const code = params.get('code')
    const url = new URL(window.location.href)
    ;['code', 'state', 'error', 'error_description'].forEach(k => url.searchParams.delete(k))
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)
    if (!code) return
    try {
      await api.get('/api/v1/admin/poc-social/meta/callback', { params: { code, state: 'meta_connect' } })
      await loadConnStatus()
    } catch (e: any) {
      alert(e?.response?.data?.detail || 'No se pudo completar la conexión de Meta.')
    }
  }

  const connectMeta = async () => {
    try {
      const { data } = await api.get('/api/v1/admin/poc-social/meta/auth-url')
      if (data.auth_url) window.location.href = data.auth_url
    } catch (e: any) {
      alert(e?.response?.data?.detail || 'Falta configurar META_APP_ID / META_APP_SECRET / META_OAUTH_REDIRECT_URI en el backend.')
    }
  }

  const cleanLinkedInQuery = () => {
    const url = new URL(window.location.href)
    url.searchParams.delete('code')
    url.searchParams.delete('state')
    url.searchParams.delete('error')
    url.searchParams.delete('error_description')
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)
  }

  const handleLinkedInCallback = async () => {
    const params = new URLSearchParams(window.location.search)
    const state = params.get('state')
    const code = params.get('code')
    const oauthError = params.get('error')

    if (state !== 'campaign_publish' && !oauthError) return

    if (oauthError) {
      setLinkedinError(params.get('error_description') || oauthError)
      cleanLinkedInQuery()
      return
    }

    if (!code) return
    const callbackKey = `linkedin_publish_callback:${code}`
    if (linkedinCallbackHandledRef.current || sessionStorage.getItem(callbackKey)) {
      cleanLinkedInQuery()
      return
    }

    linkedinCallbackHandledRef.current = true
    sessionStorage.setItem(callbackKey, '1')
    setLinkedinError(null)
    setLinkedinNotice('Conectando LinkedIn...')
    cleanLinkedInQuery()
    try {
      await api.get('/api/v1/admin/poc-social/linkedin/callback', {
        params: { code, state },
      })
      setLinkedinNotice('LinkedIn conectado para publicar.')
      await loadConnStatus()
    } catch (e: any) {
      const networks = await loadConnStatus()
      if (networks?.linkedin) {
        setLinkedinError(null)
        setLinkedinNotice('LinkedIn conectado para publicar.')
        return
      }
      setLinkedinNotice(null)
      setLinkedinError(e?.response?.data?.detail || 'No se pudo completar la conexión de LinkedIn.')
    }
  }

  const loadGrowthOptions = async () => {
    try {
      const { data } = await api.get('/api/v1/admin/poc-social/growth/options')
      if (data.pillars?.length) setPillars(data.pillars)
      if (data.audiences?.length) setAudiences(data.audiences)
      setOptionsWarning(false)
    } catch {
      setOptionsWarning(true)
    }
  }

  const loadConnStatus = async () => {
    try {
      const { data } = await api.get('/api/v1/admin/poc-social/connectors/status')
      const networks = data.networks || {}
      setConnStatus(networks)
      return networks as Record<string, boolean>
    } catch {
      return null
    }
  }

  // ── Generar ──────────────────────────────────────────────────────
  const generate = async () => {
    setGenerating(true); setGenError(null); setPosts({}); setResults({}); setImages({}); setImgError({}); setVideos({}); setVideoError({}); setStories({}); setStoryError({}); setResearch(null); setQuality({})
    try {
      const { data } = await api.post('/api/v1/admin/poc-social/growth/generate', {
        pillar, audience, topic: topic.trim() || null, research: useResearch, quality_pass: useQuality,
      })
      if (data.research) setResearch(data.research as Research)
      if (data.quality_report) setQuality(data.quality_report as Record<string, QualityItem>)
      const serverPosts: Record<string, ServerPost> = data.posts || {}
      const editable: Record<string, EditablePost> = {}
      Object.entries(serverPosts).forEach(([net, p]) => {
        editable[net] = {
          text: p.text || '',
          hashtags: (p.hashtags || []).join(' '),
          image_idea: p.image_idea,
          thread: p.thread || [],
        }
      })
      setPosts(editable)
    } catch (e: any) {
      setGenError(e?.response?.data?.detail || 'Error generando los posts.')
    } finally { setGenerating(false) }
  }

  // ── Editar / copiar ──────────────────────────────────────────────
  const updatePost = (net: string, field: 'text' | 'hashtags', value: string) => {
    setPosts(prev => ({ ...prev, [net]: { ...prev[net], [field]: value } }))
  }

  const tagsToArray = (raw: string) =>
    raw.trim() ? raw.trim().split(/\s+/).map(t => t.replace(/^#/, '')) : []

  const copyPost = (net: string) => {
    const p = posts[net]; if (!p) return
    const tags = tagsToArray(p.hashtags)
    const full = tags.length ? `${p.text}\n\n${tags.map(t => `#${t}`).join(' ')}` : p.text
    navigator.clipboard.writeText(full)
    setCopied(net); setTimeout(() => setCopied(null), 1500)
  }

  // ── Publicar ─────────────────────────────────────────────────────
  const publish = async (net: string) => {
    const p = posts[net]
    // IG/FB: carrusel = slides (imágenes). LinkedIn: carrusel = PDF (document post).
    const carouselSlides = carousels[net]?.slides?.map(s => s.data_url) || []
    const carouselPdf = net === 'linkedin' ? (carousels[net]?.pdf_data_url || null) : null
    const hasVisual = !!images[net] || carouselSlides.length > 0 || !!carouselPdf
    if (!hasVisual && !window.confirm('No generaste imagen ni carrusel para este post. ¿Publicar solo con texto y hashtags?')) {
      return
    }
    // Instagram requiere imagen sí o sí
    if (net === 'instagram' && !hasVisual) {
      setResults(prev => ({ ...prev, [net]: { network: net, status: 'failed', reason: 'Instagram necesita una imagen o carrusel' } }))
      return
    }
    setPublishing(net)
    try {
      const { data } = await api.post('/api/v1/admin/poc-social/publish-direct', {
        posts: { [net]: {
          text: p.text, hashtags: tagsToArray(p.hashtags), thread: p.thread,
          image: images[net] || null,
          carousel: carouselSlides.length > 0 ? carouselSlides : null,
          carousel_pdf: carouselPdf,
          pillar, audience,
        } },
      })
      const res: PublishResult | undefined = (data.results || [])[0]
      if (res) setResults(prev => ({ ...prev, [net]: res }))
    } catch (e: any) {
      setResults(prev => ({ ...prev, [net]: { network: net, status: 'failed', reason: e?.response?.data?.detail || 'error' } }))
    } finally { setPublishing(null) }
  }

  // ── Generar imagen ───────────────────────────────────────────────
  const generateImage = async (net: string) => {
    const p = posts[net]; if (!p) return
    setImgLoading(net)
    setImgError(prev => ({ ...prev, [net]: '' }))
    try {
      const { data } = await api.post('/api/v1/admin/poc-social/image/generate', {
        prompt: p.image_idea || p.text.slice(0, 200),
        network: net,
        style: imageStyle,
        mood: imageMood === 'auto' ? null : imageMood,
        post_text: p.text,
        audience,
        pillar,
      })
      const src = data.data_url || data.url
      if (src) setImages(prev => ({ ...prev, [net]: src }))
      else setImgError(prev => ({ ...prev, [net]: 'El modelo no devolvió imagen.' }))
    } catch (e: any) {
      setImgError(prev => ({ ...prev, [net]: e?.response?.data?.detail || 'Error generando la imagen.' }))
    } finally { setImgLoading(null) }
  }

  // ── Sugerir temas en tendencia ───────────────────────────────────
  const loadSuggestedTopics = async () => {
    setTopicsLoading(true); setTopicsNote(null)
    try {
      const { data } = await api.post('/api/v1/admin/poc-social/growth/suggest-topics', {
        pillar, audience, count: 5,
      })
      setSuggestedTopics(data.topics || [])
      setTopicsWeb(!!data.used_web_search)
      setTopicsNote(data.note || null)
    } catch (e: any) {
      setTopicsNote(e?.response?.data?.detail || 'No se pudieron sugerir temas.')
    } finally { setTopicsLoading(false) }
  }

  // ── Generar carrusel ─────────────────────────────────────────────
  const generateCarousel = async (net: string) => {
    const p = posts[net]; if (!p) return
    setCarouselLoading(net)
    setCarouselError(prev => ({ ...prev, [net]: '' }))
    try {
      const { data } = await api.post('/api/v1/admin/poc-social/carousel/generate', {
        post_text: p.text, network: net, audience, pillar, num_slides: 5, style: imageStyle,
      })
      setCarousels(prev => ({ ...prev, [net]: data }))
    } catch (e: any) {
      setCarouselError(prev => ({ ...prev, [net]: e?.response?.data?.detail || 'Error generando el carrusel.' }))
    } finally { setCarouselLoading(null) }
  }

  // ── Generar video animado de la placa ───────────────────────────
  const generateVideo = async (net: string) => {
    const p = posts[net]; if (!p) return
    setVideoLoading(net)
    setVideoError(prev => ({ ...prev, [net]: '' }))
    try {
      const { data } = await api.post('/api/v1/admin/poc-social/video/generate', {
        prompt: p.image_idea || p.text.slice(0, 200),
        network: net,
        post_text: p.text,
        audience,
        pillar,
        duration: 6,
      })
      if (data.video_data_url) {
        setVideos(prev => ({ ...prev, [net]: { video: data.video_data_url, poster: data.poster_data_url || '' } }))
      } else {
        setVideoError(prev => ({ ...prev, [net]: 'No se devolvió el video.' }))
      }
    } catch (e: any) {
      setVideoError(prev => ({ ...prev, [net]: e?.response?.data?.detail || 'Error generando el video.' }))
    } finally { setVideoLoading(null) }
  }

  // ── Generar historia animada (storytelling) ─────────────────────
  const generateStory = async (net: string) => {
    const p = posts[net]; if (!p) return
    setStoryLoading(net)
    setStoryError(prev => ({ ...prev, [net]: '' }))
    try {
      const { data } = await api.post('/api/v1/admin/poc-social/story/generate', {
        post_text: p.text,
        network: net,
        audience,
        pillar,
      })
      if (data.video_data_url) {
        setStories(prev => ({ ...prev, [net]: { video: data.video_data_url, poster: data.poster_data_url || '' } }))
      } else {
        setStoryError(prev => ({ ...prev, [net]: 'No se devolvió la historia.' }))
      }
    } catch (e: any) {
      setStoryError(prev => ({ ...prev, [net]: e?.response?.data?.detail || 'Error generando la historia.' }))
    } finally { setStoryLoading(null) }
  }

  const connectLinkedIn = async () => {
    try {
      setLinkedinError(null)
      setLinkedinNotice(null)
      const { data } = await api.get('/api/v1/admin/poc-social/linkedin/auth-url')
      if (data.auth_url) window.location.href = data.auth_url
    } catch (e: any) {
      setLinkedinError(e?.response?.data?.detail || 'No se pudo generar la URL de conexión de LinkedIn.')
    }
  }

  const hasPosts = Object.keys(posts).length > 0
  const selectedPillar = pillars.find(p => p.id === pillar)

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar currentPage="poc-social" onLogout={handleLogout} />

      <div className="flex-1">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="text-brand-600" /> Marketing — Generador de posts
          </h1>
          <p className="text-gray-600 mt-2">
            Un Head of Growth con IA que crea contenido para vender CodlyLabs en LinkedIn, Instagram, X y Facebook.
          </p>
        </div>

        {/* Conexiones */}
        <div className="px-8 py-3 bg-white border-b border-gray-100 flex flex-wrap items-center gap-3">
          <span className="text-sm text-gray-500">Conexiones:</span>
          {NETWORKS.map(n => {
            const ok = connStatus[n.id]
            return (
              <span key={n.id} className={`flex items-center gap-1.5 text-sm px-2.5 py-1 rounded-full border ${ok ? 'border-green-200 bg-green-50 text-green-700' : 'border-gray-200 bg-gray-50 text-gray-400'}`}>
                <n.icon size={14} className={ok ? n.color : ''} />
                {n.label}
                {ok ? <CheckCircle2 size={13} /> : <span className="text-xs">sin credenciales</span>}
              </span>
            )
          })}
          <div className="ml-auto flex items-center gap-2">
            {!connStatus['facebook'] && (
              <button onClick={connectMeta} className="flex items-center gap-1.5 text-sm bg-[#1877F2] text-white px-3 py-1.5 rounded-lg hover:opacity-90">
                <Link2 size={14} /> Conectar Facebook/IG
              </button>
            )}
            {!connStatus['linkedin'] && (
              <button onClick={connectLinkedIn} className="flex items-center gap-1.5 text-sm bg-[#0A66C2] text-white px-3 py-1.5 rounded-lg hover:opacity-90">
                <Link2 size={14} /> Conectar LinkedIn
              </button>
            )}
          </div>
          {linkedinNotice && (
            <span className="basis-full text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              {linkedinNotice}
            </span>
          )}
          {linkedinError && (
            <span className="basis-full text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {linkedinError}
            </span>
          )}
        </div>

        <div className="flex gap-6 p-8">
          {/* Columna izquierda — controles */}
          <div className="w-80 shrink-0 space-y-4">
            {optionsWarning && (
              <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2 flex items-start gap-1.5">
                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                Usando opciones por defecto. Reiniciá el backend para cargar las rutas nuevas.
              </div>
            )}
            <div>
              <label className="text-sm font-semibold text-gray-700">Pilar de contenido</label>
              <select value={pillar} onChange={e => { setPillar(e.target.value); setSuggestedTopics([]); setTopicsNote(null) }}
                className="w-full mt-1 border border-gray-200 rounded-lg p-2 text-sm bg-white">
                {pillars.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
              {selectedPillar && <p className="text-xs text-gray-500 mt-1">{selectedPillar.description}</p>}
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">Audiencia</label>
              <select value={audience} onChange={e => { setAudience(e.target.value); setSuggestedTopics([]); setTopicsNote(null) }}
                className="w-full mt-1 border border-gray-200 rounded-lg p-2 text-sm bg-white">
                {audiences.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">Tema / ángulo (opcional)</label>
              <textarea value={topic} onChange={e => setTopic(e.target.value)} rows={3}
                placeholder={suggestedTopics[0]?.title || selectedPillar?.topics?.[0] || 'Dejalo vacío y el agente elige'}
                className="w-full mt-1 border border-gray-200 rounded-lg p-2 text-sm resize-y" />

              <button onClick={loadSuggestedTopics} disabled={topicsLoading}
                className="mt-2 w-full flex items-center justify-center gap-1.5 text-xs text-brand-600 border border-brand-200 bg-brand-50 rounded-lg px-2.5 py-1.5 hover:bg-brand-100 disabled:opacity-50">
                <TrendingUp size={13} className={topicsLoading ? 'animate-pulse' : ''} />
                {topicsLoading ? 'Buscando tendencias…' : 'Sugerir temas en tendencia'}
              </button>
              {topicsNote && <p className="text-xs text-amber-600 mt-1">{topicsNote}</p>}

              {suggestedTopics.length > 0 ? (
                <div className="mt-2 space-y-1.5">
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    {topicsWeb ? <Globe size={11} /> : null}
                    {topicsWeb ? 'Según lo que está pegando en redes' : 'Sugerencias del modelo'}
                  </p>
                  {suggestedTopics.map((t, i) => (
                    <button key={i} onClick={() => setTopic(t.title)} title={t.why}
                      className="block w-full text-left text-xs bg-white border border-gray-200 hover:border-brand-300 hover:bg-brand-50 rounded-lg px-2.5 py-1.5">
                      <span className="font-medium text-gray-700">{t.title}</span>
                      {t.why && <span className="block text-gray-400 mt-0.5">{t.why}</span>}
                    </button>
                  ))}
                </div>
              ) : selectedPillar?.topics?.length ? (
                <div className="mt-2 flex flex-wrap gap-1">
                  {selectedPillar.topics.slice(0, 3).map((t, i) => (
                    <button key={i} onClick={() => setTopic(t)}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 rounded px-2 py-0.5 text-left">
                      {t}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <label className="flex items-start gap-2 cursor-pointer bg-white border border-gray-200 rounded-lg p-3">
              <input type="checkbox" checked={useResearch} onChange={e => setUseResearch(e.target.checked)}
                className="mt-0.5 accent-brand-600" />
              <span className="text-sm">
                <span className="font-semibold text-gray-700 flex items-center gap-1.5">
                  <TrendingUp size={14} className="text-brand-600" /> Research de tendencias
                </span>
                <span className="text-xs text-gray-500 block mt-0.5">
                  Antes de escribir, investiga en la web qué temas y formatos enganchan hoy en el rubro de la audiencia, y los usa para el gancho.
                </span>
              </span>
            </label>

            <label className="flex items-start gap-2 cursor-pointer bg-white border border-gray-200 rounded-lg p-3">
              <input type="checkbox" checked={useQuality} onChange={e => setUseQuality(e.target.checked)}
                className="mt-0.5 accent-brand-600" />
              <span className="text-sm">
                <span className="font-semibold text-gray-700 flex items-center gap-1.5">
                  <Gauge size={14} className="text-brand-600" /> Control de calidad
                </span>
                <span className="text-xs text-gray-500 block mt-0.5">
                  Tras el borrador, un crítico evalúa cada post contra una rúbrica (gancho, formato nativo, CTA, marca) y reescribe lo flojo.
                </span>
              </span>
            </label>

            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                <ImageIcon size={14} className="text-brand-600" /> Estilo de imagen
              </span>
              <div className="mt-2 grid grid-cols-2 gap-1 bg-gray-100 rounded-lg p-1">
                <button onClick={() => setImageStyle('branded')}
                  className={`text-xs py-1.5 rounded-md transition-colors ${imageStyle === 'branded' ? 'bg-white text-brand-700 font-semibold shadow-sm' : 'text-gray-500'}`}>
                  Diseño branded
                </button>
                <button onClick={() => setImageStyle('creative')}
                  className={`text-xs py-1.5 rounded-md transition-colors ${imageStyle === 'creative' ? 'bg-white text-brand-700 font-semibold shadow-sm' : 'text-gray-500'}`}>
                  Creativo (libre)
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1.5">
                {imageStyle === 'branded'
                  ? 'Placa de marca: colores, logo y texto de CodlyLabs siempre correctos.'
                  : 'Diseño libre: el agente elige una paleta espectacular para el post (sin atarse a la marca). Siempre vectorial, sin fotos.'}
              </p>

              {imageStyle === 'branded' && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <span className="text-xs font-semibold text-gray-600">Mood</span>
                  <div className="mt-1.5 grid grid-cols-2 gap-1">
                    {([
                      ['auto', 'Automático'],
                      ['profesional', 'Profesional'],
                      ['casual', 'Casual'],
                      ['wow', 'Wow'],
                    ] as const).map(([id, label]) => (
                      <button key={id} onClick={() => setImageMood(id)}
                        className={`text-xs py-1.5 rounded-md border transition-colors ${imageMood === id ? 'border-brand-400 bg-brand-50 text-brand-700 font-semibold' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                        {label}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">
                    {imageMood === 'auto' ? 'El director elige el estilo según el post.'
                      : imageMood === 'profesional' ? 'Fondo claro, sobrio. B2B serio.'
                      : imageMood === 'casual' ? 'Fondo cálido, cercano. Tono humano.'
                      : 'Fondo indigo, alto impacto.'}
                  </p>
                </div>
              )}
            </div>

            <button onClick={generate} disabled={generating}
              className="w-full flex items-center justify-center gap-2 bg-brand-600 text-white py-2.5 rounded-lg hover:bg-brand-700 disabled:opacity-50">
              <Sparkles size={16} /> {generating ? 'Generando…' : 'Generar posts'}
            </button>
          </div>

          {/* Columna derecha — posts */}
          <div className="flex-1">
            {generating ? (
              <div className="text-center text-gray-500 mt-24">
                <RefreshCw size={32} className="mx-auto mb-3 animate-spin" />
                {useResearch ? 'Investigando tendencias y generando posts…' : 'Generando posts…'}
              </div>
            ) : genError ? (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">
                <AlertCircle size={18} /> {genError}
              </div>
            ) : !hasPosts ? (
              <div className="text-center text-gray-400 mt-24">
                <Sparkles size={40} className="mx-auto mb-3 opacity-40" />
                Elegí un pilar y generá contenido para CodlyLabs.
              </div>
            ) : (
              <>
              {research && <ResearchPanel research={research} />}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                {NETWORKS.map(n => {
                  const p = posts[n.id]; if (!p) return null
                  const res = results[n.id]
                  const canPublish = connStatus[n.id]
                  const q = quality[n.id]
                  return (
                    <div key={n.id} className={`bg-white rounded-xl border-2 ${n.ring} border-opacity-20 p-5 flex flex-col`}>
                      <div className="flex items-center gap-2 mb-3">
                        <n.icon className={n.color} size={20} />
                        <span className="font-semibold text-gray-900">{n.label}</span>
                        <QualityBadge item={q} />
                        <button onClick={() => copyPost(n.id)} className="ml-auto text-gray-400 hover:text-gray-700" title="Copiar">
                          {copied === n.id ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                        </button>
                      </div>

                      <textarea value={p.text} onChange={e => updatePost(n.id, 'text', e.target.value)} rows={8}
                        className="w-full text-sm border border-gray-200 rounded-lg p-3 resize-y focus:ring-2 focus:ring-brand-400 focus:outline-none" />

                      <input value={p.hashtags} onChange={e => updatePost(n.id, 'hashtags', e.target.value)}
                        placeholder="hashtags separados por espacio"
                        className="w-full text-sm text-brand-600 border border-gray-200 rounded-lg p-2 mt-2 focus:ring-2 focus:ring-brand-400 focus:outline-none" />

                      {q && q.issues_fixed.length > 0 && (
                        <details className="mt-2 text-xs text-gray-500">
                          <summary className="cursor-pointer flex items-center gap-1.5 text-gray-600">
                            <Gauge size={12} /> Control de calidad: {q.issues_fixed.length} mejora{q.issues_fixed.length > 1 ? 's' : ''}
                          </summary>
                          {q.verdict && <p className="mt-1 italic">{q.verdict}</p>}
                          <ul className="list-disc list-inside mt-1 space-y-0.5">
                            {q.issues_fixed.map((x, i) => <li key={i}>{x}</li>)}
                          </ul>
                        </details>
                      )}

                      {p.thread.length > 0 && (
                        <div className="mt-2 text-xs text-gray-500">
                          <span className="font-medium">Hilo:</span>
                          <ul className="list-disc list-inside mt-1 space-y-0.5">
                            {p.thread.map((t, i) => <li key={i}>{t}</li>)}
                          </ul>
                        </div>
                      )}

                      {/* Imagen */}
                      <div className="mt-3 border-t border-gray-100 pt-3">
                        {p.image_idea && (
                          <p className="text-xs text-gray-500 flex items-start gap-1 mb-2">
                            <ImageIcon size={13} className="mt-0.5 shrink-0" /> {p.image_idea}
                          </p>
                        )}
                        {images[n.id] ? (
                          <div className="space-y-2">
                            <img src={images[n.id]} alt="imagen generada" className="w-full rounded-lg border border-gray-200" />
                            <div className="flex gap-2">
                              <a href={images[n.id]} download={`codlylabs-${n.id}.png`}
                                className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg px-2 py-1">
                                <Download size={13} /> Descargar
                              </a>
                              <button onClick={() => generateImage(n.id)} disabled={imgLoading === n.id}
                                className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg px-2 py-1">
                                <RefreshCw size={13} className={imgLoading === n.id ? 'animate-spin' : ''} /> Regenerar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => generateImage(n.id)} disabled={imgLoading === n.id}
                            className="flex items-center gap-1.5 text-sm text-brand-600 border border-brand-200 bg-brand-50 rounded-lg px-3 py-1.5 hover:bg-brand-100 disabled:opacity-50">
                            <Wand2 size={14} className={imgLoading === n.id ? 'animate-pulse' : ''} />
                            {imgLoading === n.id ? 'Generando imagen…' : 'Generar imagen'}
                          </button>
                        )}
                        {imgError[n.id] && <p className="text-xs text-red-600 mt-1">{imgError[n.id]}</p>}
                      </div>

                      {/* Video animado de la placa creativa */}
                      <div className="mt-3 border-t border-gray-100 pt-3">
                        {videos[n.id] ? (
                          <div className="space-y-2">
                            <video
                              src={videos[n.id].video}
                              poster={videos[n.id].poster || undefined}
                              autoPlay muted loop playsInline controls
                              className="w-full rounded-lg border border-gray-200 bg-black"
                            />
                            <div className="flex gap-2">
                              <a href={videos[n.id].video} download={`codlylabs-${n.id}.mp4`}
                                className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg px-2 py-1">
                                <Download size={13} /> Descargar MP4
                              </a>
                              <button onClick={() => generateVideo(n.id)} disabled={videoLoading === n.id}
                                className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg px-2 py-1">
                                <RefreshCw size={13} className={videoLoading === n.id ? 'animate-spin' : ''} /> Regenerar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => generateVideo(n.id)} disabled={videoLoading === n.id}
                            className="flex items-center gap-1.5 text-sm text-brand-600 border border-brand-200 bg-brand-50 rounded-lg px-3 py-1.5 hover:bg-brand-100 disabled:opacity-50">
                            <Film size={14} className={videoLoading === n.id ? 'animate-pulse' : ''} />
                            {videoLoading === n.id ? 'Generando video… (~15-30 s)' : 'Generar video'}
                          </button>
                        )}
                        {videoError[n.id] && <p className="text-xs text-red-600 mt-1">{videoError[n.id]}</p>}
                      </div>

                      {/* Historia animada (storytelling con personaje) */}
                      <div className="mt-3 border-t border-gray-100 pt-3">
                        {stories[n.id] ? (
                          <div className="space-y-2">
                            <video
                              src={stories[n.id].video}
                              poster={stories[n.id].poster || undefined}
                              autoPlay muted loop playsInline controls
                              className="w-full rounded-lg border border-gray-200 bg-black"
                            />
                            <div className="flex gap-2">
                              <a href={stories[n.id].video} download={`codlylabs-historia-${n.id}.mp4`}
                                className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg px-2 py-1">
                                <Download size={13} /> Descargar MP4
                              </a>
                              <button onClick={() => generateStory(n.id)} disabled={storyLoading === n.id}
                                className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg px-2 py-1">
                                <RefreshCw size={13} className={storyLoading === n.id ? 'animate-spin' : ''} /> Regenerar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => generateStory(n.id)} disabled={storyLoading === n.id}
                            className="flex items-center gap-1.5 text-sm text-brand-600 border border-brand-200 bg-brand-50 rounded-lg px-3 py-1.5 hover:bg-brand-100 disabled:opacity-50">
                            <Clapperboard size={14} className={storyLoading === n.id ? 'animate-pulse' : ''} />
                            {storyLoading === n.id ? 'Generando historia… (~30-45 s)' : 'Generar historia'}
                          </button>
                        )}
                        {storyError[n.id] && <p className="text-xs text-red-600 mt-1">{storyError[n.id]}</p>}
                      </div>

                      {/* Carrusel (LinkedIn / Instagram) */}
                      {(n.id === 'linkedin' || n.id === 'instagram') && (
                        <div className="mt-3 border-t border-gray-100 pt-3">
                          {carousels[n.id] ? (
                            <div className="space-y-2">
                              <div className="flex gap-2 overflow-x-auto pb-2">
                                {carousels[n.id].slides.map((s, i) => (
                                  <a key={i} href={s.data_url} download={`carrusel-${n.id}-${i + 1}.png`} className="shrink-0" title={`Slide ${i + 1} (${s.kind}) — descargar`}>
                                    <img src={s.data_url} alt={`slide ${i + 1}`} className="h-44 rounded-lg border border-gray-200" />
                                  </a>
                                ))}
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {n.id === 'linkedin' && carousels[n.id].pdf_data_url && (
                                  <a href={carousels[n.id].pdf_data_url!} download="carrusel-linkedin.pdf"
                                    className="flex items-center gap-1.5 text-xs text-white bg-brand-600 hover:bg-brand-700 rounded-lg px-3 py-1.5">
                                    <FileText size={13} /> Descargar PDF ({carousels[n.id].slides.length} slides)
                                  </a>
                                )}
                                {n.id === 'instagram' && carousels[n.id].zip_data_url && (
                                  <a href={carousels[n.id].zip_data_url!} download="carrusel-instagram.zip"
                                    className="flex items-center gap-1.5 text-xs text-white bg-brand-600 hover:bg-brand-700 rounded-lg px-3 py-1.5">
                                    <Images size={13} /> Descargar imágenes ({carousels[n.id].slides.length})
                                  </a>
                                )}
                                <button onClick={() => generateCarousel(n.id)} disabled={carouselLoading === n.id}
                                  className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg px-2 py-1.5">
                                  <RefreshCw size={13} className={carouselLoading === n.id ? 'animate-spin' : ''} /> Regenerar
                                </button>
                              </div>
                              <p className="text-xs text-gray-400">
                                {n.id === 'linkedin'
                                  ? 'LinkedIn: subí el PDF como documento para el carrusel.'
                                  : 'Instagram: subí las imágenes del ZIP como carrusel (una por slide).'}
                              </p>
                            </div>
                          ) : (
                            <button onClick={() => generateCarousel(n.id)} disabled={carouselLoading === n.id}
                              className="flex items-center gap-1.5 text-sm text-brand-600 border border-brand-200 bg-brand-50 rounded-lg px-3 py-1.5 hover:bg-brand-100 disabled:opacity-50">
                              <Layers size={14} className={carouselLoading === n.id ? 'animate-pulse' : ''} />
                              {carouselLoading === n.id ? 'Generando carrusel…' : 'Generar carrusel'}
                            </button>
                          )}
                          {carouselError[n.id] && <p className="text-xs text-red-600 mt-1">{carouselError[n.id]}</p>}
                        </div>
                      )}

                      <div className="mt-3 flex items-center gap-2">
                        <button onClick={() => publish(n.id)} disabled={!canPublish || publishing === n.id}
                          className={`flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg text-white transition-colors ${canPublish ? 'bg-brand-600 hover:bg-brand-700' : 'bg-gray-300 cursor-not-allowed'}`}
                          title={canPublish ? 'Publicar' : 'Falta conectar credenciales de esta red'}>
                          <Send size={14} /> {publishing === n.id ? 'Publicando…' : 'Publicar'}
                        </button>
                        {res && (
                          <span className={`text-xs flex items-center gap-1 ${res.status === 'published' ? 'text-green-600' : res.status === 'skipped' ? 'text-gray-400' : 'text-red-600'}`}>
                            {res.status === 'published' ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                            {res.status === 'published' ? (res.carousel ? 'Publicado con carrusel' : res.with_image ? 'Publicado con imagen' : 'Publicado (solo texto)') : res.status === 'skipped' ? 'Sin credenciales' : (res.reason || 'Falló')}
                            {res.url && <a href={res.url} target="_blank" rel="noreferrer" className="underline ml-1">ver</a>}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Badge de score de calidad ───────────────────────────────────────
function QualityBadge({ item }: { item?: QualityItem }) {
  if (!item || item.score === null || item.score === undefined) return null
  const s = item.score
  const cls = s >= 85 ? 'bg-green-100 text-green-700'
    : s >= 70 ? 'bg-amber-100 text-amber-700'
    : 'bg-red-100 text-red-700'
  return (
    <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${cls}`}
      title={item.verdict || 'Score de calidad'}>
      <Gauge size={12} /> {s}
    </span>
  )
}

// ── Panel de research de tendencias ─────────────────────────────────
function ResearchPanel({ research }: { research: Research }) {
  const NET_LABELS: Record<string, string> = {
    linkedin: 'LinkedIn', instagram: 'Instagram', x: 'X', facebook: 'Facebook',
  }
  const tips = Object.entries(research.format_tips || {})
  return (
    <div className="mb-5 bg-gradient-to-br from-brand-50 to-white border border-brand-200 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-1">
        <TrendingUp size={18} className="text-brand-600" />
        <span className="font-semibold text-gray-900">Research de tendencias</span>
        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${research.used_web_search ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
          <Globe size={12} />
          {research.used_web_search ? 'Búsqueda web en vivo' : 'Conocimiento del modelo'}
        </span>
      </div>
      <p className="text-xs text-gray-500 mb-4">
        Rubro investigado: <span className="font-medium text-gray-700">{research.sector}</span>
      </p>

      {research.note && (
        <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2 mb-4 flex items-start gap-1.5">
          <AlertCircle size={14} className="mt-0.5 shrink-0" /> {research.note}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {research.themes?.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Sparkles size={13} /> Temas calientes
            </h4>
            <ul className="space-y-1">
              {research.themes.map((t, i) => (
                <li key={i} className="text-sm text-gray-700 flex items-start gap-1.5">
                  <span className="text-brand-400 mt-1">•</span> {t}
                </li>
              ))}
            </ul>
          </div>
        )}

        {research.hooks?.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Anchor size={13} /> Ganchos que enganchan
            </h4>
            <ul className="space-y-1">
              {research.hooks.map((h, i) => (
                <li key={i} className="text-sm text-gray-700 flex items-start gap-1.5">
                  <span className="text-brand-400 mt-1">•</span> {h}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {tips.length > 0 && (
        <div className="mt-4">
          <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Tips de formato por red</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {tips.map(([net, tip]) => (
              <div key={net} className="text-sm text-gray-700 bg-white border border-gray-100 rounded-lg p-2">
                <span className="font-medium text-gray-900">{NET_LABELS[net] || net}:</span> {tip}
              </div>
            ))}
          </div>
        </div>
      )}

      {research.hashtags?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {research.hashtags.map((h, i) => (
            <span key={i} className="text-xs text-brand-600 bg-brand-50 border border-brand-100 rounded-full px-2 py-0.5">#{h}</span>
          ))}
        </div>
      )}

      {research.sources?.length > 0 && (
        <details className="mt-4">
          <summary className="text-xs font-semibold text-gray-600 uppercase tracking-wide cursor-pointer flex items-center gap-1.5">
            <Search size={13} /> Fuentes ({research.sources.length})
          </summary>
          <ul className="mt-2 space-y-1.5">
            {research.sources.map((s, i) => (
              <li key={i} className="text-sm">
                <a href={s.url} target="_blank" rel="noreferrer"
                  className="text-brand-600 hover:underline flex items-start gap-1.5">
                  <ExternalLink size={13} className="mt-0.5 shrink-0" />
                  <span>{s.title || s.url} <span className="text-gray-400">— {s.domain}</span></span>
                </a>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  )
}
