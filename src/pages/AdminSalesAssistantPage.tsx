import { useState, useEffect } from 'react'
import { MessageSquare, Calendar, AlertCircle, BarChart3, Copy, Check, Plus, Trash2 } from 'lucide-react'
import AdminSidebar from '../components/AdminSidebar'
import { api } from '../services/api'

type TabType = 'messages' | 'meet-prep' | 'objections' | 'deals'
type MessageType = 'follow_up' | 'pre_meeting' | 'post_meeting' | 'proposal' | 'close'
type Language = 'es' | 'en'

interface Deal {
  id: string
  prospect_name: string
  company: string
  email: string
  linkedin_url?: string
  job_title?: string
  industry?: string
  stage: string
  value?: number
  pain_point?: string
  last_contact_date?: string
  next_follow_up_date?: string
  meeting_date?: string
  notes?: string
  generated_prep?: string
  lost_reason?: string
  created_at: string
  updated_at?: string
  closed_at?: string
}

interface GeneratedMessage {
  message_es: string
  message_en: string
  subject_es: string
  subject_en: string
}

interface GeneratedMeetPrep {
  agenda: string
  questions: string[]
  demo_flow: string
  objections_prep: string[]
  pricing_script: string
  closing_questions: string[]
}

interface Objection {
  title: string
  category: string
  response_es: string
  response_en: string
}

export default function AdminSalesAssistantPage() {
  const [activeTab, setActiveTab] = useState<TabType>('messages')
  const [language, setLanguage] = useState<Language>('es')
  const [copiedField, setCopiedField] = useState<string | null>(null)

  // Message Generator State
  const [messageType, setMessageType] = useState<MessageType>('follow_up')
  const [prospectName, setProspectName] = useState('')
  const [prospectCompany, setProspectCompany] = useState('')
  const [prospectPainPoint, setProspectPainPoint] = useState('')
  const [contextInfo, setContextInfo] = useState('')
  const [generatedMessage, setGeneratedMessage] = useState<GeneratedMessage | null>(null)
  const [isGeneratingMessage, setIsGeneratingMessage] = useState(false)

  // Meet Prep State
  const [meetProspectName, setMeetProspectName] = useState('')
  const [meetCompany, setMeetCompany] = useState('')
  const [meetPainPoint, setMeetPainPoint] = useState('')
  const [meetObjective, setMeetObjective] = useState('')
  const [generatedMeetPrep, setGeneratedMeetPrep] = useState<GeneratedMeetPrep | null>(null)
  const [isGeneratingMeetPrep, setIsGeneratingMeetPrep] = useState(false)

  // Objections State
  const [objections, setObjections] = useState<Objection[]>([])
  const [loadingObjections, setLoadingObjections] = useState(false)

  // Deals State
  const [deals, setDeals] = useState<Deal[]>([])
  const [loadingDeals, setLoadingDeals] = useState(false)
  const [showAddDeal, setShowAddDeal] = useState(false)
  const [newDeal, setNewDeal] = useState({
    prospect_name: '',
    company: '',
    email: '',
    linkedin_url: '',
    job_title: '',
    industry: '',
    stage: 'lead',
    value: '',
    pain_point: '',
    notes: ''
  })

  // Auth headers are handled automatically by the api interceptor

  // Load objections
  useEffect(() => {
    if (activeTab === 'objections') {
      loadObjections()
    }
  }, [activeTab])

  // Load deals
  useEffect(() => {
    if (activeTab === 'deals') {
      loadDeals()
    }
  }, [activeTab])

  const loadObjections = async () => {
    setLoadingObjections(true)
    try {
      const response = await api.get('/api/v1/admin/sales-assistant/objections')
      setObjections(response.data.objections)
    } catch (error) {
      console.error('Error loading objections:', error)
    } finally {
      setLoadingObjections(false)
    }
  }

  const loadDeals = async () => {
    setLoadingDeals(true)
    try {
      const response = await api.get('/api/v1/admin/sales-assistant/deals')
      setDeals(response.data.deals)
    } catch (error) {
      console.error('Error loading deals:', error)
    } finally {
      setLoadingDeals(false)
    }
  }

  const generateMessage = async () => {
    if (!prospectName.trim()) {
      alert('Por favor ingresa el nombre del prospecto')
      return
    }

    setIsGeneratingMessage(true)
    try {
      const response = await api.post(
        '/api/v1/admin/sales-assistant/generate-message',
        {
          message_type: messageType,
          prospect_name: prospectName,
          company: prospectCompany,
          pain_point: prospectPainPoint,
          context: contextInfo
        }
      )
      setGeneratedMessage(response.data)
    } catch (error) {
      console.error('Error generating message:', error)
      alert('Error al generar el mensaje')
    } finally {
      setIsGeneratingMessage(false)
    }
  }

  const generateMeetPrep = async () => {
    if (!meetProspectName.trim()) {
      alert('Por favor ingresa el nombre del prospecto')
      return
    }

    setIsGeneratingMeetPrep(true)
    try {
      const response = await api.post(
        '/api/v1/admin/sales-assistant/generate-meet-prep',
        {
          prospect_name: meetProspectName,
          company: meetCompany,
          pain_point: meetPainPoint,
          meeting_objective: meetObjective
        }
      )
      setGeneratedMeetPrep(response.data)
    } catch (error) {
      console.error('Error generating meet prep:', error)
      alert('Error al generar la preparación de reunión')
    } finally {
      setIsGeneratingMeetPrep(false)
    }
  }

  const createDeal = async () => {
    if (!newDeal.prospect_name.trim()) {
      alert('Por favor ingresa el nombre del prospecto')
      return
    }

    try {
      await api.post(
        '/api/v1/admin/sales-assistant/deals',
        {
          prospect_name: newDeal.prospect_name,
          company: newDeal.company,
          email: newDeal.email,
          linkedin_url: newDeal.linkedin_url,
          job_title: newDeal.job_title,
          industry: newDeal.industry,
          stage: newDeal.stage,
          value: newDeal.value ? parseFloat(newDeal.value) : null,
          pain_point: newDeal.pain_point,
          notes: newDeal.notes
        }
      )
      setNewDeal({
        prospect_name: '',
        company: '',
        email: '',
        linkedin_url: '',
        job_title: '',
        industry: '',
        stage: 'lead',
        value: '',
        pain_point: '',
        notes: ''
      })
      setShowAddDeal(false)
      loadDeals()
    } catch (error) {
      console.error('Error creating deal:', error)
      alert('Error al crear el deal')
    }
  }

  const updateDealStage = async (dealId: string, newStage: string) => {
    try {
      await api.patch(
        `/api/v1/admin/sales-assistant/deals/${dealId}`,
        { stage: newStage }
      )
      loadDeals()
    } catch (error) {
      console.error('Error updating deal:', error)
      alert('Error al actualizar el deal')
    }
  }

  const deleteDeal = async (dealId: string) => {
    if (!confirm('¿Estás seguro de eliminar este deal?')) return

    try {
      await api.delete(`/api/v1/admin/sales-assistant/deals/${dealId}`)
      loadDeals()
    } catch (error) {
      console.error('Error deleting deal:', error)
      alert('Error al eliminar el deal')
    }
  }

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (error) {
      console.error('Error copying to clipboard:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    window.location.href = '/admin/login'
  }

  const messageTypeLabels = {
    follow_up: 'Seguimiento',
    pre_meeting: 'Pre-reunión',
    post_meeting: 'Post-reunión',
    proposal: 'Propuesta',
    close: 'Cierre'
  }

  const dealStages = [
    { value: 'lead', label: 'Lead', color: 'bg-gray-100 text-gray-800' },
    { value: 'engaged', label: 'Engaged', color: 'bg-blue-100 text-blue-800' },
    { value: 'meeting_scheduled', label: 'Reunión agendada', color: 'bg-purple-100 text-purple-800' },
    { value: 'meeting_completed', label: 'Reunión realizada', color: 'bg-brand-100 text-brand-800' },
    { value: 'proposal_sent', label: 'Propuesta enviada', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'negotiation', label: 'Negociación', color: 'bg-orange-100 text-orange-800' },
    { value: 'won', label: 'Ganado', color: 'bg-green-100 text-green-800' },
    { value: 'lost', label: 'Perdido', color: 'bg-red-100 text-red-800' }
  ]

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar currentPage="sales-assistant" onLogout={handleLogout} />

      <div className="flex-1">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Sales Copilot</h1>
          <p className="text-gray-600 mt-2">Tu asistente de ventas con IA</p>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200 px-8">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('messages')}
              className={`flex items-center gap-2 px-4 py-4 border-b-2 transition-colors ${
                activeTab === 'messages'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              Mensajes
            </button>
            <button
              onClick={() => setActiveTab('meet-prep')}
              className={`flex items-center gap-2 px-4 py-4 border-b-2 transition-colors ${
                activeTab === 'meet-prep'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calendar className="w-5 h-5" />
              Preparación de Reuniones
            </button>
            <button
              onClick={() => setActiveTab('objections')}
              className={`flex items-center gap-2 px-4 py-4 border-b-2 transition-colors ${
                activeTab === 'objections'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <AlertCircle className="w-5 h-5" />
              Objeciones
            </button>
            <button
              onClick={() => setActiveTab('deals')}
              className={`flex items-center gap-2 px-4 py-4 border-b-2 transition-colors ${
                activeTab === 'deals'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              Pipeline
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <div className="max-w-4xl">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Generador de Mensajes</h2>

                {/* Message Type */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de mensaje
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {Object.entries(messageTypeLabels).map(([value, label]) => (
                      <button
                        key={value}
                        onClick={() => setMessageType(value as MessageType)}
                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                          messageType === value
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-600'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input Fields */}
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del prospecto *
                    </label>
                    <input
                      type="text"
                      value={prospectName}
                      onChange={(e) => setProspectName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      placeholder="Ej: Juan Pérez"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Empresa
                    </label>
                    <input
                      type="text"
                      value={prospectCompany}
                      onChange={(e) => setProspectCompany(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      placeholder="Ej: TechCorp"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pain Point
                    </label>
                    <input
                      type="text"
                      value={prospectPainPoint}
                      onChange={(e) => setProspectPainPoint(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      placeholder="Ej: Procesos manuales lentos"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contexto adicional
                    </label>
                    <textarea
                      value={contextInfo}
                      onChange={(e) => setContextInfo(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      rows={3}
                      placeholder="Información adicional sobre la conversación previa..."
                    />
                  </div>
                </div>

                <button
                  onClick={generateMessage}
                  disabled={isGeneratingMessage || !prospectName.trim()}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                >
                  {isGeneratingMessage ? 'Generando...' : 'Generar Mensaje'}
                </button>

                {/* Generated Message */}
                {generatedMessage && (
                  <div className="mt-6 space-y-4">
                    {/* Language Selector */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setLanguage('es')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          language === 'es'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        🇪🇸 Español
                      </button>
                      <button
                        onClick={() => setLanguage('en')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          language === 'en'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        🇬🇧 English
                      </button>
                    </div>

                    {/* Subject */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-700">Asunto</h3>
                        <button
                          onClick={() => copyToClipboard(
                            language === 'es' ? generatedMessage.subject_es : generatedMessage.subject_en,
                            'subject'
                          )}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          {copiedField === 'subject' ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <p className="text-gray-900">
                        {language === 'es' ? generatedMessage.subject_es : generatedMessage.subject_en}
                      </p>
                    </div>

                    {/* Message */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-700">Mensaje</h3>
                        <button
                          onClick={() => copyToClipboard(
                            language === 'es' ? generatedMessage.message_es : generatedMessage.message_en,
                            'message'
                          )}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          {copiedField === 'message' ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <p className="text-gray-900 whitespace-pre-wrap">
                        {language === 'es' ? generatedMessage.message_es : generatedMessage.message_en}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Meet Prep Tab */}
          {activeTab === 'meet-prep' && (
            <div className="max-w-4xl">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Preparación de Reuniones</h2>

                {/* Input Fields */}
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del prospecto *
                    </label>
                    <input
                      type="text"
                      value={meetProspectName}
                      onChange={(e) => setMeetProspectName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      placeholder="Ej: María González"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Empresa
                    </label>
                    <input
                      type="text"
                      value={meetCompany}
                      onChange={(e) => setMeetCompany(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      placeholder="Ej: InnovateCorp"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pain Point
                    </label>
                    <input
                      type="text"
                      value={meetPainPoint}
                      onChange={(e) => setMeetPainPoint(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      placeholder="Ej: Falta de visibilidad en métricas"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Objetivo de la reunión
                    </label>
                    <input
                      type="text"
                      value={meetObjective}
                      onChange={(e) => setMeetObjective(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      placeholder="Ej: Demostrar ROI y agendar prueba piloto"
                    />
                  </div>
                </div>

                <button
                  onClick={generateMeetPrep}
                  disabled={isGeneratingMeetPrep || !meetProspectName.trim()}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                >
                  {isGeneratingMeetPrep ? 'Generando...' : 'Generar Preparación'}
                </button>

                {/* Generated Meet Prep */}
                {generatedMeetPrep && (
                  <div className="mt-6 space-y-6">
                    {/* Agenda */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-700">Agenda</h3>
                        <button
                          onClick={() => copyToClipboard(generatedMeetPrep.agenda, 'agenda')}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          {copiedField === 'agenda' ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <p className="text-gray-900 whitespace-pre-wrap">{generatedMeetPrep.agenda}</p>
                    </div>

                    {/* Questions */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Preguntas clave</h3>
                      <ul className="list-disc list-inside space-y-1 text-gray-900">
                        {generatedMeetPrep.questions.map((q, i) => (
                          <li key={i}>{q}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Demo Flow */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-700">Flujo de Demo</h3>
                        <button
                          onClick={() => copyToClipboard(generatedMeetPrep.demo_flow, 'demo')}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          {copiedField === 'demo' ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <p className="text-gray-900 whitespace-pre-wrap">{generatedMeetPrep.demo_flow}</p>
                    </div>

                    {/* Objections Prep */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Posibles objeciones</h3>
                      <ul className="list-disc list-inside space-y-1 text-gray-900">
                        {generatedMeetPrep.objections_prep.map((o, i) => (
                          <li key={i}>{o}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Pricing Script */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-700">Script de Pricing</h3>
                        <button
                          onClick={() => copyToClipboard(generatedMeetPrep.pricing_script, 'pricing')}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          {copiedField === 'pricing' ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <p className="text-gray-900 whitespace-pre-wrap">{generatedMeetPrep.pricing_script}</p>
                    </div>

                    {/* Closing Questions */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Preguntas de cierre</h3>
                      <ul className="list-disc list-inside space-y-1 text-gray-900">
                        {generatedMeetPrep.closing_questions.map((q, i) => (
                          <li key={i}>{q}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Objections Tab */}
          {activeTab === 'objections' && (
            <div className="max-w-4xl">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Manejo de Objeciones</h2>

                {/* Language Selector */}
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => setLanguage('es')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      language === 'es'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    🇪🇸 Español
                  </button>
                  <button
                    onClick={() => setLanguage('en')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      language === 'en'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    🇬🇧 English
                  </button>
                </div>

                {loadingObjections ? (
                  <div className="text-center py-8 text-gray-600">Cargando objeciones...</div>
                ) : (
                  <div className="space-y-4">
                    {objections.map((objection, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-medium text-gray-900">{objection.title}</h3>
                            <span className="text-xs text-gray-500 uppercase">{objection.category}</span>
                          </div>
                          <button
                            onClick={() => copyToClipboard(
                              language === 'es' ? objection.response_es : objection.response_en,
                              `objection-${index}`
                            )}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            {copiedField === `objection-${index}` ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {language === 'es' ? objection.response_es : objection.response_en}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Deals Tab */}
          {activeTab === 'deals' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Pipeline de Ventas</h2>
                <button
                  onClick={() => setShowAddDeal(!showAddDeal)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Nuevo Deal
                </button>
              </div>

              {/* Add Deal Form */}
              {showAddDeal && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Crear nuevo deal</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre del prospecto *
                      </label>
                      <input
                        type="text"
                        value={newDeal.prospect_name}
                        onChange={(e) => setNewDeal({ ...newDeal, prospect_name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Empresa</label>
                      <input
                        type="text"
                        value={newDeal.company}
                        onChange={(e) => setNewDeal({ ...newDeal, company: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={newDeal.email}
                        onChange={(e) => setNewDeal({ ...newDeal, email: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn URL</label>
                      <input
                        type="text"
                        value={newDeal.linkedin_url}
                        onChange={(e) => setNewDeal({ ...newDeal, linkedin_url: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Cargo</label>
                      <input
                        type="text"
                        value={newDeal.job_title}
                        onChange={(e) => setNewDeal({ ...newDeal, job_title: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Industria</label>
                      <input
                        type="text"
                        value={newDeal.industry}
                        onChange={(e) => setNewDeal({ ...newDeal, industry: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Valor estimado ($)</label>
                      <input
                        type="number"
                        value={newDeal.value}
                        onChange={(e) => setNewDeal({ ...newDeal, value: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Stage inicial</label>
                      <select
                        value={newDeal.stage}
                        onChange={(e) => setNewDeal({ ...newDeal, stage: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      >
                        {dealStages.slice(0, -2).map((stage) => (
                          <option key={stage.value} value={stage.value}>
                            {stage.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Pain Point</label>
                      <textarea
                        value={newDeal.pain_point}
                        onChange={(e) => setNewDeal({ ...newDeal, pain_point: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                        rows={2}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Notas</label>
                      <textarea
                        value={newDeal.notes}
                        onChange={(e) => setNewDeal({ ...newDeal, notes: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                        rows={2}
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={createDeal}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Crear Deal
                    </button>
                    <button
                      onClick={() => setShowAddDeal(false)}
                      className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {/* Deals List */}
              {loadingDeals ? (
                <div className="text-center py-8 text-gray-600">Cargando deals...</div>
              ) : deals.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-600">
                  No hay deals en el pipeline. Crea uno para comenzar.
                </div>
              ) : (
                <div className="space-y-4">
                  {deals.map((deal) => {
                    const stage = dealStages.find((s) => s.value === deal.stage)
                    return (
                      <div key={deal.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-bold text-gray-900">{deal.prospect_name}</h3>
                              {deal.company && (
                                <span className="text-gray-600">@ {deal.company}</span>
                              )}
                              {stage && (
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${stage.color}`}>
                                  {stage.label}
                                </span>
                              )}
                            </div>
                            {deal.email && (
                              <p className="text-sm text-gray-600 mb-1">📧 {deal.email}</p>
                            )}
                            {deal.job_title && (
                              <p className="text-sm text-gray-600 mb-1">💼 {deal.job_title}</p>
                            )}
                            {deal.value && (
                              <p className="text-sm text-gray-600 mb-1">💰 ${deal.value.toLocaleString()}</p>
                            )}
                            {deal.pain_point && (
                              <p className="text-sm text-gray-700 mt-2">
                                <strong>Pain point:</strong> {deal.pain_point}
                              </p>
                            )}
                            {deal.notes && (
                              <p className="text-sm text-gray-700 mt-2">
                                <strong>Notas:</strong> {deal.notes}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <select
                              value={deal.stage}
                              onChange={(e) => updateDealStage(deal.id, e.target.value)}
                              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                            >
                              {dealStages.map((stage) => (
                                <option key={stage.value} value={stage.value}>
                                  {stage.label}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => deleteDeal(deal.id)}
                              className="text-red-600 hover:text-red-800 p-2"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
