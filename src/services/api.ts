import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_DATA_KEY } from './authStorage'

// Dev: use Vite proxy by default (/api -> http://127.0.0.1:8000)
// Prod: use VITE_API_URL
const apiBaseFromEnv = import.meta.env.DEV
  ? (import.meta.env.VITE_DEV_API_URL || '')
  : (import.meta.env.VITE_API_URL || '')

const isLocalHost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')

const forceRemote = import.meta.env.VITE_FORCE_REMOTE_API === '1'

export const API_BASE_URL = isLocalHost && !forceRemote ? '' : apiBaseFromEnv

// Callback to clear Redux auth state on forced logout (set by store init)
let _onForceLogout: (() => void) | null = null
export function registerForceLogoutCallback(cb: () => void) {
  _onForceLogout = cb
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = window.localStorage.getItem(ACCESS_TOKEN_KEY)
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`)
    }
    const lang = window.localStorage.getItem('codly_language') || 'es'
    config.headers.set('Accept-Language', lang)
  }
  return config
})

// ── Force logout: flush all credentials and redirect to login ─
function forceLogout() {
  // If on admin pages, redirect to admin login — never clear tokens
  // or redirect to the user login flow (LinkedIn).
  if (window.location.pathname.startsWith('/admin')) {
    if (!window.location.pathname.startsWith('/admin/login')) {
      window.location.href = '/admin/login'
    }
    return
  }

  window.localStorage.removeItem(ACCESS_TOKEN_KEY)
  window.localStorage.removeItem(REFRESH_TOKEN_KEY)
  window.localStorage.removeItem(USER_DATA_KEY)

  // Clear Redux persisted state so the user is not "phantom logged in"
  if (_onForceLogout) _onForceLogout()

  // Save current path so login can redirect back
  const currentPath = window.location.pathname + window.location.search
  if (currentPath !== '/login' && currentPath !== '/onboarding') {
    sessionStorage.setItem('auth_return_url', currentPath)
  }

  // Redirect to login (avoid redirect loop)
  if (!window.location.pathname.startsWith('/login')) {
    window.location.href = `/login?returnTo=${encodeURIComponent(currentPath)}`
  }
}

// ── Token refresh logic ──────────────────────────────────────
let isRefreshing = false
let refreshQueue: Array<{
  resolve: (token: string) => void
  reject: (err: unknown) => void
}> = []

function processQueue(error: unknown, token: string | null) {
  refreshQueue.forEach((p) => {
    if (error || !token) {
      p.reject(error)
    } else {
      p.resolve(token)
    }
  })
  refreshQueue = []
}

// Response interceptor: auto-refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error?.response?.status
    const requestUrl: string = error?.config?.url || ''
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // URLs that should NOT trigger a refresh attempt
    const isAuthEndpoint =
      requestUrl.includes('/api/v1/auth/me') ||
      requestUrl.includes('/api/v1/auth/login') ||
      requestUrl.includes('/api/v1/auth/register') ||
      requestUrl.includes('/api/v1/auth/refresh') ||
      requestUrl.includes('/api/v1/auth/forgot-password') ||
      requestUrl.includes('/api/v1/auth/reset-password') ||
      requestUrl.includes('/api/v1/auth/linkedin/') ||
      requestUrl.includes('/api/v1/auth/google/')

    // Admin endpoints use a separate auth system — never enter the
    // user token-refresh flow, and redirect to /admin/login on 401.
    const isAdminEndpoint = requestUrl.includes('/api/v1/admin/')

    const isExpectedAnonymousLinkMiss =
      status === 404 && requestUrl.includes('/api/v1/plg/link-session')

    // When browsing admin pages, never enter the user token-refresh flow.
    // Admin auth is fully separate — let errors propagate to the page.
    const isOnAdminPage = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')

    if (status === 401 && (isAdminEndpoint || isOnAdminPage)) {
      return Promise.reject(error)
    }

    // ── Auto-refresh on 401 ──────────────────────────────────
    if (status === 401 && !isAuthEndpoint && !originalRequest._retry) {
      const refreshToken = window.localStorage.getItem(REFRESH_TOKEN_KEY)
      if (!refreshToken) {
        // No refresh token — flush everything and redirect to login
        forceLogout()
        return Promise.reject(error)
      }

      if (isRefreshing) {
        // Another refresh is in progress — queue this request
        return new Promise<string>((resolve, reject) => {
          refreshQueue.push({ resolve, reject })
        }).then((newToken) => {
          originalRequest.headers.set('Authorization', `Bearer ${newToken}`)
          originalRequest._retry = true
          return api(originalRequest)
        })
      }

      isRefreshing = true
      originalRequest._retry = true

      try {
        const res = await axios.post(
          `${API_BASE_URL}/api/v1/auth/refresh`,
          { refresh_token: refreshToken },
          { headers: { 'Content-Type': 'application/json' } },
        )
        const newAccessToken: string = res.data.access_token
        const newRefreshToken: string = res.data.refresh_token || refreshToken

        window.localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken)
        window.localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken)

        processQueue(null, newAccessToken)

        originalRequest.headers.set('Authorization', `Bearer ${newAccessToken}`)
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        // Refresh also failed — flush everything and redirect to login
        forceLogout()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    // ── Standard error logging ───────────────────────────────
    const isExpectedAuthFailure = status === 401 && isAuthEndpoint
    if (!isExpectedAuthFailure && !isExpectedAnonymousLinkMiss) {
      console.error('API Error:', error.response?.data || error.message)
    }

    return Promise.reject(error)
  }
)
