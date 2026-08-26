<template>
  <el-form
    ref="formRef"
    class="config-form"
    v-bind="formProps"
    :model="model"
    :disabled="disabled || readonly"
    @validate="handleValidate"
  >
    <slot name="prepend" :model="model" />
    <el-row v-bind="rowProps">
      <template v-for="item in items">
        <el-col
          v-if="isVisible(item)"
          :key="item.key || item.fieldKey"
          v-bind="getColProps(item)"
        >
          <el-form-item
            v-bind="getFormItemProps(item)"
            :prop="item.fieldKey"
          >
            <template v-if="getSlot(item.labelSlot)" v-slot:label>
              <SlotRenderer
                :slot-fn="getSlot(item.labelSlot)"
                :slot-props="getFormItemSlotContext(item)"
              />
            </template>

            <template v-if="getSlot(item.errorSlot)" v-slot:error="{ error }">
              <SlotRenderer
                :slot-fn="getSlot(item.errorSlot)"
                :slot-props="getErrorSlotContext(item, error)"
              />
            </template>

            <ConfigFormHint
              :content="getHint(item)"
              :mode="hintOptions.mode"
              :tooltip-props="hintOptions.tooltipProps"
            >
              <SlotRenderer
                v-if="item.type === 'slot' && getFieldSlot(item)"
                :slot-fn="getFieldSlot(item)"
                :slot-props="getSlotContext(item)"
              />
              <span v-else-if="item.type === 'slot'" />
              <FieldRenderer
                v-else
                :type="item.type"
                :value="getBindingValue(item)"
                :component="getResolvedComponent(item)"
                :model-context="getRenderContext(item)"
                :on-model-input="getModelInputHandler(item)"
              />
            </ConfigFormHint>
          </el-form-item>
        </el-col>
      </template>
    </el-row>
    <slot name="append" :model="model" />
  </el-form>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ConfigForm',
  model: {
    prop: 'model',
    event: 'update:model'
  }
})
</script>

<script lang="ts" setup>
import { computed, nextTick, ref, useSlots, watchEffect } from 'vue'
import ConfigFormHint from './ConfigFormHint'
import FieldRenderer from './FieldRenderer'
import SlotRenderer from './SlotRenderer'
import type {
  ComponentProps,
  ConfigFormFieldChangePayload,
  ConfigFormFieldContext,
  ConfigFormFieldRenderContext,
  ConfigFormValue,
  ConfigFormHintOptions,
  FieldTypeRegistry,
  FormItemConfig,
  FormModel
} from './types'
import { useControlledFormUpdate } from './composables/useControlledFormUpdate'
import { createBindingPatch, resolveBindingValue } from './utils/binding'
import { resolveDynamic, resolveFieldComponent } from './utils/field'
import { getValueByPath } from './utils/path'
import { collectSchemaDiagnostics } from './utils/schemaDiagnostics'

const props = withDefaults(defineProps<{
  model: FormModel
  items?: FormItemConfig[]
  formProps?: ComponentProps
  rowProps?: ComponentProps
  fieldTypes?: FieldTypeRegistry
  hintOptions?: ConfigFormHintOptions
  disabled?: boolean
  readonly?: boolean
}>(), {
  model: () => ({}),
  items: () => [],
  formProps: () => ({}),
  rowProps: () => ({ gutter: 16 }),
  fieldTypes: () => ({}),
  hintOptions: () => ({ mode: 'title', field: false, tooltipProps: {} }),
  disabled: false,
  readonly: false
})

const emit = defineEmits<{
  (event: 'update:model', model: FormModel): void
  (event: 'field-change', payload: ConfigFormFieldChangePayload): void
  (event: 'form-validate', prop: string, valid: boolean, message: string | null): void
}>()

const slots = useSlots()
const formRef = ref<any>(null)
const model = computed(() => props.model)
const allItems = computed(() => props.items)

if (import.meta.env.DEV) {
  const warnedDiagnostics = new Set<string>()
  watchEffect(() => {
    collectSchemaDiagnostics(props.fieldTypes, allItems.value).forEach(diagnostic => {
      if (warnedDiagnostics.has(diagnostic.key)) return
      warnedDiagnostics.add(diagnostic.key)
      console.warn(diagnostic.message)
    })
  })
}

function cloneValue(value: ConfigFormValue): ConfigFormValue {
  if (value instanceof Date) return new Date(value.getTime())
  if (Array.isArray(value)) return value.map(cloneValue)
  if (value !== null && typeof value === 'object') {
    return Object.keys(value).reduce<Record<string, unknown>>((result, key) => {
      result[key] = cloneValue(value[key])
      return result
    }, {})
  }
  return value
}

// 与 Element Form 一致，以组件创建时的 model 作为 resetFields 初始值。
const initialModel = cloneValue(props.model) as FormModel

function resolveItem(fieldKey: string) {
  return allItems.value.find(item => item.fieldKey === fieldKey)
}

const controlledUpdate = useControlledFormUpdate({
  getModel: () => props.model,
  resolveItem,
  emitUpdate: nextModel => emit('update:model', nextModel),
  emitFieldChange: payload => emit('field-change', payload)
})

function getRenderContext(item: FormItemConfig): ConfigFormFieldRenderContext {
  return {
    get model() { return controlledUpdate.getCurrentModel() },
    fieldKey: item.fieldKey,
    get value() { return getValueByPath(controlledUpdate.getCurrentModel(), item.fieldKey) },
    itemConfig: item
  }
}

function setValue(item: FormItemConfig, value: ConfigFormValue) {
  controlledUpdate.setFieldValue(item.fieldKey, value, item)
}

function updateModel(item: FormItemConfig, patch: Record<string, ConfigFormValue>) {
  controlledUpdate.updateModel(patch, item)
}

function getBindingValue(item: FormItemConfig) {
  return item.binding
    ? resolveBindingValue(controlledUpdate.getCurrentModel(), item.binding)
    : getValueByPath(controlledUpdate.getCurrentModel(), item.fieldKey)
}

function setBindingValue(item: FormItemConfig, value: ConfigFormValue) {
  if (item.binding) updateModel(item, createBindingPatch(item.binding, value))
  else setValue(item, value)
}

function getModelInputHandler(item: FormItemConfig) {
  return (value: ConfigFormValue) => setBindingValue(item, value)
}

function getFieldContext(item: FormItemConfig): ConfigFormFieldContext {
  const renderContext = getRenderContext(item)
  return Object.assign(renderContext, {
    get bindingValue() { return getBindingValue(item) },
    setValue: (value: ConfigFormValue) => setValue(item, value),
    setBindingValue: (value: ConfigFormValue) => setBindingValue(item, value),
    updateModel: (patch: Record<string, ConfigFormValue>) => updateModel(item, patch)
  })
}

function isVisible(item: FormItemConfig) {
  return resolveDynamic(item.visible, getRenderContext(item)) !== false
}

function getColProps(item: FormItemConfig) {
  return { span: 24, ...(resolveDynamic(item.colProps, getRenderContext(item)) || {}) }
}

function getFormItemProps(item: FormItemConfig) {
  return resolveDynamic(item.formItemProps, getRenderContext(item)) || {}
}

function getInteractionProps(item: FormItemConfig) {
  const context = getRenderContext(item)
  const itemDisabled = resolveDynamic(item.disabled, context) === true
  const itemReadonly = resolveDynamic(item.readonly, context) === true
  if (!props.disabled && !props.readonly && !itemDisabled && !itemReadonly) return {}
  return { disabled: true, readonly: props.readonly || itemReadonly }
}

function getHint(item: FormItemConfig): string | null {
  if (props.hintOptions.mode === false) return null
  const context = getRenderContext(item)
  const configured = resolveDynamic(item.hint, context)
  if (configured === false) return null
  if (typeof configured === 'string' && configured !== '') return configured

  const defaultHint = props.hintOptions.field
  if (!defaultHint) return null
  const content = typeof defaultHint === 'function'
    ? defaultHint(context)
    : context.value == null || context.value === '' ? null : String(context.value)
  return typeof content === 'string' && content !== '' ? content : null
}

function getResolvedComponent(item: FormItemConfig) {
  return resolveFieldComponent(
    item.type,
    item.component,
    props.fieldTypes,
    getRenderContext(item),
    getFieldContext(item),
    getInteractionProps(item)
  )
}

function getSlot(name?: string) {
  return name ? slots[name] : undefined
}

function getFieldSlot(item: FormItemConfig) {
  return item.component?.slot ? getSlot(item.component.slot) : undefined
}

function getFormItemSlotContext(item: FormItemConfig) {
  return { ...getFieldContext(item), propPath: item.fieldKey }
}

function getErrorSlotContext(item: FormItemConfig, error: string) {
  return { ...getFormItemSlotContext(item), error }
}

function getSlotContext(item: FormItemConfig) {
  return { ...getFormItemSlotContext(item), component: getResolvedComponent(item) }
}

function handleValidate(prop: string, valid: boolean, message: string | null) {
  emit('form-validate', prop, valid, message)
}

async function validate(callback?: (valid: boolean, fields?: ConfigFormValue) => void) {
  try {
    const valid = Boolean(await formRef.value?.validate())
    callback?.(valid)
    return valid
  } catch (fields) {
    callback?.(false, fields)
    return false
  }
}

defineExpose({
  validate,
  validateField: (fieldProps: string | string[], callback?: (message: string) => void) => (
    formRef.value?.validateField(fieldProps, callback)
  ),
  resetFields: () => {
    controlledUpdate.replaceModel(cloneValue(initialModel) as FormModel)
    nextTick(() => formRef.value?.clearValidate())
  },
  clearValidate: (fieldProps?: string | string[]) => formRef.value?.clearValidate(fieldProps),
  getFieldValue: (fieldKey: string) => getValueByPath(controlledUpdate.getCurrentModel(), fieldKey),
  setFieldValue: (fieldKey: string, value: ConfigFormValue) => (
    controlledUpdate.setFieldValue(fieldKey, value, resolveItem(fieldKey))
  ),
  setFieldsValue: (patch: Record<string, ConfigFormValue>) => controlledUpdate.updateModel(patch),
  getModel: () => controlledUpdate.getCurrentModel(),
  getFormRef: () => formRef.value
})
</script>

<style lang="less" scoped>
.config-form {
  :deep(.config-form__hint-target) {
    display: block;
    min-width: 0;
  }

  :deep(.el-form-item) {
    min-width: 0;
  }
}
</style>
