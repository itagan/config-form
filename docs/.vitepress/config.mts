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
      { text: 'API', link: '/api/config-form' },
      { text: '示例', link: '/examples/' },
      { text: '架构', link: '/architecture/controlled-data-flow' },
      { text: '示例站', link: playgroundUrl }
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
