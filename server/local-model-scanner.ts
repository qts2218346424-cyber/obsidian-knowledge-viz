import fs from 'fs'
import path from 'path'
import os from 'os'
import { execFileSync } from 'child_process'

const home = os.homedir()

export const DEFAULT_BLACKLIST = new Set([
  'opus',
  'sonnet',
  'haiku',
  'codex',
  'default',
  'custom',
  'undefined',
  'null',
  'version',
  'modelsDevSync',
  'models',
  'deletedModelIds',
  'gpt-image-2',
  'codex-auto-review',
  'MiniMax-M2.7',
  'glm-5.1',
  'glm-5',
  'qwen3.6-plus',
  'qwen3.5-plus',
  'mimo-v2.5-pro',
  'mimo-v2-pro',
  'claude-opus-4-7',
  'claude-sonnet-4-6',
  'claude-haiku-4-5-20251001',
  'claude-opus-4-6',
  'claude-haiku-4-5',
  'claude-opus-4-8',
  'claude-sonnet-4-5-20250929',
  'claude-sonnet-4-5-20250929-thinking',
  'claude-haiku-4-5-20251001-thinking',
  'claude-opus-4-8-thinking',
  'claude-sonnet-5',
  'claude-opus-5',
  'gpt-5.4',
  'gpt-5.4-mini-2026-03-17',
  'gpt-5.5',
  'gpt-5.5-openai-compact',
  'gpt-5.6-sol',
  'gpt-5.6-terra',
  'gpt-6-astra',
  'claude-3-7-sonnet',
  'claude-3-5-sonnet',
  'claude-3-5-haiku',
  '',
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
    if (DEFAULT_BLACKLIST.has(m) || userDeleted.has(m)) return false
    if (m.includes('image') || m.includes('auto-review')) return false
    return true
  }

  const models = {
    'claude-code': new Set<string>(),
    'codex': new Set<string>(),
    'web': new Set<string>([
      'deepseek-v4-pro',
      'deepseek-flash',
      'deepseek-reasoner',
      'deepseek-chat',
    ]),
  }

  // 1. Scan ~/.claude/settings.json (Read user's real configured endpoint and model envs)
  try {
    const claudeSettingsPath = path.join(home, '.claude', 'settings.json')
    if (fs.existsSync(claudeSettingsPath)) {
      const data = JSON.parse(fs.readFileSync(claudeSettingsPath, 'utf-8'))
      if (data.model && typeof data.model === 'string' && isModelPermitted(data.model)) {
        models['claude-code'].add(data.model)
      }
      if (data.env && typeof data.env === 'object') {
        const envKeys = [
          'ANTHROPIC_MODEL',
          'ANTHROPIC_DEFAULT_OPUS_MODEL',
          'ANTHROPIC_DEFAULT_SONNET_MODEL',
          'ANTHROPIC_DEFAULT_HAIKU_MODEL',
          'ANTHROPIC_DEFAULT_OPUS_MODEL_NAME',
        ]
        for (const k of envKeys) {
          const val = data.env[k]
          if (val && typeof val === 'string' && isModelPermitted(val)) {
            models['claude-code'].add(val)
          }
        }
      }
    }
  } catch {
    // ignore
  }

  // 2. Scan ~/.codex/config.toml (Read user's real codex model)
  try {
    const codexTomlPath = path.join(home, '.codex', 'config.toml')
    if (fs.existsSync(codexTomlPath)) {
      const content = fs.readFileSync(codexTomlPath, 'utf-8')
      const m = content.match(/model\s*=\s*["']([^"']+)["']/)
      if (m && m[1] && isModelPermitted(m[1])) {
        models['codex'].add(m[1])
      }
    }
  } catch {
    // ignore
  }



  // 4. Populate verified real default models if not explicitly deleted
  const claudeDefaults = ['deepseek-v4-flash', 'deepseek-v4-pro', 'deepseek-flash', 'deepseek-reasoner']
  for (const m of claudeDefaults) {
    if (isModelPermitted(m)) {
      models['claude-code'].add(m)
    }
  }

  const codexDefaults = ['gpt-5.6-luna', 'gpt-4o', 'o3-mini', 'o1', 'gpt-4o-mini']
  for (const m of codexDefaults) {
    if (isModelPermitted(m)) {
      models['codex'].add(m)
    }
  }

  const clean = (set: Set<string>) =>
    Array.from(set).filter(m => isModelPermitted(m))

  return {
    'claude-code': clean(models['claude-code']),
    'codex': clean(models['codex']),
    'web': clean(models['web']),
  }
}

