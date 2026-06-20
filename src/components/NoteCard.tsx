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
      className="w-full text-left bg-surface/80 border border-cream-300/50 rounded-lg px-3 py-2.5 hover:border-accent-orange/40 hover:bg-cream-100/80 transition-all group"
    >
      <div className="flex items-center gap-2 mb-1">
        <FileText className="w-3.5 h-3.5 text-accent-orange shrink-0" />
        <span className="text-xs font-medium text-warm-700 group-hover:text-accent-orange truncate">
          {note.title}
        </span>
      </div>
      <p className="text-[11px] text-warm-400 leading-relaxed line-clamp-2 pl-5.5">
        {note.excerpt}
      </p>
      {note.tags.length > 0 && (
        <div className="flex items-center gap-1 mt-1.5 pl-5.5">
          <Tag className="w-2.5 h-2.5 text-warm-400" />
          {note.tags.map(tag => (
            <span key={tag} className="text-[9px] px-1 py-0.5 rounded bg-cream-100 text-warm-400">
              {tag}
            </span>
          ))}
        </div>
      )}
    </button>
  )
}
