import { useState, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, FileText, Sparkles, Smartphone, Home } from 'lucide-react'
import PdfCanvasViewer from '../components/PdfCanvasViewer'
import { api, type BookScope } from '../services/api'

export default function PdfReaderPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const rawPath = searchParams.get('path') || ''
  const name = searchParams.get('name') || rawPath.split('/').pop() || '考研讲义与教材'
  const scope = (searchParams.get('scope') as BookScope) || 'shared'

  const downloadUrl = useMemo(() => {
    if (!rawPath) return ''
    return api.getBookRawUrl(rawPath, scope)
  }, [rawPath, scope])

  if (!rawPath) {
    return (
      <div className="min-h-screen bg-[#10121a] text-slate-300 flex flex-col items-center justify-center p-6 text-center">
        <FileText className="w-12 h-12 text-slate-600 mb-3" />
        <h2 className="text-lg font-bold text-white mb-2">未指定讲义或 PDF 路径</h2>
        <p className="text-xs text-slate-500 max-w-sm mb-5">
          请从学习中心或资料库中点击对应讲义教材进入独立阅读模式。
        </p>
        <button
          type="button"
          onClick={() => navigate('/study?tab=pdfs')}
          className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-all cursor-pointer flex items-center gap-2"
        >
          <Home className="w-4 h-4" />
          返回学习中心教材库
        </button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0e1017] text-white">
      {/* 顶部通栏导航与操作条 */}
      <header className="px-3.5 sm:px-6 py-2.5 bg-[#141722]/95 border-b border-white/10 flex items-center justify-between gap-3 shrink-0 backdrop-blur-md">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={() => {
              if (window.history.length > 1) {
                navigate(-1)
              } else {
                navigate('/study?tab=pdfs')
              }
            }}
            className="p-1.5 sm:p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer shrink-0"
            title="返回上一页"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <div className="p-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 shrink-0 hidden xs:block">
            <FileText className="w-4 h-4" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/25">
                独立 Web 阅读器
              </span>
              <span className="text-[10px] text-emerald-400/90 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded hidden sm:inline-block">
                ⚡ Canvas 高保真渲染
              </span>
            </div>
            <h1 className="text-xs sm:text-sm font-bold text-white mt-0.5 truncate max-w-[200px] xs:max-w-xs sm:max-w-md md:max-w-xl">
              {name}
            </h1>
          </div>
        </div>

        {/* 右侧操作按钮 */}
        <div className="flex items-center gap-2 shrink-0">
          {downloadUrl && (
            <a
              href={downloadUrl}
              download={name}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 text-xs font-semibold transition-all cursor-pointer"
              title="下载 PDF 原文件到本地存储"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">下载原件</span>
            </a>
          )}

          <button
            type="button"
            onClick={() => navigate('/study?tab=pdfs')}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors hidden md:flex cursor-pointer"
            title="回到学习中心"
          >
            <Home className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 主体 Canvas 阅读器 */}
      <main className="flex-1 w-full h-full overflow-hidden relative">
        <PdfCanvasViewer url={downloadUrl} title={name} />
      </main>
    </div>
  )
}
