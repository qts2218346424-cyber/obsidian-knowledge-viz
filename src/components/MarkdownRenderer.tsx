import React, { memo, useState, useEffect, useMemo } from 'react'

import ReactMarkdown from 'react-markdown'

import remarkGfm from 'remark-gfm'

import remarkMath from 'remark-math'

import rehypeHighlight from 'rehype-highlight'

import rehypeKatex from 'rehype-katex'

import { Copy, Check, ChevronDown, Sparkles } from 'lucide-react'



interface MarkdownRendererProps {

  content: string

  className?: string

  inline?: boolean

  isStreaming?: boolean

  defaultThinkingOpen?: boolean

}



/**

 * 递归从 React 子节点提取纯文本（用于代码块复制）

 */

function extractTextFromChildren(children: any): string {

  if (!children) return ''

  if (typeof children === 'string') return children

  if (typeof children === 'number') return String(children)

  if (Array.isArray(children)) return children.map(extractTextFromChildren).join('')

  if (React.isValidElement(children) && (children.props as any)?.children) {

    return extractTextFromChildren((children.props as any).children)

  }

  return ''

}



/**

 * 格式化语言名称显示

 */

function formatLanguage(lang: string): string {

  const l = (lang || '').toLowerCase().trim()

  const map: Record<string, string> = {

    ts: 'TypeScript',

    typescript: 'TypeScript',

    js: 'JavaScript',

    javascript: 'JavaScript',

    tsx: 'TypeScript (React)',

    jsx: 'JavaScript (React)',

    py: 'Python',

    python: 'Python',

    sh: 'Bash',

    bash: 'Bash',

    shell: 'Shell',

    zsh: 'Shell',

    json: 'JSON',

    html: 'HTML',

    css: 'CSS',

    sql: 'SQL',

    cpp: 'C++',

    'c++': 'C++',

    c: 'C',

    java: 'Java',

    rust: 'Rust',

    go: 'Go',

    golang: 'Go',

    md: 'Markdown',

    markdown: 'Markdown',

    yaml: 'YAML',

    yml: 'YAML',

  }

  return map[l] || (l ? l.toUpperCase() : 'Code')

}



/**

 * 智能体级代码块组件：Mac 风格顶部控制栏 + 语言徽标 + 一键复制 + 语法高亮

 */

function CodeBlock({

  language,

  children,

}: {

  language: string

  children: any

}) {

  const [copied, setCopied] = useState(false)

  const [collapsed, setCollapsed] = useState(false)



  const rawCode = useMemo(() => {

    return extractTextFromChildren(children).replace(/\n$/, '')

  }, [children])



  const lineCount = useMemo(() => {

    if (!rawCode) return 1

    return rawCode.split('\n').length

  }, [rawCode])



  const handleCopy = () => {

    if (!rawCode) return

    navigator.clipboard.writeText(rawCode)

    setCopied(true)

    setTimeout(() => setCopied(false), 2000)

  }



  const displayLang = useMemo(() => formatLanguage(language), [language])



  return (

    <div className="my-2 rounded-xl overflow-hidden border border-slate-800 bg-[#0d1117] text-slate-100 shadow-md text-xs font-mono group">

      {/* 顶部控制栏 */}

      <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#161b22] border-b border-slate-800/80 select-none">

        <div className="flex items-center gap-2">

          {/* Mac 风格三色圆点 */}

          <div className="flex items-center gap-1.5 opacity-70">

            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />

            <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />

            <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />

          </div>

          <span className="text-[11px] font-semibold text-slate-300 ml-1">

            {displayLang}

          </span>

          <span className="text-[10px] text-slate-500 font-mono">

            {lineCount} 行

          </span>

        </div>



        <div className="flex items-center gap-1.5">

          {lineCount > 12 && (

            <button

              type="button"

              onClick={() => setCollapsed(prev => !prev)}

              className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] text-slate-400 hover:text-slate-100 hover:bg-slate-700/60 transition-colors cursor-pointer"

              title={collapsed ? '展开代码块' : '折叠代码块'}

            >

              <ChevronDown className={`w-3 h-3 transition-transform ${collapsed ? '-rotate-90' : ''}`} />

              <span>{collapsed ? '展开' : '折叠'}</span>

            </button>

          )}

          <button

            type="button"

            onClick={handleCopy}

            className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] text-slate-400 hover:text-slate-100 hover:bg-slate-700/60 transition-colors cursor-pointer"

            title="复制代码"

          >

            {copied ? (

              <>

                <Check className="w-3 h-3 text-emerald-400" />

                <span className="text-emerald-400 font-medium">已复制</span>

              </>

            ) : (

              <>

                <Copy className="w-3 h-3" />

                <span>复制代码</span>

              </>

            )}

          </button>

        </div>

      </div>



      {/* 代码内容区域 */}

      {collapsed ? (

        <div

          onClick={() => setCollapsed(false)}

          className="px-3.5 py-2 text-[11px] text-slate-400 hover:text-slate-200 bg-[#0d1117]/80 cursor-pointer flex items-center justify-between"

        >

          <span className="truncate font-mono opacity-80">{rawCode.split('\n')[0]} ...</span>

          <span className="text-[10px] text-indigo-400 shrink-0 ml-2">点击展开全部 ({lineCount} 行)</span>

        </div>

      ) : (

        <div className="p-3.5 overflow-x-auto leading-relaxed max-h-[520px] overflow-y-auto">

          <pre className="m-0 p-0 bg-transparent text-slate-200">

            <code>{children}</code>

          </pre>

        </div>

      )}

    </div>

  )

}



/**

 * 深度思考折叠手风琴组件 (Chain of Thought / <think>)

 */

function ThinkingAccordion({

  thinking,

  isThinkingActive,

  defaultOpen = false,

}: {

  thinking: string

  isThinkingActive: boolean

  defaultOpen?: boolean

}) {

  // 思考中若未显式展开则保持紧凑折叠，推演完成后默认收起，极大释放垂直屏幕高度

  const [isOpen, setIsOpen] = useState(defaultOpen)



  useEffect(() => {

    if (!isThinkingActive) {

      setIsOpen(false)

    }

  }, [isThinkingActive])



  const wordCount = thinking.trim().length



  return (

    <div className="my-2.5 rounded-xl border border-cream-300/80 bg-cream-100/50 dark:border-slate-800 dark:bg-slate-900/60 overflow-hidden text-xs shadow-2xs transition-all">

      <button

        type="button"

        onClick={() => setIsOpen(!isOpen)}

        className="w-full flex items-center justify-between px-3.5 py-2 bg-cream-200/40 hover:bg-cream-200/70 dark:bg-slate-800/40 dark:hover:bg-slate-800/70 transition-colors text-warm-600 dark:text-slate-400 select-none cursor-pointer"

      >

        <div className="flex items-center gap-2 font-medium">

          <div className="p-1 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">

            <Sparkles className={`w-3.5 h-3.5 ${isThinkingActive ? 'animate-spin text-accent-orange' : ''}`} />

          </div>

          <span className="font-semibold text-warm-800 dark:text-slate-200">

            {isThinkingActive ? '正在深度思考与推演...' : '深度思考过程'}

          </span>

          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cream-200/80 dark:bg-slate-800 text-warm-500 dark:text-slate-400 font-mono">

            {isThinkingActive ? '推演中' : `已完成 · ${wordCount} 字`}

          </span>

        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-warm-400">

          <span>{isOpen ? '收起思考' : '展开思考'}</span>

          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />

        </div>

      </button>



      {isOpen && (

        <div className="p-3.5 border-t border-cream-200/70 dark:border-slate-800/80 text-warm-600 dark:text-slate-400 bg-surface/60 dark:bg-slate-950/50 leading-relaxed max-h-64 sm:max-h-72 overflow-y-auto space-y-1.5 text-[11.5px]">

          <ReactMarkdown

            remarkPlugins={[remarkGfm, remarkMath]}

            rehypePlugins={[rehypeHighlight, rehypeKatex]}

          >

            {thinking}

          </ReactMarkdown>

          {isThinkingActive && (

            <div className="flex items-center gap-1.5 text-accent-orange text-[11px] font-medium pt-1">

              <span className="w-1.5 h-1.5 rounded-full bg-accent-orange animate-ping" />

              <span>正在梳理逻辑链与求解步骤...</span>

            </div>

          )}

        </div>

      )}

    </div>

  )

}



/**

 * 提取文本中的 <think> 或 <thought> 内容

 */

function extractThinking(text: string): {

  thinking: string | null

  isThinkingActive: boolean

  mainContent: string

} {

  if (!text) return { thinking: null, isThinkingActive: false, mainContent: '' }



  const thinkTagRegex = /<(think|thought)>([\s\S]*?)(?:<\/\1>|$)/i

  const match = thinkTagRegex.exec(text)



  if (!match) {

    return { thinking: null, isThinkingActive: false, mainContent: text }

  }



  const fullMatched = match[0]

  const tagName = match[1]

  const thinkingContent = match[2]

  const hasClosed = fullMatched.toLowerCase().endsWith(`</${tagName.toLowerCase()}>`)



  // 移除已匹配的 thinking 块获得主内容

  const mainContent = text.replace(fullMatched, '').trim()



  return {

    thinking: thinkingContent.trim(),

    isThinkingActive: !hasClosed,

    mainContent,

  }

}



/**

 * 统一 Markdown 与 KaTeX 数学公式渲染组件

 * 特性：

 * - 智能提取并折叠思维链 (<think> / <thought>)

 * - Mac 风格终端代码块，带语言标签与一键复制代码

 * - GFM (GitHub Flavored Markdown: 表格、任务列表、删除线等)

 * - KaTeX (行内 $...$ 与 块级 $$...$$ 数学公式)

 * - Highlight.js 语法高亮

 */

export const MarkdownRenderer = memo(function MarkdownRenderer({

  content,

  className = '',

  inline = false,

  isStreaming = false,

  defaultThinkingOpen = false,

}: MarkdownRendererProps) {

  if (!content) return null



  // 1. 提取并分离思考过程

  const { thinking, isThinkingActive, mainContent } = useMemo(() => {

    return extractThinking(content)

  }, [content])



  // 1.1 自动规整 Obsidian 双链图片 ![[xxx.png]] -> ![](/api/vault/attachment?path=xxx.png)

  // 并在流式输出期间平滑闭合未完成的块级公式 $$，防止公式源码闪烁跳动

  const normalizedContent = useMemo(() => {

    if (!mainContent) return ''

    let processed = mainContent

      // 1. 规整图片双链 ![[xxx.png]] -> ![](/api/vault/attachment?path=xxx.png)

      .replace(

        /!\[\[(.*?\.(?:png|jpg|jpeg|gif|webp|svg|bmp))\]\]/gi,

        (_match, filename) => `![${filename}](/api/vault/attachment?path=${encodeURIComponent(filename)})`

      )

      // 2. 规整普通带别名双链 [[笔记名|显示别名]] -> [显示别名](#wikilink:笔记名)

      .replace(

        /\[\[([^\]\|]+)\|([^\]]+)\]\]/g,

        (_match, note, alias) => `[${alias}](#wikilink:${encodeURIComponent(note.trim())})`

      )

      // 3. 规整普通单向双链 [[笔记名]] -> [笔记名](#wikilink:笔记名)

      .replace(

        /\[\[([^\]]+)\]\]/g,

        (_match, note) => `[${note.trim()}](#wikilink:${encodeURIComponent(note.trim())})`

      )

      // 4. 规整连续多余空行：防止上下被拉得太长（至多允许 1 个空行，即 2 个 \n）

      .replace(/\n{3,}/g, '\n\n')

      // 5. 清理每行行尾多余的空白字符

      .replace(/[ \t]+\n/g, '\n')
      // 6. 中文排版避头尾规整：修复孤立掉落在行首的标点符号（，。！？；：、）将其上移贴回上一行行末
      .replace(/\n([，。！？；：、])/g, '')
      // 7. 规整中文全角标点后紧随的多余普通空格（符合中文观察阅读习惯）
      .replace(/([，。！？；：、”《》]) +/g, '')
      // 8. 确保中文字符与行内公式 $ 之间拥有清晰边界，防止 remark-math 将 $...$ 误判为普通文本
      .replace(/([\u4e00-\u9fa5，。！？；：、”《》])(\$\S[^\$\n]*?\$)/g, '$1 $2')
      .replace(/(\$\S[^\$\n]*?\$)([\u4e00-\u9fa5，。！？；：、”《》])/g, '$1 $2')
if (isStreaming) {

      const blockMathMatches = processed.match(/\$\$/g)

      if (blockMathMatches && blockMathMatches.length % 2 === 1) {

        processed += '\n$$'

      }

    }

    return processed

  }, [mainContent, isStreaming])



  // 2. 自定义渲染组件映射

  const components = useMemo(() => {

    return {

      // 图片组件定制：自动补全后端附件路径，圆角自适应展示

      img({ src, alt, ...props }: any) {

        let finalSrc = src || ''

        if (finalSrc && !finalSrc.startsWith('http://') && !finalSrc.startsWith('https://') && !finalSrc.startsWith('data:') && !finalSrc.startsWith('/api/')) {

          finalSrc = `/api/vault/attachment?path=${encodeURIComponent(finalSrc)}`

        }

        return (

          <span className="block my-3 text-center">

            <img

              src={finalSrc}

              alt={alt || '笔记插图'}

              className="inline-block max-w-full rounded-xl border border-cream-200 dark:border-slate-800 shadow-sm object-contain max-h-[520px] hover:shadow-md transition-shadow bg-white dark:bg-slate-900"

              loading="lazy"

              {...props}

            />

            {alt && <span className="block mt-1 text-xs text-slate-400 dark:text-slate-500 italic">{alt}</span>}

          </span>

        )

      },

      // 标题分级高亮展示

            a({ href, children, ...props }: any) {

        if (href && href.startsWith('#wikilink:')) {

          const targetNote = decodeURIComponent(href.replace('#wikilink:', ''))

          return (

            <span

              onClick={(e) => {

                e.preventDefault()

                e.stopPropagation()

                window.dispatchEvent(new CustomEvent('wikilink-clicked', { detail: { target: targetNote } }))

                if (!window.location.pathname.includes('/editor')) {

                  window.location.href = `/editor?path=${encodeURIComponent(targetNote)}`

                }

              }}

              className="inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 hover:border-indigo-500/40 font-medium cursor-pointer transition-all active:scale-95 text-[0.95em]"

              title={`点击在知识库编辑器中快速打开或创建关联笔记：[[${targetNote}]]`}

            >

              <span className="text-[10px] text-indigo-400">🔗</span>

              <span className="underline decoration-indigo-400/40 underline-offset-2">{children}</span>

            </span>

          )

        }

        return (

          <a

            href={href}

            target="_blank"

            rel="noopener noreferrer"

            className="text-accent-orange hover:underline font-medium"

            {...props}

          >

            {children}

          </a>

        )

      },

      h1({ children }: any) {

        return (

          <h1 className="text-[13px] sm:text-[14px] font-bold text-warm-900 dark:text-white mt-1.5 mb-0.5 pb-0.5 border-b border-cream-300 dark:border-white/10 flex items-center gap-1.5">

            <span className="w-1.5 h-3 rounded-full bg-accent-orange shrink-0" />

            <span>{children}</span>

          </h1>

        )

      },

      h2({ children }: any) {

        return (

          <h2 className="text-[12px] sm:text-[13px] font-bold text-warm-900 dark:text-white mt-1.2 mb-0.5 flex items-center gap-1.2">

            <span className="w-1.5 h-2.5 rounded-full bg-blue-400 shrink-0" />

            <span>{children}</span>

          </h2>

        )

      },

      h3({ children }: any) {

        return (

          <h3 className="text-[11.5px] sm:text-xs font-bold text-warm-900 dark:text-slate-100 mt-1 mb-0.5 flex items-center gap-1">

            <span className="w-1 h-2 rounded-full bg-purple-400 shrink-0" />

            <span>{children}</span>

          </h3>

        )

      },

      p({ children }: any) {

        return <p className="my-0.8 sm:my-1 leading-[1.56] text-warm-800 dark:text-slate-100">{children}</p>

      },

      ul({ children }: any) {

        return <ul className="my-0.8 pl-3.5 list-disc space-y-0.5 text-warm-800 dark:text-slate-200 text-inherit">{children}</ul>

      },

      ol({ children }: any) {

        return <ol className="my-0.8 pl-3.5 list-decimal space-y-0.5 text-warm-800 dark:text-slate-200 text-inherit">{children}</ol>

      },

      li({ children }: any) {

        return <li className="leading-[1.55] marker:text-accent-orange marker:font-bold text-warm-800 dark:text-slate-200">{children}</li>

      },

      strong({ children }: any) {

        return (

          <strong className="font-semibold text-warm-950 dark:text-amber-300 bg-amber-500/10 dark:bg-amber-400/20 px-1 py-0.5 rounded text-[0.96em]">

            {children}

          </strong>

        )

      },

      hr() {

        return <hr className="my-3.5 border-t border-cream-200 dark:border-white/10" />

      },

      // 拦截 pre 标签，交由 code 标签统筹渲染

      pre({ children }: any) {

        return <>{children}</>

      },

      // 拦截 code 标签，区分行内代码与多行语法高亮代码块

      code({ node, className, children, ...props }: any) {

        const match = /language-(\w+)/.exec(className || '')

        const raw = extractTextFromChildren(children)

        const isMultiLine = raw.includes('\n')



        // 单行行内代码：标签化胶囊展示

        if (!match && !isMultiLine) {

          return (

            <code

              className="px-1.5 py-0.5 mx-0.5 rounded-md bg-cream-200/70 dark:bg-slate-800/80 text-warm-900 dark:text-amber-200 font-mono text-[0.875em] border border-cream-300/60 dark:border-amber-500/30 font-medium"

              {...props}

            >

              {children}

            </code>

          )

        }



        // 多行代码块：Mac 风格顶部栏 + 一键复制 + 深色主题

        const language = match ? match[1] : 'text'

        return <CodeBlock language={language}>{children}</CodeBlock>

      },

      // 表格：紧致微缩横向自适应滚动防撑破容器

      table({ children }: any) {

        return (

          <div className="my-1.5 sm:my-2 overflow-x-auto rounded-lg border border-cream-200 dark:border-white/10 shadow-2xs">

            <table className="min-w-full text-left text-[11px] sm:text-xs border-collapse">

              {children}

            </table>

          </div>

        )

      },

      thead({ children }: any) {

        return <thead className="bg-slate-100/90 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700">{children}</thead>

      },

      tbody({ children }: any) {

        return <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">{children}</tbody>

      },

      tr({ children }: any) {

        return <tr className="transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/40">{children}</tr>

      },

      th({ children }: any) {

        return (

          <th className="px-2 py-1 sm:px-2.5 sm:py-1 font-semibold text-[11px] sm:text-xs text-slate-800 dark:text-slate-100 whitespace-nowrap">

            {children}

          </th>

        )

      },

      td({ children }: any) {

        return (

          <td className="px-2 py-1 sm:px-2.5 sm:py-1 text-[11px] sm:text-xs leading-snug text-slate-700 dark:text-slate-200 align-middle">

            {children}

          </td>

        )

      },

      // 引用块：智能根据避坑 / 提分口诀等类型渲染专业高亮卡片

      blockquote({ children }: any) {

        const raw = extractTextFromChildren(children)

        const isWarning = /⚠️|避坑|注意|警惕|易错|陷阱|warning|caution/i.test(raw)

        const isTip = /💡|口诀|技巧|秒杀|速记|tip|note/i.test(raw)



        let cardStyle = 'border-l-4 border-accent-orange bg-cream-100/70 dark:bg-slate-900/60 text-warm-800 dark:text-slate-100 [&>p]:text-inherit'

        if (isWarning) {

          cardStyle = 'border-l-4 border-amber-500 bg-amber-500/10 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 dark:border-amber-400 [&>p]:text-inherit'

        } else if (isTip) {

          cardStyle = 'border-l-4 border-emerald-500 bg-emerald-500/10 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 dark:border-emerald-400 [&>p]:text-inherit'

        }



        return (

          <blockquote className={`my-2.5 pl-3.5 pr-3 py-2 rounded-r-xl text-[11.5px] sm:text-xs leading-[1.55] transition-colors ${cardStyle}`}>

            {children}

          </blockquote>

        )

      },

    }

  }, [])



  return (

    <div className={`prose-math ${inline ? 'inline-block [&>p]:inline [&>p]:m-0' : ''} ${className}`}>

      {/* 渲染思考链手风琴面板（如果有） */}

      {thinking && (

        <ThinkingAccordion

          thinking={thinking}

          isThinkingActive={isThinkingActive || (isStreaming && !mainContent)}

          defaultOpen={defaultThinkingOpen}

        />

      )}



      {/* 渲染正文内容 */}

      {normalizedContent && (

        <ReactMarkdown

          remarkPlugins={[remarkGfm, remarkMath]}

          rehypePlugins={[rehypeHighlight, rehypeKatex]}

          components={components}

        >

          {normalizedContent}

        </ReactMarkdown>

      )}

    </div>

  )

})



export default MarkdownRenderer

