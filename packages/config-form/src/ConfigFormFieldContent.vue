<template>
  <ConfigFormHint
    :content="hint"
    :mode="hintMode"
    :tooltip-props="tooltipProps"
  >
    <SlotRenderer
      v-if="item.type === 'slot' && fieldSlot"
      :slot-fn="fieldSlot"
      :slot-props="slotContext"
    />
    <span v-else-if="item.type === 'slot'" />
    <FieldRenderer
      v-else
      :type="item.type"
      :value="bindingValue"
      :component="resolvedComponent"
      :model-context="renderContext"
      :on-model-input="onModelInput"
    />
  </ConfigFormHint>
</template>

<script lang="ts" setup>
import type { PropType } from 'vue'
import ConfigFormHint from './ConfigFormHint'
import FieldRenderer from './FieldRenderer'
import SlotRenderer from './SlotRenderer'
import type {
  ComponentProps,
  ConfigFormFieldRenderContext,
  ConfigFormHintMode,
  ConfigFormValue,
  FormItemConfig,
  ResolvedComponentConfig
} from './types'
import type { ConfigFormSlot } from './types/internal'

defineProps({
  item: { type: Object as PropType<FormItemConfig>, required: true },
  hint: { type: String, default: undefined },
  hintMode: { type: [String, Boolean] as PropType<ConfigFormHintMode>, default: 'title' },
  tooltipProps: { type: Object as PropType<ComponentProps>, default: () => ({}) },
  fieldSlot: { type: Function as PropType<ConfigFormSlot>, default: undefined },
  slotContext: { type: Object as PropType<Record<string, unknown>>, required: true },
  bindingValue: { default: undefined as ConfigFormValue },
  resolvedComponent: { type: Object as PropType<ResolvedComponentConfig>, required: true },
  renderContext: { type: Object as PropType<ConfigFormFieldRenderContext>, required: true },
  onModelInput: {
    type: Function as PropType<(value: ConfigFormValue) => void>,
    required: true
  }
})
</script>
