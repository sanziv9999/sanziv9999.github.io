import { useCallback, useEffect, useState } from 'react'
import { clearReposCache, fetchTopRepos } from '../lib/github'

export function useTopRepos(username, limit = 6) {
  const [projects, setProjects] = useState([])
  const [totalRepos, setTotalRepos] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [usingFallback, setUsingFallback] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const retry = useCallback(() => {
    clearReposCache()
    setRefreshKey((k) => k + 1)
  }, [])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await fetchTopRepos(username, limit)
        if (!cancelled) {
          setProjects(data.projects)
          setTotalRepos(data.totalRepos)
          setUsingFallback(!!data.fromFallback)
          setError(data.fromFallback ? data.error ?? null : null)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load repositories')
          setProjects([])
          setUsingFallback(false)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [username, limit, refreshKey])

  return { projects, totalRepos, loading, error, usingFallback, retry }
}
