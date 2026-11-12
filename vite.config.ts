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
    rollupOptions: {
      output: {
        // 精细化分包策略：隔离重型渲染引擎与超大静态数据，提升首屏加载与缓存命中率
        manualChunks(id: string) {
          if (id.includes('vocab-part') || id.includes('vocabulary')) {
            return 'data-vocab'
          }
          if (id.includes('examPapers') || id.includes('lilin6') || id.includes('cs408Papers')) {
            return 'data-papers'
          }
          if (id.includes('node_modules')) {
            if (id.includes('react-markdown') || id.includes('remark-') || id.includes('rehype-') || id.includes('katex') || id.includes('highlight.js')) {
              return 'vendor-markdown'
            }
            if (id.includes('d3') || id.includes('@xyflow') || id.includes('dagre') || id.includes('recharts')) {
              return 'vendor-viz'
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons'
            }
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react'
            }
          }
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
