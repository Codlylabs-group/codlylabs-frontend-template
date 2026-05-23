import { configureStore, combineReducers, Middleware } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import userReducer from './userSlice'
import cacheReducer from './cacheSlice'
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '../services/authStorage'
import { registerForceLogoutCallback, registerTokenRefreshCallback } from '../services/api'
import { clearAuth, setTokens } from './userSlice'

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['user', 'cache'], // Only persist user and cache state
}

const rootReducer = combineReducers({
  user: userReducer,
  cache: cacheReducer,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

// Middleware to sync tokens to localStorage
const tokenSyncMiddleware: Middleware = (storeAPI) => (next) => (action: any) => {
  const result = next(action)

  // After any action, check if tokens exist and sync to localStorage
  if (action.type?.startsWith('user/') || action.type === 'persist/REHYDRATE') {
    const state = storeAPI.getState() as RootState
    if (state.user.tokens) {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(ACCESS_TOKEN_KEY, state.user.tokens.access_token)
        window.localStorage.setItem(REFRESH_TOKEN_KEY, state.user.tokens.refresh_token)
      }
    } else {
      if (action.type === 'persist/REHYDRATE' && typeof window !== 'undefined') {
        const accessToken = window.localStorage.getItem(ACCESS_TOKEN_KEY)
        const refreshToken = window.localStorage.getItem(REFRESH_TOKEN_KEY)
        if (accessToken && refreshToken) {
          storeAPI.dispatch(setTokens({ access_token: accessToken, refresh_token: refreshToken }))
          return result
        }
      }
      // Clear tokens from localStorage if they don't exist in Redux
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(ACCESS_TOKEN_KEY)
        window.localStorage.removeItem(REFRESH_TOKEN_KEY)
      }
    }
  }

  return result
}

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(tokenSyncMiddleware),
})

export const persistor = persistStore(store)

// Wire up force-logout so the API interceptor can clear Redux auth state
registerForceLogoutCallback(() => store.dispatch(clearAuth()))
registerTokenRefreshCallback((tokens) => store.dispatch(setTokens(tokens)))

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
