import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import KnowledgeGraph from './pages/KnowledgeGraph'
import Dashboard from './pages/Dashboard'
import Workflow from './pages/Workflow'
import Chat from './pages/Chat'
import Editor from './pages/Editor'
import Study from './pages/Study'

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/graph" replace />} />
          <Route path="/graph" element={<KnowledgeGraph />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/workflow" element={<Workflow />} />
          <Route path="/editor" element={<Editor />} />
          <Route path="/study" element={<Study />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
