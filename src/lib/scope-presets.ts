// Common platform scope presets
export interface ScopePreset {
  platform: string
  scopes: string[]
  description: string
  expiryDays?: number
}

export const SCOPE_PRESETS: ScopePreset[] = [
  {
    platform: 'GitHub',
    scopes: ['repo', 'user', 'read:org', 'workflow', 'write:packages', 'delete:packages'],
    description: 'Full access to repositories, user data, and packages',
    expiryDays: 90,
  },
  {
    platform: 'GitHub',
    scopes: ['repo:status', 'repo:invite'],
    description: 'Read-only access to repository status',
    expiryDays: 365,
  },
  {
    platform: 'GitHub',
    scopes: ['user:email', 'read:user'],
    description: 'Read user profile and emails',
    expiryDays: 365,
  },
  {
    platform: 'GitLab',
    scopes: ['api', 'read_user', 'read_api', 'write_repository'],
    description: 'Full API access',
    expiryDays: 90,
  },
  {
    platform: 'PyPI',
    scopes: ['pypi-submit', 'pypi-upload'],
    description: 'Package upload permissions',
    expiryDays: undefined, // PyPI tokens don't expire
  },
  {
    platform: 'npm',
    scopes: ['publish', 'read', 'automation'],
    description: 'Package publishing and automation',
    expiryDays: 365,
  },
  {
    platform: 'AWS',
    scopes: ['s3:*', 'ec2:*', 'lambda:*'],
    description: 'Common AWS service access',
    expiryDays: 90,
  },
  {
    platform: 'Google Cloud',
    scopes: ['cloud-platform', 'userinfo.email'],
    description: 'Full cloud platform access',
    expiryDays: 90,
  },
  {
    platform: 'Vercel',
    scopes: ['deployments:write', 'projects:read'],
    description: 'Deploy and read projects',
    expiryDays: 365,
  },
  {
    platform: 'Slack',
    scopes: ['channels:read', 'chat:write', 'users:read'],
    description: 'Read channels and send messages',
    expiryDays: 365,
  },
  {
    platform: 'Discord',
    scopes: ['identify', 'guilds', 'bot'],
    description: 'User identity and bot access',
    expiryDays: undefined,
  },
  {
    platform: 'OpenAI',
    scopes: ['full'],
    description: 'Full API access',
    expiryDays: 90,
  },
]

// Get preset by platform
export function getScopePresets(platform: string): ScopePreset[] {
  return SCOPE_PRESETS.filter(
    p => p.platform.toLowerCase() === platform.toLowerCase()
  )
}

// Get default expiry suggestion for platform
export function getDefaultExpiryDays(platform: string): number | undefined {
  const preset = SCOPE_PRESETS.find(
    p => p.platform.toLowerCase() === platform.toLowerCase()
  )
  return preset?.expiryDays
}
