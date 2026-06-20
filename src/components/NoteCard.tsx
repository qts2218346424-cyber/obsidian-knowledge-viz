import { FileText, Tag } from 'lucide-react'
import type { ChatResponse } from '../services/api'

interface NoteCardProps {
  note: ChatResponse['citedNotes'][0]
  onClick: () => void
}

export default function NoteCard({ note, onClick }: NoteCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-slate-900/80 border border-slate-700/50 rounded-lg px-3 py-2.5 hover:border-violet-500/40 hover:bg-slate-800/80 transition-all group"
    >
      <div className="flex items-center gap-2 mb-1">
        <FileText className="w-3.5 h-3.5 text-violet-400 shrink-0" />
        <span className="text-xs font-medium text-slate-200 group-hover:text-violet-300 truncate">
          {note.title}
        </span>
      </div>
      <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2 pl-5.5">
        {note.excerpt}
      </p>
      {note.tags.length > 0 && (
        <div className="flex items-center gap-1 mt-1.5 pl-5.5">
          <Tag className="w-2.5 h-2.5 text-slate-600" />
          {note.tags.map(tag => (
            <span key={tag} className="text-[9px] px-1 py-0.5 rounded bg-slate-800 text-slate-500">
              {tag}
            </span>
          ))}
        </div>
      )}
    </button>
  )
}
