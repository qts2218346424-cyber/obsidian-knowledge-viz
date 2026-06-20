import { useState, useEffect, useCallback } from 'react'
import {
  api,
  checkApiHealth,
  type GraphData,
  type HealthReport,
  type VaultStats,
  type FileListItem,
  type TreeNode,
} from '../services/api'

interface UseVaultGraphResult {
  data: GraphData | null
  loading: boolean
  error: string | null
  reload: () => void
}

export function useVaultGraph(): UseVaultGraphResult {
  const [data, setData] = useState<GraphData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    api.getGraph()
      .then(setData)
      .catch((err) => {
        setError(err.message)
        setData(null)
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  return { data, loading, error, reload: load }
}

interface UseVaultHealthResult {
  report: HealthReport | null
  loading: boolean
  error: string | null
  reload: () => void
}

export function useVaultHealth(): UseVaultHealthResult {
  const [report, setReport] = useState<HealthReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    api.getHealth()
      .then(setReport)
      .catch((err) => {
        setError(err.message)
        setReport(null)
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  return { report, loading, error, reload: load }
}

interface UseVaultStatsResult {
  stats: VaultStats | null
  loading: boolean
  error: string | null
  reload: () => void
}

export function useVaultStats(): UseVaultStatsResult {
  const [stats, setStats] = useState<VaultStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    api.getStats()
      .then(setStats)
      .catch((err) => {
        setError(err.message)
        setStats(null)
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  return { stats, loading, error, reload: load }
}

interface UseVaultFilesResult {
  files: FileListItem[]
  loading: boolean
  error: string | null
  search: (query: string) => void
}

export function useVaultFiles(): UseVaultFilesResult {
  const [files, setFiles] = useState<FileListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  const load = useCallback((q: string) => {
    setLoading(true)
    setError(null)
    api.getFiles(q || undefined)
      .then(setFiles)
      .catch((err) => {
        setError(err.message)
        setFiles([])
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load(query) }, [query, load])

  const search = useCallback((q: string) => setQuery(q), [])

  return { files, loading, error, search }
}

interface UseVaultTreeResult {
  tree: TreeNode[]
  loading: boolean
  error: string | null
}

export function useVaultTree(): UseVaultTreeResult {
  const [tree, setTree] = useState<TreeNode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.getTree()
      .then(setTree)
      .catch((err) => {
        setError(err.message)
        setTree([])
      })
      .finally(() => setLoading(false))
  }, [])

  return { tree, loading, error }
}

// Check API connection status
export function useApiHealth() {
  const [healthy, setHealthy] = useState<boolean | null>(null)

  useEffect(() => {
    checkApiHealth().then(setHealthy)
  }, [])

  return healthy
}
