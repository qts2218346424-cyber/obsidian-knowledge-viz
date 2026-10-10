import fs from 'fs'
import path from 'path'
import os from 'os'
import { execFileSync } from 'child_process'

const home = os.homedir()

// 仅过滤无效字符串或纯系统占位词，绝不拦截任何真实大模型名
export const DEFAULT_BLACKLIST = new Set([
  'default',
  'custom',
  'undefined',
  'null',
  'version',
  'modelsDevSync',
  'models',
  'deletedModelIds',
  '',
])

// 明确过滤已下架、不可用、不存在或废弃的模型
export const DEPRECATED_OR_UNAVAILABLE_MODELS = new Set([
  'deepseek-v4-flash', // 未上线/虚构模型
  'deepseek-v4-pro',   // 未上线/虚构模型
  'gpt-5.4',           // 官方已下架
  'gpt-4o',            // 已下架/不可用
  'gpt-4o-mini',       // 已下架/不可用
  'o1',                // 已下架/不可用
  'claude-3-5-haiku',  // 官方已停用
  'gpt-reserve',       // 系统保留/hide
  'codex-auto-review', // 代码审查内部系统模型
])

export interface DiscoveredLocalModels {
  'claude-code': string[]
  'codex': string[]
  'web': string[]
}

function getDeletedModelsPath(): string {
  const customPath = path.join(process.cwd(), 'server', 'data', 'deleted_models.json')
  const dir = path.dirname(customPath)
  if (!fs.existsSync(dir)) {
    try { fs.mkdirSync(dir, { recursive: true }) } catch {}
  }
  return customPath
}

export function getDeletedModels(): string[] {
  try {
    const fp = getDeletedModelsPath()
    if (fs.existsSync(fp)) {
      const parsed = JSON.parse(fs.readFileSync(fp, 'utf-8'))
      if (Array.isArray(parsed)) return parsed.filter(Boolean)
    }
  } catch {}
  return []
}

export function addDeletedModel(model: string): string[] {
  const current = new Set(getDeletedModels())
  const trimmed = model.trim()
  if (trimmed) {
    current.add(trimmed)
  }
  const updated = Array.from(current)
  try {
    const fp = getDeletedModelsPath()
    fs.writeFileSync(fp, JSON.stringify(updated, null, 2), 'utf-8')
  } catch (err) {
    console.error('Failed to save deleted model to blacklist:', err)
  }
  return updated
}

export function removeDeletedModel(model: string): string[] {
  const current = new Set(getDeletedModels())
  current.delete(model.trim())
  const updated = Array.from(current)
  try {
    const fp = getDeletedModelsPath()
    fs.writeFileSync(fp, JSON.stringify(updated, null, 2), 'utf-8')
  } catch (err) {
    console.error('Failed to remove deleted model from blacklist:', err)
  }
  return updated
}

export function clearDeletedModels(): void {
  try {
    const fp = getDeletedModelsPath()
    fs.writeFileSync(fp, '[]', 'utf-8')
  } catch {}
}

export function scanHostLocalModels(): DiscoveredLocalModels {
  const userDeleted = new Set(getDeletedModels())

  const isModelPermitted = (m: string): boolean => {
    if (!m || m.length < 2) return false
    const clean = m.trim().toLowerCase()
    if (DEFAULT_BLACKLIST.has(clean) || userDeleted.has(clean)) return false
    if (DEPRECATED_OR_UNAVAILABLE_MODELS.has(clean)) return false
    if (clean.includes('image') || clean.includes('auto-review') || clean.includes('reserve')) return false
    if (clean.startsWith('deepseek-v4')) return false
    return true
  }

  const models = {
    'claude-code': new Set<string>(),
    'codex': new Set<string>(),
    'web': new Set<string>([
      'deepseek-flash',
      'deepseek-reasoner',
      'deepseek-chat',
    ]),
  }

  // 1. 扫描 ~/.codex/cc-switch-model-catalog.json (优先匹配模型切换目录中活跃可见的模型)
  try {
    const ccSwitchPath = path.join(home, '.codex', 'cc-switch-model-catalog.json')
    if (fs.existsSync(ccSwitchPath)) {
      const data = JSON.parse(fs.readFileSync(ccSwitchPath, 'utf-8'))
      if (Array.isArray(data.models)) {
        for (const item of data.models) {
          if (item?.visibility === 'hide') continue
          const slug = typeof item === 'string' ? item : (item.slug || item.name)
          if (slug && isModelPermitted(slug)) {
            models['codex'].add(slug)
          }
        }
      }
    }
  } catch {}

  // 2. 扫描 ~/.codex/models_cache.json (Codex 核心模型缓存，过滤 hide 与下架项)
  try {
    const codexCachePath = path.join(home, '.codex', 'models_cache.json')
    if (fs.existsSync(codexCachePath)) {
      const data = JSON.parse(fs.readFileSync(codexCachePath, 'utf-8'))
      if (Array.isArray(data.models)) {
        for (const item of data.models) {
          if (item?.visibility === 'hide') continue
          if (item?.slug && isModelPermitted(item.slug)) {
            models['codex'].add(item.slug)
          }
        }
      }
    }
  } catch (err) {
    console.warn('[ModelScanner] 读取 ~/.codex/models_cache.json 异常:', err)
  }

  // 3. 扫描 ~/.codex/config.toml (用户当前配置文件)
  try {
    const codexTomlPath = path.join(home, '.codex', 'config.toml')
    if (fs.existsSync(codexTomlPath)) {
      const content = fs.readFileSync(codexTomlPath, 'utf-8')
      const m = content.match(/model\s*=\s*["']([^"']+)["']/)
      if (m && m[1] && isModelPermitted(m[1])) {
        models['codex'].add(m[1])
      }
      const profileMatches = content.matchAll(/["'](gpt-[^"']+)["']\s*=/g)
      for (const pm of profileMatches) {
        const cleanName = pm[1].replace(/\*$/, '')
        if (isModelPermitted(cleanName)) {
          models['codex'].add(cleanName)
        }
      }
    }
  } catch {}

  // 4. 尝试执行 claude --print /model 动态获取当前活跃模型 (带超时保护)
  try {
    const appData = process.env.APPDATA || ''
    const claudeCmd = path.join(appData, 'npm', 'claude.cmd')
    if (fs.existsSync(claudeCmd)) {
      const output = execFileSync(claudeCmd, ['--print', '/model'], {
        encoding: 'utf-8',
        timeout: 3000,
        stdio: ['ignore', 'pipe', 'ignore'],
        windowsHide: true,
      })
      const match = output.match(/Current model:\s*`?([a-zA-Z0-9_\-\.]+)/i)
      if (match && match[1]) {
        const detected = match[1].replace(/\[\d+[A-Za-z]+\]$/, '')
        if (isModelPermitted(detected)) {
          models['claude-code'].add(detected)
        }
      }
    }
  } catch {}

  // 5. 扫描 ~/.claude/settings.json (Claude Code 环境变量与配置)
  try {
    const claudeSettingsPath = path.join(home, '.claude', 'settings.json')
    if (fs.existsSync(claudeSettingsPath)) {
      const data = JSON.parse(fs.readFileSync(claudeSettingsPath, 'utf-8'))
      if (data.model && typeof data.model === 'string' && isModelPermitted(data.model)) {
        models['claude-code'].add(data.model)
      }
      if (data.env && typeof data.env === 'object') {
        const envKeys = [
          'ANTHROPIC_DEFAULT_SONNET_MODEL_NAME',
          'ANTHROPIC_DEFAULT_OPUS_MODEL_NAME',
          'ANTHROPIC_DEFAULT_HAIKU_MODEL_NAME',
          'ANTHROPIC_MODEL',
        ]
        for (const k of envKeys) {
          const val = data.env[k]
          if (val && typeof val === 'string') {
            const cleanVal = val.replace(/\[\d+[A-Za-z]+\]$/, '')
            if (isModelPermitted(cleanVal)) {
              models['claude-code'].add(cleanVal)
            }
          }
        }
      }
    }
  } catch {}

  // 6. 补充现役真实可用模型白名单（排除一切下架或虚构模型）
  const codexActiveDefaults = ['gpt-6-luna', 'gpt-5.6-luna', 'gpt-5.6-terra', 'gpt-5.6-sol', 'gpt-5.5', 'o3-mini']
  for (const m of codexActiveDefaults) {
    if (isModelPermitted(m)) {
      models['codex'].add(m)
    }
  }

  const claudeActiveDefaults = [
    'deepseek-flash',
    'deepseek-reasoner',
    'claude-3-7-sonnet',
    'claude-3-5-sonnet',
  ]
  for (const m of claudeActiveDefaults) {
    if (isModelPermitted(m)) {
      models['claude-code'].add(m)
    }
  }

  const clean = (set: Set<string>) =>
    Array.from(set).filter(m => isModelPermitted(m))

  const cleanCodex = (set: Set<string>) => {
    const list = clean(set)
    return list.sort((a, b) => {
      if (a === 'gpt-6-luna') return -1
      if (b === 'gpt-6-luna') return 1
      return b.localeCompare(a)
    })
  }

  return {
    'claude-code': clean(models['claude-code']),
    'codex': cleanCodex(models['codex']),
    'web': clean(models['web']),
  }
}

