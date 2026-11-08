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

const KnowledgeGraph = lazy(routeLoaders.knowledgeGraph)
const Workflow = lazy(routeLoaders.workflow)
const Editor = lazy(routeLoaders.editor)
const Study = lazy(routeLoaders.study)
const Settings = lazy(routeLoaders.settings)
const Quiz = lazy(routeLoaders.quiz)
const Vocabulary = lazy(routeLoaders.vocabulary)
const HistoryOutline = lazy(routeLoaders.historyOutline)
const Politics = lazy(routeLoaders.politics)
const Music = lazy(routeLoaders.music)
const Pomodoro = lazy(routeLoaders.pomodoro)

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
            <Route path="/vocabulary" element={<Vocabulary />} />
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
