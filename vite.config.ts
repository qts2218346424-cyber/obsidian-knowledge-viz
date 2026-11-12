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
        // 精细化分包策略：隔离重型渲染引擎，提升首屏加载与缓存命中率。
        // 使用 Rolldown codeSplitting + priority：React 运行时优先归入 vendor-react，
        // 避免 markdown 分组按依赖递归吞入 react/jsx-runtime，导致落地页被迫预加载 ~600KB 的 Markdown/KaTeX 引擎。
        codeSplitting: {
          groups: [
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
