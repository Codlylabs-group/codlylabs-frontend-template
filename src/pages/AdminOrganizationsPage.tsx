import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Users, RefreshCw, ChevronDown, ChevronUp, Save, X } from 'lucide-react'
import { api } from '../services/api'
import { useAppSelector, useAppDispatch } from '../store/hooks'
import { clearAuth } from '../store/userSlice'
import AdminSidebar from '../components/AdminSidebar'

interface OrgSummary {
  id: string
  name: string
  slug: string
  plan: string
  is_active: boolean
  llm_budget_monthly: number
  llm_spent_current_month: number
  created_at: string | null
}

interface OrgMember {
  id: string
  email: string
  full_name: string | null
  role: string
  is_active: boolean
  last_login: string | null
}

interface OrgDetail {
  id: string
  name: string
  slug: string
  plan: string
  is_active: boolean
  llm_budget_monthly: number
  llm_spent_current_month: number
  subscription_status: string
  stripe_customer_id: string | null
  trial_end: string | null
  pocs_generated_current_month: number
  poc_count_total: number
  created_at: string | null
  members: OrgMember[]
}

const PLAN_OPTIONS = ['free', 'builder', 'pro', 'growth', 'enterprise']

export default function AdminOrganizationsPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const userData = useAppSelector((state) => state.user.user)

  const [orgs, setOrgs] = useState<OrgSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedOrg, setExpandedOrg] = useState<string | null>(null)
  const [orgDetail, setOrgDetail] = useState<OrgDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [editingOrg, setEditingOrg] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: '', plan: '', llm_budget_monthly: 0, is_active: true })
  const [saveLoading, setSaveLoading] = useState(false)

  useEffect(() => {
    if (!userData) { navigate('/admin/login'); return }
    loadOrgs()
  }, [userData, navigate])

  const loadOrgs = async () => {
    setIsLoading(true)
    setError('')
    try {
      const response = await api.get('/api/v1/admin/organizations?limit=100')
      setOrgs(response.data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error cargando organizaciones')
      if (err.response?.status === 401 || err.response?.status === 403) navigate('/admin/login')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    dispatch(clearAuth())
    navigate('/admin/login')
  }

  const toggleExpand = async (orgId: string) => {
    if (expandedOrg === orgId) {
      setExpandedOrg(null)
      setOrgDetail(null)
      return
    }
    setExpandedOrg(orgId)
    setDetailLoading(true)
    try {
      const response = await api.get(`/api/v1/admin/organizations/${orgId}`)
      setOrgDetail(response.data)
    } catch {
      setError('Error cargando detalle de organizacion')
    } finally {
      setDetailLoading(false)
    }
  }

  const startEdit = (org: OrgSummary) => {
    setEditingOrg(org.id)
    setEditForm({ name: org.name, plan: org.plan, llm_budget_monthly: org.llm_budget_monthly, is_active: org.is_active })
  }

  const saveEdit = async () => {
    if (!editingOrg) return
    setSaveLoading(true)
    try {
      await api.patch(`/api/v1/admin/organizations/${editingOrg}`, editForm)
      setOrgs(prev => prev.map(o => o.id === editingOrg ? { ...o, ...editForm } : o))
      setEditingOrg(null)
    } catch {
      setError('Error guardando cambios')
    } finally {
      setSaveLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const planColor = (plan: string) => {
    const colors: Record<string, string> = {
      free: 'bg-gray-100 text-gray-700',
      builder: 'bg-blue-100 text-blue-700',
      pro: 'bg-purple-100 text-purple-700',
      growth: 'bg-green-100 text-green-700',
      enterprise: 'bg-yellow-100 text-yellow-700',
    }
    return colors[plan] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar currentPage="organizations" onLogout={handleLogout} />

      <div className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Organizaciones</h1>
            <p className="text-gray-600">Gestion de organizaciones y sus recursos</p>
          </div>
          <button onClick={loadOrgs} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700">
            <RefreshCw className="w-4 h-4" />
            Refrescar
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Total</div>
            <div className="text-3xl font-bold text-gray-900">{orgs.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Activas</div>
            <div className="text-3xl font-bold text-green-600">{orgs.filter(o => o.is_active).length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Con Plan Pago</div>
            <div className="text-3xl font-bold text-purple-600">{orgs.filter(o => o.plan !== 'free').length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">LLM Gasto Total</div>
            <div className="text-3xl font-bold text-blue-600">
              ${orgs.reduce((sum, o) => sum + (o.llm_spent_current_month || 0), 0).toFixed(2)}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Orgs List */}
        {!isLoading && orgs.length > 0 && (
          <div className="space-y-4">
            {orgs.map(org => (
              <div key={org.id} className="bg-white rounded-lg shadow overflow-hidden">
                {/* Org Row */}
                <div className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50" onClick={() => toggleExpand(org.id)}>
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                      {org.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{org.name}</div>
                      <div className="text-xs text-gray-500">{org.slug}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${planColor(org.plan)}`}>{org.plan}</span>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">LLM Budget</div>
                      <div className="text-sm font-medium">${org.llm_spent_current_month?.toFixed(2) || '0.00'} / ${org.llm_budget_monthly}</div>
                    </div>
                    {!org.is_active && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">Inactiva</span>
                    )}
                    {expandedOrg === org.id ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </div>
                </div>

                {/* Expanded Detail */}
                {expandedOrg === org.id && (
                  <div className="border-t px-6 pb-6">
                    {detailLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      </div>
                    ) : orgDetail && (
                      <div className="pt-4 space-y-6">
                        {/* Edit form or Info */}
                        {editingOrg === org.id ? (
                          <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Nombre</label>
                              <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                                className="w-full px-3 py-2 border rounded-lg text-sm" />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Plan</label>
                              <select value={editForm.plan} onChange={e => setEditForm(f => ({ ...f, plan: e.target.value }))}
                                className="w-full px-3 py-2 border rounded-lg text-sm">
                                {PLAN_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Budget LLM (USD/mes)</label>
                              <input type="number" value={editForm.llm_budget_monthly} onChange={e => setEditForm(f => ({ ...f, llm_budget_monthly: Number(e.target.value) }))}
                                className="w-full px-3 py-2 border rounded-lg text-sm" />
                            </div>
                            <div className="flex items-end gap-2">
                              <label className="flex items-center gap-2 text-sm">
                                <input type="checkbox" checked={editForm.is_active} onChange={e => setEditForm(f => ({ ...f, is_active: e.target.checked }))} />
                                Activa
                              </label>
                            </div>
                            <div className="col-span-2 flex gap-2 justify-end">
                              <button onClick={() => setEditingOrg(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg flex items-center gap-1">
                                <X className="w-4 h-4" /> Cancelar
                              </button>
                              <button onClick={saveEdit} disabled={saveLoading} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1 disabled:opacity-50">
                                <Save className="w-4 h-4" /> Guardar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <div className="text-xs text-gray-500">Suscripcion</div>
                              <div className="text-sm font-medium">{orgDetail.subscription_status || 'none'}</div>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <div className="text-xs text-gray-500">POCs este Mes</div>
                              <div className="text-sm font-medium">{orgDetail.pocs_generated_current_month}</div>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <div className="text-xs text-gray-500">POCs Totales</div>
                              <div className="text-sm font-medium">{orgDetail.poc_count_total}</div>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <div className="text-xs text-gray-500">Creada</div>
                              <div className="text-sm font-medium">{formatDate(orgDetail.created_at)}</div>
                            </div>
                          </div>
                        )}

                        {editingOrg !== org.id && (
                          <button onClick={() => startEdit(org)} className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                            Editar Organizacion
                          </button>
                        )}

                        {/* Members */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Users className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">Miembros ({orgDetail.members.length})</span>
                          </div>
                          {orgDetail.members.length === 0 ? (
                            <p className="text-sm text-gray-500">Sin miembros</p>
                          ) : (
                            <div className="space-y-2">
                              {orgDetail.members.map(member => (
                                <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                  <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                                      {member.full_name?.charAt(0).toUpperCase() || member.email.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                      <div className="text-sm font-medium text-gray-900">{member.full_name || member.email}</div>
                                      <div className="text-xs text-gray-500">{member.email}</div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-700">{member.role}</span>
                                    {!member.is_active && (
                                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">Inactivo</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!isLoading && orgs.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-gray-900">No hay organizaciones</h3>
          </div>
        )}
      </div>
    </div>
  )
}
