import { createPortal } from 'react-dom'
import { useState } from 'react'
import {
  X,
  FileText,
  Sparkles,
  Download,
  Maximize2,
  Minimize2,
  ExternalLink,
  Smartphone,
  CheckCircle2
} from 'lucide-react'
import { api, type BookItem } from '../services/api'
import PdfCanvasViewer from './PdfCanvasViewer'

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

  // 1. 原生二进制下载地址（供下载文件用）
  const rawDownloadUrl = api.getBookRawUrl(book.relativePath, book.scope)
  // 2. 独立 Web 端 Canvas 阅读器页面路由（在新标签页单独打开时 100% 出现画面，彻底杜绝手机/电脑白屏）
  const standaloneReaderUrl = `/pdf-reader?path=${encodeURIComponent(book.relativePath)}&scope=${encodeURIComponent(book.scope || 'shared')}&name=${encodeURIComponent(book.name)}`
  const sizeMb = (book.size / (1024 * 1024)).toFixed(2)

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-3 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`bg-[#181b24] border-0 sm:border sm:border-white/10 flex flex-col shadow-xl overflow-hidden transition-all duration-200 ${
          isFullscreen ? 'w-full h-dvh rounded-none' : 'w-full h-dvh sm:w-[95vw] sm:h-[92vh] sm:max-w-7xl sm:rounded-2xl'
        }`}
      >
        {/* 顶部多功能工具栏 */}
        <div className="px-3 sm:px-5 py-2.5 sm:py-3 border-b border-white/10 flex items-center justify-between gap-2 sm:gap-4 bg-white/[0.03] shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-1.5 sm:p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 shrink-0 hidden sm:block">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-2 py-0.5 rounded text-2xs sm:text-2xs font-semibold bg-red-500/15 text-red-300 border border-red-500/20">
                  PDF 考研专著
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-2xs sm:text-2xs font-semibold border ${
                    book.scope === 'personal'
                      ? 'bg-indigo-500/20 text-indigo-200 border-indigo-400/30'
                      : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25'
                  }`}
                >
                  {book.scope === 'personal' ? '🔒 个人独享' : '🌐 全员共享'}
                </span>
                <span className="text-2xs text-slate-400 hidden sm:inline">
                  {book.domain === 'cs_408'
                    ? '408 计算机'
                    : book.domain === 'english'
                      ? '考研英语'
                      : book.domain === 'politics'
                        ? '考研政治'
                        : book.domain === 'general'
                          ? '专业课/综合'
                          : '考研数学'}{' '}
                  · {book.category} · {sizeMb} MB
                </span>
                <span className="text-2xs text-emerald-400/90 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded hidden md:inline-block">
                  ⚡ Canvas 动态渲染
                </span>
              </div>
              <h2
                className="text-xs sm:text-sm font-bold text-white mt-0.5 truncate max-w-[200px] xs:max-w-sm sm:max-w-xl"
                title={book.name}
              >
                {book.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {onExtractAi && (
              <button
                type="button"
                onClick={() => onExtractAi(book)}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-xs font-semibold transition-all active:scale-95 cursor-pointer"
                title="调用 AI 智能提炼本教材核心考点并入库真题"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">AI 提炼考点</span>
              </button>
            )}

            {/* 新标签页独立阅读（跳转至全屏 Web Canvas 阅读器路由，保证画面 100% 呈现） */}
            <a
              href={standaloneReaderUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 sm:p-2 rounded-xl text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex items-center gap-1 text-xs font-medium cursor-pointer"
              title="新标签页独立全屏打开（跨端 Web 渲染，绝无白屏）"
            >
              <ExternalLink className="w-4 h-4 text-cyan-400" />
              <span className="hidden md:inline">单独打开</span>
            </a>

            {/* 下载至本地 */}
            <a
              href={rawDownloadUrl}
              target="_blank"
              rel="noreferrer"
              download={book.name}
              className="p-1.5 sm:p-2 rounded-xl text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
              title="下载 PDF 原文件至本地"
            >
              <Download className="w-4 h-4" />
            </a>

            {/* 全屏切换 */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 sm:p-2 rounded-xl text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors hidden sm:flex cursor-pointer"
              title={isFullscreen ? '退出全屏' : '全屏沉浸阅读'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* 关闭按钮 */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl text-slate-300 hover:text-white bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/30 transition-colors cursor-pointer"
              title="关闭讲义阅读器"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* 手机端便捷操作栏：引导一键独立全屏或下载 */}
        <div className="sm:hidden px-3 py-1.5 bg-[#121520] border-b border-white/10 flex items-center justify-between gap-2 text-[11px] text-slate-300">
          <span className="flex items-center gap-1 text-emerald-400 truncate">
            <Smartphone className="w-3.5 h-3.5" />
            已开启 Canvas 极速光栅化
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            <a
              href={standaloneReaderUrl}
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold flex items-center gap-1 shadow-xs"
            >
              <ExternalLink className="w-3 h-3" />
              独立全屏
            </a>
            <a
              href={rawDownloadUrl}
              download={book.name}
              className="px-2 py-1 rounded-lg bg-white/10 text-slate-200 font-semibold"
            >
              下载原件
            </a>
          </div>
        </div>

        {/* 核心 PDF Canvas 内嵌视口：彻底替代原生 iframe，实现 100% 跨平台兼容 */}
        <div className="flex-1 w-full h-full overflow-hidden relative">
          <PdfCanvasViewer url={rawDownloadUrl} title={book.name} />
        </div>
      </div>
    </div>
  )

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent
}
