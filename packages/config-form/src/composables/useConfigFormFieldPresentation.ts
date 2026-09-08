import { computed } from 'vue'
import type { VNodeData } from 'vue'
import type {
  ConfigFormFieldBindingContext,
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
import { resolveConfigFormHint, stripManagedHintTitle } from '../utils/hint'
import { getValueByPath } from '../utils/path'

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
    options.updateApi.setFieldValue(item.fieldKey, value)
  }

  const updateModel = (patch: Record<string, ConfigFormValue>) => {
    options.updateApi.updateModel(patch)
  }

  const bindingValue = computed(() => {
    // 读取同步版本，确保父组件尚未回写 prop 时也刷新复合字段的 value。
    options.updateApi.getRevision?.()
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

  const bindingContext: ConfigFormFieldBindingContext = {
    get model() { return renderContext.model },
    get fieldKey() { return renderContext.fieldKey },
    get value() { return renderContext.value },
    get itemConfig() { return renderContext.itemConfig },
    get bindingValue() { return bindingValue.value }
  }

  const fieldContext: ConfigFormFieldContext = {
    get model() { return bindingContext.model },
    get fieldKey() { return bindingContext.fieldKey },
    get value() { return bindingContext.value },
    get itemConfig() { return bindingContext.itemConfig },
    get bindingValue() { return bindingContext.bindingValue },
    setValue,
    setBindingValue,
    updateModel
  }

  const hint = computed<string | null>(() => {
    const item = getItem()
    const hintOptions = options.getHintOptions()
    if (hintOptions.mode === false) return null
    const configured = resolveDynamic(item.hint, renderContext)
    if (configured === false) return null
    const explicitHint = resolveConfigFormHint(configured)
    if (explicitHint !== null) return explicitHint

    const defaultHint = hintOptions.field
    if (!defaultHint) return null
    const content = typeof defaultHint === 'function'
      ? defaultHint(renderContext)
      : renderContext.value == null || renderContext.value === ''
        ? null
        : String(renderContext.value)
    return resolveConfigFormHint(content)
  })

  const resolvedComponent = computed(() => {
    const item = getItem()
    return resolveFieldComponent(
      item.type,
      item.component,
      options.getFieldTypes(),
      renderContext,
      bindingContext,
      fieldContext
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
    componentSlots: computed(() => {
      const slots: NonNullable<VNodeData['scopedSlots']> = {}
      const mapping = getItem().component?.nativeSlots || {}
      Object.keys(mapping).forEach(name => {
        const slot = getSlot(mapping[name])
        if (!slot) return
        // Vue 2 的 proxy 标记同时向读取 $slots 的原生组件（如 el-input）暴露插槽。
        slots[name] = Object.assign((slotProps: Record<string, unknown>) => {
          const rendered = slot({ field: fieldContext, slotProps })
          return Array.isArray(rendered) ? rendered : rendered ? [rendered] : undefined
        }, { proxy: true })
      })
      return slots
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
      && getItem().hintTrigger === 'content'
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
