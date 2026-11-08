import { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AudioProvider } from './contexts/AudioContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import MiniPlayer from './components/music/MiniPlayer'
import Dashboard from './pages/Dashboard'
import Chat from './pages/Chat'
import Login from './pages/Login'
import LandingPage from './pages/LandingPage'

// 路由加载器定义，支持按需加载与空闲/悬浮即时预取 (Route Prefetching)
export const routeLoaders = {
  knowledgeGraph: () => import('./pages/KnowledgeGraph'),
  workflow: () => import('./pages/Workflow'),
  editor: () => import('./pages/Editor'),
  study: () => import('./pages/Study'),
  settings: () => import('./pages/Settings'),
  quiz: () => import('./pages/Quiz'),
  vocabulary: () => import('./pages/Vocabulary'),
  historyOutline: () => import('./pages/HistoryOutline'),
  politics: () => import('./pages/Politics'),
  music: () => import('./pages/Music'),
  pomodoro: () => import('./pages/Pomodoro'),
  english: () => import('./pages/English'),
}

// 供全局导航栏悬浮（Hover）与空闲时预热路由模块
export function prefetchRoute(routePath: string) {
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
function safeLazy<T extends React.ComponentType<any>>(
  loader: () => Promise<{ default: T }>,
  name: string
) {
  return lazy(async () => {
    try {
      const module = await loader()
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

const KnowledgeGraph = safeLazy(routeLoaders.knowledgeGraph, 'knowledgeGraph')
const Workflow = safeLazy(routeLoaders.workflow, 'workflow')
const Editor = safeLazy(routeLoaders.editor, 'editor')
const Study = safeLazy(routeLoaders.study, 'study')
const Settings = safeLazy(routeLoaders.settings, 'settings')
const Quiz = safeLazy(routeLoaders.quiz, 'quiz')
const Vocabulary = safeLazy(routeLoaders.vocabulary, 'vocabulary')
const HistoryOutline = safeLazy(routeLoaders.historyOutline, 'historyOutline')
const Politics = safeLazy(routeLoaders.politics, 'politics')
const Music = safeLazy(routeLoaders.music, 'music')
const Pomodoro = safeLazy(routeLoaders.pomodoro, 'pomodoro')
const English = safeLazy(routeLoaders.english, 'english')

function PageFallback() {
  return (
    <div className="flex h-[60vh] w-full items-center justify-center">
      <div className="flex items-center gap-2.5 rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-2.5 text-xs font-medium text-slate-600 shadow-xs">
        <span className="h-2 w-2 rounded-full bg-indigo-500 animate-ping" />
        <span>正在加载研学空间...</span>
      </div>
    </div>
  )
}

function ProtectedRoutes() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <PageFallback />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <>
      <Layout>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/graph" element={<KnowledgeGraph />} />
            <Route path="/workflow" element={<Workflow />} />
            <Route path="/editor" element={<Editor />} />
            <Route path="/study" element={<Study />} />
            <Route path="/learn" element={<Navigate to="/study" replace />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/vocabulary" element={<Navigate to="/english" replace />} />
            <Route path="/english" element={<English />} />
            <Route path="/politics" element={<Politics />} />
            <Route path="/history" element={<Politics />} />
            <Route path="/music" element={<Music />} />
            <Route path="/pomodoro" element={<Pomodoro />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </Layout>
      <MiniPlayer />
    </>
  )
}

function App() {
  useEffect(() => {
    // 立即在后台静默预热政治专区与做题中心，彻底消除导航点击延迟感
    const timer = setTimeout(() => {
      try {
        prefetchRoute('/politics')
        prefetchRoute('/quiz')
      } catch {}
    }, 150)
    return () => clearTimeout(timer)
  }, [])

  return (
    <AuthProvider>
      <AudioProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/home" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={<ProtectedRoutes />} />
          </Routes>
        </BrowserRouter>
      </AudioProvider>
    </AuthProvider>
  )
}

export default App
