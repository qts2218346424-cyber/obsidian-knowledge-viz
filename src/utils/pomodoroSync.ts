// ─── 全局番茄钟同频同步管理器 ──────────────────────────────────────────
// 联通奶龙桌面伴学小挂件与番茄钟专页，实现双向同频计时与状态联动

export interface PomodoroSyncState {
  isRunning: boolean
  timeLeft: number
  totalDuration: number
  mode: 'focus' | 'shortBreak' | 'longBreak'
  timestamp: number
}

const STORAGE_KEY = 'coreforge_pomodoro_sync_state'
const EVENT_NAME = 'coreforge_pomodoro_sync'

export function getPomodoroSyncState(): PomodoroSyncState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      // 若正在运行，结合时间戳补齐离线经过的时间
      if (parsed.isRunning && parsed.timestamp) {
        const elapsedSec = Math.floor((Date.now() - parsed.timestamp) / 1000)
        parsed.timeLeft = Math.max(0, parsed.timeLeft - elapsedSec)
        if (parsed.timeLeft === 0) {
          parsed.isRunning = false
        }
      }
      return parsed
    }
  } catch {}

  return {
    isRunning: false,
    timeLeft: 25 * 60,
    totalDuration: 25 * 60,
    mode: 'focus',
    timestamp: Date.now()
  }
}

export function setPomodoroSyncState(state: Partial<PomodoroSyncState>) {
  try {
    const current = getPomodoroSyncState()
    const next: PomodoroSyncState = {
      ...current,
      ...state,
      timestamp: Date.now()
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: next }))
  } catch {}
}

export function onPomodoroSync(callback: (state: PomodoroSyncState) => void): () => void {
  const handler = (e: any) => {
    if (e.detail) {
      callback(e.detail)
    }
  }
  const storageHandler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        callback(JSON.parse(e.newValue))
      } catch {}
    }
  }

  window.addEventListener(EVENT_NAME, handler)
  window.addEventListener('storage', storageHandler)

  return () => {
    window.removeEventListener(EVENT_NAME, handler)
    window.removeEventListener('storage', storageHandler)
  }
}

// ─── 每日番茄专注统计持久化 ──────────────────────────────────────────────
export interface DailyPomodoroStats {
  date: string
  count: number
  minutes: number
}

const DAILY_STATS_KEY = 'coreforge_pomodoro_daily_v1'
const DAILY_STATS_EVENT = 'coreforge_pomodoro_daily_updated'

function getTodayKey(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function getDailyPomodoroStats(): DailyPomodoroStats {
  const today = getTodayKey()
  try {
    const raw = localStorage.getItem(DAILY_STATS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as DailyPomodoroStats
      if (parsed && parsed.date === today) {
        return {
          date: today,
          count: Math.max(0, Number(parsed.count) || 0),
          minutes: Math.max(0, Number(parsed.minutes) || 0),
        }
      }
    }
  } catch {}
  return { date: today, count: 0, minutes: 0 }
}

export function saveDailyPomodoroStats(count: number, minutes: number): void {
  const next: DailyPomodoroStats = {
    date: getTodayKey(),
    count: Math.max(0, count),
    minutes: Math.max(0, minutes),
  }
  try {
    localStorage.setItem(DAILY_STATS_KEY, JSON.stringify(next))
    window.dispatchEvent(new CustomEvent(DAILY_STATS_EVENT, { detail: next }))
  } catch {}
}

export function onDailyPomodoroStatsUpdate(cb: (stats: DailyPomodoroStats) => void): () => void {
  const handler = (e: Event) => {
    const detail = (e as CustomEvent<DailyPomodoroStats>).detail
    if (detail) cb(detail)
  }
  window.addEventListener(DAILY_STATS_EVENT, handler)
  return () => window.removeEventListener(DAILY_STATS_EVENT, handler)
}
