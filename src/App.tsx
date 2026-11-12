import { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AudioProvider } from './contexts/AudioContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import MiniPlayer from './components/music/MiniPlayer'
import Login from './pages/Login'
import TopProgressBar from './components/ui/TopProgressBar'

// 路由加载器定义，支持按需加载与空闲/悬浮即时预取 (Route Prefetching)
export const routeLoaders = {
  dashboard: () => import('./pages/Dashboard'),
  chat: () => import('./pages/Chat'),
  landingPage: () => import('./pages/LandingPage'),
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
  pdfReader: () => import('./pages/PdfReaderPage'),
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

const Dashboard = safeLazy(routeLoaders.dashboard, 'dashboard')
const Chat = safeLazy(routeLoaders.chat, 'chat')
const LandingPage = safeLazy(routeLoaders.landingPage, 'landingPage')
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
const PdfReaderPage = safeLazy(routeLoaders.pdfReader, 'pdfReader')

function PageFallback() {
  return (
    <>
      <TopProgressBar />
      <div className="flex h-[45vh] w-full items-center justify-center animate-fade-in">
        <div className="flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 backdrop-blur-md px-3.5 py-1.5 text-xs font-medium text-slate-500 shadow-xs">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-ping" />
          <span>研学空间准备中...</span>
        </div>
      </div>
    </>
  )
}

function ProtectedRoutes() {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <PageFallback />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return (
    <>
      <Layout>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/graph" element={<Navigate to="/study?tab=graph" replace />} />
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
    // 浏览器空闲时再预热核心路由，避免首屏并发争抢带宽
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const handle = (window as any).requestIdleCallback(() => {
        prefetchRoute('/quiz')
      })
      return () => (window as any).cancelIdleCallback(handle)
    }
  }, [])

  return (
    <AuthProvider>
      <AudioProvider>
        <BrowserRouter>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/home" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/pdf-reader" element={<PdfReaderPage />} />
              <Route path="/*" element={<ProtectedRoutes />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AudioProvider>
    </AuthProvider>
  )
}

export default App
