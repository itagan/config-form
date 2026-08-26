import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue2 from '@vitejs/plugin-vue2'

export default defineConfig({
  plugins: [vue2()],
  base: process.env.NODE_ENV === 'production' ? './' : '/',
  resolve: {
    alias: {
      '@itagan/config-form': fileURLToPath(new URL('../packages/config-form/src/index.ts', import.meta.url))
    }
  },
  server: { host: '0.0.0.0', port: 5173, strictPort: true },
  build: { chunkSizeWarningLimit: 1200 }
})
