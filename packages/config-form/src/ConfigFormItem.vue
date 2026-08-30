<template>
  <el-col
    v-if="presentation.visible.value"
    v-bind="presentation.colProps.value"
  >
    <el-form-item
      v-bind="presentation.formItemProps.value"
      :prop="item.fieldKey"
      :data-config-form-field-prop="item.fieldKey"
      :data-config-form-hint="presentation.delegatedHint.value"
      :data-config-form-hint-trigger="presentation.hintTrigger.value"
      :data-config-form-hint-field="item.fieldKey"
    >
      <template v-if="presentation.getSlot(item.labelSlot)" v-slot:label>
        <SlotRenderer
          :slot-fn="presentation.getSlot(item.labelSlot)"
          :slot-props="formItemSlotContext"
        />
      </template>

      <template v-if="presentation.getSlot(item.errorSlot)" v-slot:error="{ error }">
        <SlotRenderer
          :slot-fn="presentation.getSlot(item.errorSlot)"
          :slot-props="{ ...formItemSlotContext, error }"
        />
      </template>

      <div
        v-if="presentation.hasSideSlots.value"
        class="config-form__field-row"
      >
        <span
          v-if="presentation.getSlot(item.leftSlot)"
          class="config-form__field-row-side"
        >
          <SlotRenderer
            :slot-fn="presentation.getSlot(item.leftSlot)"
            :slot-props="formItemSlotContext"
          />
        </span>
        <span class="config-form__field-row-main">
          <ConfigFormFieldContent v-bind="fieldContentProps" />
        </span>
        <span
          v-if="presentation.getSlot(item.rightSlot)"
          class="config-form__field-row-side"
        >
          <SlotRenderer
            :slot-fn="presentation.getSlot(item.rightSlot)"
            :slot-props="formItemSlotContext"
          />
        </span>
      </div>
      <ConfigFormFieldContent v-else v-bind="fieldContentProps" />
    </el-form-item>
  </el-col>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import ConfigFormFieldContent from './ConfigFormFieldContent.vue'
import SlotRenderer from './SlotRenderer'
import { useConfigFormFieldPresentation } from './composables/useConfigFormFieldPresentation'
import type {
  ConfigFormHintOptions,
  FieldTypeRegistry,
  FormItemConfig
} from './types'
import type { ConfigFormRootSlots, ConfigFormUpdateApi } from './types/internal'

const props = defineProps<{
  item: FormItemConfig
  fieldTypes: FieldTypeRegistry
  hintOptions: ConfigFormHintOptions
  rootSlots: ConfigFormRootSlots
  updateApi: ConfigFormUpdateApi
}>()

const presentation = useConfigFormFieldPresentation({
  getItem: () => props.item,
  getFieldTypes: () => props.fieldTypes,
  getHintOptions: () => props.hintOptions,
  getRootSlots: () => props.rootSlots,
  updateApi: props.updateApi
})

const formItemSlotContext = computed(() => ({
  ...presentation.fieldContext,
  propPath: props.item.fieldKey
}))

const fieldContentProps = computed(() => ({
  item: props.item,
  hint: presentation.hint.value || undefined,
  hintMode: props.hintOptions.mode,
  tooltipProps: props.hintOptions.tooltipProps,
  fieldSlot: props.item.component?.slot
    ? presentation.getSlot(props.item.component.slot)
    : undefined,
  slotContext: {
    ...formItemSlotContext.value,
    component: presentation.resolvedComponent.value
  },
  bindingValue: presentation.bindingValue.value,
  resolvedComponent: presentation.resolvedComponent.value,
  renderContext: presentation.renderContext,
  onModelInput: presentation.setBindingValue
}))
</script>
