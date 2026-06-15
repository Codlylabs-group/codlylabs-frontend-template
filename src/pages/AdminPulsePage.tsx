import { useState, useEffect } from 'react'
import {
  Newspaper, RefreshCw, Sparkles, Copy, Check, ExternalLink, Send,
  AlertCircle, Globe, Wand2, Image as ImageIcon, Images, Download, FileText, Palette,
} from 'lucide-react'
import AdminSidebar from '../components/AdminSidebar'
import { api } from '../services/api'

interface AngleOpt { id: string; label: string }
interface NewsItem { title: string; url: string; domain: string; snippet: string }
interface Visual {
  eyebrow: string; headline_lines: string[]; key_line: string
  points: string[]; question: string; area_label: string; source: string
}
interface PulsePost {
  text: string; hashtags: string[]; sources: NewsItem[]; headline: string
  visual: Visual; used_web_search: boolean; note: string | null
}
interface Slide { kind: string; data_url: string }
interface SlidesData { slides: Slide[]; pdf_data_url?: string; zip_data_url?: string; count: number }

export default function AdminPulsePage() {
  const [angles, setAngles] = useState<AngleOpt[]>([])
  const [examples, setExamples] = useState<string[]>([])
  const [angle, setAngle] = useState('novedad_take')
  const [topic, setTopic] = useState('')

  const [news, setNews] = useState<NewsItem[]>([])
  const [newsNote, setNewsNote] = useState<string | null>(null)
  const [newsLoading, setNewsLoading] = useState(false)
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null)

  const [post, setPost] = useState<PulsePost | null>(null)
  const [text, setText] = useState('')
  const [genLoading, setGenLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [publishMsg, setPublishMsg] = useState<string | null>(null)

  const [image, setImage] = useState<string | null>(null)
  const [imgLoading, setImgLoading] = useState(false)
  const [slides, setSlides] = useState<SlidesData | null>(null)
  const [slidesLoading, setSlidesLoading] = useState(false)
  const [art, setArt] = useState<string | null>(null)
  const [artLoading, setArtLoading] = useState(false)
  const [artError, setArtError] = useState<string | null>(null)

  const handleLogout = () => { localStorage.removeItem('adminToken'); window.location.href = '/admin/login' }

  useEffect(() => {
    api.get('/api/v1/admin/pulse/options').then(({ data }) => {
      setAngles(data.angles || []); setExamples(data.topic_examples || [])
      if (data.default_angle) setAngle(data.default_angle)
    }).catch(() => { /* no-op */ })
  }, [])

  const suggestNews = async () => {
    setNewsLoading(true); setNewsNote(null); setError(null)
    try {
      const { data } = await api.post('/api/v1/admin/pulse/suggest-news', { topic })
      setNews(data.items || []); setNewsNote(data.note || null)
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'No se pudieron buscar novedades.')
    } finally { setNewsLoading(false) }
  }

  const generate = async () => {
    setGenLoading(true); setError(null); setPublishMsg(null); setImage(null); setSlides(null); setArt(null); setArtError(null)
    try {
      const { data } = await api.post('/api/v1/admin/pulse/generate', {
        topic, angle, news_url: selectedUrl,
      })
      setPost(data); setText(data.text || '')
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'No se pudo generar el post.')
    } finally { setGenLoading(false) }
  }

  const generateImage = async () => {
    if (!post?.visual) return
    setImgLoading(true)
    try {
      const { data } = await api.post('/api/v1/admin/pulse/image', post.visual)
      setImage(data.data_url)
    } catch { /* no-op */ } finally { setImgLoading(false) }
  }

  const generateSlides = async () => {
    if (!post?.visual) return
    setSlidesLoading(true)
    try {
      const { data } = await api.post('/api/v1/admin/pulse/carousel', post.visual)
      setSlides(data)
    } catch { /* no-op */ } finally { setSlidesLoading(false) }
  }

  const generateArt = async () => {
    if (!post?.visual) return
    setArtLoading(true); setArtError(null)
    try {
      const { data } = await api.post('/api/v1/admin/pulse/art', {
        art: (post.visual as any).art || {}, source: post.visual.source || '',
      })
      setArt(data.data_url)
    } catch (e: any) {
      setArtError(e?.response?.data?.detail || 'No se pudo generar el arte.')
    } finally { setArtLoading(false) }
  }

  const copyAll = () => {
    const tags = (post?.hashtags || []).join(' ')
    navigator.clipboard.writeText(`${text}\n\n${tags}`.trim())
    setCopied(true); setTimeout(() => setCopied(false), 1500)
  }

  const publish = async () => {
    setPublishing(true); setPublishMsg(null)
    try {
      // Adjuntar lo que esté en pantalla: arte > imagen/diagrama > carrusel (PDF).
      const node: any = { text, hashtags: post?.hashtags || [] }
      if (art) node.image = art
      else if (image) node.image = image
      else if (slides?.pdf_data_url) node.carousel_pdf = slides.pdf_data_url
      const { data } = await api.post('/api/v1/admin/poc-social/publish-direct', {
        posts: { linkedin: node },
      })
      const r = (Array.isArray(data?.results) ? data.results.find((x: any) => x.network === 'linkedin') : null) || {}
      const withImg = node.image || node.carousel_pdf ? ' (con imagen)' : ''
      setPublishMsg(r.status === 'published' ? `✓ Publicado en LinkedIn${withImg}.` : `Estado: ${r.status || 'enviado'} ${r.reason || ''}`)
    } catch (e: any) {
      setPublishMsg(e?.response?.data?.detail || 'No se pudo publicar.')
    } finally { setPublishing(false) }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar currentPage="pulse" onLogout={handleLogout} />
      <div className="flex-1 min-w-0">
        <header className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex items-center gap-3">
            <Newspaper className="text-brand-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Novedades</h1>
              <p className="text-sm text-gray-500">Posicionate aportando: novedades reales de tu rubro + tu opinión. Sin vender.</p>
            </div>
          </div>
        </header>

        <main className="p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* ── Columna izquierda: controles + novedades ── */}
            <div className="space-y-5">
              <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                <label className="text-sm block">
                  <span className="text-gray-700 font-medium">Tema</span>
                  <input value={topic} onChange={e => setTopic(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') suggestNews() }}
                    placeholder="ej. Claude agentes, OpenAI, RAG, React Native…"
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                  {examples.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {examples.map(ex => (
                        <button key={ex} type="button" onClick={() => setTopic(ex)}
                          className="text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full px-2.5 py-1">
                          {ex}
                        </button>
                      ))}
                    </div>
                  )}
                </label>
                <label className="text-sm block">
                  <span className="text-gray-700 font-medium">Formato</span>
                  <select value={angle} onChange={e => setAngle(e.target.value)}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    {angles.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
                  </select>
                </label>
                <div className="flex gap-2">
                  <button onClick={suggestNews} disabled={newsLoading}
                    className="flex items-center gap-2 text-sm border border-brand-200 bg-brand-50 text-brand-700 rounded-lg px-3 py-2 hover:bg-brand-100 disabled:opacity-50">
                    <Globe size={15} className={newsLoading ? 'animate-spin' : ''} /> Buscar novedades
                  </button>
                  <button onClick={generate} disabled={genLoading}
                    className="flex items-center gap-2 text-sm bg-brand-600 text-white rounded-lg px-4 py-2 hover:bg-brand-700 disabled:opacity-50">
                    <Wand2 size={15} className={genLoading ? 'animate-pulse' : ''} />
                    {genLoading ? 'Generando…' : 'Generar post'}
                  </button>
                </div>
                {error && <p className="text-sm text-red-600 flex items-center gap-1"><AlertCircle size={14} /> {error}</p>}
              </div>

              {news.length > 0 && (
                <div>
                  <h2 className="text-sm font-semibold text-gray-700 mb-2">Novedades — elegí una (o dejá que el agente elija)</h2>
                  <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
                    {news.map((n, i) => (
                      <button key={i} onClick={() => setSelectedUrl(selectedUrl === n.url ? null : n.url)}
                        className={`w-full text-left border rounded-lg p-3 transition-colors ${selectedUrl === n.url ? 'border-brand-500 bg-brand-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-sm font-medium text-gray-900">{n.title}</span>
                          {selectedUrl === n.url && <Check size={16} className="text-brand-600 shrink-0" />}
                        </div>
                        {n.snippet && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{n.snippet}</p>}
                        <span className="text-xs text-gray-400">{n.domain}</span>
                      </button>
                    ))}
                  </div>
                  {newsNote && <p className="text-xs text-amber-600 mt-2 flex items-center gap-1"><AlertCircle size={13} /> {newsNote}</p>}
                </div>
              )}
            </div>

            {/* ── Columna derecha: post + imagen + slides ── */}
            <div className="lg:sticky lg:top-6">
              {!post ? (
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center text-gray-400">
                  <Sparkles className="mx-auto mb-2" />
                  <p className="text-sm">Tu post va a aparecer acá.<br />Elegí área y formato, y dale a “Generar post”.</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2"><Sparkles size={15} className="text-brand-600" /> Post para LinkedIn</h2>
                    {post.used_web_search
                      ? <span className="text-xs text-green-600">noticias en vivo</span>
                      : <span className="text-xs text-amber-600">sin noticias en vivo</span>}
                  </div>
                  <textarea value={text} onChange={e => setText(e.target.value)} rows={11}
                    className="w-full border border-gray-200 rounded-lg p-3 text-sm leading-relaxed" />
                  {post.hashtags?.length > 0 && <p className="text-sm text-brand-600 mt-2">{post.hashtags.join(' ')}</p>}

                  <div className="flex flex-wrap gap-2 mt-3">
                    <button onClick={copyAll} className="flex items-center gap-1.5 text-sm border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50">
                      {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />} {copied ? 'Copiado' : 'Copiar'}
                    </button>
                    <button onClick={generate} disabled={genLoading} className="flex items-center gap-1.5 text-sm border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50">
                      <RefreshCw size={14} className={genLoading ? 'animate-spin' : ''} /> Regenerar
                    </button>
                    <button onClick={publish} disabled={publishing || !text.trim()}
                      className="flex items-center gap-1.5 text-sm bg-brand-600 text-white rounded-lg px-3 py-1.5 hover:bg-brand-700 disabled:opacity-50">
                      <Send size={14} /> {publishing ? 'Publicando…' : 'Publicar en LinkedIn'}
                    </button>
                  </div>
                  {publishMsg && <p className="text-xs text-gray-600 mt-2">{publishMsg}</p>}

                  {/* Imagen + slides */}
                  <div className="mt-4 border-t border-gray-100 pt-3 flex flex-wrap gap-2">
                    <button onClick={generateImage} disabled={imgLoading}
                      className="flex items-center gap-1.5 text-sm text-brand-700 border border-brand-200 bg-brand-50 rounded-lg px-3 py-1.5 hover:bg-brand-100 disabled:opacity-50">
                      <ImageIcon size={14} className={imgLoading ? 'animate-pulse' : ''} /> {imgLoading ? 'Generando…' : 'Generar imagen'}
                    </button>
                    <button onClick={generateSlides} disabled={slidesLoading}
                      className="flex items-center gap-1.5 text-sm text-brand-700 border border-brand-200 bg-brand-50 rounded-lg px-3 py-1.5 hover:bg-brand-100 disabled:opacity-50">
                      <Images size={14} className={slidesLoading ? 'animate-pulse' : ''} /> {slidesLoading ? 'Generando…' : 'Generar slides'}
                    </button>
                    <button onClick={generateArt} disabled={artLoading} title="Ilustración generada por IA (tiene costo y tarda ~20s)"
                      className="flex items-center gap-1.5 text-sm text-white bg-gradient-to-r from-fuchsia-600 to-violet-600 rounded-lg px-3 py-1.5 hover:opacity-90 disabled:opacity-50">
                      <Palette size={14} className={artLoading ? 'animate-pulse' : ''} /> {artLoading ? 'Generando arte… (~20s)' : 'Generar arte (IA)'}
                    </button>
                  </div>
                  {artError && <p className="text-xs text-red-600 mt-1">{artError}</p>}
                  {art && (
                    <div className="mt-3 space-y-2">
                      <img src={art} alt="arte" className="w-full rounded-lg border border-gray-200" />
                      <a href={art} download="novedad-arte.png" className="inline-flex items-center gap-1 text-xs text-gray-600 border border-gray-200 rounded-lg px-2 py-1 hover:bg-gray-50">
                        <Download size={13} /> Descargar arte
                      </a>
                    </div>
                  )}

                  {image && (
                    <div className="mt-3 space-y-2">
                      <img src={image} alt="placa" className="w-full rounded-lg border border-gray-200" />
                      <a href={image} download="novedad.png" className="inline-flex items-center gap-1 text-xs text-gray-600 border border-gray-200 rounded-lg px-2 py-1 hover:bg-gray-50">
                        <Download size={13} /> Descargar imagen
                      </a>
                    </div>
                  )}

                  {slides && slides.slides.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {slides.slides.map((s, i) => (
                          <img key={i} src={s.data_url} alt={`slide ${i + 1}`} className="h-44 rounded-lg border border-gray-200 shrink-0" />
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {slides.pdf_data_url && (
                          <a href={slides.pdf_data_url} download="novedad-carrusel.pdf"
                            className="inline-flex items-center gap-1 text-xs text-white bg-brand-600 hover:bg-brand-700 rounded-lg px-3 py-1.5">
                            <FileText size={13} /> PDF para LinkedIn ({slides.count})
                          </a>
                        )}
                        {slides.zip_data_url && (
                          <a href={slides.zip_data_url} download="novedad-slides.zip"
                            className="inline-flex items-center gap-1 text-xs text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50">
                            <Download size={13} /> Descargar imágenes
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {post.sources?.length > 0 && (
                    <div className="mt-4 border-t border-gray-100 pt-3">
                      <p className="text-xs font-semibold text-gray-500 mb-1">Fuentes</p>
                      <ul className="space-y-1">
                        {post.sources.map((s, i) => (
                          <li key={i}>
                            <a href={s.url} target="_blank" rel="noreferrer"
                              className="text-xs text-brand-600 hover:underline flex items-center gap-1">
                              <ExternalLink size={11} /> {s.title || s.domain || s.url}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
