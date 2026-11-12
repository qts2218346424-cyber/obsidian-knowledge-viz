import { useEffect, useState } from 'react'

/**
 * 顶部极细微光渐变进度条 (Nano Top Progress Bar)
 * 作用：替代突兀的全屏居中 Loading 弹跳框，切页时在视口顶端呈现精致的流光进度动效，
 * 彻底消除切换页面时的“整屏白屏断崖感”，提供 Linear / GitHub 级丝滑质感。
 */
export default function TopProgressBar() {
  const [progress, setProgress] = useState(25)

  useEffect(() => {
    // 模拟平滑匀速向前推进，直到异步模块就绪并卸载
    const timer1 = setTimeout(() => setProgress(65), 80)
    const timer2 = setTimeout(() => setProgress(88), 240)
    const timer3 = setTimeout(() => setProgress(96), 600)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-[2.5px] bg-transparent pointer-events-none overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 shadow-[0_0_8px_rgba(99,102,241,0.6)] transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
