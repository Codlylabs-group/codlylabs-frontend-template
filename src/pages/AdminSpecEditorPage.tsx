import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileEdit, Trash2, RefreshCw, Eye, CheckCircle, Clock, Send } from 'lucide-react'
import { api } from '../services/api'
import { useAppSelector, useAppDispatch } from '../store/hooks'
import { clearAuth } from '../store/userSlice'
import AdminSidebar from '../components/AdminSidebar'

interface PendingSpec {
  spec_id: string
  status: string
  goal: string
  poc_type: string
  edits_count: number
  created_at: string
}

interface SpecDetail {
  spec_id: string
  status: string
  spec: Record<string, any>
  original_prompt: string
  edits_count: number
  created_at: string
}

export default function AdminSpecEditorPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const userData = useAppSelector((state) => state.user.user)

  const [specs, setSpecs] = useState<PendingSpec[]>([])
  const [selectedSpec, setSelectedSpec] = useState<SpecDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [editJson, setEditJson] = useState('')

  useEffect(() => {
    if (!userData) {
      navigate('/admin/login')
      return
    }
    loadSpecs()
  }, [userData, navigate])

  const loadSpecs = async () => {
    setIsLoading(true)
    setError('')
    try {
      const res = await api.get('/api/v1/spec/')
      setSpecs(res.data.specs || [])
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/admin/login')
      }
      setError(err.response?.data?.detail || 'Error cargando specs')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerate = async () => {
    if (!prompt.trim() || prompt.length < 10) return
    setIsGenerating(true)
    setError('')
    try {
      const res = await api.post('/api/v1/spec/preview', { prompt })
      setPrompt('')
      await loadSpecs()
      await handleView(res.data.spec_id)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error generando spec')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleView = async (specId: string) => {
    try {
      const res = await api.get(`/api/v1/spec/${specId}`)
      setSelectedSpec(res.data)
      setEditJson(JSON.stringify(res.data.spec, null, 2))
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error cargando spec')
    }
  }

  const handleSave = async () => {
    if (!selectedSpec) return
    try {
      const parsed = JSON.parse(editJson)
      const updates: Record<string, any> = {}
      if (parsed.goal) updates.goal = parsed.goal
      if (parsed.inferred_poc_type) updates.inferred_poc_type = parsed.inferred_poc_type
      if (parsed.domain) updates.domain = parsed.domain
      if (parsed.acceptance_criteria) updates.acceptance_criteria = parsed.acceptance_criteria

      await api.put(`/api/v1/spec/${selectedSpec.spec_id}`, updates)
      await handleView(selectedSpec.spec_id)
      await loadSpecs()
    } catch (err: any) {
      setError(err instanceof SyntaxError ? 'JSON invalido' : (err.response?.data?.detail || 'Error guardando'))
    }
  }

  const handleConfirm = async () => {
    if (!selectedSpec) return
    if (!confirm('Confirmar spec e iniciar generacion?')) return
    try {
      const res = await api.post(`/api/v1/spec/${selectedSpec.spec_id}/confirm`)
      setSelectedSpec(null)
      await loadSpecs()
      alert(`Spec confirmado. poc_id: ${res.data.poc_id}`)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error confirmando spec')
    }
  }

  const handleDiscard = async (specId: string) => {
    if (!confirm('Descartar este spec?')) return
    try {
      await api.delete(`/api/v1/spec/${specId}`)
      if (selectedSpec?.spec_id === specId) setSelectedSpec(null)
      await loadSpecs()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error descartando spec')
    }
  }

  const handleLogout = () => {
    dispatch(clearAuth())
    navigate('/admin/login')
  }

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending_review: 'bg-yellow-100 text-yellow-800',
      edited: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-green-800',
    }
    return (
      <span className={`px-2 py-0.5 rounded text-xs ${colors[status] || 'bg-gray-100 text-gray-700'}`}>
        {status}
      </span>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar currentPage="spec-editor" onLogout={handleLogout} />

      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FileEdit className="w-8 h-8 text-brand-600" />
            <h1 className="text-2xl font-bold text-gray-900">Spec Editor</h1>
          </div>
          <button
            onClick={loadSpecs}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </button>
        </div>

        {/* Generate new spec */}
        <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Generar nuevo Spec desde prompt</h2>
          <div className="flex gap-2">
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe la PoC que quieres generar (min 10 chars)..."
              className="flex-1 border rounded px-3 py-2 text-sm"
              disabled={isGenerating}
            />
            <button
              onClick={handleGenerate}
              disabled={isGenerating || prompt.length < 10}
              className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {isGenerating ? 'Generando...' : 'Generar'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Specs List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-3 border-b bg-gray-50 font-semibold text-sm text-gray-700">
                Specs pendientes ({specs.length})
              </div>
              {isLoading ? (
                <div className="p-6 text-center text-gray-500">Cargando...</div>
              ) : specs.length === 0 ? (
                <div className="p-6 text-center text-gray-400">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No hay specs pendientes</p>
                </div>
              ) : (
                <ul className="divide-y max-h-[600px] overflow-y-auto">
                  {specs.map((s) => (
                    <li
                      key={s.spec_id}
                      className={`p-3 cursor-pointer hover:bg-gray-50 ${
                        selectedSpec?.spec_id === s.spec_id ? 'bg-brand-50' : ''
                      }`}
                      onClick={() => handleView(s.spec_id)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs text-gray-500">{s.spec_id}</span>
                        {statusBadge(s.status)}
                      </div>
                      <p className="text-sm text-gray-800 truncate">{s.goal || 'Sin goal'}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span>{s.poc_type}</span>
                        <span>Edits: {s.edits_count}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDiscard(s.spec_id) }}
                          className="ml-auto text-red-400 hover:text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Spec Detail / Editor */}
          <div className="lg:col-span-2">
            {selectedSpec ? (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-4 border-b flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-gray-800">
                      {selectedSpec.spec_id}
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Prompt: {selectedSpec.original_prompt}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {selectedSpec.status !== 'confirmed' && (
                      <>
                        <button
                          onClick={handleSave}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                        >
                          Guardar cambios
                        </button>
                        <button
                          onClick={handleConfirm}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Confirmar
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="p-4">
                  <textarea
                    value={editJson}
                    onChange={(e) => setEditJson(e.target.value)}
                    className="w-full h-[500px] font-mono text-xs border rounded p-3 bg-gray-50"
                    readOnly={selectedSpec.status === 'confirmed'}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center text-gray-400">
                <Eye className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Selecciona un spec para ver/editar</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
