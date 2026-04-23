import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { clearOnboardingState } from '../utils/onboardingStorage'
import { pocGeneratorApi } from '../services/pocGenerator'

/**
 * "Finish" hook — clears onboarding state and navigates to the requested
 * route. Does NOT log the user out.
 */
export function useLogout(redirectTo = '/') {
  const navigate = useNavigate()

  return useCallback(() => {
    clearOnboardingState()
    navigate(redirectTo, { replace: true })
  }, [navigate, redirectTo])
}

/**
 * Finish and also destroy an active preview.
 */
export function useFinishWithPreview(redirectTo = '/') {
  const finish = useLogout(redirectTo)

  return useCallback((pocId?: string) => {
    if (pocId) {
      pocGeneratorApi.destroyPreview(pocId).catch(() => {})
    }
    finish()
  }, [finish])
}
