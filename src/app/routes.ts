import { lazy } from 'react'

// 路由加载器定义，支持按需加载与空闲/悬浮即时预取 (Route Prefetching)
export const routeLoaders = {
  knowledgeGraph: () => import('../pages/KnowledgeGraph'),
  workflow: () => import('../pages/Workflow'),
  editor: () => import('../pages/Editor'),
  study: () => import('../pages/Study'),
  settings: () => import('../pages/Settings'),
  quiz: () => import('../pages/Quiz'),
  vocabulary: () => import('../pages/Vocabulary'),
  historyOutline: () => import('../pages/HistoryOutline'),
  politics: () => import('../pages/Politics'),
  music: () => import('../pages/Music'),
  pomodoro: () => import('../pages/Pomodoro'),
  english: () => import('../pages/English'),
  dashboard: () => import('../pages/Dashboard'),
  chat: () => import('../pages/Chat'),
}

// 供全局导航栏悬浮（Hover）与空闲时预热路由模块
const prefetched = new Set<string>()

export function prefetchRoute(routePath: string) {
  if (prefetched.has(routePath)) return
  prefetched.add(routePath)
  try {
    switch (routePath) {
      case '/learn':
      case '/study':
        routeLoaders.study()
        break
      case '/quiz':
        routeLoaders.quiz()
        break
      case '/editor':
        routeLoaders.editor()
        break
      case '/graph':
        routeLoaders.knowledgeGraph()
        break
      case '/history':
      case '/politics':
        routeLoaders.politics()
        break
      case '/english':
        routeLoaders.english()
        break
      case '/vocabulary':
        routeLoaders.vocabulary()
        break
      case '/pomodoro':
        routeLoaders.pomodoro()
        break
      case '/workflow':
        routeLoaders.workflow()
        break
      case '/music':
        routeLoaders.music()
        break
      case '/settings':
        routeLoaders.settings()
        break
      case '/dashboard':
        routeLoaders.dashboard()
        break
      case '/chat':
        routeLoaders.chat()
        break
      default:
        break
    }
  } catch {}
}

/**
 * 具有自愈机制的安全懒加载器 (Safe Lazy with Chunk Auto-recovery)
 * 彻底解决单页应用构建更新后旧 chunk 404 或网络波动导致的动态 import 失败，
 * 避免 React.lazy 永久缓存 rejected Promise 导致用户反复点击路由持续崩溃。
 */
export function safeLazy<T extends React.ComponentType<any>>(
  loader: () => Promise<{ default: T }>,
  name: string
) {
  return lazy(async () => {
    try {
      // 先原地重试 2 次（网络抖动常见），仍失败再走整页重载
      let module: { default: T } | undefined
      let lastErr: unknown
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          module = await loader()
          break
        } catch (e) {
          lastErr = e
          if (attempt < 2) await new Promise(r => setTimeout(r, 600 * (attempt + 1)))
        }
      }
      if (!module) throw lastErr
      try {
        sessionStorage.removeItem(`safe_lazy_retry_${name}`)
      } catch {}
      return module
    } catch (err: any) {
      console.warn(`[SafeLazy] 动态加载模块 "${name}" 遇到异常，尝试自动恢复:`, err)
      const isChunkError =
        err?.message?.includes('Failed to fetch dynamically imported module') ||
        err?.message?.includes('Importing a module script failed') ||
        err?.message?.includes('Loading chunk') ||
        err?.name === 'ChunkLoadError' ||
        err?.message?.includes('Unexpected token')

      const retryKey = `safe_lazy_retry_${name}`
      let hasRetried = false
      try {
        hasRetried = Boolean(sessionStorage.getItem(retryKey))
      } catch {}

      if (isChunkError && !hasRetried) {
        try {
          sessionStorage.setItem(retryKey, 'true')
        } catch {}
        // 自动强制重载拉取最新构建资源
        window.location.reload()
        return new Promise<{ default: T }>(() => {})
      }

      throw err
    }
  })
}

