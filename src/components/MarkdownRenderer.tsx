import { memo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeHighlight from 'rehype-highlight'
import rehypeKatex from 'rehype-katex'

interface MarkdownRendererProps {
  content: string
  className?: string
  inline?: boolean
}

/**
 * 统一 Markdown 与 KaTeX 数学公式渲染组件
 * 支持：
 * - GFM (GitHub Flavored Markdown: 表格、任务列表、删除线等)
 * - KaTeX (行内 $...$ 与 块级 $$...$$ 数学公式)
 * - 代码语法高亮 (Highlight.js)
 */
export const MarkdownRenderer = memo(function MarkdownRenderer({
  content,
  className = '',
  inline = false,
}: MarkdownRendererProps) {
  if (!content) return null

  return (
    <div className={`prose-math ${inline ? 'inline-block [&>p]:inline [&>p]:m-0' : ''} ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeHighlight, rehypeKatex]}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
})

export default MarkdownRenderer
