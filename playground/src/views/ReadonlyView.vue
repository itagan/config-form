<template>
  <section class="demo-page">
    <h1>详情与只读模式</h1>
    <p>
      全局禁用通过 formProps.disabled 透传给 el-form，由 Element 原生下沉到全部字段组件；
      text 类型用于纯展示，部分锁定用字段级 readonly 动态配置。
    </p>
    <el-switch v-model="disabled" active-text="详情态" inactive-text="编辑" class="mode-switch" />
    <div class="demo-card">
      <ConfigForm v-model="model" :items="items" :form-props="formProps" :hint-options="{ mode: 'title', field: true }" />
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
import { computed, defineComponent, ref } from 'vue'
import ConfigForm, { defineFormItems } from '@itagan/config-form'
import DemoCollapsiblePanel from '../components/DemoCollapsiblePanel.vue'
import { formatConfigFormConfig } from '../utils/formatConfigFormConfig'
export default defineComponent({
  components: { ConfigForm, DemoCollapsiblePanel },
  setup() {
    const disabled = ref(true)
    const model = ref({ code: 'CF-2026-001', owner: 'Ada', status: 'enabled', remark: '季度例检记录' })
    const formProps = computed(() => ({ labelWidth: '100px', disabled: disabled.value }))
    const items = defineFormItems([
      { fieldKey: 'code', type: 'text', colProps: { span: 12 }, formItemProps: { label: '编号' } },
      { fieldKey: 'owner', type: 'input', colProps: { span: 12 }, formItemProps: { label: '负责人' } },
      { fieldKey: 'status', type: 'select', colProps: { span: 12 }, formItemProps: { label: '状态' }, component: { options: [{ label: '启用', value: 'enabled' }, { label: '停用', value: 'disabled' }] } },
      {
        fieldKey: 'remark',
        type: 'input',
        colProps: { span: 24 },
        readonly: ({ model }) => model.status === 'enabled',
        formItemProps: { label: '备注' }
      }
    ])
        const configCode = formatConfigFormConfig(items)
return { disabled, formProps, model, items, configCode }
  }
})
</script>

<style scoped>.mode-switch { margin-bottom: 18px; }</style>
