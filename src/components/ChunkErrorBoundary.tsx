import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  title?: string
  className?: string
  onReset?: () => void
}

interface State {
  hasError: boolean
  error: Error | null
  retryKey: number
}

/**
 * 局部组件/分包加载容错边界：
 * 捕获懒加载失败或组件渲染异常，提供「加载失败，重试」按钮就地恢复，不拖垮整页。
 */
export default class ChunkErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    retryKey: 0,
  }

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ChunkErrorBoundary 捕获异常]:', error, errorInfo)
  }

  private handleRetry = () => {
    this.props.onReset?.()
    this.setState(prev => ({
      hasError: false,
      error: null,
      retryKey: prev.retryKey + 1,
    }))
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div
          className={`flex flex-col items-center justify-center p-6 text-center gap-3 ${
            this.props.className || 'min-h-[240px] w-full'
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-800">
              {this.props.title || '加载失败，请重试'}
            </p>
            {this.state.error?.message && (
              <p className="text-xs text-slate-400 max-w-md break-all line-clamp-2">
                {this.state.error.message}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={this.handleRetry}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>加载失败，重试</span>
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-medium transition-colors cursor-pointer"
            >
              <span>刷新页面</span>
            </button>
          </div>
        </div>
      )
    }

    return <div key={this.state.retryKey} className="contents">{this.props.children}</div>
  }
}
