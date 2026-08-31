<template>
  <section class="demo-page">
    <header>
      <router-link class="back-link" to="/">← 返回</router-link>
      <h1>字段左右 Slot</h1>
      <p>leftSlot / rightSlot 与主字段同行；主字段占据剩余宽度，聚焦和 Tooltip 定位仍以字段内容为准。</p>
    </header>
    <div class="demo-card">
      <ConfigForm
        ref="formRef"
        v-model="formModel"
        :items="items"
        :form-props="{ labelWidth: '110px', size: 'small' }"
        :hint-options="{ mode: 'tooltip' }"
      >
        <template #amountPrefix>
          <span class="adorn-note">￥</span>
        </template>
        <template #amountSuffix>
          <span class="adorn-note">万元</span>
        </template>
        <template #searchPrefix>
          <el-button size="mini" icon="el-icon-search" @click="search">检索</el-button>
        </template>
        <template #statusSuffix>
          <el-link type="primary" :underline="false" @click="explain">口径说明</el-link>
        </template>
        <template #default>
          <div class="actions">
            <el-button type="primary" size="small" @click="jumpToKeyword">聚焦关键词</el-button>
            <el-button size="small" @click="reset">重置</el-button>
          </div>
        </template>
      </ConfigForm>
    </div>
    <p class="demo-tip">悬停金额输入框可检查 Tooltip 锚点；“聚焦关键词”会跳过左侧检索按钮。</p>
    <DemoCollapsiblePanel class="demo-card" title="字段配置">
      <pre>{{ configCode }}</pre>
    </DemoCollapsiblePanel>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { Message } from 'element-ui'
import ConfigForm, { defineConfigFormItems } from '@itagan/config-form'
import DemoCollapsiblePanel from '../components/DemoCollapsiblePanel.vue'
import { formatConfigFormConfig } from '../utils/formatConfigFormConfig'

export default defineComponent({
  components: { ConfigForm, DemoCollapsiblePanel },
  setup() {
    const formRef = ref<any>(null)
    const formModel = ref({ project: '年度盘点', amount: 1200, keyword: '', status: 'audited' })
    const items = defineConfigFormItems([
      { fieldKey: 'project', type: 'input', formItemProps: { label: '项目名称' } },
      {
        fieldKey: 'amount', type: 'number', leftSlot: 'amountPrefix', rightSlot: 'amountSuffix',
        hint: '不含税金额，单位万元', hintTrigger: 'content',
        formItemProps: { label: '项目金额' }, component: { props: { min: 0 } }
      },
      {
        fieldKey: 'keyword', type: 'input', leftSlot: 'searchPrefix', hint: '支持模糊匹配',
        formItemProps: { label: '关键词' },
        component: { props: { placeholder: '输入后点左侧检索', clearable: true } }
      },
      {
        fieldKey: 'status', type: 'select', rightSlot: 'statusSuffix',
        formItemProps: { label: '状态' },
        component: { options: [{ label: '已审核', value: 'audited' }, { label: '待审核', value: 'pending' }] }
      }
    ])

    const search = () => Message.success(`检索：${formModel.value.keyword || '(空)'}`)
    const explain = () => Message.info('状态口径：以审批系统为准')
    const jumpToKeyword = async () => {
      const focused = await formRef.value?.focusField('keyword')
      Message[focused ? 'success' : 'warning'](focused ? '焦点已落在输入框' : '未找到可聚焦元素')
    }
    const reset = () => formRef.value?.resetFields()
    const configCode = formatConfigFormConfig(items)

    return { formRef, formModel, items, configCode, search, explain, jumpToKeyword, reset }
  }
})
</script>

<style scoped>
.actions { padding-left: 110px; }
.adorn-note { color: #909399; font-size: 13px; }
.demo-tip { color: #909399; font-size: 13px; }
</style>
