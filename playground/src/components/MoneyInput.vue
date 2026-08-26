<template>
  <el-input :value="value" :disabled="disabled" @input="$emit('input', Number($event) || 0)">
    <template #prepend>{{ currency }}</template>
  </el-input>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'MoneyInput',
  props: {
    value: { type: Number, default: 0 },
    currency: { type: String, default: 'CNY' },
    disabled: Boolean
  }
})
</script>
