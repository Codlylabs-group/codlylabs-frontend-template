import { Component, type ErrorInfo, type ReactNode } from 'react'

interface AppErrorBoundaryProps {
  children: ReactNode
}

interface AppErrorBoundaryState {
  hasError: boolean
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  constructor(props: AppErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[UI] Unhandled render error', { error, errorInfo })
  }

  private handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-white border border-danger-200 rounded-xl shadow-sm p-6 space-y-4" role="alert" aria-live="assertive">
            <h1 className="text-lg font-semibold text-neutral-900">Se produjo un error en la interfaz</h1>
            <p className="text-sm text-neutral-700">
              La aplicación evitó una caída total. Recarga la página para continuar.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="inline-flex items-center px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700"
              >
                Recargar
              </button>
              <a
                href="/"
                className="inline-flex items-center px-4 py-2 rounded-lg border border-neutral-300 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              >
                Ir al inicio
              </a>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
