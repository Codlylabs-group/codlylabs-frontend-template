import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { authStorage } from '../services/authStorage'

export interface UserData {
  id: string
  email: string
  full_name?: string | null
  profile_picture?: string | null
  is_superuser?: boolean
  is_active?: boolean
  is_verified?: boolean
}

interface UserState {
  user: UserData | null
  tokens: {
    access_token: string
    refresh_token: string
  } | null
}

const storedUser = authStorage.getUserData()
const storedAccessToken = authStorage.getAccessToken()
const storedRefreshToken = authStorage.getRefreshToken()

const initialState: UserState = {
  user: storedUser,
  tokens:
    storedAccessToken && storedRefreshToken
      ? {
          access_token: storedAccessToken,
          refresh_token: storedRefreshToken,
        }
      : null,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserData>) => {
      state.user = action.payload
    },
    setTokens: (
      state,
      action: PayloadAction<{ access_token: string; refresh_token: string }>
    ) => {
      state.tokens = action.payload
    },
    setAuthData: (
      state,
      action: PayloadAction<{
        user: UserData
        tokens: { access_token: string; refresh_token: string }
      }>
    ) => {
      state.user = action.payload.user
      state.tokens = action.payload.tokens
    },
    clearAuth: (state) => {
      state.user = null
      state.tokens = null
    },
  },
})

export const { setUser, setTokens, setAuthData, clearAuth } = userSlice.actions
export default userSlice.reducer
