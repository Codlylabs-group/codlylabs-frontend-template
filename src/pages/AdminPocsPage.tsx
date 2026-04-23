import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, FileCode, Calendar, User, Trash2, RefreshCw } from 'lucide-react'
import { api } from '../services/api'
import { useAppSelector, useAppDispatch } from '../store/hooks'
import { clearAuth } from '../store/userSlice'
import AdminSidebar from '../components/AdminSidebar'

interface PocUser {
  id: string | null
  email: string | null
  full_name: string | null
}

interface Poc {
  id: string
  session_id: string
  poc_type: string
  deployment_mode: string
  status: string
  tech_stack: string[]
  download_url: string | null
  created_at: string | null
  user: PocUser | null
}

export default function AdminPocsPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const userData = useAppSelector((state) => state.user.user)

  const [pocs, setPocs] = useState<Poc[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [error, setError] = useState('')
  const [downloadingPocId, setDownloadingPocId] = useState<string | null>(null)
  const [deletingPocId, setDeletingPocId] = useState<string | null>(null)

  useEffect(() => {
    if (!userData) {
      navigate('/admin/login')
      return
    }

    loadPocs()
  }, [userData, navigate])

  const loadPocs = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await api.get('/api/v1/admin/pocs?limit=100')
      setPocs(response.data)
    } catch (err: any) {
      console.error('Error loading POCs:', err)
      setError(err.response?.data?.detail || 'Failed to load POCs')

      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/admin/login')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    dispatch(clearAuth())
    navigate('/admin/login')
  }

  const handleDownload = async (pocId: string) => {
    setDownloadingPocId(pocId)

    try {
      const response = await api.get(`/api/v1/admin/pocs/${pocId}/download`, {
        responseType: 'blob'
      })

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `poc_${pocId}.zip`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err: any) {
      console.error('Error downloading POC:', err)
      alert('Error al descargar la POC')
    } finally {
      setDownloadingPocId(null)
    }
  }

  const handleDelete = async (pocId: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta POC? Esta acción no se puede deshacer.')) {
      return
    }

    setDeletingPocId(pocId)
    try {
      await api.delete(`/api/v1/admin/pocs/${pocId}`)
      setPocs(pocs.filter((p) => p.id !== pocId))
    } catch (err: any) {
      console.error('Error deleting POC:', err)
      alert('Error al eliminar la POC')
    } finally {
      setDeletingPocId(null)
    }
  }

  const handleSync = async () => {
    setIsSyncing(true)
    setError('')
    try {
      const response = await api.post('/api/v1/admin/pocs/sync')
      const deletedCount = response.data.deleted_count
      
      if (deletedCount > 0) {
        alert(`Sincronización completada. Se eliminaron ${deletedCount} POCs que no existían en el disco.`)
        loadPocs() // Reload list
      } else {
        alert('Sincronización completada. No se encontraron POCs huérfanas.')
      }
    } catch (err: any) {
      console.error('Error syncing POCs:', err)
      alert('Error al sincronizar POCs')
    } finally {
      setIsSyncing(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getPocTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      generative: 'IA Generativa (Chatbot)',
      nlp_documental: 'Análisis Documental',
      audio: 'Audio/Sentiment',
      ml_predictive: 'ML Predictivo',
      computer_vision: 'Visión por Computadora',
      multimodal: 'Multimodal',
      ecommerce: 'E-commerce (Recomendaciones)',
      crm_copilot: 'CRM Copilot',
      autonomous_agents: 'Agentes Autónomos'
    }
    return labels[type] || type
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; color: string }> = {
      ready: { label: 'Lista', color: 'bg-green-100 text-green-800' },
      packaged: { label: 'Empaquetada', color: 'bg-blue-100 text-blue-800' },
      generating: { label: 'Generando', color: 'bg-yellow-100 text-yellow-800' },
      failed: { label: 'Fallida', color: 'bg-red-100 text-red-800' },
      blueprint_only: { label: 'Solo Blueprint', color: 'bg-gray-100 text-gray-800' }
    }

    const config = statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-800' }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar currentPage="pocs" onLogout={handleLogout} />

      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">POCs Creadas</h1>
            <p className="text-gray-600">Listado de todas las POCs generadas en la plataforma</p>
          </div>
          <button
            onClick={handleSync}
            disabled={isSyncing || isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* POCs Table */}
        {!isLoading && pocs.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo de POC
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Modo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pocs.map((poc) => (
                  <tr key={poc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileCode className="w-5 h-5 text-blue-600 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {getPocTypeLabel(poc.poc_type)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {poc.tech_stack?.slice(0, 2).join(', ')}
                            {poc.tech_stack?.length > 2 && ` +${poc.tech_stack.length - 2}`}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {poc.user ? (
                        <div className="flex items-center">
                          <User className="w-4 h-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {poc.user.full_name || 'Sin nombre'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {poc.user.email}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Usuario desconocido</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(poc.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 capitalize">
                        {poc.deployment_mode.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-2" />
                        {formatDate(poc.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {poc.download_url && (
                        <button
                          onClick={() => handleDownload(poc.id)}
                          disabled={downloadingPocId === poc.id}
                          className="inline-flex items-center px-3 py-2 border border-transparent
                                   text-sm leading-4 font-medium rounded-md text-white bg-blue-600
                                   hover:bg-blue-700 focus:outline-none focus:ring-2
                                   focus:ring-offset-2 focus:ring-blue-500
                                   disabled:opacity-50 disabled:cursor-not-allowed
                                   transition-colors duration-200"
                        >
                          {downloadingPocId === poc.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Descargando...
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4 mr-2" />
                              Descargar
                            </>
                          )}
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDelete(poc.id)}
                        disabled={deletingPocId === poc.id}
                        className="inline-flex items-center px-3 py-2 border border-transparent
                                 text-sm leading-4 font-medium rounded-md text-red-600 bg-red-50
                                 hover:bg-red-100 focus:outline-none focus:ring-2
                                 focus:ring-offset-2 focus:ring-red-500
                                 disabled:opacity-50 disabled:cursor-not-allowed
                                 transition-colors duration-200 ml-2"
                      >
                        {deletingPocId === poc.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && pocs.length === 0 && (
          <div className="text-center py-12">
            <FileCode className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay POCs</h3>
            <p className="mt-1 text-sm text-gray-500">
              Aún no se han generado POCs en la plataforma
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
