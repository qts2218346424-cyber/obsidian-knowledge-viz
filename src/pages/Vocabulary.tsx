import VocabTab from '../components/study/VocabTab'

export default function Vocabulary() {
  return (
    <div className="max-w-3xl mx-auto animate-fade-in-up">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-warm-800">📖 考研英语单词</h1>
          <p className="text-sm text-warm-500 mt-1">语境记忆 · 间隔重复 · 考研核心词库</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-warm-400">
          <span className="px-2 py-1 rounded-full bg-cream-200">考研 5500 词</span>
        </div>
      </div>
      <VocabTab />
    </div>
  )
}
