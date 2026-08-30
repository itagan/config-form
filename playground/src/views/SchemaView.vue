<template>
  <section class="demo-page">
    <h1>JSON Schema 驱动</h1>
    <p>
      items 来自可序列化 JSON（模拟远程下发）：内置 type 直接渲染，组件目标由客户端注册表在运行时绑定；
      labelSlot / errorSlot 演示自定义标签与错误渲染。
    </p>
    <div class="controls">
      <span>切换下发的 Schema：</span>
      <el-radio-group v-model="schemaName" size="small">
        <el-radio label="feedback">满意度反馈</el-radio>
        <el-radio label="worklog">工作登记</el-radio>
      </el-radio-group>
    </div>
    <div class="demo-card">
      <ConfigForm
        ref="formRef"
        v-model="formModel"
        :items="items"
        :form-props="{ labelWidth: '110px', size: 'small' }"
      >
        <template #scoreLabel="{ propPath }">
          <span>综合评分（{{ propPath }}）</span>
        </template>
        <template #scoreError="{ error }">
          <span class="score-error">★ {{ error }}，请先评分再提交</span>
        </template>
      </ConfigForm>
    </div>
    <p class="demo-tip">Try：反馈表里不给评分直接看自定义错误文案；切换 Schema 观察字段与 model 的整体替换。</p>
    <DemoCollapsiblePanel class="demo-card" title="字段配置">
      <pre>{{ configCode }}</pre>
    </DemoCollapsiblePanel>
    <DemoCollapsiblePanel class="demo-card" title="当前数据">
      <pre>{{ JSON.stringify(formModel, null, 2) }}</pre>
    </DemoCollapsiblePanel>
  </section>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue'
import ConfigForm from '@itagan/config-form'
import DemoCollapsiblePanel from '../components/DemoCollapsiblePanel.vue'
import { formatConfigFormConfig } from '../utils/formatConfigFormConfig'
import MoneyInput from '../components/MoneyInput.vue'

// 远程 JSON 不包含任何函数：组件目标用 meta.component 声明，由客户端注册表绑定。
const remoteSchemas = {
  feedback: JSON.stringify([
    {
      fieldKey: 'name', type: 'input', colProps: { span: 12 },
      formItemProps: { label: '姓名', rules: [{ required: true, message: '请输入姓名', trigger: 'blur' }] }
    },
    {
      fieldKey: 'channel', type: 'radio', colProps: { span: 12 }, formItemProps: { label: '渠道' },
      component: { options: [{ label: '线上', value: 'online' }, { label: '线下', value: 'offline' }] }
    },
    {
      key: 'score', fieldKey: 'score', type: 'rate', colProps: { span: 12 },
      labelSlot: 'scoreLabel', errorSlot: 'scoreError',
      formItemProps: { label: '综合评分', rules: [{ required: true, message: '尚未评分', trigger: 'change' }] },
      component: { props: { max: 5 } }
    },
    {
      fieldKey: 'comment', type: 'input', colProps: { span: 24 },
      formItemProps: { label: '补充说明' },
      component: { props: { type: 'textarea', rows: 2 } }
    }
  ]),
  worklog: JSON.stringify([
    {
      fieldKey: 'title', type: 'input', colProps: { span: 12 },
      formItemProps: { label: '工作项', rules: [{ required: true, message: '请输入工作项', trigger: 'blur' }] }
    },
    {
      fieldKey: 'project', type: 'select', colProps: { span: 12 }, formItemProps: { label: '所属项目' },
      component: {
        props: { placeholder: '请选择' },
        options: [{ label: 'ConfigForm', value: 'config-form' }, { label: 'FormTable', value: 'form-table' }]
      }
    },
    { fieldKey: 'start', type: 'time-select', colProps: { span: 12 }, formItemProps: { label: '开始时间' } },
    { fieldKey: 'end', type: 'time', colProps: { span: 12 }, formItemProps: { label: '结束时间' }, component: { props: { valueFormat: 'HH:mm:ss' } } },
    { fieldKey: 'intensity', type: 'slider', colProps: { span: 12 }, formItemProps: { label: '投入度 (%)' }, component: { props: { min: 0, max: 100 } } },
    { fieldKey: 'expect', type: 'date', colProps: { span: 12 }, formItemProps: { label: '预计交付' }, component: { props: { valueFormat: 'yyyy-MM-dd' } } },
    {
      fieldKey: 'category', type: 'cascader', colProps: { span: 12 }, formItemProps: { label: '归类' },
      component: {
        props: {
          options: [
            { value: 'dev', label: '研发', children: [{ value: 'fe', label: '前端' }, { value: 'be', label: '后端' }] },
            { value: 'qa', label: '质量', children: [{ value: 'automation', label: '自动化' }] }
          ]
        }
      }
    },
    { fieldKey: 'favColor', type: 'color', colProps: { span: 12 }, formItemProps: { label: '标记颜色' } },
    {
      fieldKey: 'budget', type: 'component', colProps: { span: 12 },
      meta: { component: 'money' },
      component: {},
      formItemProps: { label: '项目预算' }
    }
  ])
}

const schemaDefaults: Record<string, Record<string, any>> = {
  feedback: { name: '', channel: 'online', score: null, comment: '' },
  worklog: { title: '', project: '', start: '', end: '', intensity: 50, expect: '', category: [], favColor: '', budget: 0 }
}

const componentRegistry: Record<string, unknown> = { money: MoneyInput }

export default defineComponent({
  components: { ConfigForm, DemoCollapsiblePanel },
  setup() {
    const formRef = ref<any>(null)
    const schemaName = ref<'feedback' | 'worklog'>('feedback')
    const formModel = ref<Record<string, any>>({ ...schemaDefaults.feedback })

    // 解析远程 JSON 后，把 meta.component 指向的客户端组件注入 resolveComponent；
    // 内置 type 不需要这一步，因此整套 schema 仍然保持可序列化。
    const items = computed(() => JSON.parse(remoteSchemas[schemaName.value]).map((item: any) => (
      item.type === 'component'
        ? {
            ...item,
            component: {
              ...item.component,
              resolveComponent: ({ itemConfig }: any) => componentRegistry[itemConfig.meta?.component]
            }
          }
        : item
    )))

    // 切换 Schema 后整体替换 model，并清除上一套字段残留的校验状态。
    watch(schemaName, name => {
      formModel.value = { ...schemaDefaults[name] }
      formRef.value?.clearValidate()
    })

        const configCode = computed(() => formatConfigFormConfig(items.value))
return { formRef, schemaName, formModel, items, configCode }
  }
})
</script>

<style scoped>
.controls { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; color: #606266; }
.score-error { color: #f56c6c; font-size: 12px; }
.demo-tip { color: #909399; font-size: 13px; }
</style>
