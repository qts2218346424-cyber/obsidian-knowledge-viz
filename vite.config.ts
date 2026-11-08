import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
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
