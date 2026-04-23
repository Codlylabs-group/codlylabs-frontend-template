import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Mail, CheckCircle, XCircle, Search, UserX, ShieldCheck, Trash2, Eye, RefreshCw, X } from 'lucide-react'
import { api } from '../services/api'
import { useAppSelector, useAppDispatch } from '../store/hooks'
import { clearAuth } from '../store/userSlice'
import AdminSidebar from '../components/AdminSidebar'

interface User {
  id: string
  email: string
  full_name: string
  profile_picture: string | null
  provider: string
  is_active: boolean
  is_verified: boolean
  is_superuser: boolean
  last_login: string | null
  created_at: string | null
}

interface UserDetail extends User {
  poc_count: number
  organizations: {
    id: string
    name: string
    slug: string
    plan: string
    role: string
  }[]
}

export default function AdminUsersPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const userData = useAppSelector((state) => state.user.user)

  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    if (!userData) {
      navigate('/admin/login')
      return
    }
    loadUsers()
  }, [userData, navigate])

  const loadUsers = async () => {
    setIsLoading(true)
    setError('')
    try {
      const response = await api.get('/api/v1/admin/users?limit=100')
      setUsers(response.data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load users')
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nunca'
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = !search ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        (user.full_name || '').toLowerCase().includes(search.toLowerCase())
      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'active' && user.is_active) ||
        (filterStatus === 'inactive' && !user.is_active)
      return matchesSearch && matchesStatus
    })
  }, [users, search, filterStatus])

  const openDetail = async (userId: string) => {
    setIsDetailLoading(true)
    try {
      const response = await api.get(`/api/v1/admin/users/${userId}`)
      setSelectedUser(response.data)
    } catch {
      setError('Error cargando detalle del usuario')
    } finally {
      setIsDetailLoading(false)
    }
  }

  const toggleActive = async (userId: string, currentActive: boolean) => {
    setActionLoading(userId)
    try {
      await api.patch(`/api/v1/admin/users/${userId}/status`, { is_active: !currentActive })
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: !currentActive } : u))
      if (selectedUser?.id === userId) {
        setSelectedUser({ ...selectedUser, is_active: !currentActive })
      }
    } catch {
      setError('Error actualizando estado del usuario')
    } finally {
      setActionLoading(null)
    }
  }

  const toggleVerified = async (userId: string, currentVerified: boolean) => {
    setActionLoading(userId)
    try {
      await api.patch(`/api/v1/admin/users/${userId}/verify`, { is_verified: !currentVerified })
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_verified: !currentVerified } : u))
      if (selectedUser?.id === userId) {
        setSelectedUser({ ...selectedUser, is_verified: !currentVerified })
      }
    } catch {
      setError('Error actualizando verificacion del usuario')
    } finally {
      setActionLoading(null)
    }
  }

  const deleteUser = async (userId: string) => {
    if (!confirm('Estas seguro de que quieres eliminar este usuario? Esta accion no se puede deshacer.')) return
    setActionLoading(userId)
    try {
      await api.delete(`/api/v1/admin/users/${userId}`)
      setUsers(prev => prev.filter(u => u.id !== userId))
      if (selectedUser?.id === userId) setSelectedUser(null)
    } catch {
      setError('Error eliminando usuario')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar currentPage="users" onLogout={handleLogout} />

      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Usuarios</h1>
            <p className="text-gray-600">Gestion de usuarios de la plataforma</p>
          </div>
          <button onClick={loadUsers} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700">
            <RefreshCw className="w-4 h-4" />
            Refrescar
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Total Usuarios</div>
            <div className="text-3xl font-bold text-gray-900">{users.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Usuarios Activos</div>
            <div className="text-3xl font-bold text-green-600">
              {users.filter(u => u.is_active).length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Usuarios Verificados</div>
            <div className="text-3xl font-bold text-blue-600">
              {users.filter(u => u.is_verified).length}
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'active', 'inactive'] as const).map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {status === 'all' ? 'Todos' : status === 'active' ? 'Activos' : 'Inactivos'}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Users Table */}
        {!isLoading && filteredUsers.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ultimo Acceso</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registrado</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {user.profile_picture ? (
                            <img className="h-10 w-10 rounded-full" src={user.profile_picture} alt={user.full_name} />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                              {user.full_name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.full_name || 'Sin nombre'}</div>
                          <div className="text-xs text-gray-500">{user.provider}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Mail className="w-4 h-4 text-gray-400 mr-2" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        {user.is_active ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <XCircle className="w-3 h-3 mr-1" />Inactivo
                          </span>
                        )}
                        {user.is_verified && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Verificado</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-2" />
                        {formatDate(user.last_login)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openDetail(user.id)}
                          title="Ver detalle"
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleActive(user.id, user.is_active)}
                          disabled={actionLoading === user.id}
                          title={user.is_active ? 'Desactivar' : 'Activar'}
                          className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors disabled:opacity-50"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleVerified(user.id, user.is_verified)}
                          disabled={actionLoading === user.id}
                          title={user.is_verified ? 'Quitar verificacion' : 'Verificar'}
                          className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
                        >
                          <ShieldCheck className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteUser(user.id)}
                          disabled={actionLoading === user.id}
                          title="Eliminar"
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
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

        {!isLoading && filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {search || filterStatus !== 'all' ? 'Sin resultados' : 'No hay usuarios'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {search || filterStatus !== 'all'
                ? 'Intenta ajustar los filtros de busqueda'
                : 'Aun no se han registrado usuarios en la plataforma'}
            </p>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {(selectedUser || isDetailLoading) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedUser(null)}>
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {isDetailLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : selectedUser && (
              <>
                <div className="flex items-center justify-between p-6 border-b">
                  <h2 className="text-lg font-semibold text-gray-900">Detalle del Usuario</h2>
                  <button onClick={() => setSelectedUser(null)} className="p-1 hover:bg-gray-100 rounded">
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  {/* Profile */}
                  <div className="flex items-center gap-4">
                    {selectedUser.profile_picture ? (
                      <img className="h-16 w-16 rounded-full" src={selectedUser.profile_picture} alt="" />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
                        {selectedUser.full_name?.charAt(0).toUpperCase() || selectedUser.email.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="text-lg font-semibold text-gray-900">{selectedUser.full_name || 'Sin nombre'}</div>
                      <div className="text-sm text-gray-500">{selectedUser.email}</div>
                    </div>
                  </div>

                  {/* Status badges */}
                  <div className="flex gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${selectedUser.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {selectedUser.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                    {selectedUser.is_verified && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Verificado</span>
                    )}
                    {selectedUser.is_superuser && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">Superuser</span>
                    )}
                  </div>

                  {/* Info grid */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500">POCs Generadas</div>
                      <div className="font-semibold text-gray-900">{selectedUser.poc_count}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Ultimo Acceso</div>
                      <div className="font-semibold text-gray-900">{formatDate(selectedUser.last_login)}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Registrado</div>
                      <div className="font-semibold text-gray-900">{formatDate(selectedUser.created_at)}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">ID</div>
                      <div className="font-mono text-xs text-gray-600 truncate" title={selectedUser.id}>{selectedUser.id}</div>
                    </div>
                  </div>

                  {/* Organizations */}
                  {selectedUser.organizations.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">Organizaciones</div>
                      <div className="space-y-2">
                        {selectedUser.organizations.map(org => (
                          <div key={org.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{org.name}</div>
                              <div className="text-xs text-gray-500">{org.slug}</div>
                            </div>
                            <div className="flex gap-2">
                              <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-700">{org.role}</span>
                              <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">{org.plan}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t">
                    <button
                      onClick={() => { toggleActive(selectedUser.id, selectedUser.is_active) }}
                      disabled={actionLoading === selectedUser.id}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                        selectedUser.is_active
                          ? 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                          : 'bg-green-50 text-green-700 hover:bg-green-100'
                      }`}
                    >
                      {selectedUser.is_active ? 'Desactivar' : 'Activar'}
                    </button>
                    <button
                      onClick={() => { toggleVerified(selectedUser.id, selectedUser.is_verified) }}
                      disabled={actionLoading === selectedUser.id}
                      className="flex-1 py-2 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors disabled:opacity-50"
                    >
                      {selectedUser.is_verified ? 'Quitar Verificacion' : 'Verificar'}
                    </button>
                    <button
                      onClick={() => { deleteUser(selectedUser.id) }}
                      disabled={actionLoading === selectedUser.id}
                      className="flex-1 py-2 rounded-lg text-sm font-medium bg-red-50 text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
