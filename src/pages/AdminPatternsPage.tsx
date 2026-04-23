import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Brain, Trash2, Star, RefreshCw, AlertTriangle, Filter } from 'lucide-react'
import { api } from '../services/api'
import { useAppSelector, useAppDispatch } from '../store/hooks'
import { clearAuth } from '../store/userSlice'
import AdminSidebar from '../components/AdminSidebar'

interface PatternRecord {
  pattern_type: string
  pattern_signature: string
  error_message: string
  fix_applied: string
  fix_successful: boolean
  poc_type: string
  occurrences: number
  first_seen: string
  last_seen: string
  promoted_to_guardrail: boolean
}

interface PatternStats {
  total_patterns: number
  total_occurrences: number
  by_type: Record<string, number>
  top_errors: Array<{ signature: string; occurrences: number; error_message: string }>
  prompt_warnings_preview: string
}

export default function AdminPatternsPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const userData = useAppSelector((state) => state.user.user)

  const [patterns, setPatterns] = useState<PatternRecord[]>([])
  const [stats, setStats] = useState<PatternStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterPocType, setFilterPocType] = useState('')
  const [minOccurrences, setMinOccurrences] = useState(1)

  useEffect(() => {
    if (!userData) {
      navigate('/admin/login')
      return
    }
    loadData()
  }, [userData, navigate])

  const loadData = async () => {
    setIsLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (filterType) params.set('pattern_type', filterType)
      if (filterPocType) params.set('poc_type', filterPocType)
      if (minOccurrences > 1) params.set('min_occurrences', String(minOccurrences))

      const [patternsRes, statsRes] = await Promise.all([
        api.get(`/api/v1/admin/patterns?${params.toString()}`),
        api.get('/api/v1/admin/patterns/stats'),
      ])
      setPatterns(patternsRes.data.patterns || [])
      setStats(statsRes.data)
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/admin/login')
      }
      setError(err.response?.data?.detail || 'Error cargando patterns')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePromote = async (signature: string) => {
    try {
      await api.post(`/api/v1/admin/patterns/${encodeURIComponent(signature)}/promote`)
      loadData()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error promoviendo pattern')
    }
  }

  const handleDelete = async (signature: string) => {
    if (!confirm('Eliminar este pattern?')) return
    try {
      await api.delete(`/api/v1/admin/patterns/${encodeURIComponent(signature)}`)
      loadData()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error eliminando pattern')
    }
  }

  const handleLogout = () => {
    dispatch(clearAuth())
    navigate('/admin/login')
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar currentPage="patterns" onLogout={handleLogout} />

      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8 text-purple-600" />
            <h1 className="text-2xl font-bold text-gray-900">Pattern Memory</h1>
          </div>
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-500">Total Patterns</p>
              <p className="text-2xl font-bold">{stats.total_patterns}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-500">Total Ocurrencias</p>
              <p className="text-2xl font-bold">{stats.total_occurrences}</p>
            </div>
            {Object.entries(stats.by_type).map(([type, count]) => (
              <div key={type} className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-500">{type}</p>
                <p className="text-2xl font-bold">{count}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg p-4 shadow-sm mb-6 flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Tipo</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border rounded px-3 py-2 text-sm"
            >
              <option value="">Todos</option>
              <option value="build_error">build_error</option>
              <option value="build_fix">build_fix</option>
              <option value="smoke_test_failure">smoke_test_failure</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">PoC Type</label>
            <input
              value={filterPocType}
              onChange={(e) => setFilterPocType(e.target.value)}
              placeholder="ej: nlp_documental"
              className="border rounded px-3 py-2 text-sm w-44"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Min Ocurrencias</label>
            <input
              type="number"
              min={1}
              value={minOccurrences}
              onChange={(e) => setMinOccurrences(Number(e.target.value))}
              className="border rounded px-3 py-2 text-sm w-20"
            />
          </div>
          <button
            onClick={loadData}
            className="flex items-center gap-1 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
          >
            <Filter className="w-4 h-4" />
            Filtrar
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Patterns Table */}
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Cargando...</div>
        ) : patterns.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No hay patterns registrados</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left p-3">Signature</th>
                  <th className="text-left p-3">Tipo</th>
                  <th className="text-left p-3">PoC Type</th>
                  <th className="text-center p-3">Ocurrencias</th>
                  <th className="text-left p-3">Error</th>
                  <th className="text-left p-3">Fix</th>
                  <th className="text-center p-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {patterns.map((p) => (
                  <tr key={p.pattern_signature} className="hover:bg-gray-50">
                    <td className="p-3 font-mono text-xs max-w-[200px] truncate">
                      {p.pattern_signature}
                      {p.promoted_to_guardrail && (
                        <span className="ml-1 text-yellow-500" title="Promoted to guardrail">
                          <Star className="w-3 h-3 inline" />
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        p.pattern_type === 'build_error' ? 'bg-red-100 text-red-700' :
                        p.pattern_type === 'smoke_test_failure' ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {p.pattern_type}
                      </span>
                    </td>
                    <td className="p-3 text-gray-600">{p.poc_type || '-'}</td>
                    <td className="p-3 text-center font-bold">{p.occurrences}</td>
                    <td className="p-3 text-gray-600 max-w-[200px] truncate" title={p.error_message}>
                      {p.error_message || '-'}
                    </td>
                    <td className="p-3 text-gray-600 max-w-[180px] truncate" title={p.fix_applied}>
                      {p.fix_applied ? (
                        <span className={p.fix_successful ? 'text-green-600' : 'text-red-500'}>
                          {p.fix_applied}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex gap-1 justify-center">
                        {!p.promoted_to_guardrail && (
                          <button
                            onClick={() => handlePromote(p.pattern_signature)}
                            className="p-1 text-yellow-600 hover:bg-yellow-50 rounded"
                            title="Promover a guardrail"
                          >
                            <Star className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(p.pattern_signature)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Prompt Warnings Preview */}
        {stats?.prompt_warnings_preview && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <h3 className="font-semibold text-yellow-800">Preview: Warnings inyectados al LLM</h3>
            </div>
            <pre className="text-xs text-yellow-900 whitespace-pre-wrap font-mono">
              {stats.prompt_warnings_preview}
            </pre>
          </div>
        )}
      </main>
    </div>
  )
}
