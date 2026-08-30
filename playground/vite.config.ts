import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue2 from '@vitejs/plugin-vue2'

// 同站构建（--mode site）把 Playground 产物并入 VitePress dist，
// 基址由 VITE_SITE_BASE 控制，部署在文档站 /playground 子路径下。
export default defineConfig(({ mode }) => {
  const isSiteBuild = mode === 'site'
  const rawSiteBase = process.env.VITE_SITE_BASE || '/'
  const sitePath = rawSiteBase.replace(/^\/+|\/+$/g, '')
  const siteBase = sitePath ? `/${sitePath}/` : '/'

  return {
    base: isSiteBuild
      ? `${siteBase}playground/`
      : process.env.NODE_ENV === 'production' ? './' : '/',
    plugins: [vue2()],
    resolve: {
      alias: {
        '@itagan/config-form': fileURLToPath(new URL('../packages/config-form/src/index.ts', import.meta.url))
      }
    },
    server: { host: '0.0.0.0', port: 5173, strictPort: true },
    build: {
      ...(isSiteBuild
        ? {
            outDir: fileURLToPath(new URL('../docs/.vitepress/dist/playground', import.meta.url)),
            emptyOutDir: true
          }
        : {}),
      chunkSizeWarningLimit: 1200
    }
  }
})
