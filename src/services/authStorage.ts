export const ACCESS_TOKEN_KEY = 'poc_auth_access_token'
export const REFRESH_TOKEN_KEY = 'poc_auth_refresh_token'
export const USER_DATA_KEY = 'poc_auth_user_data'

export interface UserData {
  id: string
  email: string
  full_name?: string | null
  profile_picture?: string | null
}

export const authStorage = {
  saveTokens(accessToken: string, refreshToken: string) {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
    window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  },

  clearTokens() {
    if (typeof window === 'undefined') return
    window.localStorage.removeItem(ACCESS_TOKEN_KEY)
    window.localStorage.removeItem(REFRESH_TOKEN_KEY)
    window.localStorage.removeItem(USER_DATA_KEY)
  },

  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null
    return window.localStorage.getItem(ACCESS_TOKEN_KEY)
  },

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null
    return window.localStorage.getItem(REFRESH_TOKEN_KEY)
  },

  saveUserData(userData: UserData) {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData))
  },

  getUserData(): UserData | null {
    if (typeof window === 'undefined') return null
    const data = window.localStorage.getItem(USER_DATA_KEY)
    return data ? JSON.parse(data) : null
  },
}
