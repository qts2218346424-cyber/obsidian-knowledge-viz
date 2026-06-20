import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AudioProvider } from './contexts/AudioContext'
import Layout from './components/Layout'
import MiniPlayer from './components/music/MiniPlayer'
import KnowledgeGraph from './pages/KnowledgeGraph'
import Workflow from './pages/Workflow'
import Chat from './pages/Chat'
import Editor from './pages/Editor'
import Study from './pages/Study'
import Settings from './pages/Settings'
import Quiz from './pages/Quiz'
import Vocabulary from './pages/Vocabulary'
import Music from './pages/Music'
import Pomodoro from './pages/Pomodoro'

function App() {
  return (
    <AudioProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/graph" replace />} />
            <Route path="/dashboard" element={<Navigate to="/graph" replace />} />
            <Route path="/graph" element={<KnowledgeGraph />} />
            <Route path="/workflow" element={<Workflow />} />
            <Route path="/editor" element={<Editor />} />
            <Route path="/study" element={<Study />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/vocabulary" element={<Vocabulary />} />
            <Route path="/music" element={<Music />} />
            <Route path="/pomodoro" element={<Pomodoro />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
        <MiniPlayer />
      </BrowserRouter>
    </AudioProvider>
  )
}

export default App
