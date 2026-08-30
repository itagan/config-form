<template>
  <section class="demo-page">
    <h1>提示与 Tooltip 单例</h1>
    <p>
      tooltip 模式下整个表单只挂载一个单例 Tooltip，通过事件委托展示：悬停或键盘焦点进入字段时出现，Escape 可临时关闭。
    </p>
    <div class="demo-card">
      <div class="controls">
        <span>展示方式：</span>
        <el-radio-group v-model="mode" size="small">
          <el-radio label="title">title</el-radio>
          <el-radio label="tooltip">tooltip</el-radio>
        </el-radio-group>
        <span class="gap">触发区域（仅 tooltip）：</span>
        <el-radio-group v-model="hintTrigger" size="small" :disabled="mode !== 'tooltip'">
          <el-radio label="item">整个 FormItem</el-radio>
          <el-radio label="content">仅内容</el-radio>
        </el-radio-group>
      </div>
      <ConfigForm
        v-model="formModel"
        :items="items"
        :form-props="{ labelWidth: '96px', size: 'small', disabled: true }"
        :hint-options="hintOptions"
      />
    </div>
    <DemoCollapsiblePanel class="demo-card" title="字段配置">
      <pre>{{ configCode }}</pre>
    </DemoCollapsiblePanel>
    <DemoCollapsiblePanel class="demo-card" title="当前数据">
      <pre>{{ JSON.stringify(formModel, null, 2) }}</pre>
    </DemoCollapsiblePanel>
    <p class="demo-tip">
      Try：切到 tooltip 后悬停标签区域和输入框对比触发范围；用 Tab 进入字段体验键盘可达性（aria-describedby）。
    </p>
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
    const mode = ref<'title' | 'tooltip'>('tooltip')
    const hintTrigger = ref<'item' | 'content'>('item')
    const formModel = ref({
      orderNo: 'SO-20260829-001',
      customer: '杭州示例科技有限公司',
      contact: '李雷',
      phone: '13800000000',
      delivery: '2026-09-15',
      warehouse: '华东一号仓',
      freight: '120.00',
      status: '已审核'
    })
    const items = defineFormItems([
      { fieldKey: 'orderNo', type: 'input', colProps: { span: 12 }, formItemProps: { label: '订单号' }, hint: '业务系统生成的唯一单号，不可修改' },
      { fieldKey: 'customer', type: 'input', colProps: { span: 12 }, formItemProps: { label: '客户' }, hint: '客户全称与档案系统一致' },
      { fieldKey: 'contact', type: 'input', colProps: { span: 12 }, formItemProps: { label: '联系人' }, hint: false },
      { fieldKey: 'phone', type: 'input', colProps: { span: 12 }, formItemProps: { label: '联系电话' }, hint: '手机号或座机，座机需含区号' },
      { fieldKey: 'delivery', type: 'date', colProps: { span: 12 }, formItemProps: { label: '交付日期' }, hint: '预计发货日期，可提前不可延后' },
      { fieldKey: 'warehouse', type: 'select', colProps: { span: 12 }, formItemProps: { label: '仓库' }, component: { options: [{ label: '华东一号仓', value: 'east-1' }, { label: '华南二号仓', value: 'south-2' }] }, hint: '按收货地址自动推荐' },
      { fieldKey: 'freight', type: 'input', colProps: { span: 12 }, formItemProps: { label: '运费' }, hint: '含税金额，单位元' },
      { fieldKey: 'status', type: 'input', colProps: { span: 12 }, formItemProps: { label: '状态' }, hint: '订单当前流转状态' }
    ])
    const hintOptions = computed(() => ({
      mode: mode.value,
      hintTrigger: mode.value === 'tooltip' ? hintTrigger.value : undefined
    }))

        const configCode = formatConfigFormConfig(items)
    return { mode, hintTrigger, formModel, items, hintOptions, configCode }
  }
})
</script>

<style scoped>
.controls { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; color: #606266; }
.gap { margin-left: 16px; }
.demo-tip { color: #909399; font-size: 13px; }
</style>
