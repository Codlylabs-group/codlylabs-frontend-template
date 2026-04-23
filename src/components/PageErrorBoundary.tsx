/**
 * Page-level Error Boundary
 *
 * Unlike the global AppErrorBoundary, this boundary catches errors
 * within a single page section while keeping the rest of the app
 * functional. Use it to wrap independent page sections (sidebar,
 * main content, data panels) so a failure in one area does not
 * take down the entire view.
 *
 * Usage:
 *   <PageErrorBoundary section="panel de analytics">
 *     <AnalyticsChart />
 *   </PageErrorBoundary>
 */

import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { logger } from '../utils/logger'

interface PageErrorBoundaryProps {
  children: ReactNode
  /** Human-readable section name shown in the fallback UI */
  section?: string
  /** Optional custom fallback component */
  fallback?: ReactNode
}

interface PageErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class PageErrorBoundary extends Component<PageErrorBoundaryProps, PageErrorBoundaryState> {
  constructor(props: PageErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): PageErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.error('Page section error', {
      section: this.props.section ?? 'unknown',
      error: error.message,
      componentStack: errorInfo.componentStack ?? '',
    })
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div
          className="flex flex-col items-center justify-center gap-4 p-8 rounded-lg border border-danger-200 bg-danger-50 text-center"
          role="alert"
          aria-live="polite"
        >
          <AlertTriangle className="w-10 h-10 text-danger-500" aria-hidden="true" />
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-neutral-900">
              Error al cargar {this.props.section ?? 'esta sección'}
            </h3>
            <p className="text-xs text-neutral-500">
              Puedes intentar de nuevo o continuar usando el resto de la página.
            </p>
          </div>
          <button
            type="button"
            onClick={this.handleRetry}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition focus-ring"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            Reintentar
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default PageErrorBoundary
