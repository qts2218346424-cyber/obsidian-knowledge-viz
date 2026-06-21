import { useState, useRef } from 'react'
import { Upload, FileText, Loader2, Check, AlertCircle, ChevronDown, ChevronRight, X, ClipboardPaste } from 'lucide-react'
import WarmButton from '../ui/WarmButton'
import { api, type VocabImportResult } from '../../services/api'

type Format = 'csv' | 'json'

interface ParsedEntry {
  word: string
  phonetic: string
  definition: string
}

const CSV_PLACEHOLDER = 'word,phonetic,definition,example,exampleCn,frequency\napple,/\u02c8\u00e6p.\u0259l/,\u82f9\u679c,I eat an apple.,\u6211\u5403\u4e00\u4e2a\u82f9\u679c.,\u9ad8\u9891'
const JSON_PLACEHOLDER = '[{ "word": "apple", "phonetic": "/\u02c8\u00e6p.\u0259l/", "definition": "\u82f9\u679c", "example": "I eat an apple.", "exampleCn": "\u6211\u5403\u4e00\u4e2a\u82f9\u679c.", "frequency": "\u9ad8\u9891" }]'

function parsePreview(format: Format, data: string): ParsedEntry[] {
  try {
    if (format === 'json') {
      const arr = JSON.parse(data)
      if (!Array.isArray(arr)) return []
      return arr.slice(0, 10).map((r: Record<string, string>) => ({
        word: r.word || '',
        phonetic: r.phonetic || '',
        definition: r.definition || '',
      }))
    }
    const lines = data.split('\n').filter(l => l.trim())
    const start = lines[0]?.startsWith('word') ? 1 : 0
    return lines.slice(start, start + 10).map(line => {
      const cols = line.split(',').map(s => s.trim())
      return { word: cols[0] || '', phonetic: cols[1] || '', definition: cols[2] || '' }
    })
  } catch {
    return []
  }
}

function countEntries(format: Format, data: string): number {
  try {
    if (format === 'json') {
      const arr = JSON.parse(data)
      return Array.isArray(arr) ? arr.length : 0
    }
    const lines = data.split('\n').filter(l => l.trim())
    const start = lines[0]?.startsWith('word') ? 1 : 0
    return lines.length - start
  } catch {
    return 0
  }
}

export default function ImportPanel() {
  const [format, setFormat] = useState<Format>('csv')
  const [rawData, setRawData] = useState('')
  const [fileName, setFileName] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<VocabImportResult | null>(null)
  const [error, setError] = useState('')
  const [guideOpen, setGuideOpen] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const total = countEntries(format, rawData)
  const preview = parsePreview(format, rawData)

  const handleFile = (file: File) => {
    setError('')
    setResult(null)
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') setRawData(reader.result)
    }
    reader.onerror = () => setError('文件读取失败')
    reader.readAsText(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleImport = async () => {
    if (!rawData.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await api.importVocab(format, rawData)
      setResult(res)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '导入失败')
    } finally {
      setLoading(false)
    }
  }

  const clearData = () => {
    setRawData('')
    setFileName('')
    setResult(null)
    setError('')
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="space-y-4">
      {/* Format selector */}
      <div className="flex items-center gap-1 bg-cream-100 rounded-lg p-1 w-fit">
        {(['csv', 'json'] as const).map(f => (
          <button
            key={f}
            onClick={() => { setFormat(f); setResult(null) }}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
              format === f ? 'bg-white text-warm-700 shadow-sm' : 'text-warm-400 hover:text-warm-600'
            }`}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Drop zone */}
      <div
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed border-cream-300 rounded-2xl p-8 flex flex-col items-center gap-3 cursor-pointer hover:border-accent-orange/50 transition-colors"
      >
        <Upload className="w-8 h-8 text-warm-300" />
        <p className="text-sm text-warm-500">
          {fileName ? (
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              {fileName}
              <X className="w-3.5 h-3.5 text-warm-400 hover:text-warm-700" onClick={e => { e.stopPropagation(); clearData() }} />
            </span>
          ) : (
            '拖拽文件到此处，或点击选择文件'
          )}
        </p>
        <p className="text-xs text-warm-400">支持 .csv、json 格式</p>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.json"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
        />
      </div>

      {/* Manual input */}
      <div className="relative">
        <div className="flex items-center gap-2 mb-2">
          <ClipboardPaste className="w-4 h-4 text-warm-400" />
          <span className="text-xs text-warm-500">或直接粘贴内容</span>
        </div>
        <textarea
          value={rawData}
          onChange={e => { setRawData(e.target.value); setFileName(''); setResult(null) }}
          placeholder={format === 'csv' ? CSV_PLACEHOLDER : JSON_PLACEHOLDER}
          rows={5}
          className="w-full bg-surface border border-cream-200 rounded-lg p-3 text-xs text-warm-700 placeholder-warm-400 outline-none focus:border-accent-orange resize-y"
        />
      </div>

      {/* Preview */}
      {preview.length > 0 && (
        <div className="bg-surface border border-cream-200 rounded-2xl p-4 space-y-3">
          <p className="text-xs text-warm-500">共 <span className="font-semibold text-warm-700">{total}</span> 条数据</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-cream-200 text-warm-400">
                  <th className="py-2 text-left font-medium">单词</th>
                  <th className="py-2 text-left font-medium">音标</th>
                  <th className="py-2 text-left font-medium">释义</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i} className="border-b border-cream-100 last:border-0">
                    <td className="py-2 pr-4 text-warm-700 font-medium whitespace-nowrap">{row.word}</td>
                    <td className="py-2 pr-4 text-warm-400 whitespace-nowrap">{row.phonetic || '-'}</td>
                    <td className="py-2 text-warm-500">{row.definition}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {total > 10 && <p className="text-xs text-warm-400">仅显示前 10 条</p>}
        </div>
      )}

      {/* Import button */}
      <WarmButton
        onClick={handleImport}
        disabled={!rawData.trim() || loading}
        size="lg"
        className="w-full flex items-center justify-center gap-2"
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin" />导入中...</>
        ) : (
          <>导入 {total > 0 ? `${total} 个新词` : ''}</>
        )}
      </WarmButton>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-xs text-red-500 bg-red-50 rounded-lg p-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="bg-surface border border-cream-200 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-sm font-medium text-warm-700">导入完成</span>
          </div>
          <div className="flex gap-6 text-xs text-warm-500">
            <span>成功导入: <span className="font-semibold text-green-600">{result.imported}</span></span>
            <span>跳过(重复): <span className="font-semibold text-warm-400">{result.skipped}</span></span>
          </div>
          {result.errors.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-red-500 font-medium">错误 ({result.errors.length})</p>
              {result.errors.slice(0, 10).map((e, i) => (
                <p key={i} className="text-xs text-red-400">{e}</p>
              ))}
            </div>
          )}
          <p className="text-xs text-warm-400 pt-1 border-t border-cream-100">
            当前词库总数: <span className="font-semibold text-warm-700">{result.total}</span>
          </p>
        </div>
      )}

      {/* Format guide */}
      <div className="bg-surface border border-cream-200 rounded-2xl overflow-hidden">
        <button
          onClick={() => setGuideOpen(!guideOpen)}
          className="w-full flex items-center gap-2 p-4 text-xs text-warm-500 hover:text-warm-700 transition-colors"
        >
          {guideOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          格式说明
        </button>
        {guideOpen && (
          <div className="px-4 pb-4 space-y-4 text-xs text-warm-500">
            <div>
              <p className="font-medium text-warm-700 mb-1">CSV 格式</p>
              <code className="block bg-cream-100 rounded-lg p-3 text-warm-600 whitespace-pre">
{`word,phonetic,definition,example,exampleCn,frequency
apple,/\u02c8\u00e6p.\u0259l/,\u82f9\u679c,I eat an apple.,\u6211\u5403\u4e00\u4e2a\u82f9\u679c.,\u9ad8\u9891`}
              </code>
            </div>
            <div>
              <p className="font-medium text-warm-700 mb-1">JSON 格式</p>
              <code className="block bg-cream-100 rounded-lg p-3 text-warm-600 whitespace-pre">
{`[{ "word": "apple", "definition": "\u82f9\u679c", "phonetic": "/\u02c8\u00e6p.\u0259l/", "example": "I eat an apple.", "exampleCn": "\u6211\u5403\u4e00\u4e2a\u82f9\u679c.", "frequency": "\u9ad8\u9891" }]`}
              </code>
            </div>
            <div>
              <p className="font-medium text-warm-700 mb-1">字段说明</p>
              <ul className="space-y-1 ml-3 list-disc">
                <li><span className="text-warm-700">word</span> — 必填，单词</li>
                <li><span className="text-warm-700">phonetic</span> — 音标</li>
                <li><span className="text-warm-700">definition</span> — 必填，释义</li>
                <li><span className="text-warm-700">example</span> — 英文例句</li>
                <li><span className="text-warm-700">exampleCn</span> — 例句中文翻译</li>
                <li><span className="text-warm-700">frequency</span> — 高频 / 中频 / 低频</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
