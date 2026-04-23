export const ONBOARDING_STORAGE_KEY = 'onboarding_state_v1'
export const SMART_CONTEXT_KEY = 'smart_onboarding_context'

export function clearOnboardingState(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(ONBOARDING_STORAGE_KEY)
    window.localStorage.removeItem(SMART_CONTEXT_KEY)
  } catch (e) {
    console.error('Error clearing onboarding state from storage', e)
  }
}

export function saveSmartContext(context: any): void {
  try {
    window.localStorage.setItem(SMART_CONTEXT_KEY, JSON.stringify(context))
  } catch (e) {
    console.error('Error saving smart context', e)
  }
}

export function getSmartContext(): any | null {
  try {
    const raw = window.localStorage.getItem(SMART_CONTEXT_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}
