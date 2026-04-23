/**
 * Utility to manage session names (user names associated with sessions)
 */

const SESSION_NAME_STORAGE_KEY = 'session_names'

interface SessionNameMap {
  [sessionId: string]: string
}

/**
 * Get the stored session names map
 */
function getSessionNamesMap(): SessionNameMap {
  if (typeof window === 'undefined') return {}
  const stored = window.localStorage.getItem(SESSION_NAME_STORAGE_KEY)
  if (!stored) return {}
  try {
    return JSON.parse(stored)
  } catch {
    return {}
  }
}

/**
 * Save the session names map
 */
function saveSessionNamesMap(map: SessionNameMap): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(SESSION_NAME_STORAGE_KEY, JSON.stringify(map))
}

/**
 * Associate a session ID with a user name
 */
export function setSessionName(sessionId: string, userName: string): void {
  const map = getSessionNamesMap()
  map[sessionId] = userName
  saveSessionNamesMap(map)
}

/**
 * Get the user name associated with a session ID
 * Returns the user name if found, or the session ID if not found
 */
export function getSessionName(sessionId: string): string {
  const map = getSessionNamesMap()
  return map[sessionId] || sessionId
}

/**
 * Get the display name for a session
 * If a user name is associated, returns "{userName}'s session"
 * Otherwise returns "Session: {sessionId}"
 */
export function getSessionDisplayName(sessionId: string): string {
  const userName = getSessionName(sessionId)
  if (userName !== sessionId) {
    return `${userName}'s session`
  }
  return `Session: ${sessionId}`
}

/**
 * Clear all session names
 */
export function clearSessionNames(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(SESSION_NAME_STORAGE_KEY)
}
