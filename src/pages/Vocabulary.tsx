import VocabTab from '../components/study/VocabTab'

export default function Vocabulary() {
  return (
    <div className="max-w-3xl mx-auto animate-fade-in-up">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-warm-800">📖 考研英语单词</h1>
        <p className="text-sm text-warm-500 mt-1">每日背词 · 间隔重复 · 考研核心词库</p>
      </div>
      <VocabTab />
    </div>
  )
}
