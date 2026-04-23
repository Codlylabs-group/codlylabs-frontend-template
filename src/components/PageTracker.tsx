import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { api } from '../services/api'

// Generate or retrieve a session ID for anonymous users
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('analytics_session_id')
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    sessionStorage.setItem('analytics_session_id', sessionId)
  }
  return sessionId
}

// Map route paths to friendly page titles
const getPageTitle = (path: string): string => {
  const titleMap: Record<string, string> = {
    '/': 'Home',
    '/roi-oracle': 'ROI Oracle',
    '/vertical-pack': 'Vertical Pack',
    '/onboarding': 'Onboarding',
    '/about-platform': 'About Platform',
    '/diagnosis': 'Diagnosis',
    '/recommendation': 'Recommendation',
    '/poc-generator': 'POC Generator',
    '/roadmap': 'Roadmap',
    '/analytics': 'Analytics',
  }

  return titleMap[path] || path
}

// Check if path should be tracked (exclude admin pages)
const shouldTrackPath = (path: string): boolean => {
  // Don't track admin pages
  if (path.startsWith('/admin')) {
    return false
  }

  return true
}

export default function PageTracker() {
  const location = useLocation()
  const previousPath = useRef<string>('')

  useEffect(() => {
    const trackPageView = async () => {
      const currentPath = location.pathname

      // Don't track if it's the same page (handles re-renders)
      if (currentPath === previousPath.current) {
        return
      }

      // Don't track admin pages
      if (!shouldTrackPath(currentPath)) {
        previousPath.current = currentPath
        return
      }

      const sessionId = getSessionId()
      const pageTitle = getPageTitle(currentPath)
      const referrer = previousPath.current || null

      try {
        await api.post('/api/v1/analytics/track', {
          path: currentPath,
          page_title: pageTitle,
          referrer: referrer,
          session_id: sessionId
        })
      } catch (error) {
        // Silently fail - don't disrupt user experience if tracking fails
        console.debug('Analytics tracking failed:', error)
      }

      // Update previous path for next navigation
      previousPath.current = currentPath
    }

    trackPageView()
  }, [location.pathname])

  // This component doesn't render anything
  return null
}
