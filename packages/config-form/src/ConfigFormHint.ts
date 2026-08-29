import type { CreateElement, RenderContext, VNode } from 'vue'
import type { ComponentProps, ConfigFormHintMode } from './types'

interface Props {
  content: string | null
  mode: ConfigFormHintMode
  tooltipProps: ComponentProps
}

export default {
  name: 'ConfigFormHint',
  functional: true,
  props: {
    content: { type: String, default: null },
    mode: { type: [String, Boolean], default: 'title' },
    tooltipProps: { type: Object, default: () => ({}) }
  },
  render(h: CreateElement, context: RenderContext<Props>): VNode | VNode[] {
    const children = context.slots().default || []
    const { content, mode } = context.props
    if (!content || mode === false) return children

    // tooltip 模式由表单根部的单例 ConfigFormHintTooltip 委托展示，
    // 这里只保留内容根节点供定位与触发区域使用。
    const title = mode === 'title' ? { title: content } : {}
    return h('span', {
      class: 'config-form__hint-target',
      attrs: title
    }, children)
  }
}
