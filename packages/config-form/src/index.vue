<template>
  <el-form
    ref="formRef"
    class="config-form"
    v-bind="formProps"
    :model="model"
    data-config-form-root=""
    @validate="handleValidate"
    @keydown.native="handleNavigationKeydown"
  >
    <el-row v-bind="rowProps">
      <ConfigFormItem
        v-for="item in items"
        :key="item.key || item.fieldKey"
        :item="item"
        :field-types="fieldTypes"
        :hint-options="hintOptions"
        :root-slots="rootSlots"
        :update-api="controlledUpdate"
      />
    </el-row>
    <slot :model="model" />
    <ConfigFormHintTooltip
      v-if="hintTooltipEnabled"
      :container="hintContainer"
      :tooltip-props="hintOptions.tooltipProps"
    />
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
import { computed, nextTick, onMounted, reactive, ref, shallowRef, useSlots, watchEffect } from 'vue'
import ConfigFormItem from './ConfigFormItem.vue'
import ConfigFormHintTooltip from './ConfigFormHintTooltip.vue'
import type {
  ComponentProps,
  ConfigFormFieldChangePayload,
  ConfigFormElementFormRef,
  ConfigFormValue,
  ConfigFormHintOptions,
  ConfigFormNavigationOptions,
  FieldTypeRegistry,
  FormItemConfig,
  FormModel
} from './types'
import { useConfigFormFieldLocator } from './composables/useConfigFormFieldLocator'
import { useConfigFormKeyboardNavigation } from './composables/useConfigFormKeyboardNavigation'
import { useControlledFormUpdate } from './composables/useControlledFormUpdate'
import { cloneFormModel } from './utils/modelSnapshot'
import { collectSchemaDiagnostics } from './utils/schemaDiagnostics'

const props = withDefaults(defineProps<{
  model: FormModel
  items?: FormItemConfig[]
  formProps?: ComponentProps
  rowProps?: ComponentProps
  fieldTypes?: FieldTypeRegistry
  hintOptions?: ConfigFormHintOptions
  navigationOptions?: ConfigFormNavigationOptions
}>(), {
  model: () => ({}),
  items: () => [],
  formProps: () => ({}),
  rowProps: () => ({ gutter: 16 }),
  fieldTypes: () => ({}),
  hintOptions: () => ({ mode: 'title', field: false, tooltipProps: {} })
})

const emit = defineEmits<{
  (event: 'update:model', model: FormModel): void
  (event: 'field-change', payload: ConfigFormFieldChangePayload): void
  (event: 'form-validate', prop: string, valid: boolean, message: string | null): void
}>()

const rootSlots = reactive(useSlots())
const formRef = ref<ConfigFormElementFormRef | null>(null)
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

// 与 Element Form 一致，以组件创建时的 model 作为 resetFields 初始值。
const initialModel = cloneFormModel(props.model)

const controlledUpdate = useControlledFormUpdate({
  getModel: () => props.model,
  emitUpdate: nextModel => emit('update:model', nextModel),
  emitFieldChange: payload => emit('field-change', payload)
})

const fieldLocator = useConfigFormFieldLocator({
  getContainer: () => formRef.value?.$el as HTMLElement | null,
  getForm: () => formRef.value
})

const { handleNavigationKeydown } = useConfigFormKeyboardNavigation({
  getOptions: () => props.navigationOptions,
  getMountedFields: fieldLocator.getMountedFields,
  focusElement: fieldLocator.focusElement
})

const hintTooltipEnabled = computed(() => props.hintOptions.mode === 'tooltip')
const hintContainer = shallowRef<HTMLElement | null>(null)

onMounted(() => {
  hintContainer.value = formRef.value?.$el as HTMLElement | null
})

function handleValidate(prop: string, valid: boolean, message: string | null) {
  emit('form-validate', prop, valid, message)
}

async function validate(callback?: (valid: boolean, fields?: ConfigFormValue) => void) {
  try {
    const valid = Boolean(await formRef.value?.validate?.())
    callback?.(valid)
    return valid
  } catch (fields) {
    callback?.(false, fields)
    return false
  }
}

function validateField(fieldProps: string | string[], callback?: (message: string) => void) {
  return fieldLocator.validateField(fieldProps, callback)
}

defineExpose({
  validate,
  validateField,
  resetFields: () => {
    controlledUpdate.replaceModel(cloneFormModel(initialModel))
    nextTick(() => formRef.value?.clearValidate?.())
  },
  clearValidate: (fieldProps?: string | string[]) => formRef.value?.clearValidate?.(fieldProps),
  getFormRef: () => formRef.value,
  focusField: fieldLocator.focusField,
  scrollToFirstError: fieldLocator.scrollToFirstError
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
