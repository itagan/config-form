import { defineConfig } from 'vitepress'

const localPlaygroundUrl = 'http://localhost:5173'

const normalizeSiteBase = (value: string) => {
  const path = value.replace(/^\/+|\/+$/g, '')
  return path ? `/${path}/` : '/'
}
// 同站构建（设置 VITE_SITE_BASE）时 Playground 并入文档站 /playground 子路径，
// 站内链接全部走相对路径并使用整页跳转，避免被 VitePress 路由拦截。
const siteBase = normalizeSiteBase(process.env.VITE_SITE_BASE || '/')
const isEmbeddedPlayground = Boolean(process.env.VITE_SITE_BASE)
const playgroundUrl = process.env.VITE_PLAYGROUND_URL || localPlaygroundUrl
// 导航由 VitePress 自动补 base，因此站内 Playground 链接不带基址书写。
const playgroundSiteUrl = isEmbeddedPlayground ? '/playground/' : playgroundUrl
// PlaygroundLink 组件在构建期取最终地址，嵌入式构建不携带 localhost 兜底字符串。
const clientPlaygroundUrl = isEmbeddedPlayground ? `${siteBase}playground/` : playgroundUrl
const playgroundPathPattern = isEmbeddedPlayground ? /^\/playground(?:\/|$)/ : /^$/

export default defineConfig({
  base: siteBase,
  lang: 'zh-CN',
  title: 'ConfigForm',
  description: 'Vue 2.7 + Element UI 配置驱动表单组件',
  cleanUrls: true,
  vite: {
    define: {
      __PLAYGROUND_SITE_URL__: JSON.stringify(clientPlaygroundUrl)
    }
  },
  // Playground 在 VitePress 构建后写入同一 dist，交由 site:check 校验实际可达性。
  ignoreDeadLinks: [
    /^http:\/\/localhost:517[34](?:\/|$)/,
    playgroundPathPattern
  ],
  themeConfig: {
    nav: [
      { text: '指南', link: '/guide/quick-start' },
      { text: 'API', link: '/api/config-form' },
      { text: '示例', link: '/examples/' },
      { text: '架构', link: '/architecture/controlled-data-flow' },
      {
        text: '示例站',
        link: playgroundSiteUrl,
        ...(isEmbeddedPlayground ? { target: '_self' } : {})
      }
    ],
    sidebar: [
      {
        text: '指南',
        items: [
          { text: '快速开始', link: '/guide/quick-start' },
          { text: '配置总览', link: '/guide/configuration' },
          { text: '动态配置', link: '/guide/dynamic-configuration' },
          { text: '开发与质量检查', link: '/guide/development' }
        ]
      },
      {
        text: 'API',
        items: [
          { text: 'ConfigForm', link: '/api/config-form' },
          { text: 'FormItem', link: '/api/form-item' },
          { text: '内置字段类型', link: '/api/builtin-types' },
          { text: 'Component 与 Binding', link: '/api/component-and-binding' },
          { text: '上下文与 Slot', link: '/api/context-and-slots' },
          { text: 'Hint、事件与 Ref', link: '/api/events-and-ref' },
          { text: '自定义字段类型', link: '/api/custom-field-types' }
        ]
      },
      {
        text: '功能',
        items: [
          { text: '键盘导航', link: '/features/keyboard-navigation' },
          { text: 'Tooltip 提示单例', link: '/features/hint-tooltip' }
        ]
      },
      {
        text: '示例',
        items: [
          { text: '示例索引', link: '/examples/' },
          { text: '基础、校验与联动', link: '/examples/basic-form' },
          { text: '选项字段映射', link: '/examples/options-mapping' },
          { text: '扩展、Slot 与复合字段', link: '/examples/extensions' },
          { text: '详情与只读模式', link: '/examples/readonly-detail' }
        ]
      },
      {
        text: '架构',
        items: [
          { text: '受控数据流', link: '/architecture/controlled-data-flow' }
        ]
      }
    ],
    socialLinks: [],
    search: { provider: 'local' }
  }
})
