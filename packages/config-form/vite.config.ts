import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue2 from '@vitejs/plugin-vue2'

export default defineConfig({
  plugins: [vue2()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts']
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      name: 'ConfigForm',
      formats: ['es', 'umd'],
      fileName: format => format === 'umd' ? 'config-form.umd.cjs' : 'config-form.es.js'
    },
    rollupOptions: {
      external: ['vue', 'element-ui'],
      output: {
        exports: 'named',
        globals: { vue: 'Vue', 'element-ui': 'ELEMENT' }
      }
    }
  }
})
