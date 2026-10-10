import React, { useState } from 'react'
import {
  Brain, Globe, Folder, MessageSquare, X, CheckCircle2,
  ShieldAlert, Sparkles, Layers, BookOpen, Clock, ArrowRight,
  HardDrive, Info
} from 'lucide-react'
import type { AIProject } from '../services/ai-workspace'

interface MemoryTierModalProps {
  isOpen: boolean
  onClose: () => void
  activeProject: AIProject
  activeConvTitle?: string
  totalConversationsCount: number
  onUpdateProjectDesc?: (newDesc: string) => void
}

export default function MemoryTierModal({
  isOpen,
  onClose,
  activeProject,
  activeConvTitle,
  totalConversationsCount,
  onUpdateProjectDesc,
}: MemoryTierModalProps) {
  const [editingDesc, setEditingDesc] = useState(activeProject?.description || '')
  const [descSaved, setDescSaved] = useState(false)

  if (!isOpen) return null

  const handleSaveDesc = () => {
    if (onUpdateProjectDesc) {
      onUpdateProjectDesc(editingDesc)
      setDescSaved(true)
      setTimeout(() => setDescSaved(false), 2000)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-surface border border-cream-300 dark:border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* 顶部标题栏 */}
        <div className="px-5 py-4 border-b border-cream-200 dark:border-slate-800 flex items-center justify-between bg-cream-50/70 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-warm-900 dark:text-slate-100 flex items-center gap-2">
                <span>CoreForge 研核 · 三层认知记忆与项目隔离架构</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent-orange/15 text-accent-orange font-semibold">
                  v2.0 物理隔离体系
                </span>
              </h2>
              <p className="text-xs text-warm-500 dark:text-slate-400 mt-0.5">
                彻底厘清“全局长期记忆”、“项目专属记忆”与“会话短期工作记忆”的边界与生效时机
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-cream-200 dark:hover:bg-slate-700 text-warm-400 hover:text-warm-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 核心内容区 */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-warm-800 dark:text-slate-200 text-xs">
          {/* 架构全景速览卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* 第一层：全局记忆 */}
            <div className="p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/60 dark:bg-indigo-950/20 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-1.5 font-bold text-indigo-700 dark:text-indigo-400 text-xs">
                    <Globe className="w-4 h-4" /> 1. 全局记忆层
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-200/60 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200 font-medium">
                    跨项目共享
                  </span>
                </div>
                <p className="text-[11px] text-warm-600 dark:text-slate-300 leading-relaxed">
                  跨越全部科目与项目的最顶层先验。包含考生全局画像、408 & 数学统考总大纲规范、系统宪制规则。
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-indigo-200/50 dark:border-indigo-900/50 text-[10px] text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1">
                <Clock className="w-3 h-3 shrink-0" />
                <span>生效时机：任一模型/引擎调用始终生效</span>
              </div>
            </div>

            {/* 第二层：项目级记忆 */}
            <div className="p-3.5 rounded-xl border border-amber-300 dark:border-amber-900/50 bg-amber-50/60 dark:bg-amber-950/20 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400 text-xs">
                    <Folder className="w-4 h-4" /> 2. 项目专属记忆
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-200/60 dark:bg-amber-800 text-amber-900 dark:text-amber-200 font-medium">
                    项目物理隔离
                  </span>
                </div>
                <p className="text-[11px] text-warm-600 dark:text-slate-300 leading-relaxed">
                  限定在当前项目专属领域内。包含当前项目独立工作目录（cwd）、项目研学设定与专属沉淀笔记。
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-amber-300/50 dark:border-amber-900/50 text-[10px] text-amber-700 dark:text-amber-400 font-medium flex items-center gap-1">
                <Clock className="w-3 h-3 shrink-0" />
                <span>生效时机：仅在该项目所属会话中注入</span>
              </div>
            </div>

            {/* 第三层：会话短期记忆 */}
            <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/60 dark:bg-emerald-950/20 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400 text-xs">
                    <MessageSquare className="w-4 h-4" /> 3. 会话短期记忆
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-200/60 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-200 font-medium">
                    单条对话独立
                  </span>
                </div>
                <p className="text-[11px] text-warm-600 dark:text-slate-300 leading-relaxed">
                  当前独立问答线程的工作记忆。包含最近多轮对话滑动窗口、临时引用的单篇笔记与激活的 Skill。
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-emerald-200/50 dark:border-emerald-900/50 text-[10px] text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
                <Clock className="w-3 h-3 shrink-0" />
                <span>生效时机：单次执行，切会话即隔断</span>
              </div>
            </div>
          </div>

          {/* 核心问题详细解答与时机剖析 */}
          <div className="bg-cream-100/60 dark:bg-slate-800/60 p-4 rounded-xl border border-cream-200 dark:border-slate-700 space-y-3">
            <h3 className="font-bold text-xs text-warm-900 dark:text-slate-100 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-accent-orange" />
              <span>深度解答：什么是全局记忆？相同项目与不同项目如何划分？</span>
            </h3>

            <div className="space-y-2.5 text-[11px] leading-relaxed">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                <div>
                  <b className="text-indigo-800 dark:text-indigo-300">什么时候是全局记忆？</b>
                  <p className="text-warm-600 dark:text-slate-300 mt-0.5">
                    全局记忆用于表达<b>“所有研学场景都必须遵守的总纲领”</b>。例如：你的总目标是考取某 985 院校计算机系、你的数学习题作答偏好（定理步骤不可跳过）、考研 408 统考综合知识框架规范。不论你在哪个项目（哪怕你新建了一个完全陌生的专项项目），智能体都不会忘记你是谁、你的总备考阶段以及严禁伪造虚假考点的最高准则。
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <div>
                  <b className="text-amber-800 dark:text-amber-300">相同项目下的记忆与不同项目下的记忆划分：</b>
                  <p className="text-warm-600 dark:text-slate-300 mt-0.5">
                    <b>• 相同项目下</b>：共享该项目的专属上下文与独立文件工作目录（cwd）。比如在「数据结构算法突击」项目下，该项目专属提示词会告知模型重点关注时间复杂度分析、图论与树形遍历算法，并且该项目下创建的所有不同对话都处于这一专业语境中；
                    <br />
                    <b>• 不同项目间</b>：<b>完全物理隔离</b>！例如当你从「数据结构算法突击」切换到「计算机网络协议剖析」项目，算法项目的专项指令和会话历史绝不会污染网络项目，各项目的笔记文件沉淀与执行控制器各自独立，互不串台。
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <div>
                  <b className="text-emerald-800 dark:text-emerald-300">对话间执行过程完全独立隔离：</b>
                  <p className="text-warm-600 dark:text-slate-300 mt-0.5">
                    每个会话拥有各自专属的运行标识（convId）与专属控制器（AbortController）。即使用户在一个会话中启用了 Claude Code 运行复杂的思考推演，再切换到另一个使用 Antigravity 的会话，后者的状态栏和界面绝不会出现 Claude Code 的执行过程，且可以独立向 Antigravity 提问或独立终止任何一个会话。
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 当前活动项目专属记忆配置与工作目录展示 */}
          <div className="p-4 rounded-xl border border-cream-200 dark:border-slate-700 bg-surface space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Folder className="w-4 h-4 text-accent-orange" />
                <span className="font-bold text-xs text-warm-900 dark:text-slate-100">
                  当前活动项目：{activeProject?.name || '默认知识库项目'}
                </span>
              </div>
              <span className="text-[10px] text-warm-400 font-mono">
                ID: {activeProject?.id}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
              <div className="p-2.5 rounded-lg bg-cream-50 dark:bg-slate-800/40 border border-cream-200/80 dark:border-slate-700">
                <span className="text-warm-400 font-medium block mb-1">📁 独立工作目录 (cwd)</span>
                <span className="font-mono text-warm-800 dark:text-slate-200 break-all select-all">
                  {activeProject?.cwd || '（默认 Vault 根目录）'}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-cream-50 dark:bg-slate-800/40 border border-cream-200/80 dark:border-slate-700">
                <span className="text-warm-400 font-medium block mb-1">💬 当前项目会话数</span>
                <span className="font-bold text-accent-orange">
                  {totalConversationsCount} 个独立研学会话
                </span>
              </div>
            </div>

            {/* 可编辑的项目专属领域记忆 */}
            <div>
              <label className="text-[11px] font-bold text-warm-700 dark:text-slate-300 block mb-1.5 flex items-center justify-between">
                <span>📌 项目专属领域记忆与要求 (Project Description / System Memory)</span>
                {descSaved && (
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> 已保存生效
                  </span>
                )}
              </label>
              <textarea
                value={editingDesc}
                onChange={e => setEditingDesc(e.target.value)}
                placeholder="为该项目注入专属记忆要求（如：本项目专注于考研数学一真题解析，优先使用拉格朗日中值定理与泰勒展开，注重步骤严谨度...）"
                rows={3}
                className="w-full text-xs p-2.5 rounded-xl border border-cream-300 dark:border-slate-600 bg-cream-50/50 dark:bg-slate-800 focus:outline-hidden focus:border-accent-orange transition-colors leading-relaxed"
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={handleSaveDesc}
                  className="px-3 py-1.5 rounded-lg bg-accent-orange text-white text-xs font-semibold hover:bg-accent-orange/90 transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  保存项目专属记忆
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 底部关闭栏 */}
        <div className="px-5 py-3 border-t border-cream-200 dark:border-slate-800 bg-cream-50/70 dark:bg-slate-800/50 flex items-center justify-between text-xs">
          <span className="text-[11px] text-warm-500 dark:text-slate-400">
            ✅ 会话隔离引擎与三层记忆已自动联动后端与本地智能体环境
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-cream-200 dark:bg-slate-700 hover:bg-cream-300 text-warm-800 dark:text-slate-200 font-semibold transition-colors cursor-pointer"
          >
            关闭面板
          </button>
        </div>
      </div>
    </div>
  )
}
