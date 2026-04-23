import { describe, expect, it } from 'vitest'

import {
  buildDocumentTitle,
  getTenantSlugFromHostname,
  isTenantSubdomainHost,
  resolvePlatformName,
} from './platformBranding'

describe('platformBranding', () => {
  it('detects tenant slugs on codlylabs subdomains', () => {
    expect(getTenantSlugFromHostname('acme.codlylabs.ai')).toBe('acme')
    expect(isTenantSubdomainHost('acme.codlylabs.ai')).toBe(true)
  })

  it('treats localhost and apex hosts as the main platform', () => {
    expect(getTenantSlugFromHostname('localhost')).toBeNull()
    expect(getTenantSlugFromHostname('codlylabs.ai')).toBeNull()
    expect(isTenantSubdomainHost('localhost')).toBe(false)
  })

  it('keeps CodlyLabs as the platform brand on the main domain', () => {
    expect(resolvePlatformName({ hostname: 'localhost', tenantBrandName: 'Acme' })).toBe('CodlyLabs')
    expect(buildDocumentTitle('Workspace', { hostname: 'localhost', tenantBrandName: 'Acme' })).toBe(
      'Workspace | CodlyLabs',
    )
  })

  it('uses the tenant brand on white-label subdomains', () => {
    expect(resolvePlatformName({ hostname: 'acme.codlylabs.ai', tenantBrandName: 'Acme' })).toBe('Acme')
    expect(buildDocumentTitle('Workspace', { hostname: 'acme.codlylabs.ai', tenantBrandName: 'Acme' })).toBe(
      'Workspace | Acme',
    )
  })
})
