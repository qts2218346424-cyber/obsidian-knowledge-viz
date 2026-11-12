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

// ── 模块级 SWR 内存快照单例缓存（跨路由切换 0 毫秒即时秒显，告别转圈） ─────────────
let cachedStats: VaultStats | null = null
let cachedHealth: HealthReport | null = null
let cachedGraph: GraphData | null = null
let cachedTree: TreeNode[] | null = null
let cachedHealthStatus: boolean | null = null

interface UseVaultGraphResult {
  data: GraphData | null
  loading: boolean
  error: string | null
  reload: () => void
}

export function useVaultGraph(): UseVaultGraphResult {
  const [data, setData] = useState<GraphData | null>(() => cachedGraph)
  const [loading, setLoading] = useState(() => !cachedGraph)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    if (!cachedGraph) setLoading(true)
    setError(null)
    api.getGraph()
      .then((res) => {
        cachedGraph = res
        setData(res)
      })
      .catch((err) => {
        setError(err.message)
        if (!cachedGraph) setData(null)
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
  const [report, setReport] = useState<HealthReport | null>(() => cachedHealth)
  const [loading, setLoading] = useState(() => !cachedHealth)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    if (!cachedHealth) setLoading(true)
    setError(null)
    api.getHealth()
      .then((res) => {
        cachedHealth = res
        setReport(res)
      })
      .catch((err) => {
        setError(err.message)
        if (!cachedHealth) setReport(null)
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
  const [stats, setStats] = useState<VaultStats | null>(() => cachedStats)
  const [loading, setLoading] = useState(() => !cachedStats)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    if (!cachedStats) setLoading(true)
    setError(null)
    api.getStats()
      .then((res) => {
        cachedStats = res
        setStats(res)
      })
      .catch((err) => {
        setError(err.message)
        if (!cachedStats) setStats(null)
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
  reload: () => void
}

export function useVaultTree(): UseVaultTreeResult {
  const [tree, setTree] = useState<TreeNode[]>(() => cachedTree || [])
  const [loading, setLoading] = useState(() => !cachedTree)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    if (!cachedTree) setLoading(true)
    setError(null)
    api.getTree()
      .then((res) => {
        cachedTree = res
        setTree(res)
      })
      .catch((err) => {
        setError(err.message)
        if (!cachedTree) setTree([])
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    const handleSync = () => { load() }
    window.addEventListener('vault-updated', handleSync)
    window.addEventListener('storage', handleSync)
    return () => {
      window.removeEventListener('vault-updated', handleSync)
      window.removeEventListener('storage', handleSync)
    }
  }, [load])

  return { tree, loading, error, reload: load }
}

// 检查 API 后端服务连通性（带内存快照）
export function useApiHealth() {
  const [healthy, setHealthy] = useState<boolean | null>(() => cachedHealthStatus)

  useEffect(() => {
    checkApiHealth().then((res) => {
      cachedHealthStatus = res
      setHealthy(res)
    })
  }, [])

  return healthy
}
