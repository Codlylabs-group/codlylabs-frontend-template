import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Plus, MessageSquare, Copy, CheckCircle, Trash2, Sparkles } from 'lucide-react'
import { api } from '../services/api'
import { useAppSelector, useAppDispatch } from '../store/hooks'
import { clearAuth } from '../store/userSlice'
import AdminSidebar from '../components/AdminSidebar'

interface Prospect {
  id: string
  full_name: string
  job_title?: string
  company?: string
  industry?: string
  linkedin_url?: string
  status: string
  generated_dm_es?: string
  generated_dm_en?: string
  pain_point_title?: string
  pain_point_description?: string
  notes?: string
  created_at: string
}

interface PainPoint {
  id: number
  title: string
  description: string
}

export default function AdminLinkedInOutreachPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const userData = useAppSelector((state) => state.user.user)

  const [prospects, setProspects] = useState<Prospect[]>([])
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showDMGenerator, setShowDMGenerator] = useState(false)

  // Pain points for DM generation
  const [painPoints, setPainPoints] = useState<PainPoint[]>([])
  const [selectedPainPoint, setSelectedPainPoint] = useState<PainPoint | null>(null)
  const [dmTone, setDmTone] = useState<string>('professional')
  const [selectedLanguage, setSelectedLanguage] = useState<'es' | 'en'>('es')

  // Form states
  const [formData, setFormData] = useState({
    full_name: '',
    job_title: '',
    company: '',
    industry: '',
    linkedin_url: '',
    notes: ''
  })

  // Loading and status states
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingPainPoints, setIsLoadingPainPoints] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!userData) {
      navigate('/admin/login')
      return
    }
    loadProspects()
  }, [userData, navigate])

  const loadProspects = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await api.get('/api/v1/admin/linkedin-outreach/prospects')
      setProspects(response.data.prospects)
    } catch (err: any) {
      console.error('Error loading prospects:', err)
      setError(err.response?.data?.detail || 'Error al cargar prospectos')
    } finally {
      setIsLoading(false)
    }
  }

  const loadPainPoints = async () => {
    setIsLoadingPainPoints(true)
    setError('')

    try {
      const response = await api.get('/api/v1/admin/linkedin/pain-points')
      setPainPoints(response.data.pain_points)
    } catch (err: any) {
      console.error('Error loading pain points:', err)
      setError(err.response?.data?.detail || 'Error al cargar pain points')
    } finally {
      setIsLoadingPainPoints(false)
    }
  }

  const addProspect = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      await api.post('/api/v1/admin/linkedin-outreach/prospects', formData)
      setShowAddForm(false)
      setFormData({ full_name: '', job_title: '', company: '', industry: '', linkedin_url: '', notes: '' })
      loadProspects()
    } catch (err: any) {
      console.error('Error adding prospect:', err)
      setError(err.response?.data?.detail || 'Error al agregar prospecto')
    }
  }

  const deleteProspect = async (id: string) => {
    if (!confirm('¿Seguro que quieres eliminar este prospecto?')) return

    try {
      await api.delete(`/api/v1/admin/linkedin-outreach/prospects/${id}`)
      loadProspects()
      if (selectedProspect?.id === id) {
        setSelectedProspect(null)
        setShowDMGenerator(false)
      }
    } catch (err: any) {
      console.error('Error deleting prospect:', err)
      setError(err.response?.data?.detail || 'Error al eliminar prospecto')
    }
  }

  const updateProspectStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/api/v1/admin/linkedin-outreach/prospects/${id}`, { status })
      loadProspects()
      if (selectedProspect?.id === id) {
        setSelectedProspect({ ...selectedProspect, status })
      }
    } catch (err: any) {
      console.error('Error updating status:', err)
      setError(err.response?.data?.detail || 'Error al actualizar estado')
    }
  }

  const openDMGenerator = (prospect: Prospect) => {
    setSelectedProspect(prospect)
    setShowDMGenerator(true)
    if (painPoints.length === 0) {
      loadPainPoints()
    }
  }

  const generateDM = async () => {
    if (!selectedProspect || !selectedPainPoint) return

    setIsGenerating(true)
    setError('')

    try {
      const response = await api.post(
        `/api/v1/admin/linkedin-outreach/prospects/${selectedProspect.id}/generate-dm`,
        {
          prospect_id: selectedProspect.id,
          pain_point_title: selectedPainPoint.title,
          pain_point_description: selectedPainPoint.description,
          tone: dmTone
        }
      )

      setSelectedProspect({
        ...selectedProspect,
        generated_dm_es: response.data.dm_es,
        generated_dm_en: response.data.dm_en,
        pain_point_title: selectedPainPoint.title,
        pain_point_description: selectedPainPoint.description,
        status: 'message_generated'
      })
      loadProspects()
    } catch (err: any) {
      console.error('Error generating DM:', err)
      setError(err.response?.data?.detail || 'Error al generar DM')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyDM = async (language: 'es' | 'en') => {
    if (!selectedProspect) return

    const dm = language === 'es' ? selectedProspect.generated_dm_es : selectedProspect.generated_dm_en
    if (!dm) return

    try {
      await navigator.clipboard.writeText(dm)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      console.error('Error copying:', err)
    }
  }

  const handleLogout = () => {
    dispatch(clearAuth())
    navigate('/admin/login')
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-gray-100 text-gray-700',
      message_generated: 'bg-blue-100 text-blue-700',
      contacted: 'bg-yellow-100 text-yellow-700',
      responded: 'bg-green-100 text-green-700',
      converted: 'bg-purple-100 text-purple-700',
      not_interested: 'bg-red-100 text-red-700'
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      message_generated: 'Mensaje Generado',
      contacted: 'Contactado',
      responded: 'Respondió',
      converted: 'Convertido',
      not_interested: 'No Interesado'
    }
    return labels[status] || status
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar currentPage="linkedin-outreach" onLogout={handleLogout} />

      <div className="flex-1 p-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">LinkedIn Outreach</h1>
          </div>
          <p className="text-gray-600">Gestiona prospectos y genera DMs personalizados</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Prospects List */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Prospectos</h2>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Agregar
              </button>
            </div>

            {showAddForm && (
              <form onSubmit={addProspect} className="mb-6 p-4 bg-gray-50 rounded-lg">
                <input
                  type="text"
                  placeholder="Nombre completo *"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full mb-2 px-3 py-2 border rounded-lg"
                  required
                />
                <input
                  type="text"
                  placeholder="Cargo"
                  value={formData.job_title}
                  onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                  className="w-full mb-2 px-3 py-2 border rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Empresa"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full mb-2 px-3 py-2 border rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Industria"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full mb-2 px-3 py-2 border rounded-lg"
                />
                <input
                  type="url"
                  placeholder="LinkedIn URL"
                  value={formData.linkedin_url}
                  onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                  className="w-full mb-2 px-3 py-2 border rounded-lg"
                />
                <textarea
                  placeholder="Notas"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full mb-2 px-3 py-2 border rounded-lg"
                  rows={2}
                />
                <div className="flex gap-2">
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {isLoading ? (
                <p className="text-gray-500 text-center py-8">Cargando...</p>
              ) : prospects.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No hay prospectos aún</p>
              ) : (
                prospects.map((prospect) => (
                  <div
                    key={prospect.id}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedProspect?.id === prospect.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => setSelectedProspect(prospect)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{prospect.full_name}</h3>
                        {prospect.job_title && (
                          <p className="text-sm text-gray-600">{prospect.job_title}</p>
                        )}
                        {prospect.company && (
                          <p className="text-sm text-gray-500">{prospect.company}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            openDMGenerator(prospect)
                          }}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                          title="Generar DM"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteProspect(prospect.id)
                          }}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <span className={`inline-block px-2 py-1 text-xs rounded ${getStatusColor(prospect.status)}`}>
                      {getStatusLabel(prospect.status)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* DM Generator / Prospect Detail */}
          <div className="bg-white rounded-lg shadow p-6">
            {!selectedProspect ? (
              <div className="flex items-center justify-center h-96 text-gray-400">
                <div className="text-center">
                  <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Selecciona un prospecto para generar DM</p>
                </div>
              </div>
            ) : !showDMGenerator && !selectedProspect.generated_dm_es ? (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold mb-4">{selectedProspect.full_name}</h3>
                <button
                  onClick={() => openDMGenerator(selectedProspect)}
                  className="flex items-center gap-2 mx-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Sparkles className="w-5 h-5" />
                  Generar DM Personalizado
                </button>
              </div>
            ) : showDMGenerator && !selectedProspect.generated_dm_es ? (
              <div>
                <h3 className="text-xl font-semibold mb-4">Generar DM para {selectedProspect.full_name}</h3>

                {painPoints.length === 0 ? (
                  <div className="text-center py-8">
                    <button
                      onClick={loadPainPoints}
                      disabled={isLoadingPainPoints}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isLoadingPainPoints ? 'Cargando...' : 'Cargar Pain Points'}
                    </button>
                  </div>
                ) : !selectedPainPoint ? (
                  <div>
                    <p className="mb-4 text-gray-600">Selecciona un pain point:</p>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {painPoints.map((pp) => (
                        <button
                          key={pp.id}
                          onClick={() => setSelectedPainPoint(pp)}
                          className="w-full text-left p-3 border-2 border-gray-200 rounded-lg hover:border-blue-500"
                        >
                          <p className="font-medium">{pp.title}</p>
                          <p className="text-sm text-gray-600">{pp.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <p className="font-medium">{selectedPainPoint.title}</p>
                      <p className="text-sm text-gray-600">{selectedPainPoint.description}</p>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">Tono:</label>
                      <div className="flex gap-2">
                        {['professional', 'casual', 'friendly'].map((tone) => (
                          <button
                            key={tone}
                            onClick={() => setDmTone(tone)}
                            className={`px-4 py-2 rounded-lg ${
                              dmTone === tone
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {tone === 'professional' ? 'Profesional' : tone === 'casual' ? 'Casual' : 'Amigable'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={generateDM}
                      disabled={isGenerating}
                      className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isGenerating ? 'Generando...' : 'Generar DM'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-semibold mb-4">DM para {selectedProspect.full_name}</h3>

                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setSelectedLanguage('es')}
                    className={`px-4 py-2 rounded-lg ${
                      selectedLanguage === 'es' ? 'bg-blue-600 text-white' : 'bg-gray-100'
                    }`}
                  >
                    🇪🇸 Español
                  </button>
                  <button
                    onClick={() => setSelectedLanguage('en')}
                    className={`px-4 py-2 rounded-lg ${
                      selectedLanguage === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-100'
                    }`}
                  >
                    🇬🇧 English
                  </button>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg mb-4">
                  <p className="text-gray-800 whitespace-pre-wrap">
                    {selectedLanguage === 'es' ? selectedProspect.generated_dm_es : selectedProspect.generated_dm_en}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <button
                    onClick={() => copyDM('es')}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {isCopied && selectedLanguage === 'es' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    Copiar ES
                  </button>
                  <button
                    onClick={() => copyDM('en')}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {isCopied && selectedLanguage === 'en' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    Copy EN
                  </button>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Actualizar estado:</label>
                  <select
                    value={selectedProspect.status}
                    onChange={(e) => updateProspectStatus(selectedProspect.id, e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="pending">Pendiente</option>
                    <option value="message_generated">Mensaje Generado</option>
                    <option value="contacted">Contactado</option>
                    <option value="responded">Respondió</option>
                    <option value="converted">Convertido</option>
                    <option value="not_interested">No Interesado</option>
                  </select>
                </div>

                <button
                  onClick={() => {
                    setShowDMGenerator(true)
                    setSelectedPainPoint(null)
                  }}
                  className="text-blue-600 hover:underline text-sm"
                >
                  Regenerar DM
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
