<template>
  <el-tooltip
    ref="tooltipRef"
    v-bind="resolvedProps"
    :content="content"
    :enterable="false"
  />
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import type { ComponentProps } from './types'
import { useConfigFormHintTooltip } from './composables/useConfigFormHintTooltip'
import type { ConfigFormHintTooltipRef } from './composables/useConfigFormHintTooltip'
import { resolveHintTooltipProps } from './utils/hintTooltipRuntime'

const props = defineProps<{
  container?: HTMLElement | null
  tooltipProps?: ComponentProps
}>()

const containerRef = computed(() => props.container || null)
const tooltipRef = ref<ConfigFormHintTooltipRef | null>(null)
const content = ref('')
const resolvedProps = computed(() => resolveHintTooltipProps(props.tooltipProps || {}))

useConfigFormHintTooltip({
  containerRef,
  tooltipRef,
  content
})
</script>
