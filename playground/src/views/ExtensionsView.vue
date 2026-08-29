<template>
  <section class="demo-page">
    <h1>扩展、Slot 与复合字段</h1>
    <p>展示注册字段 type、具名 Slot，以及 binding.map 的双向拆装。</p>
    <div class="demo-card">
      <ConfigForm v-model="model" :items="items" :field-types="fieldTypes" :form-props="{ labelWidth: '110px' }">
        <template #summary="{ model: currentModel }">
          <el-alert :closable="false" :title="`${currentModel.project} / ${currentModel.amount} 元`" type="success" />
        </template>
      </ConfigForm>
    </div>
    <pre class="model-preview">{{ model }}</pre>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import ConfigForm, { defineConfigFormType, defineConfigFormTypes, defineFormItems } from '@itagan/config-form'
import MoneyInput from '../components/MoneyInput.vue'
import TimeRangeEditor from '../components/TimeRangeEditor.vue'

export default defineComponent({
  components: { ConfigForm },
  setup() {
    const model = ref({ project: 'ConfigForm', amount: 1200, start: '09:00', end: '18:00', summary: '' })
    const money = defineConfigFormType()<{ currency: string }>({ is: MoneyInput, props: { currency: 'CNY' } })
    const fieldTypes = defineConfigFormTypes()({ money })
    const items = defineFormItems<Record<string, any>, typeof fieldTypes>([
      { fieldKey: 'project', type: 'input', colProps: { span: 12 }, formItemProps: { label: '项目' } },
      { fieldKey: 'amount', type: 'money', colProps: { span: 12 }, formItemProps: { label: '金额' }, component: { props: { currency: 'CNY' } } },
      {
        fieldKey: 'start', type: 'component', colProps: { span: 24 }, formItemProps: { label: '工作时段' },
        component: { is: TimeRangeEditor },
        binding: { map: [{ fieldPath: 'start', valuePath: 'start' }, { fieldPath: 'end', valuePath: 'end' }] }
      },
      { fieldKey: 'summary', type: 'slot', colProps: { span: 24 }, formItemProps: { label: '摘要' }, component: { slot: 'summary' } }
    ])
    return { model, items, fieldTypes }
  }
})
</script>
