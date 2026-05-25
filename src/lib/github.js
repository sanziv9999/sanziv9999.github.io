import { FALLBACK_PROJECTS, PROJECT_OVERRIDES, profile } from '../data'
import {
  assertGitHubRepoName,
  assertGitHubUsername,
  GITHUB_REPO_PATTERN,
  isAllowedGitHubApiPath,
  sanitizeCachedProjects,
  sanitizeProject,
} from './security'

const CACHE_KEY = 'portfolio-top-repos'
const CACHE_MS = 60 * 60 * 1000

/** Dev: Vite proxy. Production: direct API or build-time github-data.json on GitHub Pages */
const API_BASE = import.meta.env.DEV
  ? '/api/github'
  : 'https://api.github.com'

const BUILT_DATA_URL = `${import.meta.env.BASE_URL}github-data.json`

const HEADERS = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
}

function techFromLanguage(language, name) {
  const n = name.toLowerCase()
  if (!language) {
    if (n.includes('react')) return ['React']
    if (n.includes('django')) return ['Django', 'Python']
    return ['Code']
  }
  if (language === 'Blade') return ['Laravel', 'PHP']
  if (language === 'JavaScript' && n.includes('react')) return ['React', 'JavaScript']
  if (language === 'HTML' && n.includes('flash')) return ['Django', 'Python', 'HTML']
  return [language]
}

function fallbackDescription(name) {
  return name.replace(/-/g, ' ')
}

function applyProjectOverrides(project) {
  const override = PROJECT_OVERRIDES[project.name]
  if (!override) return project
  return {
    ...project,
    ...(override.description && { description: override.description }),
    ...(override.tech && { tech: override.tech }),
  }
}

function enrichProjects(projects) {
  return projects.map(applyProjectOverrides)
}

function apiUrl(path) {
  const normalized = path.startsWith('/') ? path : `/${path}`
  if (!isAllowedGitHubApiPath(normalized)) {
    throw new Error('Blocked GitHub API path')
  }
  return `${API_BASE}${normalized}`
}

async function getJson(path, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    const res = await fetch(apiUrl(path), { headers: HEADERS })

    if (res.status === 202) {
      await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)))
      continue
    }

    if (res.status === 403) {
      const remaining = res.headers.get('X-RateLimit-Remaining')
      if (remaining === '0') {
        throw new Error(
          'GitHub rate limit reached. Wait a few minutes and click Retry.',
        )
      }
      throw new Error('GitHub API access denied (403).')
    }

    if (!res.ok) {
      throw new Error(`GitHub API error (${res.status})`)
    }

    return res.json()
  }

  throw new Error('GitHub API is still processing. Please retry.')
}

async function mapInBatches(items, mapper, batchSize = 4) {
  const results = []
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    const batchResults = await Promise.all(batch.map(mapper))
    results.push(...batchResults)
  }
  return results
}

async function getContributorCommits(username, repoName) {
  try {
    const contributors = await getJson(
      `/repos/${username}/${repoName}/contributors?per_page=100`,
      2,
    )
    if (!Array.isArray(contributors)) return 0
    const mine = contributors.find((c) => c.login === username)
    return mine?.contributions ?? 0
  } catch {
    return 0
  }
}

async function loadBuiltData(limit, owner) {
  try {
    const res = await fetch(BUILT_DATA_URL, { cache: 'no-store' })
    if (!res.ok) return null
    const json = await res.json()
    const safe = sanitizeCachedProjects(json.projects, owner)
    if (!safe.length) return null
    return {
      projects: enrichProjects(safe).slice(0, limit),
      totalRepos: json.totalRepos ?? safe.length,
      fromFallback: false,
    }
  } catch {
    return null
  }
}

export async function fetchTopRepos(username, limit = 6) {
  const ghUser = assertGitHubUsername(username)
  const owner = assertGitHubUsername(profile.handle)

  if (ghUser !== owner) {
    throw new Error('GitHub user mismatch')
  }

  const built = await loadBuiltData(limit, owner)
  if (built) return built

  const cached = sessionStorage.getItem(CACHE_KEY)
  if (cached) {
    try {
      const { ts, data } = JSON.parse(cached)
      const safe = sanitizeCachedProjects(data.projects, owner)
      if (Date.now() - ts < CACHE_MS && safe.length) {
        return {
          ...data,
          projects: enrichProjects(safe).slice(0, limit),
        }
      }
    } catch {
      sessionStorage.removeItem(CACHE_KEY)
    }
  }

  try {
    const user = await getJson(`/users/${ghUser}`)
    const repos = await getJson(
      `/users/${ghUser}/repos?per_page=100&sort=pushed`,
    )

    if (!Array.isArray(repos)) {
      throw new Error('Unexpected GitHub API response')
    }

    const eligible = repos.filter(
      (r) =>
        r &&
        !r.fork &&
        r.name !== ghUser &&
        GITHUB_REPO_PATTERN.test(r.name),
    )

    // Only score the most recently pushed repos to limit API calls
    const candidates = [...eligible]
      .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
      .slice(0, Math.max(limit * 2, 12))

    const withCommits = await mapInBatches(candidates, async (repo) => {
      const repoName = assertGitHubRepoName(repo.name)
      const commits = await getContributorCommits(ghUser, repoName)
      const project = sanitizeProject(
        {
          name: repoName,
          description: repo.description || fallbackDescription(repoName),
          tech: techFromLanguage(repo.language, repoName),
          url: repo.html_url,
          commits,
        },
        owner,
      )
      return project
    })

    const projects = enrichProjects(
      withCommits
        .filter(Boolean)
        .sort((a, b) => b.commits - a.commits)
        .slice(0, limit),
    )

    const data = {
      projects,
      totalRepos: user.public_repos,
      fromFallback: false,
    }

    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }))
    return data
  } catch {
    if (import.meta.env.DEV) {
      console.warn('[github] fetch failed, using fallback')
    }
    return {
      projects: FALLBACK_PROJECTS.slice(0, limit),
      totalRepos: FALLBACK_PROJECTS.length,
      fromFallback: true,
      error: 'Could not load repositories',
    }
  }
}

export function clearReposCache() {
  sessionStorage.removeItem(CACHE_KEY)
}
