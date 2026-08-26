<template>
  <section class="demo-page">
    <h1>选项与字段映射</h1>
    <p>Select、Radio 和 Checkbox 使用同一套 options/optionProps 配置。</p>
    <div class="demo-card">
      <ConfigForm v-model="model" :items="items" :form-props="{ labelWidth: '110px' }" />
    </div>
    <pre class="model-preview">{{ model }}</pre>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import ConfigForm, { defineFormItems } from '@itagan/config-form'

const businessOptions = [
  { text: '研发', code: 'rd', locked: false },
  { text: '设计', code: 'design', locked: false },
  { text: '归档', code: 'archived', locked: true }
]
const optionProps = { label: 'text', value: 'code', disabled: 'locked' }

export default defineComponent({
  components: { ConfigForm },
  setup() {
    const model = ref({ department: 'rd', role: 'design', permissions: ['rd'] })
    const items = defineFormItems([
      { fieldKey: 'department', type: 'select', colProps: { span: 12 }, formItemProps: { label: '部门' }, component: { options: businessOptions, optionProps } },
      { fieldKey: 'role', type: 'radio', colProps: { span: 12 }, formItemProps: { label: '角色' }, component: { options: businessOptions, optionProps } },
      { fieldKey: 'permissions', type: 'checkbox', colProps: { span: 24 }, formItemProps: { label: '权限' }, component: { options: businessOptions, optionProps } }
    ])
    return { model, items }
  }
})
</script>
