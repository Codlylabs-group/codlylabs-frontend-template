/**
 * Preview URL normalization — shared between TryPage and TryEditorPage.
 *
 * Handles three cases:
 *  1. Relative URLs (/) — resolved against API_BASE_URL
 *  2. Loopback URLs (localhost/127.0.0.1) — rewritten to current host in production
 *  3. Absolute URLs — returned as-is
 */

import { API_BASE_URL } from '../services/api'

const isLoopbackHost = (host: string): boolean =>
  host === 'localhost' || host === '127.0.0.1' || host === '::1'

export function normalizePreviewUrl(rawUrl: string): string {
  if (rawUrl.startsWith('/')) {
    if (API_BASE_URL) {
      try {
        return new URL(rawUrl, API_BASE_URL).toString()
      } catch {
        return rawUrl
      }
    }
    return rawUrl
  }

  try {
    const parsed = new URL(rawUrl)
    if (typeof window === 'undefined') return parsed.toString()

    if (isLoopbackHost(parsed.hostname) && !isLoopbackHost(window.location.hostname)) {
      parsed.hostname = window.location.hostname
      parsed.protocol = window.location.protocol
    }

    return parsed.toString()
  } catch {
    return rawUrl
  }
}
