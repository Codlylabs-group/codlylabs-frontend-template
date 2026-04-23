import { api } from './api'

export interface WorkspaceInvitationSummary {
  id: string
  email?: string | null
  role: string
  created_at?: string | null
  expires_at?: string | null
  accept_url: string
  token?: string
  status?: string
}

export interface StatChange {
  label: string
  direction: 'up' | 'down' | 'flat'
  positive: boolean
}

export interface WorkspaceContextResponse {
  workspace: {
    id: string
    name: string
    display_name: string
    slug: string
    plan: string
    plan_label: string
    subscription_status: string
    billing_source: string
    white_label: boolean
    powered_by: string
    organization_role: string
    brand: {
      name: string
      initials: string
      primary: string
      primaryDark: string
      accent: string
      surface: string
      logo_url?: string | null
      favicon_url?: string | null
      tagline?: string | null
      login_title?: string | null
      login_subtitle?: string | null
      login_hero_title?: string | null
      login_hero_description?: string | null
      border_radius?: string
      badge_config?: { position: string; style: string }
      subdomain_slug?: string | null
    }
  }
  user: {
    id: string
    email: string
    full_name?: string | null
    profile_picture?: string | null
    role: string
  }
  summary: {
    pending_recommendations: number
    active_previews: number
  }
  stats: {
    active_projects: number
    active_projects_change: StatChange | null
    generated_pocs: number
    generated_pocs_change: StatChange | null
    success_rate: number
    success_rate_change: StatChange | null
    average_generation_minutes: number
    average_generation_minutes_change: StatChange | null
  }
  activity: Array<{
    id: string
    type: string
    text: string
    time_label: string
    actor: string
  }>
  active_previews: Array<{
    poc_id: string
    name: string
    vertical: string
    status: string
    uptime: string
    preview_url: string
  }>
  projects: Array<{
    id: string
    name: string
    poc_type?: string | null
    vertical?: string | null
    archetype?: string | null
    thumbnail_url?: string | null
    current_poc_id?: string | null
    iterations_count: number
    deployments_count: number
    latest_deployment_status?: string | null
    latest_share_url?: string | null
    updated_at?: string | null
    created_at?: string | null
    owner_id?: string | null
  }>
  members: Array<{
    id: string
    email: string
    name: string
    full_name?: string | null
    role: string
    initials: string
    status: string
    last_login?: string | null
  }>
  pending_invitations: WorkspaceInvitationSummary[]
  usage: {
    plan_label: string
    pocs_used: number
    pocs_limit: number | 'unlimited'
    previews_used: number
    previews_limit: number
    seats_used: number
    seats_limit: number | 'unlimited'
    seats_reserved: number
    llm_used_k: number
    llm_budget_k: number
  }
  quick_actions: Array<{
    id: string
    label: string
    description: string
    href: string
    disabled?: boolean
  }>
}

export interface ResolvedInvitationResponse {
  token: string
  status: string
  email?: string | null
  role: string
  allow_any_email: boolean
  expires_at?: string | null
  workspace: {
    id: string
    name: string
    display_name: string
    slug: string
  }
}

export const workspaceApi = {
  async getContext(): Promise<WorkspaceContextResponse> {
    const response = await api.get('/api/v1/workspace/context')
    return response.data as WorkspaceContextResponse
  },

  async createInvitation(payload: { email: string; role: string }): Promise<WorkspaceInvitationSummary> {
    const response = await api.post('/api/v1/workspace/invitations', payload)
    return response.data as WorkspaceInvitationSummary
  },

  async resolveInvitation(token: string): Promise<ResolvedInvitationResponse> {
    const response = await api.get('/api/v1/workspace/invitations/resolve', { params: { token } })
    return response.data as ResolvedInvitationResponse
  },

  async acceptInvitation(payload: {
    token: string
    email?: string
    password?: string
    confirm_password?: string
    full_name?: string
  }) {
    const response = await api.post('/api/v1/workspace/invitations/accept', payload)
    return response.data
  },
}
