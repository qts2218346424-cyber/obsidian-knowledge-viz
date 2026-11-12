import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AudioProvider } from './contexts/AudioContext'
import { AuthProvider } from './contexts/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'
import PageFallback from './app/PageFallback'
import { routeLoaders, safeLazy } from './app/routes'

// 向后兼容：路由预取工具已迁移至 app/routes
export { routeLoaders, prefetchRoute } from './app/routes'

// 公开页面与受保护工作台全部按需加载：落地页访客不再下载 Layout / Chat / Dashboard / Markdown 渲染引擎
const LandingPage = safeLazy(() => import('./pages/LandingPage'), 'landing')
const Login = safeLazy(() => import('./pages/Login'), 'login')
const PdfReaderPage = safeLazy(routeLoaders.pdfReader, 'pdfReader')
const ProtectedRoutes = lazy(() => import('./app/ProtectedRoutes'))

function App() {
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
