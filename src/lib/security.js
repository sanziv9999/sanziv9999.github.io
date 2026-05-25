export const GITHUB_USER_PATTERN = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/
export const GITHUB_REPO_PATTERN = /^[a-zA-Z0-9._-]{1,100}$/
const SAFE_HTTP_URL = /^https:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/\S*)?$/

export function assertGitHubUsername(username) {
  if (!GITHUB_USER_PATTERN.test(username)) {
    throw new Error('Invalid GitHub username')
  }
  return username
}

export function assertGitHubRepoName(name) {
  if (!GITHUB_REPO_PATTERN.test(name)) {
    throw new Error('Invalid repository name')
  }
  return name
}

export function isAllowedGitHubApiPath(path) {
  const p = (path.startsWith('/') ? path : `/${path}`).split('?')[0]
  const user = '[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?'
  const repo = '[a-zA-Z0-9._-]{1,100}'
  return (
    new RegExp(`^/users/${user}$`).test(p) ||
    new RegExp(`^/users/${user}/repos$`).test(p) ||
    new RegExp(`^/repos/${user}/${repo}/contributors$`).test(p)
  )
}

export function sanitizeExternalUrl(url, fallback) {
  if (typeof url !== 'string' || !SAFE_HTTP_URL.test(url)) {
    return fallback
  }
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'https:') return fallback
    return parsed.href
  } catch {
    return fallback
  }
}

export function sanitizeProject(raw, defaultUser) {
  if (!raw || typeof raw.name !== 'string' || !GITHUB_REPO_PATTERN.test(raw.name)) {
    return null
  }

  const fallbackUrl = `https://github.com/${defaultUser}/${raw.name}`
  const url = sanitizeExternalUrl(raw.url, fallbackUrl)

  return {
    name: raw.name,
    description: String(raw.description ?? '')
      .slice(0, 500)
      .replace(/[<>]/g, ''),
    tech: Array.isArray(raw.tech)
      ? raw.tech
          .filter((t) => typeof t === 'string')
          .slice(0, 12)
          .map((t) => t.slice(0, 40).replace(/[<>]/g, ''))
      : [],
    url,
    commits: Math.min(Math.max(0, Number(raw.commits) || 0), 999_999),
  }
}

export function sanitizeCachedProjects(projects, defaultUser) {
  if (!Array.isArray(projects)) return []
  return projects
    .map((p) => sanitizeProject(p, defaultUser))
    .filter(Boolean)
}

/** Reduces plain-text email scraping; still usable via mailto on click */
export function buildMailto(parts) {
  if (!Array.isArray(parts) || parts.length !== 2) return null
  const [user, domain] = parts.map((p) => String(p).trim())
  if (!user || !domain || /[\s@<>]/.test(user) || /[\s@<>]/.test(domain)) {
    return null
  }
  return `mailto:${user}@${domain}`
}

export function obfuscatedEmailLabel(parts) {
  if (!Array.isArray(parts) || parts.length !== 2) return 'Email'
  return `${parts[0]} [at] ${parts[1].replace('.', ' [dot] ')}`
}
