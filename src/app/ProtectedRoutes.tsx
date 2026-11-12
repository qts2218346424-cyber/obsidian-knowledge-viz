import { Suspense } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Layout from '../components/Layout'
import MiniPlayer from '../components/music/MiniPlayer'
import PageFallback from './PageFallback'
import { routeLoaders, safeLazy } from './routes'

const Dashboard = safeLazy(routeLoaders.dashboard, 'dashboard')
const Chat = safeLazy(routeLoaders.chat, 'chat')
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

export default function ProtectedRoutes() {
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

