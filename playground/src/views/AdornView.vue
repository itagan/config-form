<template>
  <section class="demo-page">
    <h1>字段左右插槽（评估）</h1>
    <p>
      leftSlot / rightSlot 与主内容同行：宽度由 flex 分配，主内容占据剩余空间；
      Tooltip 锚点仍指向输入框，focusField 不会被装饰内容抢焦点。
    </p>
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
          <el-button
            class="adorn-button"
            type="plain"
            size="mini"
            icon="el-icon-search"
            @click="search"
          >检索</el-button>
        </template>
        <template #statusSuffix>
          <el-link type="primary" :underline="false" @click="explain">口径说明</el-link>
        </template>
        <template #append>
          <div class="actions">
            <el-button type="primary" size="small" @click="jumpToKeyword">聚焦关键词（验证不被装饰抢焦点）</el-button>
            <el-button size="small" @click="reset">重置</el-button>
          </div>
        </template>
      </ConfigForm>
    </div>
    <p class="demo-tip">
      Try：悬停"项目金额"输入框，Tooltip 应指向输入框而非"万元"装饰；点"聚焦关键词"，焦点应落在输入框而非左侧"检索"按钮。
    </p>
    <DemoCollapsiblePanel class="demo-card" title="字段配置">
      <pre>{{ configCode }}</pre>
    </DemoCollapsiblePanel>
    <DemoCollapsiblePanel class="demo-card" title="当前数据">
      <pre>{{ JSON.stringify(formModel, null, 2) }}</pre>
    </DemoCollapsiblePanel>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { Message } from 'element-ui'
import ConfigForm, { defineFormItems } from '@itagan/config-form'
import DemoCollapsiblePanel from '../components/DemoCollapsiblePanel.vue'
import { formatConfigFormConfig } from '../utils/formatConfigFormConfig'

export default defineComponent({
  components: { ConfigForm, DemoCollapsiblePanel },
  setup() {
    const formRef = ref<any>(null)
    const formModel = ref({
      project: '年度盘点',
      amount: 1200,
      keyword: '',
      status: 'audited'
    })
    const items = defineFormItems([
      // 对照：无装饰字段，布局应与装饰字段对齐
      { fieldKey: 'project', type: 'input', colProps: { span: 24 }, formItemProps: { label: '项目名称' } },
      {
        fieldKey: 'amount',
        type: 'number',
        colProps: { span: 24 },
        leftSlot: 'amountPrefix',
        rightSlot: 'amountSuffix',
        hint: '不含税金额，单位万元',
        formItemProps: { label: '项目金额' },
        component: { props: { min: 0 } }
      },
      {
        fieldKey: 'keyword',
        type: 'input',
        colProps: { span: 24 },
        leftSlot: 'searchPrefix',
        hint: '支持模糊匹配',
        formItemProps: { label: '关键词' },
        component: { props: { placeholder: '输入后点左侧检索', clearable: true } }
      },
      {
        fieldKey: 'status',
        type: 'select',
        colProps: { span: 24 },
        rightSlot: 'statusSuffix',
        hint: '订单当前流转状态',
        formItemProps: { label: '状态' },
        component: {
          props: { placeholder: '请选择', clearable: true },
          options: [
            { label: '已审核', value: 'audited' },
            { label: '待审核', value: 'pending' }
          ]
        }
      }
    ])

    function search() {
      Message.success(`检索：${formModel.value.keyword || '(空)'}`)
    }

    function explain() {
      Message.info('状态口径：以审批系统为准')
    }

    async function jumpToKeyword() {
      const focused = await formRef.value?.focusField('keyword')
      Message[focused ? 'success' : 'warning'](focused ? '焦点已落在输入框' : '未找到可聚焦元素')
    }

    function reset() {
      formRef.value?.resetFields()
    }

        const configCode = formatConfigFormConfig(items)
    return { formRef, formModel, items, configCode, search, explain, jumpToKeyword, reset }
  }
})
</script>

<style scoped>
.actions { padding-left: 110px; }
.adorn-note { color: #909399; font-size: 13px; }
.adorn-button { padding: 7px 10px; }
.demo-tip { color: #909399; font-size: 13px; }
</style>
