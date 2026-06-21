import fs from 'fs'
import path from 'path'
import {
  renameFile,
  createFile,
  deleteFile,
  type VaultNote,
} from './vault-parser.js'
import {
  addTagToContent,
  parseFrontmatter,
} from './tag-utils.js'

// ===== Interfaces =====

export interface FoldSuggestion {
  type: 'move' | 'merge' | 'tag' | 'link' | 'create'
  description: string
  from?: string
  to?: string
  reason?: string
}

export interface OpResult {
  index: number
  success: boolean
  action: string
  error?: string
}

export interface BatchResult {
  results: OpResult[]
  summary: {
    total: number
    succeeded: number
    failed: number
  }
  backupPath: string
}

// ===== Path Safety =====

/**
 * Validate that a relative path does not escape the vault root.
 * Returns true if the path is safe.
 */
function isPathSafe(relativePath: string | undefined): boolean {
  if (!relativePath) return false
  const normalised = path.normalize(relativePath)
  if (normalised.startsWith('..') || path.isAbsolute(normalised)) return false
  // Check individual segments for traversal
  const segments = normalised.split(path.sep)
  if (segments.includes('..')) return false
  return true
}

// ===== VaultBackup =====

export class VaultBackup {
  readonly backupPath: string
  private vaultPath: string

  constructor(vaultPath: string, backupPath?: string) {
    this.vaultPath = vaultPath
    if (backupPath) {
      this.backupPath = path.isAbsolute(backupPath)
        ? backupPath
        : path.join(vaultPath, backupPath)
    } else {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      this.backupPath = path.join(vaultPath, '.obsidian-viz', 'backups', timestamp)
    }
  }

  /**
   * Copy each listed file (relative to vault) into the backup directory,
   * preserving the relative folder structure.
   */
  snapshot(relativePaths: string[]): void {
    for (const rel of relativePaths) {
      if (!rel) continue
      const src = path.join(this.vaultPath, rel)
      if (!fs.existsSync(src)) continue

      const dest = path.join(this.backupPath, rel)
      fs.mkdirSync(path.dirname(dest), { recursive: true })
      fs.copyFileSync(src, dest)
    }
  }

  /**
   * Restore every file stored in the backup directory back into the vault,
   * overwriting whatever is currently there.
   * Returns the number of files restored.
   */
  restore(): number {
    if (!fs.existsSync(this.backupPath)) return 0

    let count = 0
    const walk = (dir: string): void => {
      const entries = fs.readdirSync(dir, { withFileTypes: true })
      for (const entry of entries) {
        const fullSrc = path.join(dir, entry.name)
        if (entry.isDirectory()) {
          walk(fullSrc)
        } else {
          const rel = path.relative(this.backupPath, fullSrc)
          const dest = path.join(this.vaultPath, rel)
          fs.mkdirSync(path.dirname(dest), { recursive: true })
          fs.copyFileSync(fullSrc, dest)
          count++
        }
      }
    }

    walk(this.backupPath)
    return count
  }
}

// ===== Execute a single suggestion =====

export async function executeSuggestion(
  suggestion: FoldSuggestion,
  vaultPath: string,
): Promise<{ success: boolean; action: string; error?: string }> {
  try {
    // --- Path safety validation ---
    if (suggestion.from && !isPathSafe(suggestion.from)) {
      return { success: false, action: suggestion.type, error: `Unsafe path (from): ${suggestion.from}` }
    }
    if (suggestion.to && !isPathSafe(suggestion.to)) {
      return { success: false, action: suggestion.type, error: `Unsafe path (to): ${suggestion.to}` }
    }

    switch (suggestion.type) {
      // ---- MOVE ----
      case 'move': {
        if (!suggestion.from || !suggestion.to) {
          return { success: false, action: 'move', error: 'move requires both from and to' }
        }
        // Ensure the target directory exists
        const targetDir = path.dirname(path.join(vaultPath, suggestion.to))
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true })
        }
        renameFile(vaultPath, suggestion.from, suggestion.to)
        return { success: true, action: `move: ${suggestion.from} -> ${suggestion.to}` }
      }

      // ---- TAG ----
      case 'tag': {
        if (!suggestion.from) {
          return { success: false, action: 'tag', error: 'tag requires from (file path)' }
        }
        const filePath = path.join(vaultPath, suggestion.from)
        if (!fs.existsSync(filePath)) {
          return { success: false, action: 'tag', error: `File not found: ${suggestion.from}` }
        }
        const content = fs.readFileSync(filePath, 'utf-8')

        // Extract tag name: look for #word in description, otherwise use description itself
        let tagName: string
        const hashMatch = suggestion.description.match(/#([\w\u4e00-\u9fff][\w\u4e00-\u9fff/-]*)/)
        if (hashMatch) {
          tagName = hashMatch[1]
        } else {
          tagName = suggestion.description.trim().replace(/\s+/g, '-')
        }

        const updated = addTagToContent(content, tagName)
        fs.writeFileSync(filePath, updated, 'utf-8')
        return { success: true, action: `tag: added #${tagName} to ${suggestion.from}` }
      }

      // ---- LINK ----
      case 'link': {
        if (!suggestion.from || !suggestion.to) {
          return { success: false, action: 'link', error: 'link requires both from and to' }
        }
        const filePath = path.join(vaultPath, suggestion.from)
        if (!fs.existsSync(filePath)) {
          return { success: false, action: 'link', error: `File not found: ${suggestion.from}` }
        }
        const content = fs.readFileSync(filePath, 'utf-8')
        const targetName = suggestion.to.replace(/\.md$/, '')
        const updated = content + `\n\n[[${targetName}]]`
        fs.writeFileSync(filePath, updated, 'utf-8')
        return { success: true, action: `link: appended [[${targetName}]] to ${suggestion.from}` }
      }

      // ---- CREATE ----
      case 'create': {
        const targetPath = suggestion.to || suggestion.from
        if (!targetPath) {
          return { success: false, action: 'create', error: 'create requires to or from' }
        }
        createFile(
          vaultPath,
          targetPath,
          suggestion.description || '',
          { title: suggestion.description || 'New Note', tags: ['auto-created'] },
        )
        return { success: true, action: `create: ${targetPath}` }
      }

      // ---- MERGE ----
      case 'merge': {
        if (!suggestion.from || !suggestion.to) {
          return { success: false, action: 'merge', error: 'merge requires both from and to' }
        }
        const fromPath = path.join(vaultPath, suggestion.from)
        const toPath = path.join(vaultPath, suggestion.to)
        if (!fs.existsSync(fromPath)) {
          return { success: false, action: 'merge', error: `Source file not found: ${suggestion.from}` }
        }
        if (!fs.existsSync(toPath)) {
          return { success: false, action: 'merge', error: `Target file not found: ${suggestion.to}` }
        }

        const fromContent = fs.readFileSync(fromPath, 'utf-8')
        const toContent = fs.readFileSync(toPath, 'utf-8')

        // Split both files into paragraphs and append unique ones from source to target
        const fromParagraphs = fromContent.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
        const toParagraphs = new Set(
          toContent.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean),
        )

        const uniqueParagraphs = fromParagraphs.filter((p) => !toParagraphs.has(p))
        let mergedContent = toContent
        if (uniqueParagraphs.length > 0) {
          mergedContent += '\n\n' + uniqueParagraphs.join('\n\n')
        }

        fs.writeFileSync(toPath, mergedContent, 'utf-8')

        // Delete the source file after merging
        await deleteFile(vaultPath, suggestion.from)

        return {
          success: true,
          action: `merge: ${suggestion.from} into ${suggestion.to} (${uniqueParagraphs.length} unique paragraphs appended)`,
        }
      }

      default:
        return { success: false, action: suggestion.type, error: `Unknown suggestion type: ${suggestion.type}` }
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return { success: false, action: suggestion.type, error: message }
  }
}

// ===== Batch execution with backup =====

export async function executeSuggestionsBatch(
  suggestions: FoldSuggestion[],
  vaultPath: string,
): Promise<BatchResult> {
  const backup = new VaultBackup(vaultPath)

  // Collect all affected file paths for snapshot
  const affectedPaths = new Set<string>()
  for (const s of suggestions) {
    if (s.from) affectedPaths.add(s.from)
    if (s.to) affectedPaths.add(s.to)
  }
  backup.snapshot([...affectedPaths])

  const results: OpResult[] = []
  for (let i = 0; i < suggestions.length; i++) {
    const outcome = await executeSuggestion(suggestions[i], vaultPath)
    results.push({
      index: i,
      success: outcome.success,
      action: outcome.action,
      error: outcome.error,
    })
  }

  const succeeded = results.filter((r) => r.success).length
  return {
    results,
    summary: {
      total: results.length,
      succeeded,
      failed: results.length - succeeded,
    },
    backupPath: backup.backupPath,
  }
}

// ===== Rollback =====

export async function rollback(
  vaultPath: string,
  backupRelPath: string,
): Promise<{ success: boolean; filesRestored: number }> {
  try {
    const backup = new VaultBackup(vaultPath, backupRelPath)

    if (!fs.existsSync(backup.backupPath)) {
      return { success: false, filesRestored: 0 }
    }

    const filesRestored = backup.restore()
    return { success: true, filesRestored }
  } catch (err: unknown) {
    return { success: false, filesRestored: 0 }
  }
}
