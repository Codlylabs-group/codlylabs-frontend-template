import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import { useLogout } from './useLogout'
import { ONBOARDING_STORAGE_KEY, SMART_CONTEXT_KEY } from '../utils/onboardingStorage'

function LogoutHarness({ redirectTo }: { redirectTo?: string }) {
  const finish = useLogout(redirectTo)

  return (
    <button type="button" onClick={finish}>
      Finalizar
    </button>
  )
}

describe('useLogout', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('redirects to home by default and clears onboarding state', async () => {
    const user = userEvent.setup()
    window.localStorage.setItem(ONBOARDING_STORAGE_KEY, '{"sessionId":"abc"}')
    window.localStorage.setItem(SMART_CONTEXT_KEY, '{"vertical":"fintech"}')

    render(
      <MemoryRouter initialEntries={['/preview/test']}>
        <Routes>
          <Route path="/preview/:pocId" element={<LogoutHarness />} />
          <Route path="/" element={<div>Home</div>} />
        </Routes>
      </MemoryRouter>
    )

    await user.click(screen.getByRole('button', { name: 'Finalizar' }))

    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(window.localStorage.getItem(ONBOARDING_STORAGE_KEY)).toBeNull()
    expect(window.localStorage.getItem(SMART_CONTEXT_KEY)).toBeNull()
  })

  it('redirects to a custom route when requested', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/preview/test']}>
        <Routes>
          <Route path="/preview/:pocId" element={<LogoutHarness redirectTo="/workspace" />} />
          <Route path="/workspace" element={<div>Workspace</div>} />
        </Routes>
      </MemoryRouter>
    )

    await user.click(screen.getByRole('button', { name: 'Finalizar' }))

    expect(screen.getByText('Workspace')).toBeInTheDocument()
  })
})
