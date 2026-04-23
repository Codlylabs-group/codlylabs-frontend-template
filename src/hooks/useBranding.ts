/**
 * useBranding — detects tenant from hostname and injects CSS custom properties.
 *
 * On codlylabs.ai (no subdomain) → uses CodlyLabs defaults.
 * On {slug}.codlylabs.ai → resolves tenant branding via API.
 *
 * CSS custom properties injected on :root:
 *   --brand-primary, --brand-primary-dark, --brand-accent,
 *   --brand-surface, --brand-text-primary, --brand-text-secondary,
 *   --brand-radius
 */
import { useEffect, useState } from 'react'
import { brandingApi } from '../services/branding'
import { getTenantSlugFromHostname } from '../utils/platformBranding'
import { TENANT_STATIC_BRANDING } from '../constants/tenantBranding'

const DEFAULTS = {
  primary: '#6366f1',
  primaryDark: '#4f46e5',
  accent: '#7C3AED',
  surface: '#ffffff',
  textPrimary: '#111827',
  textSecondary: '#4b5563',
}

const RADIUS_MAP: Record<string, string> = {
  rounded: '12px',
  sharp: '4px',
  pill: '9999px',
}

export interface TenantBranding {
  slug: string | null
  isWhiteLabel: boolean
  brandName: string
  colors: typeof DEFAULTS
  borderRadius: string
  logoUrl: string | null
  faviconUrl: string | null
  loginTitle: string | null
  loginSubtitle: string | null
  loginHeroTitle: string | null
  loginHeroDescription: string | null
  badgeConfig: { position: string; style: string }
  loading: boolean
}

export function useBranding(): TenantBranding {
  const [tenant, setTenant] = useState<TenantBranding>({
    slug: null,
    isWhiteLabel: false,
    brandName: 'CodlyLabs',
    colors: { ...DEFAULTS },
    borderRadius: '12px',
    logoUrl: null,
    faviconUrl: null,
    loginTitle: null,
    loginSubtitle: null,
    loginHeroTitle: null,
    loginHeroDescription: null,
    badgeConfig: { position: 'sidebar_footer', style: 'full' },
    loading: true,
  })

  useEffect(() => {
    // Build-time baked branding (dedicated tenant builds) wins over both
    // the hostname lookup and the /resolve/{slug} runtime fetch.
    if (TENANT_STATIC_BRANDING) {
      const b = TENANT_STATIC_BRANDING
      const colors = { ...DEFAULTS, ...b.colors }
      injectCSSProperties(colors, b.borderRadius)
      if (b.faviconUrl) {
        const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null
        if (link) link.href = b.faviconUrl
      }
      if (b.brandName) {
        updateMetaTag('og:title', `${b.brandName} — Powered by CodlyLabs`)
        updateMetaTag('og:site_name', b.brandName)
        updateMetaTag('twitter:title', `${b.brandName} — Powered by CodlyLabs`)
      }
      if (b.tagline) {
        updateMetaTag('og:description', b.tagline)
        updateMetaTag('twitter:description', b.tagline)
        updateMetaTag('description', b.tagline, 'name')
      }
      setTenant({
        slug: b.slug,
        isWhiteLabel: true,
        brandName: b.brandName,
        colors,
        borderRadius: RADIUS_MAP[b.borderRadius] || '12px',
        logoUrl: b.logoUrl,
        faviconUrl: b.faviconUrl,
        loginTitle: b.loginTitle,
        loginSubtitle: b.loginSubtitle,
        loginHeroTitle: b.loginHeroTitle,
        loginHeroDescription: b.loginHeroDescription,
        badgeConfig: b.badgeConfig || { position: 'sidebar_footer', style: 'full' },
        loading: false,
      })
      return
    }

    const slug = getTenantSlugFromHostname()

    if (!slug) {
      // No subdomain — use CodlyLabs defaults
      injectCSSProperties(DEFAULTS, 'rounded')
      setTenant(prev => ({ ...prev, loading: false }))
      return
    }

    // Resolve tenant
    brandingApi.resolve(slug)
      .then(data => {
        const colors = { ...DEFAULTS, ...data.colors }
        const radius = data.border_radius || 'rounded'
        injectCSSProperties(colors, radius)

        // Update favicon if provided
        if (data.favicon_url) {
          const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement
          if (link) link.href = data.favicon_url
        }

        // Update OG tags
        if (data.brand_name) {
          updateMetaTag('og:title', `${data.brand_name} — Powered by CodlyLabs`)
          updateMetaTag('og:site_name', data.brand_name)
          updateMetaTag('twitter:title', `${data.brand_name} — Powered by CodlyLabs`)
        }
        if (data.tagline) {
          updateMetaTag('og:description', data.tagline)
          updateMetaTag('twitter:description', data.tagline)
          updateMetaTag('description', data.tagline, 'name')
        }

        setTenant({
          slug,
          isWhiteLabel: true,
          brandName: data.brand_name || 'Workspace',
          colors,
          borderRadius: RADIUS_MAP[radius] || '12px',
          logoUrl: data.logo_url || null,
          faviconUrl: data.favicon_url || null,
          loginTitle: data.login_title || null,
          loginSubtitle: data.login_subtitle || null,
          loginHeroTitle: data.login_hero_title || null,
          loginHeroDescription: data.login_hero_description || null,
          badgeConfig: data.badge_config || { position: 'sidebar_footer', style: 'full' },
          loading: false,
        })
      })
      .catch(() => {
        // Slug not found — fall back to defaults
        injectCSSProperties(DEFAULTS, 'rounded')
        setTenant(prev => ({ ...prev, loading: false }))
      })
  }, [])

  return tenant
}

function injectCSSProperties(
  colors: typeof DEFAULTS,
  borderRadius: string,
) {
  const root = document.documentElement
  root.style.setProperty('--brand-primary', colors.primary)
  root.style.setProperty('--brand-primary-dark', colors.primaryDark)
  root.style.setProperty('--brand-accent', colors.accent)
  root.style.setProperty('--brand-surface', colors.surface)
  root.style.setProperty('--brand-text-primary', colors.textPrimary)
  root.style.setProperty('--brand-text-secondary', colors.textSecondary)
  root.style.setProperty('--brand-radius', RADIUS_MAP[borderRadius] || '12px')
}

function updateMetaTag(key: string, content: string, attr: 'property' | 'name' = 'property') {
  const el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null
  if (el) {
    el.content = content
  }
}
