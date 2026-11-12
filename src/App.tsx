import { Suspense, useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AudioProvider } from './contexts/AudioContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import MiniPlayer from './components/music/MiniPlayer'
import Login from './pages/Login'
import TopProgressBar from './components/ui/TopProgressBar'
import ErrorBoundary from './components/ErrorBoundary'
import { lazyWithRetry } from './utils/lazyWithRetry'

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

const Dashboard = lazyWithRetry(routeLoaders.dashboard, 'dashboard')
const Chat = lazyWithRetry(routeLoaders.chat, 'chat')
const LandingPage = lazyWithRetry(routeLoaders.landingPage, 'landingPage')
const KnowledgeGraph = lazyWithRetry(routeLoaders.knowledgeGraph, 'knowledgeGraph')
const Workflow = lazyWithRetry(routeLoaders.workflow, 'workflow')
const Editor = lazyWithRetry(routeLoaders.editor, 'editor')
const Study = lazyWithRetry(routeLoaders.study, 'study')
const Settings = lazyWithRetry(routeLoaders.settings, 'settings')
const Quiz = lazyWithRetry(routeLoaders.quiz, 'quiz')
const Vocabulary = lazyWithRetry(routeLoaders.vocabulary, 'vocabulary')
const HistoryOutline = lazyWithRetry(routeLoaders.historyOutline, 'historyOutline')
const Politics = lazyWithRetry(routeLoaders.politics, 'politics')
const Music = lazyWithRetry(routeLoaders.music, 'music')
const Pomodoro = lazyWithRetry(routeLoaders.pomodoro, 'pomodoro')
const English = lazyWithRetry(routeLoaders.english, 'english')
const PdfReaderPage = lazyWithRetry(routeLoaders.pdfReader, 'pdfReader')

function PageFallback() {
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => setElapsed(s => s + 1), 1000)
    return () => clearInterval(timer)
  }, [])

  const progress = Math.min(92, 24 + elapsed * 14)
  const stepText =
    elapsed < 2
      ? '第 1/3 步：正在连接研学功能模块...'
      : elapsed < 5
        ? '第 2/3 步：正在加载学科知识库与组件...'
        : `第 3/3 步：正在完成页面初始化（已用时 ${elapsed} 秒）...`

  return (
    <>
      <TopProgressBar />
      <div className="flex h-[52vh] w-full items-center justify-center px-4 animate-fade-in">
        <div className="w-full max-w-sm rounded-2xl border border-slate-200/90 bg-white/95 p-6 shadow-sm space-y-3.5 text-center">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-indigo-600 animate-ping" />
              <span>{stepText}</span>
            </span>
            <span className="font-mono text-[11px] text-slate-400">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-sky-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10.5px] text-slate-400">
            <span className={elapsed < 2 ? 'text-indigo-600 font-semibold' : 'text-emerald-600'}>① 请求资源</span>
            <span className={elapsed >= 2 && elapsed < 5 ? 'text-indigo-600 font-semibold' : elapsed >= 5 ? 'text-emerald-600' : ''}>② 装载模块</span>
            <span className={elapsed >= 5 ? 'text-indigo-600 font-semibold' : ''}>③ 渲染界面</span>
          </div>
          {elapsed >= 15 && (
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <p className="text-xs text-amber-600 font-medium">加载时间较长，可能因网络波动或版本更新导致</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                重试加载
              </button>
            </div>
          )}
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
    <ErrorBoundary>
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
    </ErrorBoundary>
  )
}

export default App
