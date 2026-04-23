const TENANT_HOST_RE = /^([a-z0-9][a-z0-9-]*[a-z0-9]?)\.codlylabs\.ai$/

// Subdominios de infraestructura que NO son tenants white-label.
// Cualquiera de estos debe comportarse como el apex (landing pública).
const RESERVED_SUBDOMAINS = new Set([
  'www',
  'api',
  'app',
  'poc',
  'admin',
  'cdn',
  'assets',
  'static',
  'mail',
  'email',
  'status',
  'docs',
  'blog',
])

export const DEFAULT_PLATFORM_NAME = 'CodlyLabs'

function normalizeHostname(hostname?: string): string {
  if (hostname) return hostname.trim().toLowerCase()
  if (typeof window === 'undefined') return ''
  return window.location.hostname.trim().toLowerCase()
}

export function getTenantSlugFromHostname(hostname?: string): string | null {
  const normalized = normalizeHostname(hostname)
  const match = TENANT_HOST_RE.exec(normalized)
  if (!match) return null
  const slug = match[1]
  if (RESERVED_SUBDOMAINS.has(slug)) return null
  return slug
}

export function isTenantSubdomainHost(hostname?: string): boolean {
  return Boolean(getTenantSlugFromHostname(hostname))
}

export function resolvePlatformName(options: {
  tenantBrandName?: string | null
  hostname?: string
} = {}): string {
  const { tenantBrandName, hostname } = options
  const normalizedBrand = String(tenantBrandName ?? '').trim()

  if (isTenantSubdomainHost(hostname) && normalizedBrand) {
    return normalizedBrand
  }

  return DEFAULT_PLATFORM_NAME
}

export function buildDocumentTitle(
  pageTitle?: string | null,
  options: {
    tenantBrandName?: string | null
    hostname?: string
  } = {},
): string {
  const normalizedPageTitle = String(pageTitle ?? '').trim()
  const platformName = resolvePlatformName(options)

  return normalizedPageTitle ? `${normalizedPageTitle} | ${platformName}` : platformName
}

// ─────────────────────────────────────────────────────────────
// Workspace brand resolution (CodlyLabs central vs tenant)
// ─────────────────────────────────────────────────────────────

export const CODLYLABS_PLATFORM_PALETTE = {
  primary: '#6366f1',
  primaryDark: '#4f46e5',
  accent: '#7C3AED',
  surface: '#ffffff',
} as const

export interface WorkspaceBrandShape {
  name: string
  initials: string
  primary: string
  primaryDark: string
  accent: string
  surface: string
  logo_url?: string | null
  favicon_url?: string | null
  tagline?: string | null
  login_title?: string | null
  login_subtitle?: string | null
  login_hero_title?: string | null
  login_hero_description?: string | null
  border_radius?: string
  badge_config?: { position: string; style: string }
  subdomain_slug?: string | null
}

/**
 * Decide which brand palette should drive the workspace UI.
 *
 * - On a tenant subdomain (`{slug}.codlylabs.ai`) or inside a dedicated tenant
 *   build (`TENANT_STATIC_BRANDING` baked in): honour whatever the backend
 *   returns — that's the tenant's own palette.
 * - On the CodlyLabs central workspace (apex / localhost): force the CodlyLabs
 *   platform palette. A tenant admin editing their branding from the central
 *   workspace must not see their draft colors bleed into the CodlyLabs UI.
 *
 * `name`, `initials`, `logo_url` are preserved either way — they describe the
 * org the user belongs to, which is independent of the palette.
 */
export function resolveWorkspaceBrand(
  brand: WorkspaceBrandShape,
  options: { hostname?: string; isTenantBuild?: boolean } = {},
): WorkspaceBrandShape {
  const { hostname, isTenantBuild = false } = options
  if (isTenantBuild || isTenantSubdomainHost(hostname)) {
    return brand
  }
  return {
    ...brand,
    primary: CODLYLABS_PLATFORM_PALETTE.primary,
    primaryDark: CODLYLABS_PLATFORM_PALETTE.primaryDark,
    accent: CODLYLABS_PLATFORM_PALETTE.accent,
    surface: CODLYLABS_PLATFORM_PALETTE.surface,
  }
}
