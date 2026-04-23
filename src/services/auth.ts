import { api } from './api'
import { authStorage, type UserData } from './authStorage'

export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface AuthResponse {
  user: {
    id: string
    email: string
    full_name?: string | null
    profile_picture?: string | null
  }
  organization: {
    id: string
    name: string
    slug: string
    plan?: string
  }
  tokens: AuthTokens
}

export interface UserOrganizationSummary {
  id: string
  name: string
  slug: string
  display_name: string
  plan: string
  plan_label: string
  subscription_status: string
  role: string
  is_current: boolean
}

export interface ListOrganizationsResponse {
  organizations: UserOrganizationSummary[]
  current_organization_id: string
}

export interface UserProfileResponse {
  user: {
    id: string
    email: string
    full_name?: string | null
    profile_picture?: string | null
    is_superuser: boolean
    created_at: string
    last_login?: string | null
  }
  organization: {
    id: string
    name: string
    slug: string
    plan: string
    llm_budget_monthly: number
    llm_spent_current_month: number
  }
  roles: {
    organization_role: string
    is_superuser: boolean
    effective_role: 'admin' | 'user' | string
  }
  usage: {
    budget_usd: number
    spent_usd: number
    remaining_usd: number
    usage_percentage: number
  }
  projects: Array<{
    id: string
    name: string
    user_id?: string | null
    session_id?: string | null
    thumbnail_url?: string | null
    poc_type: string
    vertical: string
    archetype: string
    current_poc_id: string
    iterations_count: number
    deployments_count: number
    updated_at: string
    latest_deployment_status?: string | null
    latest_share_url?: string | null
  }>
  totals: {
    projects: number
  }
}

/** Save the current URL so we can return here after OAuth. */
export function saveAuthReturnUrl(): void {
  sessionStorage.setItem('auth_return_url', window.location.pathname + window.location.search)
}

/** Save an explicit return URL for OAuth redirection. */
export function saveExplicitAuthReturnUrl(url: string): void {
  sessionStorage.setItem('auth_return_url', url)
}

/** Read (and clear) the saved return URL. Returns null if none was saved. */
export function getAndClearAuthReturnUrl(): string | null {
  const url = sessionStorage.getItem('auth_return_url')
  if (url) sessionStorage.removeItem('auth_return_url')
  return url
}

export const authApi = {
  async login(email: string, password: string, workspace?: string): Promise<AuthResponse> {
    const response = await api.post('/api/v1/auth/login', {
      email,
      password,
      workspace: workspace?.trim() || undefined,
    })
    return response.data as AuthResponse
  },

  async register(payload: {
    email: string
    password: string
    confirmPassword: string
    fullName?: string
    organizationName: string
  }): Promise<AuthResponse> {
    const response = await api.post('/api/v1/auth/register', {
      email: payload.email,
      password: payload.password,
      confirm_password: payload.confirmPassword,
      full_name: payload.fullName || null,
      organization_name: payload.organizationName,
    })
    return response.data as AuthResponse
  },

  async getLinkedInAuthUrl(): Promise<string> {
    const response = await api.get('/api/v1/auth/linkedin/url')
    return response.data.auth_url as string
  },

  async exchangeLinkedInCode(code: string, state: string): Promise<AuthResponse> {
    const response = await api.post('/api/v1/auth/linkedin/callback', { code, state })
    return response.data as AuthResponse
  },

  async getGoogleAuthUrl(): Promise<string> {
    const response = await api.get('/api/v1/auth/google/url')
    return response.data.auth_url as string
  },

  async exchangeGoogleCode(code: string, state: string): Promise<AuthResponse> {
    const response = await api.post('/api/v1/auth/google/callback', { code, state })
    return response.data as AuthResponse
  },

  async refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
    const response = await api.post('/api/v1/auth/refresh', {
      refresh_token: refreshToken,
    })
    return response.data as AuthTokens
  },

  async forgotPassword(email: string): Promise<{ message: string; token?: string | null }> {
    const response = await api.post('/api/v1/auth/forgot-password', { email })
    return response.data as { message: string; token?: string | null }
  },

  async resetPassword(
    token: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<{ message: string }> {
    const response = await api.post('/api/v1/auth/reset-password', {
      token,
      new_password: newPassword,
      confirm_password: confirmPassword,
    })
    return response.data as { message: string }
  },

  async getProfile(): Promise<UserProfileResponse> {
    const response = await api.get('/api/v1/auth/profile')
    return response.data as UserProfileResponse
  },

  async listOrganizations(): Promise<ListOrganizationsResponse> {
    const response = await api.get('/api/v1/auth/organizations')
    return response.data as ListOrganizationsResponse
  },

  async switchOrganization(organizationId: string): Promise<AuthResponse> {
    const response = await api.post(
      `/api/v1/auth/organizations/${encodeURIComponent(organizationId)}/switch`,
    )
    return response.data as AuthResponse
  },

  async changePassword(payload: {
    currentPassword: string
    newPassword: string
    confirmPassword: string
  }): Promise<{ message: string }> {
    const response = await api.post('/api/v1/auth/change-password', {
      current_password: payload.currentPassword,
      new_password: payload.newPassword,
      confirm_password: payload.confirmPassword,
    })
    return response.data as { message: string }
  },

  saveTokens(tokens: AuthTokens) {
    authStorage.saveTokens(tokens.access_token, tokens.refresh_token)
  },

  saveUserData(user: UserData) {
    authStorage.saveUserData(user)
  },

  getUserData(): UserData | null {
    return authStorage.getUserData()
  },

  clearTokens() {
    authStorage.clearTokens()
  },

  getAccessToken(): string | null {
    return authStorage.getAccessToken()
  },

  getRefreshToken(): string | null {
    return authStorage.getRefreshToken()
  },
}
