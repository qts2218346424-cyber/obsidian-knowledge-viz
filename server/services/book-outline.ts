/**
 * 书籍章节目录解析与 Python 正文/习题提取脚本调用。
 */
import fs from 'fs'
import path from 'path'
import { execFile } from 'child_process'
import { promisify } from 'util'
import { __dirname } from '../context.js'

const execFileAsync = promisify(execFile)

export interface BookChapter {
  id: string
  title: string
  rawContent: string
  subSections: string[]
}

export function parseOutlineIntoChapters(outline: string): BookChapter[] {
  const lines = outline.split('\n')
  const chapters: BookChapter[] = []
  let currentChapter: BookChapter | null = null

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('## ')) {
      const title = trimmed.replace(/^##\s+/, '').trim()
      if (['前言', '前 言', '致读者', '致 读 者', '说明', '参考文献', '致谢', '附录'].includes(title)) {
        continue
      }
      currentChapter = {
        id: `ch-${chapters.length + 1}`,
        title,
        subSections: [],
        rawContent: trimmed
      }
      chapters.push(currentChapter)
    } else if (currentChapter) {
      currentChapter.rawContent += '\n' + line
      if (trimmed.startsWith('### ') || trimmed.startsWith('- ')) {
        const sub = trimmed.replace(/^(###|-)\s+/, '').trim()
        if (sub && !sub.includes('本节习题') && !sub.includes('答案与解析')) {
          currentChapter.subSections.push(sub)
        }
      }
    }
  }

  // 若 ## 二级标题较少（<=3个，如仅为学科总名“线性代数”、“概率论”），但存在多个 ### 三级章节（如 ###第十章行列式...），智能提升为章节
  const h3ChapterLines = lines.filter(l => {
    const t = l.trim()
    return t.startsWith('### ') && (t.includes('章') || t.includes('讲') || t.includes('模块') || /第[0-9一二三四五六七八九十]+/.test(t))
  })
  if ((chapters.length <= 1 || (chapters.length <= 3 && h3ChapterLines.length >= 3))) {
    const subChapters: BookChapter[] = []
    let currentSubCh: BookChapter | null = null
    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.startsWith('### ')) {
        const title = trimmed.replace(/^###\s+/, '').trim()
        if (['前言', '前 言', '致读者', '致 读 者', '说明', '参考文献', '致谢', '附录'].includes(title)) {
          continue
        }
        currentSubCh = {
          id: `ch-${subChapters.length + 1}`,
          title,
          subSections: [],
          rawContent: trimmed
        }
        subChapters.push(currentSubCh)
      } else if (currentSubCh) {
        currentSubCh.rawContent += '\n' + line
        if (trimmed.startsWith('- ') || trimmed.startsWith('#### ')) {
          const sub = trimmed.replace(/^(-|####)\s+/, '').trim()
          if (sub && !sub.includes('本节习题') && !sub.includes('答案与解析')) {
            currentSubCh.subSections.push(sub)
          }
        }
      }
    }
    if (subChapters.length > 1) {
      return subChapters
    }
  }

  return chapters
}

/**
 * 健壮解析资料文件的绝对路径，支持 raw-sources 与 06-原始资料库 互备
 */
export function resolveMaterialFullPath(vaultPath: string, relPath: string): string | null {
  if (!relPath) return null
  let fullPath = path.resolve(vaultPath, relPath)
  if (fs.existsSync(fullPath)) return fullPath

  const rawSourcesDir = path.resolve(vaultPath, 'raw-sources')
  const inRaw = path.resolve(rawSourcesDir, relPath)
  if (fs.existsSync(inRaw)) return inRaw

  if (relPath.includes('raw-sources')) {
    const alt = path.resolve(vaultPath, relPath.replace('raw-sources', '06-原始资料库'))
    if (fs.existsSync(alt)) return alt
  } else if (relPath.includes('06-原始资料库')) {
    const alt = path.resolve(vaultPath, relPath.replace('06-原始资料库', 'raw-sources'))
    if (fs.existsSync(alt)) return alt
  }

  const baseName = path.basename(relPath)
  const candidates = [
    path.resolve(vaultPath, 'raw-sources', '408计算机', '经典教材', baseName),
    path.resolve(vaultPath, '06-原始资料库', '408计算机', '经典教材', baseName),
    path.resolve(vaultPath, 'raw-sources', '数学', '考研题集', baseName),
    path.resolve(vaultPath, '06-原始资料库', '数学', '考研题集', baseName)
  ]
  for (const c of candidates) {
    if (fs.existsSync(c)) return c
  }

  return fullPath
}

/**
 * 调用 Python 真实书本正文与习题深度提取引擎
 */
export async function runBookContentExtractor(fullPath: string, action: 'outline' | 'extract_chapter', chapterId?: string): Promise<any> {
  const possibleScriptPaths = [
    path.resolve(process.cwd(), 'server', 'scripts', 'extract_book_content_and_exercises.py'),
    path.resolve(__dirname, 'scripts', 'extract_book_content_and_exercises.py'),
    path.resolve(__dirname, '..', 'server', 'scripts', 'extract_book_content_and_exercises.py'),
    path.resolve(__dirname, '..', 'scripts', 'extract_book_content_and_exercises.py'),
  ]
  const scriptPath = possibleScriptPaths.find(p => fs.existsSync(p))
  if (!scriptPath) {
    console.warn('Script not found in candidate paths:', possibleScriptPaths)
    return null
  }
  const args = [scriptPath, fullPath, action]
  if (chapterId) args.push(chapterId)

  try {
    const { stdout } = await execFileAsync('python', args, {
      timeout: 90000,
      maxBuffer: 30 * 1024 * 1024
    })
    return JSON.parse(stdout)
  } catch (err: any) {
    console.warn(`runBookContentExtractor error (${action}):`, err.message)
    return null
  }
}

