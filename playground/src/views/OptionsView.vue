<template>
  <section class="demo-page">
    <header>
      <router-link class="back-link" to="/">← 返回</router-link>
      <h1>选项与字段映射</h1>
      <p>Select、Radio 和 Checkbox 使用同一套 options/optionProps 配置。</p>
    </header>
    <div class="demo-card">
      <ConfigForm v-model="model" :items="items" :form-props="{ labelWidth: '110px' }" />
    </div>
    <DemoCollapsiblePanel class="demo-card" title="字段配置">
      <pre>{{ configCode }}</pre>
    </DemoCollapsiblePanel>
    <DemoCollapsiblePanel class="demo-card" title="当前数据">
      <pre>{{ JSON.stringify(model, null, 2) }}</pre>
    </DemoCollapsiblePanel>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import ConfigForm, { defineConfigFormItems } from '@itagan/config-form'
import DemoCollapsiblePanel from '../components/DemoCollapsiblePanel.vue'
import { formatConfigFormConfig } from '../utils/formatConfigFormConfig'

const businessOptions = [
  { text: '研发', code: 'rd', locked: false },
  { text: '设计', code: 'design', locked: false },
  { text: '归档', code: 'archived', locked: true }
]
const optionProps = { label: 'text', value: 'code', disabled: 'locked' }

export default defineComponent({
  components: { ConfigForm, DemoCollapsiblePanel },
  setup() {
    const model = ref({ department: 'rd', role: 'design', permissions: ['rd'] })
    const items = defineConfigFormItems([
      { fieldKey: 'department', type: 'select', colProps: { span: 12 }, formItemProps: { label: '部门' }, component: { options: businessOptions, optionProps } },
      { fieldKey: 'role', type: 'radio', colProps: { span: 12 }, formItemProps: { label: '角色' }, component: { options: businessOptions, optionProps } },
      { fieldKey: 'permissions', type: 'checkbox', colProps: { span: 24 }, formItemProps: { label: '权限' }, component: { options: businessOptions, optionProps } }
    ])
        const configCode = formatConfigFormConfig(items)
return { model, items, configCode }
  }
})
</script>
