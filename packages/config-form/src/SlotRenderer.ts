import type { CreateElement, RenderContext, VNode } from 'vue'

interface Props {
  slotFn: (props: any) => VNode[] | VNode | undefined
  slotProps: any
}

export default {
  name: 'ConfigFormSlotRenderer',
  functional: true,
  props: {
    slotFn: { type: Function, required: true },
    slotProps: { type: Object, required: true }
  },
  render(_createElement: CreateElement, context: RenderContext<Props>) {
    const rendered = context.props.slotFn(context.props.slotProps)
    return Array.isArray(rendered) ? rendered : rendered || []
  }
}
