import type {
  BuiltinFormItemType,
  ConfigFormFieldRenderContext,
  FieldComponentConfig,
  FieldTypeDefinition,
  FormModel,
  ResolvedFieldComponent
} from '../types'

const componentTypeMap: Record<BuiltinFormItemType, string> = {
  input: 'el-input', select: 'el-select', date: 'el-date-picker',
  time: 'el-time-picker', 'time-select': 'el-time-select', number: 'el-input-number',
  switch: 'el-switch', radio: 'el-radio-group', checkbox: 'el-checkbox-group',
  text: 'span', rate: 'el-rate', slider: 'el-slider', color: 'el-color-picker',
  cascader: 'el-cascader', autocomplete: 'el-autocomplete'
}

export function isBuiltinType(type: string): type is BuiltinFormItemType {
  return Object.prototype.hasOwnProperty.call(componentTypeMap, type)
}

export function isReservedType(type: string) {
  return type === 'component' || type === 'slot' || isBuiltinType(type)
}

function resolveDynamic<T, TContext>(value: T | ((context: TContext) => T) | undefined, context: TContext) {
  return typeof value === 'function' ? (value as (context: TContext) => T)(context) : value
}

export function resolveFieldComponent<TModel extends FormModel>(
  type: string,
  config: FieldComponentConfig<TModel> | undefined,
  registry: Record<string, FieldTypeDefinition<TModel>>,
  renderContext: ConfigFormFieldRenderContext<TModel>,
  fieldContext: any,
  interactionProps: Record<string, unknown> = {}
): ResolvedFieldComponent<TModel> {
  const definition = !isBuiltinType(type) && type !== 'component' && type !== 'slot'
    ? registry[type]
    : undefined
  const component = config || {}
  const listenerConfig = component.listeners || {}
  const listeners = Object.keys(listenerConfig).reduce<Record<string, (...args: unknown[]) => void>>(
    (result, event) => {
      result[event] = (...args) => listenerConfig[event](fieldContext, ...args)
      return result
    },
    {}
  )

  return {
    is: component.resolveComponent?.(renderContext)
      || component.is
      || definition?.is
      || (isBuiltinType(type) ? componentTypeMap[type] : undefined),
    props: {
      ...(resolveDynamic(definition?.props, renderContext) || {}),
      ...(resolveDynamic(component.props, renderContext) || {}),
      ...interactionProps
    },
    listeners,
    options: resolveDynamic(component.options, renderContext) || [],
    optionProps: resolveDynamic(component.optionProps, renderContext),
    model: component.model !== undefined ? component.model : definition?.model
  }
}

export { resolveDynamic }
