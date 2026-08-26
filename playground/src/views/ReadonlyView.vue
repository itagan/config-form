<template>
  <section class="demo-page">
    <h1>详情与只读模式</h1>
    <p>readonly 会统一下沉到字段组件，text 类型用于纯展示。</p>
    <el-switch v-model="readonly" active-text="只读" inactive-text="编辑" class="mode-switch" />
    <div class="demo-card">
      <ConfigForm v-model="model" :items="items" :readonly="readonly" :form-props="{ labelWidth: '100px' }" :hint-options="{ mode: 'title', field: true }" />
    </div>
    <pre class="model-preview">{{ model }}</pre>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import ConfigForm, { defineFormItems } from '@itagan/config-form'
export default defineComponent({
  components: { ConfigForm },
  setup() {
    const readonly = ref(true)
    const model = ref({ code: 'CF-2026-001', owner: 'Ada', status: 'enabled' })
    const items = defineFormItems([
      { fieldKey: 'code', type: 'text', colProps: { span: 12 }, formItemProps: { label: '编号' } },
      { fieldKey: 'owner', type: 'input', colProps: { span: 12 }, formItemProps: { label: '负责人' } },
      { fieldKey: 'status', type: 'select', colProps: { span: 12 }, formItemProps: { label: '状态' }, component: { options: [{ label: '启用', value: 'enabled' }, { label: '停用', value: 'disabled' }] } }
    ])
    return { readonly, model, items }
  }
})
</script>

<style scoped>.mode-switch { margin-bottom: 18px; }</style>
