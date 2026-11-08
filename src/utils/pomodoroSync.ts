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
