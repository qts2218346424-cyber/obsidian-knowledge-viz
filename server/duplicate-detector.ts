import fs from 'fs'
import path from 'path'
import { renameFile, deleteFile } from './vault-parser.js'
import { parseFrontmatter } from './tag-utils.js'

// ===== Interfaces =====

export interface DuplicatePair {
  fileA: string
  fileB: string
  similarity: number
  matchType: 'prefix' | 'jaccard' | 'title'
  longerFile: string
  shorterFile: string
}

export interface MergeResult {
  keepFile: string
  mergedFile: string
  success: boolean
  appendedChars: number
  error?: string
}

// ===== Constants =====

const STOPWORDS = new Set([
  'the', 'a', 'is', 'and', 'of', 'to', 'in', 'for',
])

// ===== Helper functions (not exported) =====

/**
 * Tokenize content into a set of lowercase words, filtering out stopwords.
 * Splits on whitespace and punctuation.
 */
function tokenize(content: string): Set<string> {
  const tokens = content
    .toLowerCase()
    .split(/[\s\p{P}]+/u)
    .filter((w) => w.length > 0 && !STOPWORDS.has(w))
  return new Set(tokens)
}

/**
 * Compute Jaccard similarity between two token sets: |A intersection B| / |A union B|.
 */
function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0

  let intersection = 0
  for (const token of a) {
    if (b.has(token)) intersection++
  }

  const union = a.size + b.size - intersection
  if (union === 0) return 0
  return intersection / union
}

/**
 * Compute character overlap ratio between two filenames (without extension).
 * Uses bigram-style character overlap for a simple similarity metric.
 */
function titleSimilarity(a: string, b: string): number {
  if (a.length === 0 && b.length === 0) return 0
  if (a.length === 0 || b.length === 0) return 0

  const aLower = a.toLowerCase()
  const bLower = b.toLowerCase()

  // Build character frequency maps
  const freqA = new Map<string, number>()
  const freqB = new Map<string, number>()

  for (const ch of aLower) {
    freqA.set(ch, (freqA.get(ch) || 0) + 1)
  }
  for (const ch of bLower) {
    freqB.set(ch, (freqB.get(ch) || 0) + 1)
  }

  // Compute overlap: sum of min counts for shared characters
  let overlap = 0
  for (const [ch, countA] of freqA) {
    const countB = freqB.get(ch)
    if (countB !== undefined) {
      overlap += Math.min(countA, countB)
    }
  }

  const total = Math.max(aLower.length, bLower.length)
  return overlap / total
}

/**
 * Recursively walk a directory for .md files, skipping hidden dirs (starting with '.').
 */
function walkDir(dir: string): string[] {
  const results: string[] = []
  let entries: fs.Dirent[]
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true })
  } catch {
    return results
  }

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue

    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...walkDir(fullPath))
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      results.push(fullPath)
    }
  }

  return results
}

/**
 * Escape special regex characters in a string.
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Update all [[fromFile]] wikilinks across the vault to point to [[toFile]].
 * Returns the number of files that were updated.
 */
function updateLinksForMerge(vaultPath: string, fromFile: string, toFile: string): number {
  const fromName = path.basename(fromFile, '.md')
  const toName = path.basename(toFile, '.md')
  if (fromName === toName) return 0

  const allFiles = walkDir(vaultPath)
  let updatedCount = 0

  // Pattern for [[fromName|alias]] or [[fromName#heading]] etc.
  const linkPattern = new RegExp(`\\[\\[${escapeRegex(fromName)}([\\]|#])`, 'g')
  // Pattern for exact [[fromName]]
  const linkPatternExact = new RegExp(`\\[\\[${escapeRegex(fromName)}\\]\\]`, 'g')

  for (const filePath of allFiles) {
    try {
      const raw = fs.readFileSync(filePath, 'utf-8')
      let updated = raw

      if (linkPattern.test(updated)) {
        updated = updated.replace(linkPattern, `[[${toName}$1`)
      }
      if (linkPatternExact.test(updated)) {
        updated = updated.replace(linkPatternExact, `[[${toName}]]`)
      }

      if (updated !== raw) {
        fs.writeFileSync(filePath, updated, 'utf-8')
        updatedCount++
      }
    } catch {
      // Skip unreadable files
    }
  }

  return updatedCount
}

// ===== Exported functions =====

/**
 * Detect duplicate notes in a vault using multi-signal similarity analysis.
 *
 * Signals:
 *  - Prefix match: first 200 chars (trimmed, lowercased) identical => score 1.0
 *  - Jaccard similarity: token overlap ratio (weighted 0.8)
 *  - Title similarity: character overlap of filenames (weighted 0.2)
 *
 * Combined score = max(prefixScore, jaccardScore * 0.8 + titleScore * 0.2)
 * Pairs with score > 0.6 are returned, sorted descending, max 50.
 */
export function detectDuplicates(vaultPath: string): DuplicatePair[] {
  const files = walkDir(vaultPath)

  // Read all file contents and compute relative paths
  const fileData: { absPath: string; relPath: string; content: string; tokens: Set<string>; title: string }[] = []

  for (const absPath of files) {
    try {
      const content = fs.readFileSync(absPath, 'utf-8')
      const relPath = path.relative(vaultPath, absPath).replace(/\\/g, '/')
      const tokens = tokenize(content)
      const title = path.basename(absPath, '.md')
      fileData.push({ absPath, relPath, content, tokens, title })
    } catch {
      // Skip unreadable files
    }
  }

  const pairs: DuplicatePair[] = []

  for (let i = 0; i < fileData.length; i++) {
    for (let j = i + 1; j < fileData.length; j++) {
      const a = fileData[i]
      const b = fileData[j]

      // Prefix match: compare first 200 chars, trimmed and lowercased
      const prefixA = a.content.slice(0, 200).trim().toLowerCase()
      const prefixB = b.content.slice(0, 200).trim().toLowerCase()
      let prefixScore = 0
      if (prefixA === prefixB && prefixA.length >= 20) {
        prefixScore = 1.0
      }

      // Jaccard similarity on tokenized content
      const jScore = jaccardSimilarity(a.tokens, b.tokens)

      // Title similarity on filenames
      const tScore = titleSimilarity(a.title, b.title)

      // Combined score
      const combined = Math.max(prefixScore, jScore * 0.8 + tScore * 0.2)

      if (combined > 0.6) {
        // Determine match type based on which signal contributed most
        let matchType: 'prefix' | 'jaccard' | 'title'
        if (prefixScore >= jScore * 0.8 + tScore * 0.2) {
          matchType = 'prefix'
        } else if (jScore >= tScore) {
          matchType = 'jaccard'
        } else {
          matchType = 'title'
        }

        const longerFile = a.content.length >= b.content.length ? a.relPath : b.relPath
        const shorterFile = a.content.length >= b.content.length ? b.relPath : a.relPath

        pairs.push({
          fileA: a.relPath,
          fileB: b.relPath,
          similarity: Math.round(combined * 1000) / 1000,
          matchType,
          longerFile,
          shorterFile,
        })
      }
    }
  }

  // Sort by similarity descending
  pairs.sort((a, b) => b.similarity - a.similarity)

  // Limit to 50 pairs
  return pairs.slice(0, 50)
}

/**
 * Merge two duplicate notes: append unique paragraphs from mergeFile into keepFile,
 * update wikilinks across the vault, and delete the merged file.
 *
 * @param keepFile  - Relative path of the file to keep (destination)
 * @param mergeFile - Relative path of the file to merge in and delete
 * @param vaultPath - Absolute path to the vault root
 * @param mode      - 'auto' uses paragraph-level Jaccard dedup; 'ai' is reserved for future AI integration
 */
export async function mergeNotes(
  keepFile: string,
  mergeFile: string,
  vaultPath: string,
  mode: 'auto' | 'ai',
): Promise<MergeResult> {
  try {
    const keepFullPath = path.resolve(vaultPath, keepFile)
    const mergeFullPath = path.resolve(vaultPath, mergeFile)

    // Validate paths are inside vault
    const resolvedVault = path.resolve(vaultPath)
    if (!keepFullPath.startsWith(resolvedVault) || !mergeFullPath.startsWith(resolvedVault)) {
      return {
        keepFile,
        mergedFile: mergeFile,
        success: false,
        appendedChars: 0,
        error: 'Path traversal detected: files must be inside vault',
      }
    }

    // Read both files
    if (!fs.existsSync(keepFullPath)) {
      return {
        keepFile,
        mergedFile: mergeFile,
        success: false,
        appendedChars: 0,
        error: `Keep file not found: ${keepFile}`,
      }
    }
    if (!fs.existsSync(mergeFullPath)) {
      return {
        keepFile,
        mergedFile: mergeFile,
        success: false,
        appendedChars: 0,
        error: `Merge file not found: ${mergeFile}`,
      }
    }

    const keepContent = fs.readFileSync(keepFullPath, 'utf-8')
    const mergeContent = fs.readFileSync(mergeFullPath, 'utf-8')

    // Parse frontmatter so we work with body content only
    const { body: keepBody } = parseFrontmatter(keepContent)
    const { body: mergeBody } = parseFrontmatter(mergeContent)

    // Auto mode (and AI mode fallback): paragraph-level dedup merge
    const keepParagraphs = keepBody.split('\n\n').filter((p) => p.trim().length > 0)
    const mergeParagraphs = mergeBody.split('\n\n').filter((p) => p.trim().length > 0)

    // Pre-compute token sets for keep paragraphs
    const keepTokenSets = keepParagraphs.map((p) => tokenize(p))

    let appendedContent = ''
    for (const paragraph of mergeParagraphs) {
      const mergeTokens = tokenize(paragraph)
      let isDuplicate = false

      for (const keepTokens of keepTokenSets) {
        if (jaccardSimilarity(mergeTokens, keepTokens) >= 0.7) {
          isDuplicate = true
          break
        }
      }

      if (!isDuplicate) {
        appendedContent += (appendedContent ? '\n\n' : '') + paragraph
      }
    }

    // Write updated keepFile with appended content
    let updatedContent = keepContent
    if (appendedContent.length > 0) {
      // Append after the existing content
      updatedContent = keepContent.trimEnd() + '\n\n' + appendedContent
      fs.writeFileSync(keepFullPath, updatedContent, 'utf-8')
    }

    // Update all [[mergeFile]] wikilinks to [[keepFile]] across the vault
    updateLinksForMerge(vaultPath, mergeFile, keepFile)

    // Delete the merged file
    await deleteFile(vaultPath, mergeFile)

    return {
      keepFile,
      mergedFile: mergeFile,
      success: true,
      appendedChars: appendedContent.length,
    }
  } catch (err) {
    return {
      keepFile,
      mergedFile: mergeFile,
      success: false,
      appendedChars: 0,
      error: err instanceof Error ? err.message : String(err),
    }
  }
}
