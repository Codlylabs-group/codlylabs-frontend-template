import { describe, expect, it } from 'vitest'

import { inferWorkspaceNameFromEmail } from './workspaceNaming'

describe('workspaceNaming', () => {
  it('falls back to Mi Workspace for public email providers', () => {
    expect(inferWorkspaceNameFromEmail('founder@gmail.com')).toBe('Mi Workspace')
    expect(inferWorkspaceNameFromEmail('operator@outlook.com')).toBe('Mi Workspace')
  })

  it('infers a company-like workspace name from corporate domains', () => {
    expect(inferWorkspaceNameFromEmail('team@acme-ai.com')).toBe('Acme Ai')
    expect(inferWorkspaceNameFromEmail('ops@mail.globex.com.ar')).toBe('Globex')
  })
})
