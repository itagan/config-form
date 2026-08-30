export interface PlaygroundExample {
  path: string
  title: string
  description: string
  category: string
  level: 'beginner' | 'intermediate' | 'advanced'
  type: 'primary' | 'success' | 'warning' | 'info'
  tags: string[]
}

export const categoryDefinitions = [
  { id: 'basics', title: '基础使用', description: '常规字段编辑、选项映射和受控闭环。' },
  { id: 'advanced', title: '进阶配置', description: '动态字段、扩展协议、远程 Schema 与装饰插槽。' },
  { id: 'experience', title: '状态与体验', description: '详情态、聚焦导航和提示交互。' }
] as const

export const examples: PlaygroundExample[] = [
  {
    path: '/basic-form',
    title: '基础、校验与联动',
    description: '栅格、规则、提交、重置、显隐和字段变化事件的最小闭环。',
    category: 'basics',
    level: 'beginner',
    type: 'primary',
    tags: ['formItemProps', 'rules', 'visible', 'field-change']
  },
  {
    path: '/options',
    title: '选项与字段映射',
    description: 'Select、Radio、Checkbox 共用 options/optionProps 映射业务数据。',
    category: 'basics',
    level: 'beginner',
    type: 'primary',
    tags: ['options', 'optionProps']
  },
  {
    path: '/dynamic',
    title: '动态字段与增删',
    description: 'items 由业务派生：数组路径 fieldKey、稳定 key 与批量事务写回。',
    category: 'advanced',
    level: 'intermediate',
    type: 'success',
    tags: ['数组路径', '稳定 key', '受控 model']
  },
  {
    path: '/schema',
    title: 'JSON Schema 驱动',
    description: '可序列化 JSON 下发配置，客户端注册表绑定组件实现。',
    category: 'advanced',
    level: 'advanced',
    type: 'success',
    tags: ['resolveComponent', 'labelSlot', 'errorSlot']
  },
  {
    path: '/extensions',
    title: '扩展、Slot 与复合字段',
    description: '注册业务 type、具名 Slot 与 binding.map 双向拆装。',
    category: 'advanced',
    level: 'intermediate',
    type: 'success',
    tags: ['业务 type', 'binding.map', 'slot']
  },
  {
    path: '/readonly',
    title: '详情与只读模式',
    description: 'formProps.disabled 全局透传、type: text 纯展示与字段级锁定。',
    category: 'experience',
    level: 'beginner',
    type: 'info',
    tags: ['formProps.disabled', 'type: text', 'readonly']
  },
  {
    path: '/interaction',
    title: '校验聚焦与键盘导航',
    description: 'Enter 连续录入、scrollToFirstError 定位与 focusField 精确跳转。',
    category: 'experience',
    level: 'intermediate',
    type: 'info',
    tags: ['Enter 导航', 'scrollToFirstError', 'focusField']
  },
  {
    path: '/hints',
    title: '提示与 Tooltip 单例',
    description: 'title/tooltip 模式对比、触发区域与键盘可达性（aria-describedby）。',
    category: 'experience',
    level: 'beginner',
    type: 'info',
    tags: ['hintOptions', 'hintTrigger', 'aria']
  }
]

export const exampleGroups = categoryDefinitions
  .map(category => ({
    ...category,
    examples: examples.filter(example => example.category === category.id)
  }))
  .filter(category => category.examples.length > 0)

export const levelLabels: Record<string, string> = {
  beginner: '基础',
  intermediate: '进阶',
  advanced: '高级'
}

export const findExampleByPath = (path: string) => (
  examples.find(example => example.path === path)
)
