import { useState, useEffect } from 'react'
import {
  Linkedin, Twitter, Facebook, Instagram, Copy, Check, Send,
  Sparkles, RefreshCw, Image as ImageIcon, Link2, AlertCircle, CheckCircle2,
  Wand2, Download,
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
}

interface Pillar { id: string; label: string; description: string; topics: string[] }
interface Audience { id: string; label: string }

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
  // Controles Head of Growth
  const [pillars, setPillars] = useState<Pillar[]>(FALLBACK_PILLARS)
  const [audiences, setAudiences] = useState<Audience[]>(FALLBACK_AUDIENCES)
  const [optionsWarning, setOptionsWarning] = useState(false)
  const [pillar, setPillar] = useState('educativo')
  const [audience, setAudience] = useState('pymes')
  const [topic, setTopic] = useState('')

  // Posts
  const [posts, setPosts] = useState<Record<string, EditablePost>>({})
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState<string | null>(null)
  const [connStatus, setConnStatus] = useState<Record<string, boolean>>({})
  const [copied, setCopied] = useState<string | null>(null)
  const [publishing, setPublishing] = useState<string | null>(null)
  const [results, setResults] = useState<Record<string, PublishResult>>({})
  const [images, setImages] = useState<Record<string, string>>({})
  const [imgLoading, setImgLoading] = useState<string | null>(null)
  const [imgError, setImgError] = useState<Record<string, string>>({})

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    window.location.href = '/admin/login'
  }

  useEffect(() => {
    loadConnStatus()
    loadGrowthOptions()
  }, [])

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
      setConnStatus(data.networks || {})
    } catch { /* no-op */ }
  }

  // ── Generar ──────────────────────────────────────────────────────
  const generate = async () => {
    setGenerating(true); setGenError(null); setPosts({}); setResults({}); setImages({}); setImgError({})
    try {
      const { data } = await api.post('/api/v1/admin/poc-social/growth/generate', {
        pillar, audience, topic: topic.trim() || null,
      })
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
    setPublishing(net)
    try {
      const p = posts[net]
      const { data } = await api.post('/api/v1/admin/poc-social/publish-direct', {
        posts: { [net]: { text: p.text, hashtags: tagsToArray(p.hashtags), thread: p.thread } },
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
      })
      const src = data.data_url || data.url
      if (src) setImages(prev => ({ ...prev, [net]: src }))
      else setImgError(prev => ({ ...prev, [net]: 'El modelo no devolvió imagen.' }))
    } catch (e: any) {
      setImgError(prev => ({ ...prev, [net]: e?.response?.data?.detail || 'Error generando la imagen.' }))
    } finally { setImgLoading(null) }
  }

  const connectLinkedIn = async () => {
    try {
      const { data } = await api.get('/api/v1/admin/poc-social/linkedin/auth-url')
      if (data.auth_url) window.open(data.auth_url, '_blank')
    } catch (e: any) {
      alert(e?.response?.data?.detail || 'No se pudo generar la URL de conexión de LinkedIn.')
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
          {!connStatus['linkedin'] && (
            <button onClick={connectLinkedIn} className="ml-auto flex items-center gap-1.5 text-sm bg-[#0A66C2] text-white px-3 py-1.5 rounded-lg hover:opacity-90">
              <Link2 size={14} /> Conectar LinkedIn
            </button>
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
              <select value={pillar} onChange={e => setPillar(e.target.value)}
                className="w-full mt-1 border border-gray-200 rounded-lg p-2 text-sm bg-white">
                {pillars.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
              {selectedPillar && <p className="text-xs text-gray-500 mt-1">{selectedPillar.description}</p>}
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">Audiencia</label>
              <select value={audience} onChange={e => setAudience(e.target.value)}
                className="w-full mt-1 border border-gray-200 rounded-lg p-2 text-sm bg-white">
                {audiences.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">Tema / ángulo (opcional)</label>
              <textarea value={topic} onChange={e => setTopic(e.target.value)} rows={3}
                placeholder={selectedPillar?.topics?.[0] || 'Dejalo vacío y el agente elige'}
                className="w-full mt-1 border border-gray-200 rounded-lg p-2 text-sm resize-y" />
              {selectedPillar?.topics?.length ? (
                <div className="mt-1 flex flex-wrap gap-1">
                  {selectedPillar.topics.slice(0, 3).map((t, i) => (
                    <button key={i} onClick={() => setTopic(t)}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 rounded px-2 py-0.5 text-left">
                      {t}
                    </button>
                  ))}
                </div>
              ) : null}
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
                <RefreshCw size={32} className="mx-auto mb-3 animate-spin" /> Generando posts…
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
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                {NETWORKS.map(n => {
                  const p = posts[n.id]; if (!p) return null
                  const res = results[n.id]
                  const canPublish = connStatus[n.id]
                  return (
                    <div key={n.id} className={`bg-white rounded-xl border-2 ${n.ring} border-opacity-20 p-5 flex flex-col`}>
                      <div className="flex items-center gap-2 mb-3">
                        <n.icon className={n.color} size={20} />
                        <span className="font-semibold text-gray-900">{n.label}</span>
                        <button onClick={() => copyPost(n.id)} className="ml-auto text-gray-400 hover:text-gray-700" title="Copiar">
                          {copied === n.id ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                        </button>
                      </div>

                      <textarea value={p.text} onChange={e => updatePost(n.id, 'text', e.target.value)} rows={8}
                        className="w-full text-sm border border-gray-200 rounded-lg p-3 resize-y focus:ring-2 focus:ring-brand-400 focus:outline-none" />

                      <input value={p.hashtags} onChange={e => updatePost(n.id, 'hashtags', e.target.value)}
                        placeholder="hashtags separados por espacio"
                        className="w-full text-sm text-brand-600 border border-gray-200 rounded-lg p-2 mt-2 focus:ring-2 focus:ring-brand-400 focus:outline-none" />

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

                      <div className="mt-3 flex items-center gap-2">
                        <button onClick={() => publish(n.id)} disabled={!canPublish || publishing === n.id}
                          className={`flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg text-white transition-colors ${canPublish ? 'bg-brand-600 hover:bg-brand-700' : 'bg-gray-300 cursor-not-allowed'}`}
                          title={canPublish ? 'Publicar' : 'Falta conectar credenciales de esta red'}>
                          <Send size={14} /> {publishing === n.id ? 'Publicando…' : 'Publicar'}
                        </button>
                        {res && (
                          <span className={`text-xs flex items-center gap-1 ${res.status === 'published' ? 'text-green-600' : res.status === 'skipped' ? 'text-gray-400' : 'text-red-600'}`}>
                            {res.status === 'published' ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                            {res.status === 'published' ? 'Publicado' : res.status === 'skipped' ? 'Sin credenciales' : (res.reason || 'Falló')}
                            {res.url && <a href={res.url} target="_blank" rel="noreferrer" className="underline ml-1">ver</a>}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
