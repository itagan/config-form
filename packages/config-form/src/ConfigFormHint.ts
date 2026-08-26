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
    const { content, mode, tooltipProps } = context.props
    if (!content || mode === false) return children

    const target = h('span', {
      class: 'config-form__hint-target',
      attrs: mode === 'title' ? { title: content } : {}
    }, children)

    if (mode === 'tooltip') {
      return h('el-tooltip', {
        props: { placement: 'top', effect: 'dark', ...tooltipProps, content }
      }, [target])
    }
    return target
  }
}
