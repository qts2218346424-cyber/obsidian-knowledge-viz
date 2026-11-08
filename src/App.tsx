import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AudioProvider } from './contexts/AudioContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import MiniPlayer from './components/music/MiniPlayer'
import Dashboard from './pages/Dashboard'
import Chat from './pages/Chat'
import Login from './pages/Login'

const KnowledgeGraph = lazy(() => import('./pages/KnowledgeGraph'))
const Workflow = lazy(() => import('./pages/Workflow'))
const Editor = lazy(() => import('./pages/Editor'))
const Study = lazy(() => import('./pages/Study'))
const Settings = lazy(() => import('./pages/Settings'))
const Quiz = lazy(() => import('./pages/Quiz'))
const Vocabulary = lazy(() => import('./pages/Vocabulary'))
const HistoryOutline = lazy(() => import('./pages/HistoryOutline'))
const Music = lazy(() => import('./pages/Music'))
const Pomodoro = lazy(() => import('./pages/Pomodoro'))

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
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/vocabulary" element={<Vocabulary />} />
            <Route path="/history" element={<HistoryOutline />} />
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
  return (
    <AuthProvider>
      <AudioProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={<ProtectedRoutes />} />
          </Routes>
        </BrowserRouter>
      </AudioProvider>
    </AuthProvider>
  )
}

export default App
