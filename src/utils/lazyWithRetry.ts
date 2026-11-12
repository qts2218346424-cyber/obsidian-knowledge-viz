import { lazy, type ComponentType } from 'react'

function isChunkLoadError(err: unknown): boolean {
  const error = err as { name?: string; message?: string } | null
  const msg = error?.message || ''
  return (
    error?.name === 'ChunkLoadError' ||
    msg.includes('Failed to fetch dynamically imported module') ||
    msg.includes('Importing a module script failed') ||
    msg.includes('Loading chunk') ||
    msg.includes('Loading CSS chunk') ||
    msg.includes('Unexpected token')
  )
}

/**
 * 带自动重试与 Chunk 404 自愈的懒加载封装：
 * 1. 动态 import 失败时自动重试 2 次；
 * 2. 若仍为 chunk 404 / 资源哈希失效，自动刷新页面一次拉取最新资源；
 * 3. 刷新后仍失败则抛出异常，交由 ErrorBoundary 呈现「加载失败，重试」。
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  loader: () => Promise<{ default: T }>,
  name: string,
  maxRetries = 2
) {
  return lazy(async () => {
    let lastError: unknown
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const mod = await loader()
        try {
          sessionStorage.removeItem(`lazy_reload_${name}`)
        } catch {}
        return mod
      } catch (err) {
        lastError = err
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 400 * (attempt + 1)))
        }
      }
    }

    if (isChunkLoadError(lastError)) {
      const reloadKey = `lazy_reload_${name}`
      let hasReloaded = false
      try {
        hasReloaded = Boolean(sessionStorage.getItem(reloadKey))
      } catch {}

      if (!hasReloaded) {
        try {
          sessionStorage.setItem(reloadKey, 'true')
        } catch {}
        window.location.reload()
        return new Promise<{ default: T }>(() => {})
      }
    }

    throw lastError
  })
}
