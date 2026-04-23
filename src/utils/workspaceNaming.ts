const PUBLIC_EMAIL_DOMAINS = new Set([
  'gmail.com',
  'googlemail.com',
  'hotmail.com',
  'outlook.com',
  'live.com',
  'msn.com',
  'yahoo.com',
  'ymail.com',
  'icloud.com',
  'me.com',
  'mac.com',
  'aol.com',
  'gmx.com',
  'proton.me',
  'protonmail.com',
  'hey.com',
])

const MULTI_LEVEL_TLDS = new Set(['com', 'co', 'org', 'net'])

function extractWorkspaceSeed(domain: string): string {
  const parts = domain
    .trim()
    .toLowerCase()
    .split('.')
    .map((part) => part.trim())
    .filter(Boolean)

  if (parts.length === 0) return ''
  if (parts.length === 1) return parts[0]
  if (parts.length >= 3 && MULTI_LEVEL_TLDS.has(parts[parts.length - 2])) {
    return parts[parts.length - 3] || ''
  }
  return parts[parts.length - 2] || ''
}

export function inferWorkspaceNameFromEmail(email?: string | null): string {
  const normalizedEmail = String(email ?? '').trim().toLowerCase()
  const domain = normalizedEmail.split('@')[1] || ''
  if (!domain || PUBLIC_EMAIL_DOMAINS.has(domain)) {
    return 'Mi Workspace'
  }

  const seed = extractWorkspaceSeed(domain).replace(/[-_]+/g, ' ').trim()
  if (!seed) return 'Mi Workspace'

  return seed
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}
