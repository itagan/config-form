<template>
  <div class="range-editor">
    <el-time-select :value="value.start" :picker-options="pickerOptions" @input="update('start', $event)" />
    <span>至</span>
    <el-time-select :value="value.end" :picker-options="pickerOptions" @input="update('end', $event)" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'TimeRangeEditor',
  props: { value: { type: Object, default: () => ({ start: '', end: '' }) } },
  setup(props, { emit }) {
    const pickerOptions = { start: '08:00', step: '00:30', end: '22:00' }
    const update = (key: string, value: string) => emit('input', { ...props.value, [key]: value })
    return { pickerOptions, update }
  }
})
</script>

<style scoped>.range-editor { display: flex; align-items: center; gap: 10px; }</style>
