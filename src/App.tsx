import { Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AudioProvider } from './contexts/AudioContext'
import { AuthProvider } from './contexts/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'
import PageFallback from './app/PageFallback'
import { routeLoaders, safeLazy } from './app/routes'

// 向后兼容：路由预取工具已迁移至 app/routes
export { routeLoaders, prefetchRoute } from './app/routes'

// 开源单机纯净版：彻底移除面向访客的网络宣传 Landing 落地页，根路径直接进入备考工作台
const Login = safeLazy(() => import('./pages/Login'), 'login')
const PdfReaderPage = safeLazy(routeLoaders.pdfReader, 'pdfReader')
const ProtectedRoutes = safeLazy(() => import('./app/ProtectedRoutes'), 'protected-routes')

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AudioProvider>
          <BrowserRouter>
            <Suspense fallback={<PageFallback />}>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/home" element={<Navigate to="/dashboard" replace />} />
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
