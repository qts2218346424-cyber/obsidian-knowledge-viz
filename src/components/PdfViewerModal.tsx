import { useState } from 'react'
import {
  X, FileText, Sparkles, Download, Maximize2, Minimize2, ExternalLink, Loader2
} from 'lucide-react'
import type { BookItem } from '../services/api'

interface PdfViewerModalProps {
  isOpen: boolean
  onClose: () => void
  book: BookItem | null
  onExtractAi?: (book: BookItem) => void
}

export default function PdfViewerModal({
  isOpen,
  onClose,
  book,
  onExtractAi,
}: PdfViewerModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [loading, setLoading] = useState(true)

  if (!isOpen || !book) return null

  // 优化浏览器内置 PDF 查看器首屏秒开参数：启用线性化分片渲染与首屏自适应
  const pdfUrl = `/api/books/raw?path=${encodeURIComponent(book.relativePath)}#toolbar=1&navpanes=1&scrollbar=1&page=1&view=FitH`
  const rawDownloadUrl = `/api/books/raw?path=${encodeURIComponent(book.relativePath)}`
  const sizeMb = (book.size / (1024 * 1024)).toFixed(2)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className={`bg-[#181b24] border border-white/10 rounded-2xl flex flex-col shadow-2xl overflow-hidden transition-all duration-200 ${
        isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-6xl h-[92vh]'
      }`}>
        {/* Top Header Bar */}
        <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between gap-4 bg-white/[0.03]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-red-500/15 text-red-300 border border-red-500/20">
                  PDF 考研专著
                </span>
                <span className="text-[11px] text-slate-400">
                  {book.domain === 'cs_408' ? '408 计算机' : '考研数学'} · {book.category} · {sizeMb} MB
                </span>
                <span className="text-[10px] text-emerald-400/90 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded hidden sm:inline-block">
                  ⚡ HTTP 206 分片秒开
                </span>
              </div>
              <h2 className="text-sm font-bold text-white mt-0.5 truncate max-w-xl" title={book.name}>
                {book.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onExtractAi && (
              <button
                onClick={() => onExtractAi(book)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-xs font-semibold transition-all active:scale-95"
                title="调用 AI 智能提炼本教材核心考点并入库真题"
              >
                <Sparkles className="w-3.5 h-3.5" />
                AI 提炼考点
              </button>
            )}

            <a
              href={rawDownloadUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 border border-white/10 transition-colors"
              title="新标签页独立打开 (调用浏览器原生独立 PDF 渲染器)"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            <a
              href={rawDownloadUrl}
              target="_blank"
              rel="noreferrer"
              download={book.name}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 border border-white/10 transition-colors"
              title="下载至本地"
            >
              <Download className="w-4 h-4" />
            </a>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 border border-white/10 transition-colors"
              title={isFullscreen ? '退出全屏' : '全屏阅读'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Embedded Viewport */}
        <div className="flex-1 w-full h-full bg-[#20222a] relative overflow-hidden">
          {loading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#1a1d26] text-slate-300 gap-3">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
              <div className="text-sm font-medium">正在调取流式分片管道并渲染 PDF...</div>
              <div className="text-xs text-slate-500">大体积文件 ({sizeMb} MB) 已启用 HTTP 206 分片首屏加速</div>
            </div>
          )}

          <iframe
            src={pdfUrl}
            title={book.name}
            className="w-full h-full border-0"
            onLoad={() => setLoading(false)}
          />
        </div>
      </div>
    </div>
  )
}
