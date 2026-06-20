import { useState } from 'react'
import { BookOpen, User, Save, Check, X } from 'lucide-react'
import type { AgentMessage } from '../pages/Chat'
import { api } from '../services/api'
import NoteCard from './NoteCard'

interface ChatMessageProps {
  message: AgentMessage
  onNoteClick: (path: string) => void
}

export default function ChatMessage({ message, onNoteClick }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [saveFolder, setSaveFolder] = useState('')
  const [saved, setSaved] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSaveClick = () => {
    // Generate default name from content
    const firstLine = message.content.split('\n')[0].replace(/[#*]/g, '').trim()
    setSaveName(firstLine.substring(0, 40).replace(/[<>:"/\\|?*]/g, '_'))
    setSaveFolder('')
    setShowSaveDialog(true)
  }

  const handleSave = async () => {
    if (!saveName.trim()) return
    setSaving(true)
    try {
      const fileName = saveName.trim()
      const folder = saveFolder.trim()
      const filePath = folder ? `${folder}/${fileName}.md` : `${fileName}.md`

      // Collect tags from cited notes
      const citedTags = new Set<string>()
      if (message.citedNotes) {
        message.citedNotes.forEach(n => n.tags?.forEach(t => citedTags.add(t)))
      }

      const frontmatter: Record<string, unknown> = {
        title: fileName,
        tags: ['ai-generated', ...Array.from(citedTags).slice(0, 5)],
        created: new Date().toISOString().split('T')[0],
        source: 'ai-chat',
      }

      // Build content with cited notes section
      let fullContent = message.content
      if (message.citedNotes && message.citedNotes.length > 0) {
        fullContent += '\n\n---\n## 参考笔记\n'
        message.citedNotes.forEach(n => {
          fullContent += `- [[${n.title}]]\n`
        })
      }

      await api.createFile(filePath, fullContent, frontmatter)
      setSaved(filePath)
      setShowSaveDialog(false)
    } catch (err: any) {
      // If file exists, try with suffix
      try {
        const altPath = saveFolder
          ? `${saveFolder}/${saveName}-${Date.now()}.md`
          : `${saveName}-${Date.now()}.md`
        await api.createFile(altPath, message.content, { tags: ['ai-generated'] })
        setSaved(altPath)
        setShowSaveDialog(false)
      } catch {
        // Silently fail
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
        isUser ? 'bg-cream-300 text-warm-600' : 'bg-gradient-to-br from-accent-orange to-accent-peach text-white'
      }`}>
        {isUser ? <User className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
      </div>

      {/* Message bubble */}
      <div className={`max-w-[75%] ${isUser ? 'text-right' : ''}`}>
        <div className={`inline-block rounded-xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? 'bg-accent-orange/15 text-warm-800 border border-accent-orange/20'
            : 'bg-cream-200/50 text-warm-600 border border-cream-300/50'
        }`}>
          {message.content.split('\n').map((line, i) => (
            <span key={i}>
              {renderInlineMarkdown(line)}
              {i < message.content.split('\n').length - 1 && <br />}
            </span>
          ))}
        </div>

        {/* Cited notes */}
        {message.citedNotes && message.citedNotes.length > 0 && (
          <div className="mt-2 space-y-2">
            {message.citedNotes.map((note, i) => (
              <NoteCard key={i} note={note} onClick={() => onNoteClick(note.path)} />
            ))}
          </div>
        )}

        {/* Save as note button (assistant messages only) */}
        {!isUser && !saved && (
          <button
            onClick={handleSaveClick}
            className="mt-1.5 flex items-center gap-1 text-[10px] text-warm-400 hover:text-accent-orange transition-colors"
          >
            <Save className="w-3 h-3" />
            保存为笔记
          </button>
        )}
        {saved && (
          <div className="mt-1.5 flex items-center gap-1 text-[10px] text-accent-sage">
            <Check className="w-3 h-3" />
            已保存: {saved}
          </div>
        )}

        <div className="text-[10px] text-warm-400 mt-1 px-1">
          {message.timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-warm-900/40 flex items-center justify-center z-50">
          <div className="bg-surface border border-cream-300 rounded-xl p-5 w-80 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-warm-700">保存为笔记</h3>
              <button onClick={() => setShowSaveDialog(false)} className="p-1 rounded hover:bg-cream-100 text-warm-400">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-warm-500 mb-1 block">文件名</label>
                <input type="text" value={saveName} onChange={e => setSaveName(e.target.value)}
                  className="w-full bg-cream-100 border border-cream-300 rounded px-2 py-1.5 text-xs text-warm-700 outline-none focus:border-accent-orange" autoFocus />
              </div>
              <div>
                <label className="text-[10px] text-warm-500 mb-1 block">文件夹 (可选)</label>
                <input type="text" value={saveFolder} onChange={e => setSaveFolder(e.target.value)}
                  placeholder="wiki, notes, etc."
                  className="w-full bg-cream-100 border border-cream-300 rounded px-2 py-1.5 text-xs text-warm-700 outline-none focus:border-accent-orange" />
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => setShowSaveDialog(false)}
                  className="flex-1 px-3 py-1.5 rounded text-xs bg-cream-100 text-warm-600 hover:bg-cream-200">取消</button>
                <button onClick={handleSave} disabled={!saveName.trim() || saving}
                  className="flex-1 px-3 py-1.5 rounded text-xs bg-accent-orange text-white hover:bg-accent-orange/85 disabled:opacity-40">
                  {saving ? '保存中...' : '保存'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function renderInlineMarkdown(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-warm-800 font-semibold">{part.slice(2, -2)}</strong>
    }
    return part
  })
}
