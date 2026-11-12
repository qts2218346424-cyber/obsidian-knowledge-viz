import { createPortal } from 'react-dom'
import React, { useState, useEffect } from 'react'
import {
  Sparkles,
  BookOpen,
  HelpCircle,
  CheckCircle2,
  Loader2,
  X,
  FileText,
  Layers,
  ArrowRight,
  Database,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronRight,
  Network,
  ListTree,
  BookmarkCheck,
  Check
} from 'lucide-react'
import {
  api,
  type BookItem,
  type BookOutlineResult,
  type DeepExtractResult
} from '../../services/api'

interface BookExtractModalProps {
  book: BookItem
  onClose: () => void
  onSuccess: () => void
}

export const BookExtractModal: React.FC<BookExtractModalProps> = ({
  book,
  onClose,
  onSuccess
}) => {
  // 根据文件名和分类智能推断默认模式
  const isQuestionBook =
    book.name.includes('题') ||
    book.name.includes('做题本') ||
    book.name.includes('880') ||
    book.name.includes('真题') ||
    book.category === '历年真题' ||
    book.category === '模拟题卷'

  const [mode, setMode] = useState<'concept' | 'question' | 'dual'>(
    isQuestionBook ? 'question' : 'dual'
  )

  // 大纲加载状态
  const [loadingOutline, setLoadingOutline] = useState(true)
  const [outlineData, setOutlineData] = useState<BookOutlineResult | null>(null)
  const [selectedChapterIds, setSelectedChapterIds] = useState<string[]>([])
  const [expandedChapterIds, setExpandedChapterIds] = useState<Record<string, boolean>>({})

  // 执行拆解状态
  const [extracting, setExtracting] = useState(false)
  const [extractProgressStep, setExtractProgressStep] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  // 拆解成果
  const [deepResult, setDeepResult] = useState<DeepExtractResult | null>(null)
  const [activeResultTab, setActiveResultTab] = useState<'notes' | 'questions' | 'outline'>('notes')
  const [selectedNoteIndex, setSelectedNoteIndex] = useState<number>(0)

  // 初始化加载全书章节目录树
  useEffect(() => {
    let isMounted = true
    const fetchOutline = async () => {
      setLoadingOutline(true)
      setError(null)
      try {
        const data = await api.getBookOutline(book.relativePath)
        if (isMounted && data && data.success) {
          setOutlineData(data)
          // 默认全选所有章节
          const allIds = data.chapters.map(c => c.id)
          setSelectedChapterIds(allIds)
          // 默认展开第1个章节展示子考点
          if (data.chapters.length > 0) {
            setExpandedChapterIds({ [data.chapters[0].id]: true })
          }
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('Failed to get book outline:', err)
          setError(err.message || '获取书籍章节架构大纲失败')
        }
      } finally {
        if (isMounted) {
          setLoadingOutline(false)
        }
      }
    }

    fetchOutline()
    return () => {
      isMounted = false
    }
  }, [book.relativePath])

  // 章节勾选与反选
  const handleToggleChapter = (id: string) => {
    setSelectedChapterIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    if (!outlineData) return
    if (selectedChapterIds.length === outlineData.chapters.length) {
      setSelectedChapterIds([])
    } else {
      setSelectedChapterIds(outlineData.chapters.map(c => c.id))
    }
  }

  const toggleExpandChapter = (id: string) => {
    setExpandedChapterIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  // 启动全卷深度拆解与规模化入库
  const handleStartDeepExtract = async () => {
    if (selectedChapterIds.length === 0) {
      setError('请至少勾选一个需要拆解入库的核心章节')
      return
    }

    setExtracting(true)
    setError(null)
    setExtractProgressStep('正在初始化知识库分卷引擎...')

    const timer1 = setTimeout(() => {
      setExtractProgressStep(`正在对选中的 ${selectedChapterIds.length} 个核心章节逐章提取深度考点...`)
    }, 600)
    const timer2 = setTimeout(() => {
      setExtractProgressStep('正在根据考研统考大纲规模化命制各章对应真题与深度解析...')
    }, 1500)
    const timer3 = setTimeout(() => {
      setExtractProgressStep('正在生成全书考点知识图谱总览双向链接并同步写入题库中心...')
    }, 2400)

    try {
      const res = await api.deepExtractBook({
        relativePath: book.relativePath,
        domain: outlineData?.domain || book.domain,
        subject: outlineData?.subject,
        selectedChapterIds,
        mode
      })

      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)

      if (res && res.success) {
        setDeepResult(res)
        setActiveResultTab('notes')
        setSelectedNoteIndex(0)
        onSuccess()
      } else {
        setError('深度解析响应异常，请重试')
      }
    } catch (err: any) {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      setError(err.message || '全卷深度解析失败，请检查服务日志')
    } finally {
      setExtracting(false)
    }
  }

  // 渲染右侧选中的笔记预览
  const renderSelectedNote = () => {
    if (!deepResult) return null

    if (selectedNoteIndex === 0) {
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-cream-100">
            <div>
              <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-700">
                图谱总览笔记
              </span>
              <h5 className="font-bold text-warm-900 text-sm mt-1">
                {deepResult.indexNoteTitle}
              </h5>
            </div>
            <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> 已持久化入库
            </span>
          </div>
          <div className="text-xs text-warm-500 bg-cream-50 p-2.5 rounded-lg border border-cream-200 font-mono">
            存入路径：<span className="text-cyan-700">{deepResult.indexNotePath}</span>
          </div>
          <div className="text-xs text-warm-700 leading-relaxed space-y-2">
            <p>
              该笔记作为 <b>《{deepResult.bookName}》</b> 在知识图谱中的中心主节点，内置指向本书所有{' '}
              <b>{deepResult.chaptersCount} 个独立章节笔记</b> 的 <code>[[双向链接]]</code>。
            </p>
            <div className="p-3 rounded-lg bg-cyan-50 border border-cyan-100 text-cyan-900 text-xs">
              <div className="font-bold mb-1">🔗 双向链接星图导航预览：</div>
              <ul className="list-disc pl-4 space-y-1">
                {deepResult.notes.map(n => (
                  <li key={n.title}>
                    <code>[[{n.title}]]</code>（{n.chapterTitle}）
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )
    }

    const currentNote = deepResult.notes[selectedNoteIndex - 1]
    if (!currentNote) return null

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-cream-100">
          <div>
            <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700">
              章节深度精解
            </span>
            <h5 className="font-bold text-warm-900 text-sm mt-1">
              {currentNote.title}
            </h5>
          </div>
          <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> 已持久化入库
          </span>
        </div>
        <div className="text-xs text-warm-500 bg-cream-50 p-2.5 rounded-lg border border-cream-200 font-mono">
          存入路径：<span className="text-cyan-700">{currentNote.path}</span>
        </div>
        <div className="text-xs text-warm-700 leading-relaxed space-y-2">
          <p>
            <b>归属章节</b>：{currentNote.chapterTitle}
          </p>
          <p>
            笔记内容包含：本章知识架构大纲、核心概念物理机理、考研高频大题模型解法套路、以及考场避坑指南。
          </p>
          <div className="p-2.5 rounded-lg bg-cream-50 border border-cream-200 text-warm-600 text-xs">
            💡 可直接在系统的 <b>Obsidian 知识图谱视图</b> 与 <b>卡片复习中心</b> 中打开此笔记并加入艾宾浩斯复习循环。
          </div>
        </div>
      </div>
    )
  }

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface border border-cream-200 w-full max-w-4xl rounded-2xl shadow-xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* 顶部标题栏 */}
        <div className="px-6 py-4 border-b border-cream-200 flex items-center justify-between bg-cream-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 text-cyan-600 border border-cyan-500/30">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-warm-900 text-base">
                  全书全卷智能深度拆解与成套入库工作台
                </h3>
                <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 border border-cyan-500/20">
                  {book.domain === 'cs_408' ? '408 计算机统考' : '全国统考数学'}
                </span>
                {outlineData && (
                  <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">
                    学科：{outlineData.subject}
                  </span>
                )}
              </div>
              <p className="text-xs text-warm-500 truncate max-w-lg mt-0.5">
                当前资料：<span className="font-medium text-warm-800">{book.name}</span>
                <span className="ml-2 text-warm-400">({(book.size / 1024 / 1024).toFixed(2)} MB)</span>
                {outlineData && (
                  <span className="ml-2 text-cyan-700 font-medium">
                    · 共嗅探出 {outlineData.totalChapters} 个核心章节
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-warm-400 hover:text-warm-700 hover:bg-cream-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 主体交互区域 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!deepResult ? (
            <>
              {/* 1. 解析模式选择 */}
              <div>
                <label className="block text-xs font-bold text-warm-700 mb-2 uppercase tracking-wider">
                  1. 选择全书拆解策略
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div
                    onClick={() => setMode('concept')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      mode === 'concept'
                        ? 'bg-cyan-500/10 border-cyan-500 shadow-sm'
                        : 'border-cream-200 bg-surface hover:bg-cream-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <BookOpen className={`w-4 h-4 ${mode === 'concept' ? 'text-cyan-600' : 'text-warm-500'}`} />
                      <span className={`text-sm font-bold ${mode === 'concept' ? 'text-cyan-900' : 'text-warm-800'}`}>
                        讲义教材系统拆解
                      </span>
                    </div>
                    <p className="text-xs text-warm-500 leading-relaxed">
                      为全书每个大章分别生成专属独立的 <b>Obsidian 深度笔记</b>，并构建全书知识星图总览与双向链接。
                    </p>
                  </div>

                  <div
                    onClick={() => setMode('question')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      mode === 'question'
                        ? 'bg-amber-500/10 border-amber-500 shadow-sm'
                        : 'border-cream-200 bg-surface hover:bg-cream-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <HelpCircle className={`w-4 h-4 ${mode === 'question' ? 'text-amber-600' : 'text-warm-500'}`} />
                      <span className={`text-sm font-bold ${mode === 'question' ? 'text-amber-900' : 'text-warm-800'}`}>
                        成套真题/习题萃取
                      </span>
                    </div>
                    <p className="text-xs text-warm-500 leading-relaxed">
                      为选中的每个章节批量抽取与命制成套考研高频真题，附带名师详析，<b>批量注入做题中心</b>。
                    </p>
                  </div>

                  <div
                    onClick={() => setMode('dual')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      mode === 'dual'
                        ? 'bg-purple-500/10 border-purple-500 shadow-sm'
                        : 'border-cream-200 bg-surface hover:bg-cream-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <Layers className={`w-4 h-4 ${mode === 'dual' ? 'text-purple-600' : 'text-warm-500'}`} />
                      <span className={`text-sm font-bold ${mode === 'dual' ? 'text-purple-900' : 'text-warm-800'}`}>
                        双轨全量深度入库 (推荐)
                      </span>
                    </div>
                    <p className="text-xs text-warm-500 leading-relaxed">
                      双管齐下：既按大章生成多篇知识库深度笔记与星图总览，又批量产出 15~25+ 道成套真题注入题库。
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. 章节目录树与拆解范围选择 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-warm-700 uppercase tracking-wider flex items-center gap-1.5">
                    <ListTree className="w-3.5 h-3.5 text-cyan-600" />
                    <span>2. 全书章节目录树与拆解范围 (已选 {selectedChapterIds.length} / {outlineData?.chapters.length || 0} 章)</span>
                  </label>
                  {outlineData && outlineData.chapters.length > 0 && (
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="text-xs text-cyan-600 hover:text-cyan-800 font-semibold flex items-center gap-1"
                    >
                      {selectedChapterIds.length === outlineData.chapters.length ? (
                        <>
                          <CheckSquare className="w-3.5 h-3.5" />
                          <span>取消全选</span>
                        </>
                      ) : (
                        <>
                          <Square className="w-3.5 h-3.5" />
                          <span>全选所有章节</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {loadingOutline ? (
                  <div className="p-8 rounded-xl bg-cream-50 border border-cream-200 flex flex-col items-center justify-center text-warm-500 gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-cyan-600" />
                    <span className="text-xs font-medium">正在解析 PDF 书签大纲并智能切分章节架构...</span>
                  </div>
                ) : outlineData && outlineData.chapters.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {outlineData.chapters.map(ch => {
                      const isSelected = selectedChapterIds.includes(ch.id)
                      const isExpanded = !!expandedChapterIds[ch.id]

                      return (
                        <div
                          key={ch.id}
                          className={`rounded-xl border transition-all ${
                            isSelected
                              ? 'border-cyan-500/40 bg-cyan-50/20'
                              : 'border-cream-200 bg-surface opacity-75'
                          }`}
                        >
                          <div className="flex items-center justify-between p-3">
                            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                              <button
                                type="button"
                                onClick={() => handleToggleChapter(ch.id)}
                                className="text-cyan-600 hover:text-cyan-700 shrink-0"
                              >
                                {isSelected ? (
                                  <CheckSquare className="w-4 h-4 text-cyan-600" />
                                ) : (
                                  <Square className="w-4 h-4 text-warm-300" />
                                )}
                              </button>
                              <div
                                onClick={() => handleToggleChapter(ch.id)}
                                className="cursor-pointer flex-1 min-w-0"
                              >
                                <span className="font-semibold text-xs text-warm-900 block truncate">
                                  {ch.title}
                                </span>
                                <div className="text-2xs text-warm-500 flex flex-wrap items-center gap-1.5 mt-0.5">
                                  {ch.startPage !== undefined && (
                                    <span className="font-mono text-cyan-700 bg-cyan-50 px-1.5 py-0.2 rounded border border-cyan-200">
                                      原书第 {ch.startPage + 1} ~ {(ch.endPage ?? ch.startPage) + 1} 页 ({ch.pageCount || 1} 页)
                                    </span>
                                  )}
                                  <span>{ch.subSections.length} 个考点脉络</span>
                                  {ch.exercisePagesCount !== undefined && ch.exercisePagesCount > 0 && (
                                    <span className="text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                                      🎯 检测到 {ch.exercisePagesCount} 处课后习题/做题页
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {ch.subSections.length > 0 && (
                              <button
                                type="button"
                                onClick={() => toggleExpandChapter(ch.id)}
                                className="text-warm-400 hover:text-warm-700 p-1 rounded-lg text-xs flex items-center gap-0.5"
                              >
                                <span className="text-2xs">{isExpanded ? '收起' : '考点'}</span>
                                {isExpanded ? (
                                  <ChevronDown className="w-3.5 h-3.5" />
                                ) : (
                                  <ChevronRight className="w-3.5 h-3.5" />
                                )}
                              </button>
                            )}
                          </div>

                          {/* 展开查看子章节考点 */}
                          {isExpanded && ch.subSections.length > 0 && (
                            <div className="px-4 pb-3 pt-1 border-t border-cream-100 bg-white/40">
                              <div className="text-2xs text-warm-600 space-y-1">
                                {ch.subSections.map((sub, sIdx) => (
                                  <div key={sIdx} className="flex items-start gap-1.5">
                                    <span className="text-cyan-500 font-mono">•</span>
                                    <span className="leading-relaxed">{sub}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                    <Database className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>本书籍未包含可直接提取的多级书签目录，将采用全书统筹拆解模型为您生成体系化笔记与试题。</span>
                  </div>
                )}

                <div className="mt-2 p-2.5 rounded-xl bg-cream-50 border border-cream-200 text-xs text-warm-600 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookmarkCheck className="w-4 h-4 text-cyan-600" />
                    <span>
                      已选 <b>{selectedChapterIds.length}</b> 个章节 · 入库后将生成{' '}
                      <b>{selectedChapterIds.length + 1} 篇 Markdown 笔记</b>（含 1 篇星图总览）+ 约{' '}
                      <b>{selectedChapterIds.length * (mode === 'dual' ? 3 : mode === 'question' ? 3 : 2)} 道真题</b>
                    </span>
                  </div>
                  <span className="text-2xs text-green-700 font-semibold bg-green-500/10 px-2 py-0.5 rounded-full">
                    全量高保真入库
                  </span>
                </div>
              </div>

              {/* 错误提示 */}
              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                  {error}
                </div>
              )}
            </>
          ) : (
            /* 3. 全卷深度拆解成果展示面板 */
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-green-900">
                      🎉 全卷深度拆解与规模化题库整合已全部成功完成！
                    </h4>
                    <p className="text-xs text-green-700 mt-0.5">
                      已按章节精细生成 <b>{deepResult.notes.length + 1} 篇 Markdown 笔记</b>（含双向链接全景导航），并录入{' '}
                      <b>{deepResult.totalQuestionsCount} 道考研成套真题</b> 至做题中心。
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-green-800 bg-white/60 px-2.5 py-1 rounded-lg border border-green-500/20">
                    {deepResult.chaptersCount} 大章节覆盖
                  </span>
                </div>
              </div>

              {/* 结果切换 Tab */}
              <div className="flex items-center gap-2 border-b border-cream-200 pb-2">
                <button
                  type="button"
                  onClick={() => setActiveResultTab('notes')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeResultTab === 'notes'
                      ? 'bg-cyan-500 text-white shadow-sm'
                      : 'text-warm-600 hover:bg-cream-100'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>生成的全书笔记体系 ({deepResult.notes.length + 1} 篇)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveResultTab('questions')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeResultTab === 'questions'
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'text-warm-600 hover:bg-cream-100'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>录入的成套考研真题 ({deepResult.totalQuestionsCount} 题)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveResultTab('outline')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeResultTab === 'outline'
                      ? 'bg-purple-500 text-white shadow-sm'
                      : 'text-warm-600 hover:bg-cream-100'
                  }`}
                >
                  <Network className="w-3.5 h-3.5" />
                  <span>全书原始大纲索引</span>
                </button>
              </div>

              {/* Tab 1: 知识库笔记列表与预览 */}
              {activeResultTab === 'notes' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* 左侧笔记目录列表 */}
                  <div className="border border-cream-200 rounded-xl overflow-hidden bg-cream-50/50 flex flex-col max-h-80">
                    <div className="p-2.5 border-b border-cream-200 text-xs font-bold text-warm-700 bg-cream-100/50">
                      生成的笔记文件列表：
                    </div>
                    <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
                      {/* 总览导航笔记 */}
                      <button
                        type="button"
                        onClick={() => setSelectedNoteIndex(0)}
                        className={`w-full text-left p-2 rounded-lg text-xs transition-all flex items-start gap-2 ${
                          selectedNoteIndex === 0
                            ? 'bg-cyan-500 text-white font-bold shadow-sm'
                            : 'hover:bg-cream-200 text-warm-800'
                        }`}
                      >
                        <Network className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="truncate">{deepResult.indexNoteTitle}</div>
                          <div className={`text-2xs ${selectedNoteIndex === 0 ? 'text-cyan-100' : 'text-warm-400'}`}>
                            🌟 全书考点知识图谱总览
                          </div>
                        </div>
                      </button>

                      {/* 各章独立笔记 */}
                      {deepResult.notes.map((n, idx) => {
                        const noteIdx = idx + 1
                        const isCurrent = selectedNoteIndex === noteIdx
                        return (
                          <button
                            key={n.path}
                            type="button"
                            onClick={() => setSelectedNoteIndex(noteIdx)}
                            className={`w-full text-left p-2 rounded-lg text-xs transition-all flex items-start gap-2 ${
                              isCurrent
                                ? 'bg-cyan-500 text-white font-bold shadow-sm'
                                : 'hover:bg-cream-200 text-warm-800'
                            }`}
                          >
                            <FileText className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                            <div className="min-w-0 flex-1">
                              <div className="truncate">{n.title}</div>
                              <div className={`text-2xs truncate ${isCurrent ? 'text-cyan-100' : 'text-warm-400'}`}>
                                {n.chapterTitle}
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* 右侧选中的笔记信息与路径 */}
                  <div className="md:col-span-2 border border-cream-200 rounded-xl p-4 bg-surface flex flex-col max-h-80 overflow-y-auto">
                    {renderSelectedNote()}
                  </div>
                </div>
              )}

              {/* Tab 2: 录入的成套真题池 */}
              {activeResultTab === 'questions' && (
                <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-center justify-between">
                    <span>
                      本书已累计提取命制并入库 <b>{deepResult.questions.length} 道精选考研真题</b>，均包含选项与名师详析。
                    </span>
                    <span className="font-mono font-bold text-amber-700">
                      存储：custom-questions.json
                    </span>
                  </div>

                  {deepResult.questions.map((q, idx) => (
                    <div
                      key={q.id || idx}
                      className="p-3.5 rounded-xl border border-cream-200 bg-surface space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded font-bold bg-amber-500/10 text-amber-700 text-2xs">
                            第 {idx + 1} 题 · {q.type === 'choice' ? '单选题' : '综合题'} ({q.difficulty || '中等'})
                          </span>
                          <span className="text-2xs font-semibold text-warm-600 bg-cream-100 px-2 py-0.5 rounded">
                            {q.chapter || deepResult.subject}
                          </span>
                        </div>
                        <span className="text-2xs text-warm-400 font-mono">
                          来源: {deepResult.bookName}
                        </span>
                      </div>
                      <div className="font-semibold text-warm-900 leading-snug">
                        {q.question}
                      </div>
                      {q.options && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-2 font-mono text-2xs text-warm-700">
                          {Object.entries(q.options).map(([k, v]) => (
                            <div
                              key={k}
                              className={k === q.answer ? 'text-green-600 font-bold bg-green-50/50 p-1 rounded' : 'p-1'}
                            >
                              {k}. {String(v)}
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="p-2.5 rounded-lg bg-green-500/5 border border-green-500/15 text-2xs text-green-900 leading-relaxed">
                        <b>【标准答案与深度解析】</b>: <span className="font-bold text-green-700">选项 {q.answer}</span>
                        <div className="mt-1 text-green-800">{q.explanation}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 3: 全书原始大纲索引 */}
              {activeResultTab === 'outline' && (
                <div className="max-h-80 overflow-y-auto p-4 rounded-xl bg-surface border border-cream-200 font-mono text-xs leading-relaxed text-warm-800 whitespace-pre-wrap">
                  {outlineData?.fullOutline || '暂无全书纯文本大纲'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 底部按钮栏 */}
        <div className="px-6 py-3.5 border-t border-cream-200 bg-cream-50/70 flex items-center justify-between">
          <div className="text-xs text-warm-400">
            {extracting && (
              <span className="flex items-center gap-2 text-cyan-600 font-semibold">
                <Loader2 className="w-4 h-4 animate-spin" />
                {extractProgressStep}
              </span>
            )}
            {!extracting && !deepResult && (
              <span>
                支持全书成套拆解，点击后将自动生成 <b>多篇章节笔记</b> 与 <b>成套真题池</b>
              </span>
            )}
            {deepResult && (
              <span className="text-green-600 font-semibold">
                已成功写入 Obsidian 知识库与做题中心！
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {!deepResult ? (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={extracting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-warm-600 hover:bg-cream-200 transition-colors"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleStartDeepExtract}
                  disabled={extracting || loadingOutline || selectedChapterIds.length === 0}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-600 hover:to-indigo-700 shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {extracting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>正在全速深度拆解入库...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>开始全卷成套深度拆解 ({selectedChapterIds.length} 章)</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-warm-600 hover:bg-cream-200 transition-colors"
                >
                  完成并关闭
                </button>
                <a
                  href="/quiz"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <span>立即前往做题中心刷题</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent
}
