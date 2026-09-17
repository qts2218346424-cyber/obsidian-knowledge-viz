import { useState } from 'react'
import {
  X, FileText, Sparkles, Download, Maximize2, Minimize2
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

  if (!isOpen || !book) return null

  const pdfUrl = `/api/books/raw?path=${encodeURIComponent(book.relativePath)}`
  const sizeMb = (book.size / (1024 * 1024)).toFixed(2)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
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
                  PDF 核心教材
                </span>
                <span className="text-[11px] text-slate-400">
                  {book.domain === 'cs_408' ? '408 计算机' : '考研数学'} · {book.category} · {sizeMb} MB
                </span>
              </div>
              <h2 className="text-sm font-bold text-white mt-0.5 truncate max-w-xl">
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
              href={pdfUrl}
              target="_blank"
              rel="noreferrer"
              download={book.name}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 border border-white/10 transition-colors"
              title="下载 / 外部打开"
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
        <div className="flex-1 w-full h-full bg-[#20222a] relative">
          <iframe
            src={pdfUrl}
            title={book.name}
            className="w-full h-full border-0"
          />
        </div>
      </div>
    </div>
  )
}
