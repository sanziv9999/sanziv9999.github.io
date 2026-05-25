/**
 * Fetches sanziv9999 repos and prints projects sorted by commit count.
 * Run: npm run sync:repos
 */

const USER = 'sanziv9999'
const headers = { 'User-Agent': 'personal-portfolio-sync' }

async function getJson(url) {
  const res = await fetch(url, { headers })
  if (!res.ok) throw new Error(`${url} → ${res.status}`)
  return res.json()
}

const repos = await getJson(
  `https://api.github.com/users/${USER}/repos?per_page=100`,
)

const rows = []

for (const repo of repos) {
  if (repo.fork) continue

  let commits = 0
  try {
    const contributors = await getJson(
      `https://api.github.com/repos/${USER}/${repo.name}/contributors`,
    )
    const mine = contributors.find((c) => c.login === USER)
    commits = mine?.contributions ?? 0
  } catch {
    commits = 0
  }

  if (repo.name === USER) continue

  rows.push({
    name: repo.name,
    description: repo.description,
    language: repo.language,
    url: repo.html_url,
    commits,
  })

  await new Promise((r) => setTimeout(r, 120))
}

rows.sort((a, b) => b.commits - a.commits)
console.log(JSON.stringify(rows, null, 2))
