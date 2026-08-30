import { computed } from 'vue'
import type {
  ConfigFormFieldContext,
  ConfigFormFieldRenderContext,
  ConfigFormHintOptions,
  ConfigFormValue,
  FieldTypeRegistry,
  FormItemConfig
} from '../types'
import type { ConfigFormRootSlots, ConfigFormUpdateApi } from '../types/internal'
import { createBindingPatch, resolveBindingValue } from '../utils/binding'
import { resolveDynamic, resolveFieldComponent } from '../utils/field'
import { stripManagedHintTitle } from '../utils/hint'
import { getValueByPath } from '../utils/path'

const nativeReadonlyTypes = new Set(['input', 'date', 'time', 'time-select', 'autocomplete'])

interface Options {
  getItem: () => FormItemConfig
  getFieldTypes: () => FieldTypeRegistry
  getHintOptions: () => ConfigFormHintOptions
  getRootSlots: () => ConfigFormRootSlots
  updateApi: ConfigFormUpdateApi
}

/** 归一化单字段的动态配置、上下文、受控值和展示状态。 */
export function useConfigFormFieldPresentation(options: Options) {
  const getItem = options.getItem
  const getModel = options.updateApi.getCurrentModel

  const renderContext: ConfigFormFieldRenderContext = {
    get model() { return getModel() },
    get fieldKey() { return getItem().fieldKey },
    get value() { return getValueByPath(getModel(), getItem().fieldKey) },
    get itemConfig() { return getItem() }
  }

  const setValue = (value: ConfigFormValue) => {
    const item = getItem()
    options.updateApi.setFieldValue(item.fieldKey, value, item)
  }

  const updateModel = (patch: Record<string, ConfigFormValue>) => {
    options.updateApi.updateModel(patch, getItem())
  }

  const bindingValue = computed(() => {
    const item = getItem()
    return item.binding
      ? resolveBindingValue(getModel(), item.binding)
      : getValueByPath(getModel(), item.fieldKey)
  })

  const setBindingValue = (value: ConfigFormValue) => {
    const item = getItem()
    if (item.binding) updateModel(createBindingPatch(item.binding, value))
    else setValue(value)
  }

  const fieldContext = Object.assign(renderContext, {
    setValue,
    setBindingValue,
    updateModel
  }) as ConfigFormFieldContext
  Object.defineProperty(fieldContext, 'bindingValue', {
    enumerable: true,
    get: () => bindingValue.value
  })

  const hint = computed<string | null>(() => {
    const item = getItem()
    const hintOptions = options.getHintOptions()
    if (hintOptions.mode === false) return null
    const configured = resolveDynamic(item.hint, renderContext)
    if (configured === false) return null
    if (typeof configured === 'string' && configured !== '') return configured

    const defaultHint = hintOptions.field
    if (!defaultHint) return null
    const content = typeof defaultHint === 'function'
      ? defaultHint(renderContext)
      : renderContext.value == null || renderContext.value === ''
        ? null
        : String(renderContext.value)
    return typeof content === 'string' && content !== '' ? content : null
  })

  const interactionProps = computed(() => {
    const item = getItem()
    const disabled = resolveDynamic(item.disabled, renderContext) === true
    const readonly = resolveDynamic(item.readonly, renderContext) === true
    if (disabled) return { disabled: true }
    if (!readonly) return {}

    const strategy = resolveDynamic(item.readonlyStrategy, renderContext) || 'auto'
    if (strategy === 'native') return { readonly: true }
    if (strategy === 'disabled') return { disabled: true }
    return nativeReadonlyTypes.has(item.type)
      ? { readonly: true }
      : { disabled: true }
  })

  const resolvedComponent = computed(() => {
    const item = getItem()
    return resolveFieldComponent(
      item.type,
      item.component,
      options.getFieldTypes(),
      renderContext,
      fieldContext,
      interactionProps.value
    )
  })

  const getSlot = (name?: string) => name ? options.getRootSlots()[name] : undefined
  const hintTooltipEnabled = computed(() => options.getHintOptions().mode === 'tooltip')

  return {
    visible: computed(() => resolveDynamic(getItem().visible, renderContext) !== false),
    colProps: computed(() => ({
      span: 24,
      ...(resolveDynamic(getItem().colProps, renderContext) || {})
    })),
    formItemProps: computed(() => {
      const props = resolveDynamic(getItem().formItemProps, renderContext) || {}
      return hintTooltipEnabled.value && hint.value !== null
        ? stripManagedHintTitle(props)
        : props
    }),
    bindingValue,
    renderContext,
    fieldContext,
    resolvedComponent,
    hint,
    delegatedHint: computed(() => hintTooltipEnabled.value ? hint.value : null),
    hintTrigger: computed(() => (
      hintTooltipEnabled.value
      && hint.value
      && options.getHintOptions().hintTrigger === 'content'
        ? 'content'
        : undefined
    )),
    getSlot,
    hasSideSlots: computed(() => Boolean(
      getSlot(getItem().leftSlot) || getSlot(getItem().rightSlot)
    )),
    setBindingValue
  }
}
