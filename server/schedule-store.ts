import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export interface ScheduleConfig {
  enabled: boolean
  intervalMinutes: number
  autoApplySafe: boolean
  safeCategories: string[]
  lastRun: string | null
}

const CONFIG_PATH = path.join(__dirname, 'data', 'schedule-config.json')

const DEFAULT_CONFIG: ScheduleConfig = {
  enabled: false,
  intervalMinutes: 60,
  autoApplySafe: true,
  safeCategories: ['link_integrity', 'metadata_coverage', 'tag_consistency'],
  lastRun: null,
}

export function loadScheduleConfig(): ScheduleConfig {
  try {
    const raw = fs.readFileSync(CONFIG_PATH, 'utf-8')
    return JSON.parse(raw) as ScheduleConfig
  } catch {
    return { ...DEFAULT_CONFIG, safeCategories: [...DEFAULT_CONFIG.safeCategories] }
  }
}

export function saveScheduleConfig(config: ScheduleConfig): void {
  const dir = path.dirname(CONFIG_PATH)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8')
}
