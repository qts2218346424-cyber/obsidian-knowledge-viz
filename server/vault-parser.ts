import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export interface VaultNote {
  path: string
  title: string
  frontmatter: Record<string, any>
  content: string
  links: string[]
  tags: string[]
  modified: Date
  wordCount: number
}

/**
 * Extract [[wikilinks]] from markdown content.
 * Handles formats: [[note]], [[note|alias]], [[note#heading]], [[note#^block]]
 */
function extractLinks(content: string): string[] {
  const linkRegex = /\[\[([^\]|#]+?)(?:#[^\]|]*)?(?:\|[^\]]+?)?\]\]/g
  const links: string[] = []
  let match: RegExpExecArray | null
  while ((match = linkRegex.exec(content)) !== null) {
    links.push(match[1].trim())
  }
  return [...new Set(links)]
}

/**
 * Extract #tags and nested #parent/child tags from content.
 * Also extracts tags from frontmatter.
 */
function extractTags(content: string, frontmatter: Record<string, any>): string[] {
  const tagRegex = /(?:^|\s)#([a-zA-Z\u4e00-\u9fff][\w\u4e00-\u9fff/-]*)/g
  const tags: string[] = []
  let match: RegExpExecArray | null
  while ((match = tagRegex.exec(content)) !== null) {
    tags.push(match[1].trim())
  }

  // Also get tags from frontmatter
  if (frontmatter.tags) {
    const rawTags = Array.isArray(frontmatter.tags)
      ? frontmatter.tags
      : String(frontmatter.tags).split(',').map((t: string) => t.trim())
    const fmTags = rawTags.map((t: unknown) => String(t).trim()).filter((t: string) => t.length > 0)
    tags.push(...fmTags)
  }

  return [...new Set(tags)]
}

/**
 * Parse a single markdown file into a VaultNote.
 */
function parseFile(filePath: string, vaultPath: string): VaultNote | null {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8')
    const { data: frontmatter, content } = matter(raw)
    const relativePath = path.relative(vaultPath, filePath).replace(/\\/g, '/')
    const title = frontmatter.title || path.basename(filePath, '.md')
    const stat = fs.statSync(filePath)

    return {
      path: relativePath,
      title,
      frontmatter,
      content,
      links: extractLinks(content),
      tags: extractTags(content, frontmatter),
      modified: stat.mtime,
      wordCount: content.split(/\s+/).filter(Boolean).length,
    }
  } catch {
    return null
  }
}

/**
 * Recursively scan a vault directory for all .md files.
 */
export function walkDir(dir: string): string[] {
  const results: string[] = []
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        // Skip .obsidian and other hidden dirs
        if (!entry.name.startsWith('.')) {
          results.push(...walkDir(fullPath))
        }
      } else if (entry.name.endsWith('.md')) {
        results.push(fullPath)
      }
    }
  } catch {
    // Directory not accessible
  }
  return results
}

/**
 * Scan the entire vault and return parsed notes.
 */
export function scanVault(vaultPath: string): VaultNote[] {
  if (!fs.existsSync(vaultPath)) {
    console.warn(`Vault path does not exist: ${vaultPath}`)
    return []
  }

  const files = walkDir(vaultPath)
  const notes: VaultNote[] = []

  for (const filePath of files) {
    const note = parseFile(filePath, vaultPath)
    if (note) {
      notes.push(note)
    }
  }

  console.log(`Scanned ${notes.length} notes from ${vaultPath}`)
  return notes
}

/**
 * Get a single file's content by relative path.
 */
export function getFile(vaultPath: string, relativePath: string): VaultNote | null {
  const fullPath = path.resolve(vaultPath, relativePath)
  if (!fullPath.startsWith(path.resolve(vaultPath))) {
    return null // Prevent path traversal
  }
  return parseFile(fullPath, vaultPath)
}

/**
 * Get the directory tree structure of the vault.
 */
export interface TreeNode {
  name: string
  path: string
  type: 'folder' | 'file'
  children?: TreeNode[]
}

export function getTree(vaultPath: string): TreeNode[] {
  function buildTree(dir: string, basePath: string): TreeNode[] {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    const nodes: TreeNode[] = []

    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue

      const fullPath = path.join(dir, entry.name)
      const relPath = path.relative(basePath, fullPath).replace(/\\/g, '/')

      if (entry.isDirectory()) {
        nodes.push({
          name: entry.name,
          path: relPath,
          type: 'folder',
          children: buildTree(fullPath, basePath),
        })
      } else if (entry.name.endsWith('.md')) {
        nodes.push({
          name: entry.name.replace('.md', ''),
          path: relPath,
          type: 'file',
        })
      }
    }

    // Sort: folders first, then alphabetical
    nodes.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1
      return a.name.localeCompare(b.name)
    })

    return nodes
  }

  try {
    return buildTree(vaultPath, vaultPath)
  } catch {
    return []
  }
}

// ===== Write Operations =====

function ensureInsideVault(vaultPath: string, relativePath: string): string {
  const fullPath = path.resolve(vaultPath, relativePath)
  if (!fullPath.startsWith(path.resolve(vaultPath))) {
    throw new Error('Path traversal detected: file must be inside vault')
  }
  return fullPath
}

function buildFileContent(content: string, frontmatter?: Record<string, any>): string {
  if (!frontmatter || Object.keys(frontmatter).length === 0) return content
  return matter.stringify(content, frontmatter)
}

/**
 * Create a new markdown file in the vault.
 */
export function createFile(
  vaultPath: string,
  relativePath: string,
  content: string,
  frontmatter?: Record<string, any>,
): VaultNote {
  const fullPath = ensureInsideVault(vaultPath, relativePath)
  if (fs.existsSync(fullPath)) {
    throw new Error(`File already exists: ${relativePath}`)
  }

  // Ensure parent directory exists
  const dir = path.dirname(fullPath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  const fileContent = buildFileContent(content, frontmatter)
  fs.writeFileSync(fullPath, fileContent, 'utf-8')

  const note = parseFile(fullPath, vaultPath)
  if (!note) throw new Error('Failed to parse created file')
  return note
}

/**
 * Update an existing markdown file.
 */
export function updateFile(
  vaultPath: string,
  relativePath: string,
  content: string,
  frontmatter?: Record<string, any>,
): VaultNote {
  const fullPath = ensureInsideVault(vaultPath, relativePath)
  if (!fs.existsSync(fullPath)) {
    throw new Error(`File not found: ${relativePath}`)
  }

  const fileContent = buildFileContent(content, frontmatter)
  fs.writeFileSync(fullPath, fileContent, 'utf-8')

  const note = parseFile(fullPath, vaultPath)
  if (!note) throw new Error('Failed to parse updated file')
  return note
}

/**
 * Delete a file by moving it to the recycle bin.
 * On Windows uses PowerShell SendToRecycleBin; fallback moves to .trash/
 */
export async function deleteFile(
  vaultPath: string,
  relativePath: string,
): Promise<{ ok: boolean; deletedPath: string }> {
  const fullPath = ensureInsideVault(vaultPath, relativePath)
  if (!fs.existsSync(fullPath)) {
    throw new Error(`File not found: ${relativePath}`)
  }

  const absPath = fullPath.replace(/\//g, '\\')

  // Try Windows recycle bin
  if (process.platform === 'win32') {
    try {
      const { execSync } = await import('child_process')
      execSync(
        `powershell.exe -Command "Add-Type -AssemblyName Microsoft.VisualBasic; [Microsoft.VisualBasic.FileIO.FileSystem]::DeleteFile('${absPath}', 'OnlyErrorDialogs', 'SendToRecycleBin')"`,
        { timeout: 10000 },
      )
      // Verify deletion
      if (!fs.existsSync(fullPath)) {
        return { ok: true, deletedPath: relativePath }
      }
    } catch {
      // Fallback below
    }
  }

  // Fallback: move to .trash/ inside vault
  const trashDir = path.join(vaultPath, '.trash')
  if (!fs.existsSync(trashDir)) {
    fs.mkdirSync(trashDir, { recursive: true })
  }
  const trashPath = path.join(trashDir, path.basename(fullPath))
  fs.renameSync(fullPath, trashPath)
  return { ok: true, deletedPath: relativePath }
}

/**
 * Rename / move a file, and update all [[oldName]] wikilinks across the vault.
 */
export function renameFile(
  vaultPath: string,
  oldPath: string,
  newPath: string,
): { ok: boolean; newPath: string; linksUpdated: number } {
  const fullOld = ensureInsideVault(vaultPath, oldPath)
  const fullNew = ensureInsideVault(vaultPath, newPath)

  if (!fs.existsSync(fullOld)) {
    throw new Error(`File not found: ${oldPath}`)
  }
  if (fs.existsSync(fullNew)) {
    throw new Error(`Target already exists: ${newPath}`)
  }

  // Ensure target directory
  const dir = path.dirname(fullNew)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  // Move the file
  fs.renameSync(fullOld, fullNew)

  // Compute old and new link names (without .md extension)
  const oldName = path.basename(oldPath, '.md')
  const newName = path.basename(newPath, '.md')

  // Update wikilinks across the vault
  let linksUpdated = 0
  if (oldName !== newName) {
    const allFiles = walkDir(vaultPath)
    const linkPattern = new RegExp(`\\[\\[${escapeRegex(oldName)}([\\]|#])`, 'g')
    for (const filePath of allFiles) {
      try {
        const raw = fs.readFileSync(filePath, 'utf-8')
        if (linkPattern.test(raw)) {
          const updated = raw.replace(linkPattern, `[[${newName}$1`)
          fs.writeFileSync(filePath, updated, 'utf-8')
          linksUpdated++
        }
      } catch {
        // Skip unreadable files
      }
    }
    // Also handle [[oldName]] at end of line (no trailing |#)
    const linkPatternExact = new RegExp(`\\[\\[${escapeRegex(oldName)}\\]\\]`, 'g')
    for (const filePath of walkDir(vaultPath)) {
      try {
        const raw = fs.readFileSync(filePath, 'utf-8')
        if (linkPatternExact.test(raw)) {
          const updated = raw.replace(linkPatternExact, `[[${newName}]]`)
          fs.writeFileSync(filePath, updated, 'utf-8')
          linksUpdated++
        }
      } catch {
        // Skip
      }
    }
  }

  return { ok: true, newPath, linksUpdated }
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
