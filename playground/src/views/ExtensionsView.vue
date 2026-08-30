<template>
  <section class="demo-page">
    <header>
      <router-link class="back-link" to="/">← 返回</router-link>
      <h1>扩展、Slot 与复合字段</h1>
      <p>展示注册字段 type、具名 Slot，以及 binding.map 的双向拆装。</p>
    </header>
    <div class="demo-card">
      <ConfigForm v-model="model" :items="items" :field-types="fieldTypes" :form-props="{ labelWidth: '110px' }">
        <template #summary="{ model: currentModel }">
          <el-alert :closable="false" :title="`${currentModel.project} / ${currentModel.amount} 元`" type="success" />
        </template>
      </ConfigForm>
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
import { createConfigForm, defineConfigFormItems, defineConfigFormType, defineConfigFormTypes } from '@itagan/config-form'
import DemoCollapsiblePanel from '../components/DemoCollapsiblePanel.vue'
import { formatConfigFormConfig } from '../utils/formatConfigFormConfig'
import MoneyInput from '../components/MoneyInput.vue'
import TimeRangeEditor from '../components/TimeRangeEditor.vue'

const money = defineConfigFormType()<{ currency: string }>({ is: MoneyInput, props: { currency: 'CNY' } })
const fieldTypes = defineConfigFormTypes()({ money })
const ConfigForm = createConfigForm<Record<string, any>, typeof fieldTypes>()

export default defineComponent({
  components: { ConfigForm, DemoCollapsiblePanel },
  setup() {
    const model = ref({ project: 'ConfigForm', amount: 1200, start: '09:00', end: '18:00', summary: '' })
    const items = defineConfigFormItems<Record<string, any>, typeof fieldTypes>([
      { fieldKey: 'project', type: 'input', colProps: { span: 12 }, formItemProps: { label: '项目' } },
      { fieldKey: 'amount', type: 'money', colProps: { span: 12 }, formItemProps: { label: '金额' }, component: { props: { currency: 'CNY' } } },
      {
        fieldKey: 'start', type: 'component', colProps: { span: 24 }, formItemProps: { label: '工作时段' },
        component: { is: TimeRangeEditor },
        binding: { map: [{ fieldPath: 'start', valuePath: 'start' }, { fieldPath: 'end', valuePath: 'end' }] }
      },
      { fieldKey: 'summary', type: 'slot', colProps: { span: 24 }, formItemProps: { label: '摘要' }, component: { slot: 'summary' } }
    ])
        const configCode = formatConfigFormConfig(items)
return { model, items, fieldTypes, configCode }
  }
})
</script>
