<template>
  <section class="demo-page">
    <header>
      <router-link class="back-link" to="/">← 返回</router-link>
      <h1>基础、校验与动态联动</h1>
      <p>单个 el-row 配合字段级 el-col；企业名称根据类型动态显示。</p>
    </header>
    <div class="demo-card">
      <ConfigForm
        ref="formRef"
        v-model="formModel"
        :items="items"
        :form-props="{ labelWidth: '96px', size: 'small' }"
        :hint-options="{ mode: 'tooltip' }"
        @field-change="lastChange = $event"
      >
        <template #actions>
          <span />
        </template>
        <template #default>
          <div class="actions">
            <el-button type="primary" size="small" @click="submit">校验</el-button>
            <el-button size="small" @click="reset">重置</el-button>
          </div>
        </template>
      </ConfigForm>
    </div>
    <DemoCollapsiblePanel class="demo-card" title="字段配置">
      <pre>{{ configCode }}</pre>
    </DemoCollapsiblePanel>
    <DemoCollapsiblePanel class="demo-card" title="当前数据">
      <pre>{{ JSON.stringify(formModel, null, 2) }}</pre>
    </DemoCollapsiblePanel>
    <p v-if="lastChange">最近变化：{{ lastChange.fieldKey }}</p>
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
    const formModel = ref({
      name: '',
      type: 'personal',
      birthday: '',
      enabled: true,
      company: ''
    })
    const lastChange = ref<any>(null)
    const items = defineConfigFormItems([
      {
        fieldKey: 'name',
        type: 'input',
        colProps: { span: 12 },
        formItemProps: {
          label: '姓名',
          rules: [{ required: true, message: '请输入姓名', trigger: 'blur' }]
        },
        component: { props: { placeholder: '请输入姓名', clearable: true } },
        hint: '姓名将用于业务单据展示'
      },
      {
        fieldKey: 'type',
        type: 'select',
        colProps: { span: 12 },
        formItemProps: { label: '类型' },
        component: {
          props: { placeholder: '请选择' },
          options: [
            { label: '个人', value: 'personal' },
            { label: '企业', value: 'company' }
          ]
        }
      },
      {
        fieldKey: 'company',
        type: 'input',
        colProps: { span: 12 },
        visible: ({ model }) => model.type === 'company',
        formItemProps: { label: '企业名称' }
      },
      {
        fieldKey: 'birthday',
        type: 'date',
        colProps: { span: 12 },
        formItemProps: { label: '生日' },
        component: { props: { valueFormat: 'yyyy-MM-dd' } }
      },
      {
        fieldKey: 'enabled',
        type: 'switch',
        colProps: { span: 12 },
        formItemProps: { label: '启用' }
      }
    ])
    const submit = async () => {
      const valid = await formRef.value?.validate()
      if (valid) Message.success('校验通过')
    }
    const reset = () => formRef.value?.resetFields()
        const configCode = formatConfigFormConfig(items)
return { formRef, formModel, items, lastChange, configCode, submit, reset }
  }
})
</script>
