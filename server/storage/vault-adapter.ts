import fs from 'fs'
import path from 'path'

/**
 * 知识库持久层统一存储适配器规范
 * 解耦业务层与底层文件系统，支持单机文件系统与未来云端对象存储（S3/MinIO）无缝切换
 */
export interface IVaultStorageAdapter {
  readonly mode: 'local' | 'cloud_s3'
  readFile(relativePath: string): Promise<string>
  writeFile(relativePath: string, content: string): Promise<void>
  deleteFile(relativePath: string): Promise<void>
  exists(relativePath: string): Promise<boolean>
  listFiles(subDir?: string, extension?: string): Promise<string[]>
  stat(relativePath: string): Promise<{ size: number; mtime: number } | null>
}

/**
 * 本地优先存储适配器（Local-First Adapter）
 * 包含严密的路径穿越（Path Traversal）安全校验，防御 '../../' 越界攻击
 */
export class LocalVaultAdapter implements IVaultStorageAdapter {
  readonly mode = 'local' as const
  private rootDir: string

  constructor(vaultPath: string) {
    this.rootDir = path.resolve(vaultPath)
  }

  private resolveSafePath(relativePath: string): string {
    const normalized = path.normalize(relativePath).replace(/^(\.\.(\/|\\|$))+/, '')
    const resolved = path.resolve(this.rootDir, normalized)
    if (!resolved.startsWith(this.rootDir)) {
      throw new Error(`安全防御拦截：试图越界访问知识库根目录外路径 [${relativePath}]`)
    }
    return resolved
  }

  async readFile(relativePath: string): Promise<string> {
    const fullPath = this.resolveSafePath(relativePath)
    return await fs.promises.readFile(fullPath, 'utf-8')
  }

  async writeFile(relativePath: string, content: string): Promise<void> {
    const fullPath = this.resolveSafePath(relativePath)
    const dir = path.dirname(fullPath)
    if (!fs.existsSync(dir)) {
      await fs.promises.mkdir(dir, { recursive: true })
    }
    await fs.promises.writeFile(fullPath, content, 'utf-8')
  }

  async deleteFile(relativePath: string): Promise<void> {
    const fullPath = this.resolveSafePath(relativePath)
    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath)
    }
  }

  async exists(relativePath: string): Promise<boolean> {
    try {
      const fullPath = this.resolveSafePath(relativePath)
      return fs.existsSync(fullPath)
    } catch {
      return false
    }
  }

  async listFiles(subDir = '', extension?: string): Promise<string[]> {
    const targetDir = this.resolveSafePath(subDir)
    if (!fs.existsSync(targetDir)) return []

    const results: string[] = []
    const scan = async (dir: string) => {
      const entries = await fs.promises.readdir(dir, { withFileTypes: true })
      for (const entry of entries) {
        const full = path.join(dir, entry.name)
        if (entry.isDirectory()) {
          if (!entry.name.startsWith('.')) {
            await scan(full)
          }
        } else if (entry.isFile()) {
          if (!extension || entry.name.endsWith(extension)) {
            const rel = path.relative(this.rootDir, full).replace(/\\/g, '/')
            results.push(rel)
          }
        }
      }
    }

    await scan(targetDir)
    return results
  }

  async stat(relativePath: string): Promise<{ size: number; mtime: number } | null> {
    try {
      const fullPath = this.resolveSafePath(relativePath)
      const st = await fs.promises.stat(fullPath)
      return { size: st.size, mtime: st.mtimeMs }
    } catch {
      return null
    }
  }
}

/**
 * 云端对象存储适配器（预留标准接口实现）
 */
export class CloudS3VaultAdapter implements IVaultStorageAdapter {
  readonly mode = 'cloud_s3' as const
  constructor(private bucket: string, private prefix: string = '') {}

  async readFile(_relativePath: string): Promise<string> {
    throw new Error('云端 S3 对象存储适配器正在就绪中')
  }
  async writeFile(_relativePath: string, _content: string): Promise<void> {
    throw new Error('云端 S3 对象存储适配器正在就绪中')
  }
  async deleteFile(_relativePath: string): Promise<void> {
    throw new Error('云端 S3 对象存储适配器正在就绪中')
  }
  async exists(_relativePath: string): Promise<boolean> {
    return false
  }
  async listFiles(_subDir?: string, _extension?: string): Promise<string[]> {
    return []
  }
  async stat(_relativePath: string): Promise<{ size: number; mtime: number } | null> {
    return null
  }
}
