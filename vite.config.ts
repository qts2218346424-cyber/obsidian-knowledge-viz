import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, './shared'),
    },
  },
  build: {
    rolldownOptions: {
      output: {
        // 精细化高并发分包策略：将数 MB 静态真题库、整卷库、讲义与重型渲染引擎拆分为细粒度缓存单元，
        // 彻底消除 >1.5MB 单体巨无霸 chunk 造成的网络队头阻塞与 V8 主线程长任务解析尖峰。
        codeSplitting: {
          groups: [
            { name: 'data-vocab', test: /(vocab-part|vocabulary)/, priority: 55 },
            { name: 'data-papers-math-classic', test: /(math1Mature2004_2015|classicMathPapers)/, priority: 52 },
            { name: 'data-papers-math-modern', test: /(math1Mature2016_2020|math1RecentPapers|mathPapers)/, priority: 51 },
            { name: 'data-papers-lilin', test: /lilin6Papers/, priority: 50 },
            { name: 'data-papers-cs408', test: /cs408Papers/, priority: 49 },
            { name: 'data-papers-english', test: /englishPapers/, priority: 48 },
            { name: 'data-math-exams', test: /(mature-real-exams|recent-real-exams|classic-1993)/, priority: 47 },
            { name: 'data-math-special', test: /(jiuming-probability|meizale-linear-algebra|lilin6-)/, priority: 46 },
            { name: 'data-handouts', test: /(mathExtraHandouts|politicsHandouts|handoutsData)/, priority: 45 },
            { name: 'data-english-reading', test: /(englishPracticeData|dailyReadingData|englishData)/, priority: 44 },
            { name: 'vendor-react', test: /[\\/]node_modules[\\/](react|react-dom|scheduler|react-router|react-router-dom)[\\/]/, priority: 40 },
            { name: 'vendor-icons', test: /[\\/]node_modules[\\/]lucide-react[\\/]/, priority: 30 },
            { name: 'vendor-markdown', test: /[\\/]node_modules[\\/](react-markdown|remark-[^\\/]+|rehype-[^\\/]+|katex|highlight\.js|lowlight)[\\/]/, priority: 20 },
            { name: 'vendor-viz', test: /[\\/]node_modules[\\/](d3[^\\/]*|@xyflow|dagre|recharts)[\\/]/, priority: 10 },
          ],
        },
      },
    },
  },
  server: {
    watch: {
      ignored: [
        '**/data/**',
        '**/uploads/**',
        '**/server/**',
        '**/release/**',
        '**/dist/**',
        '**/dist-server/**',
        '**/build/**',
        '**/scratch/**',
        '**/*.sqlite*',
        '**/*.sqlite-wal*',
        '**/*.sqlite-shm*',
        '**/*.log',
        /.*[\\/](data|uploads|server|release|dist|dist-server|build|scratch)[\\/].*/,
        /.*\.sqlite.*/,
      ],
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
