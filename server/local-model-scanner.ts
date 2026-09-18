import fs from 'fs'
import path from 'path'
import os from 'os'
import { execFileSync } from 'child_process'

const home = os.homedir()

const BLACKLIST_MODELS = new Set([
  'version',
  'modelsDevSync',
  'models',
  'deletedModelIds',
  'default',
  'custom',
  'undefined',
  'null',
  '',
])

export interface DiscoveredLocalModels {
  'claude-code': string[]
  'codex': string[]
  'web': string[]
}

export function scanHostLocalModels(): DiscoveredLocalModels {
  const models = {
    'claude-code': new Set<string>([
      'claude-3-7-sonnet',
      'claude-3-5-sonnet',
      'claude-3-5-haiku',
      'opus',
      'sonnet',
      'haiku',
    ]),
    'codex': new Set<string>([
      'gpt-4o',
      'o3-mini',
      'o1',
      'gpt-4o-mini',
      'codex',
    ]),
    'web': new Set<string>([
      'deepseek-v4-pro',
      'deepseek-reasoner',
      'deepseek-chat',
      'claude-3-7-sonnet',
      'gpt-4o',
    ]),
  }

  // 1. Scan ~/.claude/settings.json
  try {
    const claudeSettingsPath = path.join(home, '.claude', 'settings.json')
    if (fs.existsSync(claudeSettingsPath)) {
      const data = JSON.parse(fs.readFileSync(claudeSettingsPath, 'utf-8'))
      if (data.model && typeof data.model === 'string') {
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
          if (val && typeof val === 'string') {
            models['claude-code'].add(val)
          }
        }
      }
    }
  } catch {
    // ignore
  }

  // 2. Scan ~/.codex/config.toml
  try {
    const codexTomlPath = path.join(home, '.codex', 'config.toml')
    if (fs.existsSync(codexTomlPath)) {
      const content = fs.readFileSync(codexTomlPath, 'utf-8')
      const m = content.match(/model\s*=\s*["']([^"']+)["']/)
      if (m && m[1]) models['codex'].add(m[1])
    }
  } catch {
    // ignore
  }

  // 3. Scan ~/.codex/models_cache.json
  try {
    const codexCachePath = path.join(home, '.codex', 'models_cache.json')
    if (fs.existsSync(codexCachePath)) {
      const data = JSON.parse(fs.readFileSync(codexCachePath, 'utf-8'))
      const list = Array.isArray(data) ? data : data.models || []
      for (const item of list) {
        if (typeof item === 'string' && !BLACKLIST_MODELS.has(item)) {
          models['codex'].add(item)
        } else if (item?.slug && !BLACKLIST_MODELS.has(item.slug)) {
          models['codex'].add(item.slug)
        } else if (item?.id && !BLACKLIST_MODELS.has(item.id)) {
          models['codex'].add(item.id)
        }
      }
    }
  } catch {
    // ignore
  }

  // 4. Scan ~/.cc-switch/model-pricing.json
  try {
    const pricingPath = path.join(home, '.cc-switch', 'model-pricing.json')
    if (fs.existsSync(pricingPath)) {
      const data = JSON.parse(fs.readFileSync(pricingPath, 'utf-8'))
      const items = Array.isArray(data) ? data : Object.values(data)
      for (const item of items) {
        const id = item?.id || item?.model_id
        if (typeof id === 'string' && !BLACKLIST_MODELS.has(id)) {
          if (id.startsWith('claude')) models['claude-code'].add(id)
          else models['codex'].add(id)
        }
      }
    }
  } catch {
    // ignore
  }

  // 5. Scan ~/.cc-switch/cc-switch.db for active/frequently used models
  try {
    const dbPath = path.join(home, '.cc-switch', 'cc-switch.db')
    if (fs.existsSync(dbPath)) {
      const pyCode = `import sqlite3; conn=sqlite3.connect(r'${dbPath}'); cur=conn.cursor(); cur.execute('SELECT DISTINCT model FROM usage_daily_rollups WHERE model != "" LIMIT 40'); print(','.join([r[0] for r in cur.fetchall()]))`
      const out = execFileSync('python', ['-c', pyCode], { encoding: 'utf-8', timeout: 3000 }).trim()
      if (out) {
        for (const m of out.split(',')) {
          const trimmed = m.trim()
          if (!trimmed || BLACKLIST_MODELS.has(trimmed)) continue
          if (trimmed.includes('claude')) {
            models['claude-code'].add(trimmed)
          } else {
            models['codex'].add(trimmed)
            models['claude-code'].add(trimmed)
          }
        }
      }
    }
  } catch {
    // ignore
  }

  const clean = (set: Set<string>) =>
    Array.from(set).filter(m => m && m.length >= 2 && !BLACKLIST_MODELS.has(m))

  return {
    'claude-code': clean(models['claude-code']),
    'codex': clean(models['codex']),
    'web': clean(models['web']),
  }
}
