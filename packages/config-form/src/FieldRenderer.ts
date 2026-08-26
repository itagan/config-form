import type { CreateElement, RenderContext, VNode, VNodeData } from 'vue'
import type {
  ConfigFormFieldRenderContext,
  ConfigFormValue,
  FormItemOption,
  FormModel,
  OptionPropsConfig,
  ResolvedFieldComponent
} from './types'

interface Props {
  type: string
  value: ConfigFormValue
  component: ResolvedFieldComponent
  modelContext: ConfigFormFieldRenderContext
  onModelInput: (value: ConfigFormValue) => void
}

interface ModelVNodeData extends VNodeData {
  model?: { value: ConfigFormValue, callback: (value: ConfigFormValue) => void }
}

function pick(option: FormItemOption, mapping: OptionPropsConfig | undefined, key: keyof OptionPropsConfig) {
  const mappedKey = mapping?.[key] || key
  return option[mappedKey]
}

function createOptions(
  h: CreateElement,
  type: string,
  options: FormItemOption[],
  mapping?: OptionPropsConfig
): VNode[] | undefined {
  if (!['select', 'radio', 'checkbox'].includes(type)) return undefined
  const tag = type === 'select' ? 'el-option' : type === 'radio' ? 'el-radio' : 'el-checkbox'
  return options.map((option, index) => {
    const label = pick(option, mapping, 'label')
    const value = pick(option, mapping, 'value')
    const key = pick(option, mapping, 'key') ?? value ?? index
    return h(tag, {
      key,
      attrs: {
        label: type === 'select' ? label : value,
        value: type === 'select' ? value : undefined,
        disabled: Boolean(pick(option, mapping, 'disabled'))
      }
    }, type === 'select' ? undefined : [String(label ?? '')])
  })
}

function createData(component: ResolvedFieldComponent): ModelVNodeData {
  const { class: className, style, ...attrs } = component.props
  return { attrs, class: className, style, on: { ...component.listeners } }
}

export default {
  name: 'ConfigFormFieldRenderer',
  functional: true,
  props: {
    type: { type: String, required: true },
    value: null,
    component: { type: Object, required: true },
    modelContext: { type: Object, required: true },
    onModelInput: { type: Function, required: true }
  },
  render(h: CreateElement, context: RenderContext<Props>): VNode {
    const { type, value, component, modelContext, onModelInput } = context.props
    if (type === 'text') return h('span', createData(component), [String(value ?? '')])
    if (!component.is) return h('span')

    const data = createData(component)
    const protocol = component.model
    const modelValue = protocol && protocol.valueToProp
      ? protocol.valueToProp(modelContext as ConfigFormFieldRenderContext<FormModel>, value)
      : value

    if (protocol === undefined) {
      data.model = { value: modelValue, callback: onModelInput }
    } else if (protocol !== false) {
      const prop = protocol.prop || 'value'
      const event = protocol.event || 'input'
      const listener = component.listeners[event]
      data.attrs = { ...data.attrs, [prop]: modelValue }
      data.on = {
        ...data.on,
        [event]: (...args: unknown[]) => {
          const nextValue = protocol.valueFromEvent
            ? protocol.valueFromEvent(modelContext as ConfigFormFieldRenderContext<FormModel>, ...args)
            : args[0]
          onModelInput(nextValue)
          listener?.(...args)
        }
      }
    }

    return h(
      component.is as any,
      data,
      createOptions(h, type, component.options, component.optionProps)
    )
  }
}
