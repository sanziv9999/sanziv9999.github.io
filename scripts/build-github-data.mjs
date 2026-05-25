/**
 * Build-time GitHub fetch for GitHub Pages (no browser proxy).
 * Run in CI: node scripts/build-github-data.mjs
 */
import { writeFileSync } from 'fs'

const USER = process.env.GITHUB_USER || 'sanziv9999'
const LIMIT = Number(process.env.TOP_REPO_COUNT || 6)
const OUT = 'public/github-data.json'

const headers = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'portfolio-build',
  'X-GitHub-Api-Version': '2022-11-28',
}

if (process.env.GITHUB_TOKEN) {
  headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
}

async function getJson(path) {
  const res = await fetch(`https://api.github.com${path}`, { headers })
  if (!res.ok) throw new Error(`${path} → ${res.status}`)
  return res.json()
}

function techFromLanguage(language, name) {
  const n = name.toLowerCase()
  if (!language) return n.includes('react') ? ['React'] : ['Code']
  if (language === 'Blade') return ['Laravel', 'PHP']
  if (language === 'JavaScript' && n.includes('react')) return ['React', 'JavaScript']
  return [language]
}

const user = await getJson(`/users/${USER}`)
const repos = await getJson(`/users/${USER}/repos?per_page=100&sort=pushed`)

const eligible = repos
  .filter((r) => !r.fork && r.name !== USER)
  .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
  .slice(0, Math.max(LIMIT * 2, 12))

const projects = []

for (const repo of eligible) {
  let commits = 0
  try {
    const contributors = await getJson(
      `/repos/${USER}/${repo.name}/contributors?per_page=100`,
    )
    commits = contributors.find((c) => c.login === USER)?.contributions ?? 0
  } catch {
    commits = 0
  }
  projects.push({
    name: repo.name,
    description: repo.description || repo.name.replace(/-/g, ' '),
    tech: techFromLanguage(repo.language, repo.name),
    url: repo.html_url,
    commits,
  })
  await new Promise((r) => setTimeout(r, 80))
}

projects.sort((a, b) => b.commits - a.commits)

const payload = {
  generatedAt: new Date().toISOString(),
  totalRepos: user.public_repos,
  projects: projects.slice(0, LIMIT),
}

writeFileSync(OUT, JSON.stringify(payload, null, 2))
console.log(`Wrote ${OUT} (${payload.projects.length} projects)`)
