import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Globe, Users, Target, Megaphone, Sparkles, Copy, CheckCircle, RefreshCw,
  ChevronRight, ChevronLeft, Layers, FileText, Film, Clipboard,
  Building2, TrendingUp, Zap, Calendar, DollarSign, BarChart3,
  AlertCircle, ArrowRight, BookOpen, UserCheck, Rocket,
  Shield, Eye, MousePointerClick, MessageSquare,
  ThumbsUp, MessageCircle, Repeat2, Send,
} from 'lucide-react'
import { api } from '../services/api'
import { useAppSelector, useAppDispatch } from '../store/hooks'
import { clearAuth } from '../store/userSlice'
import AdminSidebar from '../components/AdminSidebar'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface CampaignConfig {
  campaign_types: Record<string, any>
  audience_tracks: Record<string, any>
  industry_verticals: Record<string, any>
  funnel_phases: Record<string, any>
  ad_formats: Record<string, any>
  plan_targets: Record<string, any>
  retargeting_segments: Record<string, any>
  quality_checklist: Array<{ id: string; label_es: string; label_en: string }>
}

interface CampaignBrief {
  campaign_type: string
  audience_track: string
  industry_vertical: string
  funnel_phase: string
  ad_format: string
  plan_target: string
  custom_context: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const CAMPAIGN_TYPE_ICONS: Record<string, typeof Globe> = {
  brand_awareness: Globe,
  client_acquisition: Users,
}

const TRACK_ICONS: Record<string, typeof Rocket> = {
  track_a: Rocket,
  track_b: Building2,
  track_c: UserCheck,
}

const VERTICAL_ICONS: Record<string, typeof Shield> = {
  fintech: Shield,
  retail: TrendingUp,
  healthcare: BookOpen,
  cross_vertical: Globe,
}

const PHASE_ICONS: Record<string, typeof Megaphone> = {
  activate: Megaphone,
  convert: MousePointerClick,
  expand: TrendingUp,
  authority: Eye,
}

const FORMAT_ICONS: Record<string, typeof Layers> = {
  single_image: Target,
  video_script: Film,
  carousel: Layers,
  document_ad: FileText,
  lead_gen_form: MessageSquare,
  thought_leadership: BookOpen,
}

// ---------------------------------------------------------------------------
// LinkedIn Post Preview Component
// ---------------------------------------------------------------------------
function LinkedInPostPreview({ name, headline, avatarUrl, postText, imageConceptText, carouselSlides, lang }: {
  name: string
  headline: string
  avatarUrl?: string
  postText: string
  imageConceptText?: string
  carouselSlides?: any[]
  lang: 'es' | 'en'
}) {
  const [expanded, setExpanded] = useState(false)

  // Normalize line breaks: JSON may deliver literal \n sequences
  const normalizedText = postText
    .replace(/\\n/g, '\n')       // literal \n from JSON
    .replace(/\r\n/g, '\n')      // windows line endings
    .replace(/\n{3,}/g, '\n\n')  // collapse 3+ newlines to 2

  // Parse text: handle "...see more" truncation like LinkedIn
  const lines = normalizedText.split('\n')
  const truncateAt = 5 // LinkedIn shows ~5 lines then "...see more"
  const needsTruncation = lines.length > truncateAt
  const displayText = expanded || !needsTruncation
    ? normalizedText
    : lines.slice(0, truncateAt).join('\n')

  // Render text with hashtags, URLs styled like LinkedIn, and real line breaks
  const renderText = (text: string) => {
    // Split into lines first, then process each line
    const textLines = text.split('\n')
    return textLines.map((line, lineIdx) => {
      // Split each line by hashtags and URLs
      const parts = line.split(/(#[\w\u00C0-\u024F]+|https?:\/\/[^\s]+)/g)
      const rendered = parts.map((part, partIdx) => {
        if (part.startsWith('#')) {
          return <span key={`${lineIdx}-${partIdx}`} className="text-[#0A66C2] font-semibold cursor-pointer hover:underline">{part}</span>
        }
        if (part.startsWith('http://') || part.startsWith('https://')) {
          return <a key={`${lineIdx}-${partIdx}`} href={part} target="_blank" rel="noopener noreferrer" className="text-[#0A66C2] hover:underline">{part}</a>
        }
        return <span key={`${lineIdx}-${partIdx}`}>{part}</span>
      })
      return (
        <span key={lineIdx}>
          {lineIdx > 0 && <br />}
          {line === '' && lineIdx > 0 ? <br /> : rendered}
        </span>
      )
    })
  }

  const timeAgo = 'Now'
  const randomLikes = useMemo(() => Math.floor(Math.random() * 80) + 20, [])
  const randomComments = useMemo(() => Math.floor(Math.random() * 15) + 3, [])
  const randomReposts = useMemo(() => Math.floor(Math.random() * 8) + 1, [])

  return (
    <div className="w-full max-w-[555px]">
      {/* LinkedIn card container */}
      <div className="bg-white rounded-lg border border-[#e0e0e0] shadow-sm overflow-hidden" style={{ fontFamily: '-apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif' }}>

        {/* Post header */}
        <div className="px-4 pt-3 pb-2">
          <div className="flex items-start gap-2">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt={name} className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0A66C2] to-[#004182] flex items-center justify-center text-white font-bold text-lg">
                  {name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
              )}
            </div>
            {/* Name / headline / time */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="font-semibold text-[14px] text-[#000000E6] leading-5 hover:text-[#0A66C2] hover:underline cursor-pointer">{name}</span>
                <span className="text-[12px] text-[#00000099]">• 1st</span>
              </div>
              <p className="text-[12px] text-[#00000099] leading-4 truncate">{headline}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[12px] text-[#00000099]">{timeAgo}</span>
                <span className="text-[12px] text-[#00000099]">•</span>
                <svg className="w-3 h-3 text-[#00000099]" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 107 7 7 7 0 00-7-7zM3 8a5 5 0 011-3l.55.55A1.5 1.5 0 015 6.62v1.07a.75.75 0 00.22.53l.56.56a.75.75 0 00.53.22H7v.69a.75.75 0 00.22.53l.56.56a.75.75 0 01.22.53V13a5 5 0 01-5-5zm9.61 1.03a.75.75 0 00-.53-.22H11v-.69a.75.75 0 00-.22-.53l-.56-.56a.75.75 0 01-.22-.53V5.07a.75.75 0 00-.22-.53l-.56-.56A1.5 1.5 0 007.68 3H7V2.05A5 5 0 0112.61 9.03z"></path></svg>
              </div>
            </div>
            {/* More icon */}
            <button className="p-1.5 rounded-full hover:bg-[#00000014] transition-colors">
              <svg className="w-5 h-5 text-[#00000099]" viewBox="0 0 24 24" fill="currentColor"><path d="M14 12a2 2 0 11-4 0 2 2 0 014 0zM4 12a2 2 0 11-4 0 2 2 0 014 0zm16 0a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            </button>
          </div>
        </div>

        {/* Post body text */}
        <div className="px-4 pb-2">
          <div className="text-[14px] text-[#000000E6] leading-5 whitespace-pre-wrap break-words">
            {renderText(displayText)}
            {needsTruncation && !expanded && (
              <span
                onClick={() => setExpanded(true)}
                className="text-[#00000099] hover:text-[#0A66C2] cursor-pointer font-medium"
              >
                ...see more
              </span>
            )}
          </div>
        </div>

        {/* Image/visual placeholder */}
        {imageConceptText && !carouselSlides?.length && (
          <div className="bg-[#F3F2EF] border-t border-b border-[#e0e0e0]">
            <div className="aspect-[1.91/1] flex items-center justify-center p-8">
              <div className="text-center max-w-sm">
                <div className="w-16 h-16 rounded-full bg-white/80 flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <Eye className="w-8 h-8 text-[#666]" />
                </div>
                <p className="text-[13px] text-[#666] leading-5 italic">{imageConceptText}</p>
                <p className="text-[11px] text-[#999] mt-2">Visual concept — replace with final image</p>
              </div>
            </div>
          </div>
        )}

        {/* Carousel preview */}
        {carouselSlides && carouselSlides.length > 0 && (
          <div className="border-t border-b border-[#e0e0e0] overflow-x-auto">
            <div className="flex">
              {carouselSlides.map((slide: any, i: number) => (
                <div key={i} className="flex-shrink-0 w-[300px] bg-[#F3F2EF] border-r border-[#e0e0e0] p-6 flex flex-col justify-center min-h-[200px]">
                  <span className="text-[11px] font-bold text-[#0A66C2] uppercase tracking-wide">{i === 0 ? '' : `${i + 1}/${carouselSlides.length}`}</span>
                  <h4 className="text-[16px] font-bold text-[#000000E6] mt-1 leading-5">
                    {lang === 'es' ? slide.headline_es : slide.headline_en}
                  </h4>
                  <p className="text-[13px] text-[#00000099] mt-2 leading-4">
                    {lang === 'es' ? slide.description_es : slide.description_en}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Engagement counts */}
        <div className="px-4 py-2 flex items-center justify-between text-[12px] text-[#00000099]">
          <div className="flex items-center gap-1">
            {/* Like/celebrate/support icons */}
            <div className="flex -space-x-0.5">
              <div className="w-4 h-4 rounded-full bg-[#378FE9] flex items-center justify-center">
                <ThumbsUp className="w-2.5 h-2.5 text-white" />
              </div>
              <div className="w-4 h-4 rounded-full bg-[#E16745] flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 14c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6z"></path></svg>
              </div>
            </div>
            <span className="hover:text-[#0A66C2] hover:underline cursor-pointer">{randomLikes}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hover:text-[#0A66C2] hover:underline cursor-pointer">{randomComments} comments</span>
            <span className="hover:text-[#0A66C2] hover:underline cursor-pointer">{randomReposts} reposts</span>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-4 border-t border-[#e0e0e0]"></div>

        {/* Action buttons */}
        <div className="px-2 py-1 flex items-center justify-between">
          {[
            { icon: ThumbsUp, label: 'Like' },
            { icon: MessageCircle, label: 'Comment' },
            { icon: Repeat2, label: 'Repost' },
            { icon: Send, label: 'Send' },
          ].map(({ icon: Icon, label }) => (
            <button
              key={label}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-lg hover:bg-[#00000014] transition-colors group"
            >
              <Icon className="w-5 h-5 text-[#00000099] group-hover:text-[#000000CC]" />
              <span className="text-[12px] font-semibold text-[#00000099] group-hover:text-[#000000CC]">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Meta label */}
      <p className="text-center text-[11px] text-gray-400 mt-3">LinkedIn Feed Preview — approximate rendering</p>
    </div>
  )
}


const STEPS = [
  { id: 'type', label: 'Tipo de Campaña' },
  { id: 'audience', label: 'Audiencia' },
  { id: 'vertical', label: 'Vertical' },
  { id: 'phase', label: 'Fase del Funnel' },
  { id: 'format', label: 'Formato & Plan' },
  { id: 'context', label: 'Contexto' },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function AdminLinkedInPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const userData = useAppSelector((state) => state.user.user)

  // Config
  const [config, setConfig] = useState<CampaignConfig | null>(null)
  const [isLoadingConfig, setIsLoadingConfig] = useState(false)

  // Wizard step
  const [currentStep, setCurrentStep] = useState(0)

  // Brief
  const [brief, setBrief] = useState<CampaignBrief>({
    campaign_type: '',
    audience_track: '',
    industry_vertical: '',
    funnel_phase: '',
    ad_format: '',
    plan_target: 'free_signup',
    custom_context: '',
  })

  // Results
  const [campaignResult, setCampaignResult] = useState<any>(null)
  const [fullPlanResult, setFullPlanResult] = useState<any>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState<'es' | 'en'>('en')

  // View mode: 'wizard' | 'result' | 'full_plan'
  const [viewMode, setViewMode] = useState<'wizard' | 'result' | 'full_plan'>('wizard')

  // Result sub-tab: 'edit' | 'preview'
  const [resultTab, setResultTab] = useState<'edit' | 'preview'>('edit')

  // LinkedIn publish state
  const [linkedinConnected, setLinkedinConnected] = useState(false)
  const [linkedinProfile, setLinkedinProfile] = useState<{ name: string; email: string; picture?: string } | null>(null)
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishResult, setPublishResult] = useState<{ status: string; post_id?: string } | null>(null)

  useEffect(() => {
    if (!userData) {
      navigate('/admin/login')
      return
    }
    loadConfig()
    checkLinkedInConnection()
  }, [userData, navigate])

  const loadConfig = async () => {
    setIsLoadingConfig(true)
    try {
      const response = await api.get('/api/v1/admin/linkedin/campaign-config')
      setConfig(response.data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error loading configuration')
    } finally {
      setIsLoadingConfig(false)
    }
  }

  const checkLinkedInConnection = async () => {
    try {
      const response = await api.get('/api/v1/admin/linkedin/publish/status')
      if (response.data.connected) {
        setLinkedinConnected(true)
        setLinkedinProfile({
          name: response.data.name,
          email: response.data.email,
          picture: response.data.picture,
        })
      }
    } catch {
      // Not connected — that's fine
    }
  }

  const connectLinkedIn = async () => {
    try {
      const response = await api.get('/api/v1/admin/linkedin/publish/auth-url')
      window.open(response.data.auth_url, '_blank', 'width=600,height=700')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error connecting to LinkedIn')
    }
  }

  const publishToLinkedIn = async (text: string) => {
    setIsPublishing(true)
    setPublishResult(null)
    try {
      const response = await api.post('/api/v1/admin/linkedin/publish/post', {
        text,
        language: selectedLanguage,
        visibility: 'PUBLIC',
      })
      setPublishResult(response.data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error publishing to LinkedIn')
    } finally {
      setIsPublishing(false)
    }
  }

  const generateCampaign = async () => {
    setIsGenerating(true)
    setError('')
    setCampaignResult(null)

    try {
      const payload: any = { ...brief }
      if (!payload.custom_context) delete payload.custom_context
      const response = await api.post('/api/v1/admin/linkedin/generate-campaign', payload)
      setCampaignResult(response.data)
      setViewMode('result')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error generating campaign')
    } finally {
      setIsGenerating(false)
    }
  }

  const generateFullPlan = async () => {
    setIsGeneratingPlan(true)
    setError('')
    setFullPlanResult(null)

    try {
      const payload: any = {
        campaign_type: brief.campaign_type,
        industry_vertical: brief.industry_vertical || 'cross_vertical',
      }
      if (brief.custom_context) payload.custom_context = brief.custom_context
      const response = await api.post('/api/v1/admin/linkedin/generate-full-plan', payload)
      setFullPlanResult(response.data)
      setViewMode('full_plan')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error generating campaign plan')
    } finally {
      setIsGeneratingPlan(false)
    }
  }

  const copyToClipboard = async (text: string, fieldId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(fieldId)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error('Error copying:', err)
    }
  }

  const resetWizard = () => {
    setViewMode('wizard')
    setCurrentStep(0)
    setBrief({
      campaign_type: '',
      audience_track: '',
      industry_vertical: '',
      funnel_phase: '',
      ad_format: '',
      plan_target: 'free_signup',
      custom_context: '',
    })
    setCampaignResult(null)
    setFullPlanResult(null)
    setError('')
  }

  const handleLogout = () => {
    dispatch(clearAuth())
    navigate('/admin/login')
  }

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 0: return !!brief.campaign_type
      case 1: return !!brief.audience_track
      case 2: return !!brief.industry_vertical
      case 3: return !!brief.funnel_phase
      case 4: return !!brief.ad_format
      case 5: return true
      default: return false
    }
  }

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------

  function OptionCard({ selected, onClick, icon: Icon, title, description, badge }: {
    selected: boolean
    onClick: () => void
    icon: any
    title: string
    description: string
    badge?: string
  }) {
    return (
      <button
        onClick={onClick}
        className={`relative text-left w-full p-5 rounded-xl border-2 transition-all duration-200 ${
          selected
            ? 'border-blue-500 bg-blue-50 shadow-md shadow-blue-100'
            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm bg-white'
        }`}
      >
        {badge && (
          <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
            {badge}
          </span>
        )}
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-lg ${selected ? 'bg-blue-100' : 'bg-gray-100'}`}>
            <Icon className={`w-6 h-6 ${selected ? 'text-blue-600' : 'text-gray-500'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold text-base ${selected ? 'text-blue-700' : 'text-gray-900'}`}>
              {title}
            </h3>
            <p className="text-sm text-gray-500 mt-1 leading-relaxed">{description}</p>
          </div>
        </div>
      </button>
    )
  }

  function StepIndicator() {
    return (
      <div className="flex items-center gap-1 mb-8">
        {STEPS.map((step, i) => (
          <div key={step.id} className="flex items-center">
            <button
              onClick={() => i <= currentStep && setCurrentStep(i)}
              disabled={i > currentStep}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                i === currentStep
                  ? 'bg-blue-600 text-white'
                  : i < currentStep
                    ? 'bg-blue-100 text-blue-700 cursor-pointer hover:bg-blue-200'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                i < currentStep ? 'bg-blue-600 text-white' : i === currentStep ? 'bg-white/20' : ''
              }`}>
                {i < currentStep ? '✓' : i + 1}
              </span>
              <span className="hidden lg:inline">{step.label}</span>
            </button>
            {i < STEPS.length - 1 && (
              <ChevronRight className="w-4 h-4 text-gray-300 mx-1" />
            )}
          </div>
        ))}
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Step renderers
  // ---------------------------------------------------------------------------

  function renderStepType() {
    if (!config) return null
    return (
      <div className="space-y-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">¿Qué tipo de campaña quieres crear?</h2>
          <p className="text-gray-500 mt-2">Tu CRO Agent generará la campaña completa según el objetivo seleccionado.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.values(config.campaign_types).map((ct: any) => (
            <OptionCard
              key={ct.id}

              selected={brief.campaign_type === ct.id}
              onClick={() => setBrief({ ...brief, campaign_type: ct.id })}
              icon={CAMPAIGN_TYPE_ICONS[ct.id] || Globe}
              title={ct.label_es}
              description={ct.description_es}
            />
          ))}
        </div>

        {brief.campaign_type && (
          <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-semibold text-purple-700">Plan automático de 6 meses</span>
            </div>
            <p className="text-sm text-purple-600 mb-3">
              También puedes generar un plan completo de campaña con todas las fases, presupuestos y ads específicos.
            </p>
            <button
              onClick={generateFullPlan}
              disabled={isGeneratingPlan}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors text-sm font-medium"
            >
              {isGeneratingPlan ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Generando plan completo...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generar Plan Completo de 6 Meses
                </>
              )}
            </button>
          </div>
        )}
      </div>
    )
  }

  function renderStepAudience() {
    if (!config) return null
    return (
      <div className="space-y-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">¿A quién va dirigida?</h2>
          <p className="text-gray-500 mt-2">Selecciona el track de audiencia. Nunca mezcles tracks en el mismo ad set.</p>
        </div>
        <div className="space-y-3">
          {Object.values(config.audience_tracks).map((track: any) => (
            <OptionCard
              key={track.id}
              selected={brief.audience_track === track.id}
              onClick={() => setBrief({ ...brief, audience_track: track.id })}
              icon={TRACK_ICONS[track.id] || Users}
              title={track.label_es}
              description={track.description_es}
            />
          ))}
        </div>

        {brief.audience_track && config.audience_tracks[brief.audience_track] && (
          <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-xl">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">LinkedIn Targeting</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-xs text-gray-400 block mb-1">Job Titles</span>
                <div className="flex flex-wrap gap-1">
                  {config.audience_tracks[brief.audience_track].targeting.job_titles.map((t: string) => (
                    <span key={t} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{t}</span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-xs text-gray-400 block mb-1">Company Size</span>
                <span className="text-sm text-gray-700">{config.audience_tracks[brief.audience_track].targeting.company_size}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block mb-1">Industries</span>
                <div className="flex flex-wrap gap-1">
                  {config.audience_tracks[brief.audience_track].targeting.industries.map((t: string) => (
                    <span key={t} className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  function renderStepVertical() {
    if (!config) return null
    return (
      <div className="space-y-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">¿Qué vertical?</h2>
          <p className="text-gray-500 mt-2">Cada vertical tiene messaging específico. Cross-vertical solo para awareness top-of-funnel.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.values(config.industry_verticals).map((v: any) => (
            <OptionCard
              key={v.id}
              selected={brief.industry_vertical === v.id}
              onClick={() => setBrief({ ...brief, industry_vertical: v.id })}
              icon={VERTICAL_ICONS[v.id] || Globe}
              title={v.label_es}
              description={v.messaging_es || v.pain_es}
              badge={v.id === 'cross_vertical' ? 'Solo awareness' : undefined}
            />
          ))}
        </div>
      </div>
    )
  }

  function renderStepPhase() {
    if (!config) return null
    return (
      <div className="space-y-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">¿En qué fase del funnel?</h2>
          <p className="text-gray-500 mt-2">Cada fase tiene su presupuesto, formato recomendado y KPIs.</p>
        </div>
        <div className="space-y-3">
          {Object.values(config.funnel_phases).map((phase: any) => (
            <button
              key={phase.id}
              onClick={() => setBrief({ ...brief, funnel_phase: phase.id })}
              className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-200 ${
                brief.funnel_phase === phase.id
                  ? 'border-blue-500 bg-blue-50 shadow-md shadow-blue-100'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-lg ${brief.funnel_phase === phase.id ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    {(() => { const Icon = PHASE_ICONS[phase.id] || Target; return <Icon className={`w-5 h-5 ${brief.funnel_phase === phase.id ? 'text-blue-600' : 'text-gray-500'}`} /> })()}
                  </div>
                  <div>
                    <h3 className={`font-semibold ${brief.funnel_phase === phase.id ? 'text-blue-700' : 'text-gray-900'}`}>
                      {phase.label_es}
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">{phase.goal_es}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <div className="flex items-center gap-1 text-sm font-semibold text-gray-700">
                    <DollarSign className="w-3.5 h-3.5" />
                    {phase.budget}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">KPI: {phase.kpi}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  function renderStepFormat() {
    if (!config) return null
    return (
      <div className="space-y-6">
        <div className="mb-2">
          <h2 className="text-2xl font-bold text-gray-900">Formato del Ad y Plan Target</h2>
          <p className="text-gray-500 mt-2">Elige el formato de contenido y hacia qué plan dirigir la conversión.</p>
        </div>

        {/* Ad Format */}
        <div>
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Formato</h3>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.values(config.ad_formats).map((fmt: any) => {
              const Icon = FORMAT_ICONS[fmt.id] || FileText
              const selected = brief.ad_format === fmt.id
              return (
                <button
                  key={fmt.id}
                  onClick={() => setBrief({ ...brief, ad_format: fmt.id })}
                  className={`flex flex-col items-start p-4 rounded-xl border-2 transition-all ${
                    selected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 mb-2 ${selected ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className={`text-sm font-semibold ${selected ? 'text-blue-700' : 'text-gray-700'}`}>
                    {fmt.label_es}
                  </span>
                  <span className="text-[11px] text-gray-400 mt-1 leading-tight">{fmt.best_use_es}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Plan Target */}
        <div>
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Plan Target</h3>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
            {Object.values(config.plan_targets).map((plan: any) => {
              const selected = brief.plan_target === plan.id
              return (
                <button
                  key={plan.id}
                  onClick={() => setBrief({ ...brief, plan_target: plan.id })}
                  className={`text-left px-4 py-3 rounded-lg border-2 transition-all text-sm ${
                    selected
                      ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold">{plan.label_es}</div>
                  <div className="text-xs text-gray-400">{plan.pocs} PoCs/mo</div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  function renderStepContext() {
    return (
      <div className="space-y-6">
        <div className="mb-2">
          <h2 className="text-2xl font-bold text-gray-900">Contexto adicional</h2>
          <p className="text-gray-500 mt-2">Información extra para que el CRO Agent personalice la campaña.</p>
        </div>

        <textarea
          value={brief.custom_context}
          onChange={(e) => setBrief({ ...brief, custom_context: e.target.value })}
          placeholder="Ej: Enfocarse en el mercado LATAM, mencionar EU AI Act, destacar caso de éxito reciente, campaña navideña, etc."
          className="w-full p-4 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none resize-none"
          rows={4}
        />

        {/* Summary */}
        {config && (
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200 rounded-xl p-6">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Resumen de la Campaña</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Tipo:</span>
                <span className="ml-2 text-gray-800 font-medium">
                  {config.campaign_types[brief.campaign_type]?.label_es}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Track:</span>
                <span className="ml-2 text-gray-800 font-medium">
                  {config.audience_tracks[brief.audience_track]?.label_es}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Vertical:</span>
                <span className="ml-2 text-gray-800 font-medium">
                  {config.industry_verticals[brief.industry_vertical]?.label_es}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Fase:</span>
                <span className="ml-2 text-gray-800 font-medium">
                  {config.funnel_phases[brief.funnel_phase]?.label_es}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Formato:</span>
                <span className="ml-2 text-gray-800 font-medium">
                  {config.ad_formats[brief.ad_format]?.label_es}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Plan:</span>
                <span className="ml-2 text-gray-800 font-medium">
                  {config.plan_targets[brief.plan_target]?.label_es}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Result view
  // ---------------------------------------------------------------------------
  function renderResult() {
    if (!campaignResult) return null
    const r = campaignResult
    const lang = selectedLanguage

    return (
      <div className="space-y-6">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Campaña Generada</h2>
            <p className="text-sm text-gray-500 mt-1">
              {r.campaign_type === 'brand_awareness' ? '🌍 Brand Awareness' : '🎯 Client Acquisition'}
              {' · '}{r.phase_context?.phase}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={generateCampaign}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm"
            >
              {isGenerating ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <RefreshCw className="w-4 h-4" />}
              Regenerar
            </button>
            <button
              onClick={resetWizard}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm"
            >
              Nueva Campaña
            </button>
          </div>
        </div>

        {/* Language + View toggle */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {(['en', 'es'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setSelectedLanguage(l)}
                className={`px-5 py-2 rounded-lg font-medium transition-all text-sm ${
                  selectedLanguage === l
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {l === 'en' ? 'English' : 'Español'}
              </button>
            ))}
          </div>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setResultTab('edit')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                resultTab === 'edit' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Editor
            </button>
            <button
              onClick={() => setResultTab('preview')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                resultTab === 'preview' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Preview LinkedIn
            </button>
          </div>
        </div>

        {/* ============ PREVIEW TAB ============ */}
        {resultTab === 'preview' && (
          <div className="flex justify-center">
            <LinkedInPostPreview
              name={linkedinProfile?.name || 'Hugo Rodrigo'}
              headline="Co-founder at CodlyLabs"
              avatarUrl={linkedinProfile?.picture}
              postText={`${lang === 'es' ? r.headline_es : r.headline_en}\n\n${lang === 'es' ? r.body_es : r.body_en}`}
              imageConceptText={r.suggested_image_concept}
              carouselSlides={r.carousel_slides}
              lang={lang}
            />
          </div>
        )}

        {/* ============ EDITOR TAB ============ */}
        {resultTab === 'edit' && (
        <>
        {/* Ad content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Headline</label>
            <div className="mt-1 p-3 bg-gray-50 rounded-lg text-lg font-semibold text-gray-900">
              {lang === 'es' ? r.headline_es : r.headline_en}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Body Copy</label>
            <div className="mt-1 p-4 bg-gray-50 rounded-lg text-sm text-gray-800 whitespace-pre-wrap leading-relaxed min-h-[200px]">
              {lang === 'es' ? r.body_es : r.body_en}
            </div>
          </div>
          {r.cta_label && (
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">CTA</label>
              <div className="mt-1 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold">
                {r.cta_label}
              </div>
            </div>
          )}

          {/* Carousel slides */}
          {r.carousel_slides && r.carousel_slides.length > 0 && (
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Carousel Slides</label>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {r.carousel_slides.map((slide: any, i: number) => (
                  <div key={i} className="flex-shrink-0 w-64 p-4 bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-xl">
                    <span className="text-[10px] font-bold text-blue-500 uppercase">Slide {slide.slide_num || i + 1}</span>
                    <h4 className="text-sm font-bold text-gray-800 mt-1">
                      {lang === 'es' ? slide.headline_es : slide.headline_en}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">
                      {lang === 'es' ? slide.description_es : slide.description_en}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Copy buttons */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => {
                const headline = lang === 'es' ? r.headline_es : r.headline_en
                const body = lang === 'es' ? r.body_es : r.body_en
                copyToClipboard(`${headline}\n\n${body}`, 'ad_copy')
              }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all ${
                copiedField === 'ad_copy'
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {copiedField === 'ad_copy' ? <><CheckCircle className="w-4 h-4" /> Copiado!</> : <><Clipboard className="w-4 h-4" /> Copiar Ad Copy</>}
            </button>

            {/* Publish to LinkedIn button */}
            {linkedinConnected ? (
              <button
                onClick={() => {
                  const headline = lang === 'es' ? r.headline_es : r.headline_en
                  const body = lang === 'es' ? r.body_es : r.body_en
                  publishToLinkedIn(`${headline}\n\n${body}`)
                }}
                disabled={isPublishing}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all ${
                  publishResult?.status === 'published'
                    ? 'bg-green-600 text-white'
                    : 'bg-[#0A66C2] text-white hover:bg-[#004182]'
                } disabled:opacity-50`}
              >
                {isPublishing ? (
                  <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Publicando...</>
                ) : publishResult?.status === 'published' ? (
                  <><CheckCircle className="w-4 h-4" /> Publicado en LinkedIn!</>
                ) : (
                  <><ArrowRight className="w-4 h-4" /> Publicar en LinkedIn</>
                )}
              </button>
            ) : (
              <button
                onClick={connectLinkedIn}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
              >
                <ArrowRight className="w-4 h-4" />
                Conectar LinkedIn para publicar
              </button>
            )}
          </div>

          {/* LinkedIn connection info */}
          {linkedinConnected && linkedinProfile && (
            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-xs text-green-700">Conectado como <strong>{linkedinProfile.name}</strong></span>
            </div>
          )}
        </div>
        </>
        )}

        {/* Image concept */}
        {r.suggested_image_concept && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <label className="text-xs font-bold text-amber-600 uppercase tracking-wider block mb-1">Concepto Visual</label>
            <p className="text-sm text-amber-800">{r.suggested_image_concept}</p>
          </div>
        )}

        {/* Metadata cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Budget */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Presupuesto</span>
            </div>
            <p className="text-lg font-bold text-gray-900">{r.budget_recommendation || r.phase_context?.budget}</p>
            <p className="text-xs text-gray-400 mt-1">Bidding: {r.bidding_strategy}</p>
          </div>

          {/* Audience */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Audiencia</span>
            </div>
            {r.audience_config && (
              <>
                <div className="flex flex-wrap gap-1">
                  {r.audience_config.job_titles?.map((t: string) => (
                    <span key={t} className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">{t}</span>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">{r.audience_config.company_size} employees</p>
              </>
            )}
          </div>

          {/* KPIs */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">KPIs</span>
            </div>
            <p className="text-sm text-gray-700 font-medium">{r.phase_context?.kpi}</p>
            {r.kpis && (
              <div className="flex flex-wrap gap-1 mt-2">
                {r.kpis.map((k: string) => (
                  <span key={k} className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">{k}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Retargeting */}
        {r.retargeting && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-4 h-4 text-orange-600" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Retargeting Segments</span>
            </div>
            <div className="space-y-3">
              {Object.entries(r.retargeting).map(([segId, seg]: [string, any]) => (
                <div key={segId} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                  <ArrowRight className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-orange-700">{seg.trigger}</p>
                    <p className="text-sm text-orange-900 mt-0.5">"{seg.message}"</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quality checklist */}
        {r.quality_checklist && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Quality Checklist</span>
            </div>
            <div className="space-y-2">
              {r.quality_checklist.map((item: any) => (
                <label key={item.id} className="flex items-start gap-3 text-sm text-gray-700 cursor-pointer">
                  <input type="checkbox" className="mt-0.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                  <span>{lang === 'es' ? item.label_es : item.label_en}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Full plan view
  // ---------------------------------------------------------------------------
  function renderFullPlan() {
    if (!fullPlanResult) return null
    const plan = fullPlanResult
    const lang = selectedLanguage

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Plan de Campaña Completo</h2>
            <p className="text-sm text-gray-500 mt-1">
              {plan.campaign_type === 'brand_awareness' ? '🌍 Brand Awareness' : '🎯 Client Acquisition'}
              {' · '}{plan.timeline}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={generateFullPlan}
              disabled={isGeneratingPlan}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm"
            >
              {isGeneratingPlan ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <RefreshCw className="w-4 h-4" />}
              Regenerar Plan
            </button>
            <button onClick={resetWizard} className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm">
              Nueva Campaña
            </button>
          </div>
        </div>

        {/* Language toggle */}
        <div className="flex gap-2">
          {(['en', 'es'] as const).map((l) => (
            <button
              key={l}
              onClick={() => setSelectedLanguage(l)}
              className={`px-5 py-2 rounded-lg font-medium transition-all text-sm ${
                selectedLanguage === l ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {l === 'en' ? 'English' : 'Español'}
            </button>
          ))}
        </div>

        {/* Strategy summary */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-2">Estrategia</h3>
          <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
            {lang === 'es' ? plan.strategy_summary_es : plan.strategy_summary_en}
          </p>
        </div>

        {/* Budget + KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Presupuesto Total</span>
            </div>
            <p className="text-xl font-bold text-gray-900">{plan.total_budget_estimate}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">KPIs Principales</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {plan.primary_kpis?.map((kpi: string) => (
                <span key={kpi} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">{kpi}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Phases */}
        {plan.phases?.map((phase: any, phaseIdx: number) => (
          <div key={phaseIdx} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-white font-bold">{lang === 'es' ? phase.phase_name_es : phase.phase_name_en}</h3>
                <p className="text-gray-300 text-sm mt-0.5">{lang === 'es' ? phase.goal_es : phase.goal_en}</p>
              </div>
              <div className="text-right">
                <span className="text-white font-semibold">{phase.budget}</span>
                <p className="text-gray-400 text-xs mt-0.5">KPI: {phase.kpi}</p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {phase.ads?.map((ad: any, adIdx: number) => (
                <div key={adIdx} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full uppercase">
                        {ad.format?.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                        {ad.track}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {ad.daily_budget}/day · {ad.bidding}
                    </div>
                  </div>
                  <h4 className="font-semibold text-gray-900 text-sm">
                    {lang === 'es' ? ad.headline_es : ad.headline_en}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {lang === 'es' ? ad.body_summary_es : ad.body_summary_en}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-blue-600 font-medium">CTA: {ad.cta}</span>
                    <button
                      onClick={() => {
                        const text = `${lang === 'es' ? ad.headline_es : ad.headline_en}\n\n${lang === 'es' ? ad.body_summary_es : ad.body_summary_en}`
                        copyToClipboard(text, `plan_ad_${phaseIdx}_${adIdx}`)
                      }}
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      {copiedField === `plan_ad_${phaseIdx}_${adIdx}` ? <CheckCircle className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                      {copiedField === `plan_ad_${phaseIdx}_${adIdx}` ? 'Copiado' : 'Copiar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Copy full plan */}
        <button
          onClick={() => copyToClipboard(JSON.stringify(fullPlanResult, null, 2), 'full_plan')}
          className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold transition-all ${
            copiedField === 'full_plan' ? 'bg-green-600 text-white' : 'bg-gray-800 text-white hover:bg-gray-900'
          }`}
        >
          {copiedField === 'full_plan' ? <><CheckCircle className="w-5 h-5" /> Plan copiado!</> : <><Clipboard className="w-5 h-5" /> Copiar Plan Completo (JSON)</>}
        </button>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Main render
  // ---------------------------------------------------------------------------
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar currentPage="linkedin" onLogout={handleLogout} />

      <div className="flex-1 p-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Campaign Generator</h1>
              <p className="text-gray-500 text-sm">CRO Expert Agent — powered by AI</p>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Loading */}
        {isLoadingConfig && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Wizard mode */}
        {config && viewMode === 'wizard' && (
          <>
            <StepIndicator />

            <div className="min-h-[400px]">
              {currentStep === 0 && renderStepType()}
              {currentStep === 1 && renderStepAudience()}
              {currentStep === 2 && renderStepVertical()}
              {currentStep === 3 && renderStepPhase()}
              {currentStep === 4 && renderStepFormat()}
              {currentStep === 5 && renderStepContext()}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className="flex items-center gap-2 px-5 py-2.5 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>

              {currentStep < STEPS.length - 1 ? (
                <button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  disabled={!canProceed()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={generateCampaign}
                  disabled={isGenerating || !canProceed()}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all font-semibold shadow-lg shadow-blue-600/20"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      CRO Agent generando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generar Campaña
                    </>
                  )}
                </button>
              )}
            </div>
          </>
        )}

        {/* Result mode */}
        {viewMode === 'result' && renderResult()}

        {/* Full plan mode */}
        {viewMode === 'full_plan' && renderFullPlan()}
      </div>
    </div>
  )
}
