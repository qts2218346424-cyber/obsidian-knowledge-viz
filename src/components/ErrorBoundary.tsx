import React, { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertCircle, RefreshCw, Home, Trash2 } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[CoreForge ErrorBoundary 捕获到异常]:', error, errorInfo)
  }

  private handleHardReload = () => {
    try {
      sessionStorage.clear()
    } catch {}
    const url = new URL(window.location.href)
    url.searchParams.set('_v', Date.now().toString())
    window.location.href = url.toString()
  }

  private handleClearCacheAndReset = () => {
    try {
      const preserveKeys = ['coreforge_user', 'coreforge_token', 'coreforge_auth_user']
      const preserved: Record<string, string> = {}
      for (const k of preserveKeys) {
        const val = localStorage.getItem(k)
        if (val) preserved[k] = val
      }
      localStorage.clear()
      sessionStorage.clear()
      for (const [k, v] of Object.entries(preserved)) {
        localStorage.setItem(k, v)
      }
    } catch {}
    window.location.href = '/'
  }

  private handleGoHome = () => {
    window.location.href = '/dashboard'
  }

  public render() {
    if (this.state.hasError) {
      const errMsg = this.state.error?.message || ''
      const isChunkOrHookError =
        errMsg.includes('hooks') ||
        errMsg.includes('dynamically imported') ||
        errMsg.includes('Loading chunk') ||
        errMsg.includes('Unexpected token')

      return (
        <div className="min-h-screen w-full flex items-center justify-center p-6 bg-slate-900 text-slate-100 font-sans">
          <div className="max-w-md w-full bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <AlertCircle className="w-7 h-7" />
            </div>

            <h2 className="text-xl font-bold text-white mb-2">研学工作台渲染异常</h2>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              {isChunkOrHookError
                ? '检测到系统静态资源已完成最新编译发布。请点击下方「一键硬刷新」同步最新页面模块即可恢复。'
                : '页面加载时遇到了一点小波折，通常是由于浏览器资源缓存未刷新或离线引起的。点击下方按钮即可一键刷新恢复。'}
            </p>

            {errMsg && (
              <div className="mb-6 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] font-mono text-rose-300 text-left break-all max-h-32 overflow-y-auto">
                {errMsg}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={this.handleHardReload}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>一键硬刷新同步</span>
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 active:scale-[0.98] text-slate-200 text-xs font-semibold transition-all cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>返回首页</span>
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-700/60 flex justify-center">
              <button
                type="button"
                onClick={this.handleClearCacheAndReset}
                className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors inline-flex items-center gap-1 cursor-pointer"
                title="重置前端本地组件缓存（保留登录凭证）"
              >
                <Trash2 className="w-3 h-3" />
                <span>清除前端视图缓存并重启</span>
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
