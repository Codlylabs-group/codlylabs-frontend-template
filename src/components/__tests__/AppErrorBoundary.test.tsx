import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppErrorBoundary } from '../AppErrorBoundary'

// Component that throws an error on demand
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) throw new Error('Test error')
  return <div>Content renders fine</div>
}

describe('AppErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('renders children when no error occurs', () => {
    render(
      <AppErrorBoundary>
        <ThrowError shouldThrow={false} />
      </AppErrorBoundary>
    )
    expect(screen.getByText('Content renders fine')).toBeInTheDocument()
  })

  it('renders error UI when child throws', () => {
    render(
      <AppErrorBoundary>
        <ThrowError shouldThrow={true} />
      </AppErrorBoundary>
    )
    expect(screen.getByText('Se produjo un error en la interfaz')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('provides a reload button', () => {
    render(
      <AppErrorBoundary>
        <ThrowError shouldThrow={true} />
      </AppErrorBoundary>
    )
    expect(screen.getByText('Recargar')).toBeInTheDocument()
  })

  it('provides a link to home', () => {
    render(
      <AppErrorBoundary>
        <ThrowError shouldThrow={true} />
      </AppErrorBoundary>
    )
    const homeLink = screen.getByText('Ir al inicio')
    expect(homeLink).toHaveAttribute('href', '/')
  })

  it('reload button calls window.location.reload', async () => {
    const user = userEvent.setup()
    const reloadMock = vi.fn()
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...window.location, reload: reloadMock },
    })

    render(
      <AppErrorBoundary>
        <ThrowError shouldThrow={true} />
      </AppErrorBoundary>
    )

    const reloadButton = screen.getByText('Recargar')
    await user.click(reloadButton)

    expect(reloadMock).toHaveBeenCalled()
  })

  it('displays alert role for accessibility', () => {
    render(
      <AppErrorBoundary>
        <ThrowError shouldThrow={true} />
      </AppErrorBoundary>
    )
    const alert = screen.getByRole('alert')
    expect(alert).toHaveAttribute('aria-live', 'assertive')
  })

  it('renders error message text', () => {
    render(
      <AppErrorBoundary>
        <ThrowError shouldThrow={true} />
      </AppErrorBoundary>
    )
    expect(screen.getByText('La aplicación evitó una caída total. Recarga la página para continuar.')).toBeInTheDocument()
  })
})
