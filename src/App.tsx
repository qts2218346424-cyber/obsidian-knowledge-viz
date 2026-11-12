import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AudioProvider } from './contexts/AudioContext'
import { AuthProvider } from './contexts/AuthContext'
import PageFallback from './app/PageFallback'
import { safeLazy } from './app/routes'

// 向后兼容：路由预取工具已迁移至 app/routes
export { routeLoaders, prefetchRoute } from './app/routes'

// 公开页面与受保护工作台全部按需加载：落地页访客不再下载 Layout / Chat / Dashboard / Markdown 渲染引擎
const LandingPage = safeLazy(() => import('./pages/LandingPage'), 'landing')
const Login = safeLazy(() => import('./pages/Login'), 'login')
const ProtectedRoutes = lazy(() => import('./app/ProtectedRoutes'))

function App() {
  return (
    <AuthProvider>
      <AudioProvider>
        <BrowserRouter>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/home" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/*" element={<ProtectedRoutes />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AudioProvider>
    </AuthProvider>
  )
}

export default App
