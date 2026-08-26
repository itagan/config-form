import { defineConfig } from 'vitepress'

const playgroundUrl = process.env.VITE_PLAYGROUND_URL || 'http://localhost:5173'

export default defineConfig({
  lang: 'zh-CN',
  title: 'ConfigForm',
  description: 'Vue 2.7 + Element UI 配置驱动表单组件',
  cleanUrls: true,
  themeConfig: {
    nav: [
      { text: '指南', link: '/guide/quick-start' },
      { text: 'API', link: '/api/form-item' },
      { text: '架构', link: '/architecture/controlled-data-flow' },
      { text: '示例站', link: playgroundUrl }
    ],
    sidebar: [
      {
        text: '指南',
        items: [
          { text: '快速开始', link: '/guide/quick-start' },
          { text: '配置总览', link: '/guide/configuration' },
          { text: '动态配置', link: '/guide/dynamic-configuration' }
        ]
      },
      {
        text: 'API',
        items: [
          { text: 'FormItem', link: '/api/form-item' },
          { text: 'Component 与 Binding', link: '/api/component-and-binding' },
          { text: 'Hint、事件与 Ref', link: '/api/events-and-ref' },
          { text: '自定义字段类型', link: '/api/custom-field-types' }
        ]
      },
      {
        text: '架构',
        items: [
          { text: '受控数据流', link: '/architecture/controlled-data-flow' }
        ]
      },
      { text: '示例', items: [{ text: '示例索引', link: '/examples/' }] }
    ],
    socialLinks: [],
    search: { provider: 'local' }
  }
})
