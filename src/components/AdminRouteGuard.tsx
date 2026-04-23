/**
 * AdminRouteGuard — Protects admin routes with token validation.
 *
 * Checks that a valid admin token exists before rendering children.
 * If no token or token is expired, redirects to /admin/login.
 * This is a runtime guard (complementing the compile-time FeatureGate).
 */

import { type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAppSelector } from '../store/hooks'
import { authStorage } from '../services/authStorage'

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 < Date.now()
  } catch {
    return true
  }
}

interface AdminRouteGuardProps {
  children: ReactNode
}

export default function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const location = useLocation()
  const tokens = useAppSelector((state) => state.user.tokens)

  const accessToken = tokens?.access_token || authStorage.getAccessToken()

  if (!accessToken || isTokenExpired(accessToken)) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
