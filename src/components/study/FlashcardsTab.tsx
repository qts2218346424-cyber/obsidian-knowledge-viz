import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Sparkles,
  Plus,
  Star,
  RotateCw,
  CheckCircle2,
  Flame,
  Brain,
  Trash2,
  Edit3,
  X,
  Search,
  Layers,
  HelpCircle,
  FolderDown,
  RefreshCw,
  Lightbulb,
  AlertTriangle,
  Smile,
  Frown
} from 'lucide-react'
import MarkdownRenderer from '../MarkdownRenderer'

export interface FlashcardItem {
  id: string
  title: string
  domain: 'cs_408' | 'math'
  subject: string
  chapter?: string
  front: string
  back: string
  mnemonic?: string
  pitfall?: string
  isForgotten: boolean
  difficulty: 'easy' | 'medium' | 'hard'
  tags: string[]
  repetition: number
  intervalDays: number
  easinessFactor: number
  reviewCount: number
  masteryLevel: number
  lastReviewedAt?: string
  nextReviewAt?: string
  createdAt: string
  updatedAt: string
}

const SUBJECT_OPTIONS = [
  '数据结构',
  '计算机组成原理',
  '操作系统',
  '计算机网络',
  '高等数学',
  '线性代数',
  '概率论与数理统计'
]

export default function FlashcardsTab() {
  const [cards, setCards] = useState<FlashcardItem[]>([])
  const [loading, setLoading] = useState(false)
  const [subjectFilter, setSubjectFilter] = useState<string>('all')
  const [onlyForgotten, setOnlyForgotten] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // 翻转状态记录 { [cardId]: boolean }
  const [flippedMap, setFlippedMap] = useState<Record<string, boolean>>({})

  // 沉浸式快速反复记忆模式 (Anki Mode)
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [reviewQueue, setReviewQueue] = useState<FlashcardItem[]>([])
  const [currentReviewIdx, setCurrentReviewIdx] = useState(0)
  const [isReviewFlipped, setIsReviewFlipped] = useState(false)
  const [sessionReviewedCount, setSessionReviewedCount] = useState(0)

  // 新建/编辑卡片弹窗
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<Partial<FlashcardItem> | null>(null)

  // AI 智能生成卡片弹窗
  const [aiModalOpen, setAiModalOpen] = useState(false)
  const [aiConceptInput, setAiConceptInput] = useState('')
  const [aiSubject, setAiSubject] = useState('操作系统')
  const [isGeneratingAi, setIsGeneratingAi] = useState(false)

  // 加载卡片列表
  const loadCards = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/flashcards/list')
      const data = await res.json()
      if (data.cards) {
        setCards(data.cards)
      }
    } catch (err) {
      console.error('Failed to load flashcards:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCards()
  }, [loadCards])

  // 切换单张卡片翻转
  const toggleFlip = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setFlippedMap(prev => ({ ...prev, [id]: !prev[id] }))
  }

  // 切换【容易遗忘 ⭐】标记
  const handleToggleForgotten = async (id: string, currentVal: boolean, e?: React.MouseEvent) => {
    e?.stopPropagation()
    try {
      const res = await fetch('/api/flashcards/toggle-forgotten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isForgotten: !currentVal })
      })
      const data = await res.json()
      if (data.success && data.card) {
        setCards(prev => prev.map(c => c.id === id ? data.card : c))
      }
    } catch (err) {
      console.error('Toggle forgotten error:', err)
    }
  }

  // 提交复习评分（记住 / 遗忘）
  const handleReviewCard = async (id: string, remembered: boolean, e?: React.MouseEvent) => {
    e?.stopPropagation()
    try {
      const res = await fetch('/api/flashcards/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, remembered })
      })
      const data = await res.json()
      if (data.success && data.card) {
        setCards(prev => prev.map(c => c.id === id ? data.card : c))
      }
    } catch (err) {
      console.error('Review card error:', err)
    }
  }

  // 删除卡片
  const handleDeleteCard = async (id: string, title: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (!window.confirm(`确定要删除卡片《${title}》吗？`)) return
    try {
      const res = await fetch(`/api/flashcards/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setCards(prev => prev.filter(c => c.id !== id))
      }
    } catch (err) {
      console.error('Delete card error:', err)
    }
  }

  // 保存新建/编辑卡片
  const handleSaveCard = async () => {
    if (!editingCard?.title?.trim() || !editingCard?.front?.trim() || !editingCard?.back?.trim()) {
      alert('请完整填写标题、正面问题和背面解析')
      return
    }

    try {
      if (editingCard.id) {
        // 更新
        const res = await fetch(`/api/flashcards/${editingCard.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingCard)
        })
        const data = await res.json()
        if (data.success) {
          setCards(prev => prev.map(c => c.id === editingCard.id ? data.card : c))
          setEditModalOpen(false)
        }
      } else {
        // 新建
        const res = await fetch('/api/flashcards/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingCard)
        })
        const data = await res.json()
        if (data.success) {
          setCards(prev => [data.card, ...prev])
          setEditModalOpen(false)
        }
      }
    } catch (err: any) {
      alert('保存卡片失败: ' + err.message)
    }
  }

  // AI 智能提炼卡片
  const handleAiGenerate = async () => {
    if (!aiConceptInput.trim()) {
      alert('请输入要制作卡片的考点概念（例如：Cache直接映射计算、PV操作生产者消费者）')
      return
    }

    setIsGeneratingAi(true)
    try {
      const res = await fetch('/api/flashcards/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concept: aiConceptInput.trim(),
          subject: aiSubject,
          domain: ['高等数学', '线性代数', '概率论与数理统计'].includes(aiSubject) ? 'math' : 'cs_408'
        })
      })
      const data = await res.json()
      if (data.success && data.cardData) {
        setEditingCard({
          ...data.cardData,
          isForgotten: true,
          difficulty: 'medium'
        })
        setAiModalOpen(false)
        setEditModalOpen(true)
      } else {
        alert(data.error || 'AI 生成卡片失败')
      }
    } catch (err: any) {
      alert('AI 生成异常: ' + err.message)
    } finally {
      setIsGeneratingAi(false)
    }
  }

  // 导出到 Obsidian
  const handleExportObsidian = async () => {
    try {
      const res = await fetch('/api/flashcards/export-obsidian', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        alert(data.message || '已成功导出为 Markdown 笔记至 Obsidian 知识库！')
      }
    } catch (err: any) {
      alert('导出异常: ' + err.message)
    }
  }

  // 开启沉浸式背诵
  const handleStartReview = (onlyForgot = true) => {
    let queue = cards
    if (onlyForgot) {
      queue = cards.filter(c => c.isForgotten)
    }
    if (subjectFilter !== 'all') {
      queue = queue.filter(c => c.subject === subjectFilter)
    }
    if (queue.length === 0) {
      alert(onlyForgot ? '当前学科没有标记为【容易遗忘】的卡片！' : '当前筛选条件下暂无卡片！')
      return
    }

    // 打乱顺序提升记忆提取效果
    const shuffled = [...queue].sort(() => Math.random() - 0.5)
    setReviewQueue(shuffled)
    setCurrentReviewIdx(0)
    setIsReviewFlipped(false)
    setSessionReviewedCount(0)
    setReviewModalOpen(true)
  }

  // 沉浸式背诵卡片动作
  const handleReviewStep = async (remembered: boolean) => {
    const currentCard = reviewQueue[currentReviewIdx]
    if (!currentCard) return

    await handleReviewCard(currentCard.id, remembered)
    setSessionReviewedCount(prev => prev + 1)

    // 如果未记住，把卡片放到队列末尾再次强化记忆
    let nextQueue = [...reviewQueue]
    if (!remembered) {
      nextQueue.push(currentCard)
    }

    if (currentReviewIdx + 1 < nextQueue.length) {
      setReviewQueue(nextQueue)
      setCurrentReviewIdx(prev => prev + 1)
      setIsReviewFlipped(false)
    } else {
      // 队列全部通关
      alert(`🎉 恭喜！本轮记忆攻坚已全部通关！共强化复习了 ${sessionReviewedCount + 1} 次知识点！`)
      setReviewModalOpen(false)
      loadCards()
    }
  }

  // 过滤后的卡片列表
  const filteredCards = useMemo(() => {
    return cards.filter(c => {
      if (subjectFilter !== 'all' && c.subject !== subjectFilter) return false
      if (onlyForgotten && !c.isForgotten) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchTitle = c.title.toLowerCase().includes(q)
        const matchFront = c.front.toLowerCase().includes(q)
        const matchBack = c.back.toLowerCase().includes(q)
        const matchMnemonic = (c.mnemonic || '').toLowerCase().includes(q)
        if (!matchTitle && !matchFront && !matchBack && !matchMnemonic) return false
      }
      return true
    })
  }, [cards, subjectFilter, onlyForgotten, searchQuery])

  // 统计数据
  const stats = useMemo(() => {
    const total = cards.length
    const forgotten = cards.filter(c => c.isForgotten).length
    const mastered = cards.filter(c => c.masteryLevel >= 3).length
    const due = cards.filter(c => !c.nextReviewAt || new Date(c.nextReviewAt) <= new Date()).length
    return { total, forgotten, mastered, due }
  }, [cards])

  return (
    <div className="space-y-6">
      {/* 1. 顶部数据看板与快捷行动栏 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-surface border border-cream-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-warm-500 mb-1">
            <span>408 核心闪卡库</span>
            <Layers className="w-4 h-4 text-warm-400" />
          </div>
          <div className="text-2xl font-bold text-warm-800">
            {stats.total} <span className="text-xs font-normal text-warm-400">张知识卡</span>
          </div>
          <div className="text-[11px] text-warm-400 mt-1">涵盖数据结构、计组、操作系统与网络</div>
        </div>

        <div className="bg-surface border border-amber-200/80 bg-amber-50/20 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-amber-700 font-semibold mb-1">
            <span>🔥 容易遗忘考点</span>
            <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
          </div>
          <div className="text-2xl font-bold text-amber-600">
            {stats.forgotten} <span className="text-xs font-normal text-amber-500/80">个高频易忘点</span>
          </div>
          <div className="text-[11px] text-amber-600/80 mt-1">标记星标，支持高强度反复唤醒</div>
        </div>

        <div className="bg-surface border border-indigo-200/80 bg-indigo-50/20 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-indigo-700 font-semibold mb-1">
            <span>今日待强化复习</span>
            <Brain className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-indigo-600">
            {stats.due} <span className="text-xs font-normal text-indigo-500/80">张到期复习</span>
          </div>
          <div className="text-[11px] text-indigo-600/80 mt-1">基于 SuperMemo-2 艾宾浩斯科学调度</div>
        </div>

        <div className="bg-surface border border-emerald-200/80 bg-emerald-50/20 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-emerald-700 font-semibold mb-1">
            <span>已牢固掌握</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">
            {stats.mastered} <span className="text-xs font-normal text-emerald-500/80">个核心要点</span>
          </div>
          <div className="text-[11px] text-emerald-600/80 mt-1">连续 3 轮以上正确回忆</div>
        </div>
      </div>

      {/* 2. 行动操作区与筛选栏 */}
      <div className="bg-surface border border-cream-200 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* 左侧：开启极速背诵与新建 */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleStartReview(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold shadow-md shadow-amber-500/20 hover:from-amber-600 hover:to-orange-600 transition-all cursor-pointer"
            title="只背诵标记为容易遗忘的知识点"
          >
            <Flame className="w-4 h-4 text-amber-100" />
            <span>开启易忘点极速背诵 ({stats.forgotten})</span>
          </button>

          <button
            onClick={() => handleStartReview(false)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-indigo-200 bg-indigo-50/60 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 transition-all cursor-pointer"
            title="全部卡片自由背诵"
          >
            <Brain className="w-4 h-4 text-indigo-500" />
            <span>全量卡片背诵</span>
          </button>

          <button
            onClick={() => {
              setEditingCard({
                title: '',
                domain: 'cs_408',
                subject: '操作系统',
                chapter: '核心考点',
                front: '',
                back: '',
                mnemonic: '',
                pitfall: '',
                isForgotten: true,
                difficulty: 'medium',
                tags: ['自定义考点']
              })
              setEditModalOpen(true)
            }}
            className="flex items-center gap-1 px-3 py-2 rounded-xl border border-cream-300 text-warm-700 text-xs font-semibold hover:bg-cream-100 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>新建卡片</span>
          </button>

          <button
            onClick={() => setAiModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-semibold shadow-xs hover:from-purple-500 hover:to-indigo-500 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI 智能提炼卡片</span>
          </button>

          <button
            onClick={handleExportObsidian}
            className="p-2 rounded-xl border border-cream-200 text-warm-500 hover:text-warm-800 hover:bg-cream-100 transition-colors cursor-pointer"
            title="将所有闪卡同步导出到 Obsidian 知识库 (wiki/03-记忆闪卡/)"
          >
            <FolderDown className="w-4 h-4" />
          </button>
        </div>

        {/* 右侧：筛选与搜索 */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setOnlyForgotten(!onlyForgotten)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
              onlyForgotten
                ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                : 'bg-cream-100 text-warm-600 border-cream-200 hover:bg-cream-200'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${onlyForgotten ? 'fill-white text-white' : 'text-amber-500'}`} />
            <span>仅看易忘点</span>
          </button>

          <select
            value={subjectFilter}
            onChange={e => setSubjectFilter(e.target.value)}
            className="text-xs rounded-xl border border-cream-300 px-2.5 py-1.5 bg-white text-warm-700 focus:outline-none focus:ring-1 focus:ring-accent-orange"
          >
            <option value="all">全学科卡片</option>
            {SUBJECT_OPTIONS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-warm-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="搜索卡片标题/口诀..."
              className="text-xs rounded-xl border border-cream-300 pl-8 pr-3 py-1.5 bg-white text-warm-800 focus:outline-none focus:ring-1 focus:ring-accent-orange w-40"
            />
          </div>
        </div>
      </div>

      {/* 3. 知识点卡片流网格 */}
      {loading ? (
        <div className="py-16 text-center text-xs text-warm-400 flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-accent-orange" />
          <span>正在加载记忆闪卡库...</span>
        </div>
      ) : filteredCards.length === 0 ? (
        <div className="py-16 text-center bg-surface border border-cream-200 rounded-2xl p-6">
          <Brain className="w-10 h-10 text-warm-300 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-warm-700">暂无符合条件的知识点卡片</h4>
          <p className="text-xs text-warm-400 mt-1">
            {onlyForgotten ? '太棒了！当前没有标记为易忘的考点，继续保持！' : '点击上方“新建卡片”或“AI 智能提炼卡片”添加你的 408 核心记忆卡。'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCards.map(card => {
            const isFlipped = Boolean(flippedMap[card.id])
            const isCs = card.domain === 'cs_408'

            return (
              <div
                key={card.id}
                className={`bg-surface border rounded-2xl transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
                  card.isForgotten ? 'border-amber-300 ring-1 ring-amber-200/60 bg-amber-50/10' : 'border-cream-200 hover:border-cream-300'
                }`}
              >
                {/* 卡片头部 */}
                <div className="p-4 pb-2 border-b border-cream-100 flex items-center justify-between gap-2 bg-cream-50/40">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                      isCs ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/60' : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                    }`}>
                      {card.subject}
                    </span>
                    {card.chapter && (
                      <span className="text-[10px] text-warm-400 truncate">
                        {card.chapter}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={e => handleToggleForgotten(card.id, card.isForgotten, e)}
                      className={`p-1 rounded-md transition-colors cursor-pointer ${
                        card.isForgotten ? 'text-amber-500 hover:text-amber-600 bg-amber-50' : 'text-warm-300 hover:text-amber-500'
                      }`}
                      title={card.isForgotten ? '已标记为容易遗忘，点击取消' : '标记为容易遗忘（反复强化记忆）'}
                    >
                      <Star className={`w-4 h-4 ${card.isForgotten ? 'fill-amber-500' : ''}`} />
                    </button>
                    <button
                      onClick={() => {
                        setEditingCard(card)
                        setEditModalOpen(true)
                      }}
                      className="p-1 rounded-md text-warm-400 hover:text-warm-700 hover:bg-cream-200 transition-colors cursor-pointer"
                      title="编辑卡片"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={e => handleDeleteCard(card.id, card.title, e)}
                      className="p-1 rounded-md text-warm-300 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                      title="删除卡片"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 卡片主体：正面提问 vs 背面答案 */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-warm-800 mb-2.5 leading-snug">
                      {card.title}
                    </h3>

                    {!isFlipped ? (
                      /* 正面记忆挑战 */
                      <div className="space-y-3">
                        <div className="text-xs text-warm-600 leading-relaxed bg-cream-100/60 p-3 rounded-xl border border-cream-200/70">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-700 mb-1.5">
                            <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                            <span>核心记忆挑战与设问：</span>
                          </div>
                          {card.front}
                        </div>

                        <button
                          onClick={e => toggleFlip(card.id, e)}
                          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200/60 transition-all cursor-pointer"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                          <span>翻转查看考点答案与口诀</span>
                        </button>
                      </div>
                    ) : (
                      /* 背面答案与口诀 */
                      <div className="space-y-3 animate-in fade-in zoom-in-98 duration-150">
                        <div className="text-xs text-warm-700 bg-white p-3 rounded-xl border border-cream-200 max-h-60 overflow-y-auto">
                          <MarkdownRenderer content={card.back} />
                        </div>

                        {card.mnemonic && (
                          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] leading-relaxed">
                            <span className="font-bold flex items-center gap-1 mb-0.5 text-amber-900">
                              <Lightbulb className="w-3 h-3 text-amber-600" /> 速记口诀：
                            </span>
                            {card.mnemonic}
                          </div>
                        )}

                        {card.pitfall && (
                          <div className="p-2.5 rounded-xl bg-red-50/80 border border-red-200 text-red-800 text-[11px] leading-relaxed">
                            <span className="font-bold flex items-center gap-1 mb-0.5 text-red-900">
                              <AlertTriangle className="w-3 h-3 text-red-600" /> 命题陷阱：
                            </span>
                            {card.pitfall}
                          </div>
                        )}

                        <button
                          onClick={e => toggleFlip(card.id, e)}
                          className="w-full text-center py-1 text-[11px] text-warm-400 hover:text-warm-600 transition-colors"
                        >
                          收起背面 / 翻回正面
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 卡片底部记忆状态与自评 */}
                  <div className="mt-4 pt-3 border-t border-cream-100 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="text-warm-400">
                        复习 {card.reviewCount} 次
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        card.masteryLevel >= 3
                          ? 'bg-emerald-50 text-emerald-700'
                          : card.masteryLevel >= 1
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {card.masteryLevel >= 3 ? '已牢固' : card.masteryLevel >= 1 ? '掌握中' : '易忘/初学'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={e => handleReviewCard(card.id, false, e)}
                        className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold transition-colors cursor-pointer flex items-center gap-1"
                        title="标记为模糊，增加复习权重"
                      >
                        <Frown className="w-3 h-3" />
                        <span>模糊</span>
                      </button>
                      <button
                        onClick={e => handleReviewCard(card.id, true, e)}
                        className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold transition-colors cursor-pointer flex items-center gap-1"
                        title="已记住"
                      >
                        <Smile className="w-3 h-3" />
                        <span>记住</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 4. 沉浸式极速背诵模态框 (Anki Mode) */}
      {reviewModalOpen && reviewQueue.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-cream-300 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* 顶栏进度 */}
            <div className="p-4 border-b border-cream-200 bg-cream-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-amber-100 text-amber-700 rounded-lg">
                  <Flame className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-xs font-bold text-warm-800">
                    易忘考点反复记忆攻坚 ({currentReviewIdx + 1} / {reviewQueue.length})
                  </h3>
                  <p className="text-[10px] text-warm-400">空格键翻转查看，1 键模糊，2 键记住</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-600">
                  进度 {Math.round(((currentReviewIdx + 1) / reviewQueue.length) * 100)}%
                </span>
                <button
                  onClick={() => setReviewModalOpen(false)}
                  className="p-1 rounded-lg text-warm-400 hover:text-warm-700 hover:bg-cream-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 进度条 */}
            <div className="w-full bg-cream-200 h-1">
              <div
                className="bg-gradient-to-r from-amber-500 to-indigo-600 h-1 transition-all duration-300"
                style={{ width: `${((currentReviewIdx + 1) / reviewQueue.length) * 100}%` }}
              />
            </div>

            {/* 卡片大窗口 */}
            <div className="p-6 flex-1 overflow-y-auto space-y-4">
              {reviewQueue[currentReviewIdx] && (() => {
                const cur = reviewQueue[currentReviewIdx]
                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {cur.subject} · {cur.chapter || '核心考点'}
                      </span>
                      {cur.isForgotten && (
                        <span className="flex items-center gap-1 text-[11px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <Flame className="w-3 h-3" /> 易忘高频点
                        </span>
                      )}
                    </div>

                    <h2 className="text-lg font-bold text-warm-900 leading-snug">
                      {cur.title}
                    </h2>

                    {/* 正面设问 */}
                    <div className="p-4 rounded-2xl bg-cream-100/70 border border-cream-200 text-sm text-warm-800 leading-relaxed">
                      <div className="font-bold text-xs text-amber-700 mb-2 flex items-center gap-1.5">
                        <HelpCircle className="w-4 h-4 text-amber-600" />
                        <span>请在脑海中回忆推导：</span>
                      </div>
                      {cur.front}
                    </div>

                    {/* 背面内容 */}
                    {!isReviewFlipped ? (
                      <div className="text-center py-8">
                        <button
                          onClick={() => setIsReviewFlipped(true)}
                          className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all cursor-pointer flex items-center gap-2 mx-auto"
                        >
                          <RotateCw className="w-4 h-4" />
                          <span>翻转查看考点答案与记忆口诀 (空格键)</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4 animate-in fade-in duration-200">
                        <div className="p-4 rounded-2xl bg-white border border-indigo-200/80 shadow-xs text-xs text-warm-800 leading-relaxed">
                          <MarkdownRenderer content={cur.back} />
                        </div>

                        {cur.mnemonic && (
                          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                            <span className="font-bold block mb-1">💡 记忆口诀：</span>
                            {cur.mnemonic}
                          </div>
                        )}

                        {cur.pitfall && (
                          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs">
                            <span className="font-bold block mb-1">⚠️ 考研命题陷阱：</span>
                            {cur.pitfall}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })()}
            </div>

            {/* 底部评估按钮栏 */}
            {isReviewFlipped && (
              <div className="p-4 border-t border-cream-200 bg-cream-50/80 flex items-center justify-between gap-4">
                <button
                  onClick={() => handleReviewStep(false)}
                  className="flex-1 py-3 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                >
                  <Frown className="w-4 h-4" />
                  <span>仍很模糊 / 记不清 (加入本轮再背)</span>
                </button>

                <button
                  onClick={() => handleReviewStep(true)}
                  className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Smile className="w-4 h-4" />
                  <span>已熟练掌握 / 记住了 (下一张)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. 新建 / 编辑卡片弹窗 */}
      {editModalOpen && editingCard && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-cream-300 shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-cream-200 pb-3 mb-4">
              <h3 className="text-sm font-bold text-warm-900">
                {editingCard.id ? '编辑知识点记忆卡片' : '新建 408 知识点记忆闪卡'}
              </h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-1 rounded-lg text-warm-400 hover:text-warm-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-warm-700 mb-1">考点标题</label>
                <input
                  type="text"
                  value={editingCard.title || ''}
                  onChange={e => setEditingCard({ ...editingCard, title: e.target.value })}
                  placeholder="例如：Cache 直接映射 vs 组相联映射"
                  className="w-full rounded-xl border border-cream-300 p-2.5 bg-white text-warm-800 focus:outline-none focus:ring-1 focus:ring-accent-orange font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-warm-700 mb-1">所属学科</label>
                  <select
                    value={editingCard.subject || '操作系统'}
                    onChange={e => setEditingCard({ ...editingCard, subject: e.target.value })}
                    className="w-full rounded-xl border border-cream-300 p-2 bg-white text-warm-800"
                  >
                    {SUBJECT_OPTIONS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-warm-700 mb-1">章节考点</label>
                  <input
                    type="text"
                    value={editingCard.chapter || ''}
                    onChange={e => setEditingCard({ ...editingCard, chapter: e.target.value })}
                    placeholder="例如：存储系统 / 进程管理"
                    className="w-full rounded-xl border border-cream-300 p-2 bg-white text-warm-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-warm-700 mb-1">正面记忆提问（输入设问或挑战）</label>
                <textarea
                  rows={2}
                  value={editingCard.front || ''}
                  onChange={e => setEditingCard({ ...editingCard, front: e.target.value })}
                  placeholder="设计一个直击考点本质的问题..."
                  className="w-full rounded-xl border border-cream-300 p-2.5 bg-white text-warm-800 focus:outline-none focus:ring-1 focus:ring-accent-orange"
                />
              </div>

              <div>
                <label className="block font-semibold text-warm-700 mb-1">背面考点解析与机理（支持 Markdown 与 LaTeX 公式）</label>
                <textarea
                  rows={4}
                  value={editingCard.back || ''}
                  onChange={e => setEditingCard({ ...editingCard, back: e.target.value })}
                  placeholder="输入精炼的推导与核心知识点..."
                  className="w-full rounded-xl border border-cream-300 p-2.5 bg-white text-warm-800 focus:outline-none focus:ring-1 focus:ring-accent-orange font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-warm-700 mb-1">💡 记忆口诀 / 助记技巧（选填）</label>
                <input
                  type="text"
                  value={editingCard.mnemonic || ''}
                  onChange={e => setEditingCard({ ...editingCard, mnemonic: e.target.value })}
                  placeholder="例如：组间直接组内全，超时断崖跌到一"
                  className="w-full rounded-xl border border-cream-300 p-2 bg-white text-warm-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-warm-700 mb-1">⚠️ 考研命题陷阱（选填）</label>
                <input
                  type="text"
                  value={editingCard.pitfall || ''}
                  onChange={e => setEditingCard({ ...editingCard, pitfall: e.target.value })}
                  placeholder="易错易混淆干扰项提示..."
                  className="w-full rounded-xl border border-cream-300 p-2 bg-white text-warm-800"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="forgottenCheck"
                  checked={Boolean(editingCard.isForgotten)}
                  onChange={e => setEditingCard({ ...editingCard, isForgotten: e.target.checked })}
                  className="rounded text-amber-500 focus:ring-amber-400"
                />
                <label htmlFor="forgottenCheck" className="text-xs font-semibold text-amber-700 cursor-pointer">
                  🔥 标记为【容易遗忘知识点】（排入每日高频强化背诵池）
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-cream-200">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl border border-cream-300 text-warm-600 hover:bg-cream-100 cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleSaveCard}
                  className="px-4 py-1.5 rounded-xl bg-accent-orange hover:bg-orange-600 text-white font-bold shadow-xs cursor-pointer"
                >
                  保存卡片
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. AI 智能提炼卡片弹窗 */}
      {aiModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-cream-300 shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-cream-200 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-50 rounded-xl text-purple-600 border border-purple-200">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-warm-900">AI 一键提炼记忆闪卡</h3>
                  <p className="text-[11px] text-warm-400">输入考点名称，自动提炼设问、答案与速记口诀</p>
                </div>
              </div>
              <button
                onClick={() => setAiModalOpen(false)}
                className="p-1 rounded-lg text-warm-400 hover:text-warm-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-warm-700 mb-1">所属学科</label>
                <select
                  value={aiSubject}
                  onChange={e => setAiSubject(e.target.value)}
                  className="w-full rounded-xl border border-cream-300 p-2.5 bg-white text-warm-800"
                >
                  {SUBJECT_OPTIONS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-warm-700 mb-1">考点概念或难点</label>
                <input
                  type="text"
                  value={aiConceptInput}
                  onChange={e => setAiConceptInput(e.target.value)}
                  placeholder="例如：流水线冒险处理、死锁避免银行家算法、二叉排序树"
                  className="w-full rounded-xl border border-cream-300 p-2.5 bg-white text-warm-800 focus:outline-none focus:ring-1 focus:ring-purple-500 font-medium"
                />
              </div>

              <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200/80 text-[11px] text-purple-800 leading-relaxed">
                ✨ AI 将结合 408 统考真题命题规律，自动构建正面考查设问、背面核心机理推导、琅琅上口的记忆口诀以及防坑易错辨析！
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAiModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl border border-cream-300 text-warm-600 hover:bg-cream-100"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleAiGenerate}
                  disabled={isGeneratingAi || !aiConceptInput.trim()}
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold shadow-xs disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {isGeneratingAi ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>AI 正在提炼考点...</span>
                    </>
                  ) : (
                    <span>开始智能提炼</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
