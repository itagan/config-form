<template>
  <section class="demo-page">
    <header>
      <router-link class="back-link" to="/">← 返回</router-link>
      <h1>校验聚焦与键盘导航</h1>
      <p>
        长表单中直接按 Enter 跳到下一个字段（Shift+Enter 返回）；提交失败时自动滚动并聚焦第一个报错字段；也可以用按钮程序化跳转。
      </p>
    </header>
    <div class="demo-card">
      <ConfigForm
        ref="formRef"
        v-model="formModel"
        :items="items"
        :form-props="{ labelWidth: '96px', size: 'small' }"
        :navigation-options="{ enabled: true }"
        :hint-options="{ mode: 'title' }"
      >
        <template #append>
          <div class="actions">
            <el-button type="primary" size="small" @click="submit">校验并提交</el-button>
            <el-button size="small" @click="jumpToRemark">跳转到备注</el-button>
            <el-button size="small" @click="reset">重置</el-button>
          </div>
        </template>
      </ConfigForm>
    </div>
    <p class="demo-tip">
      Try：在任意输入框按 Enter / Shift+Enter 连续录入；清空姓名或手机号后点击“校验并提交”。
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
      name: '',
      phone: '',
      email: '',
      city: '',
      address: '',
      channel: 'offline',
      budget: 0,
      remark: ''
    })
    const items = defineFormItems([
      {
        fieldKey: 'name',
        type: 'input',
        colProps: { span: 12 },
        formItemProps: {
          label: '姓名',
          rules: [{ required: true, message: '请输入姓名', trigger: 'blur' }]
        },
        hint: '必填，Enter 可跳到下一项'
      },
      {
        fieldKey: 'phone',
        type: 'input',
        colProps: { span: 12 },
        formItemProps: {
          label: '手机号',
          rules: [{ required: true, message: '请输入手机号', trigger: 'blur' }]
        }
      },
      { fieldKey: 'email', type: 'input', colProps: { span: 12 }, formItemProps: { label: '邮箱' } },
      {
        fieldKey: 'city',
        type: 'select',
        colProps: { span: 12 },
        formItemProps: { label: '城市' },
        component: {
          props: { placeholder: '请选择', clearable: true },
          options: [
            { label: '杭州', value: 'hangzhou' },
            { label: '上海', value: 'shanghai' },
            { label: '深圳', value: 'shenzhen' }
          ]
        }
      },
      { fieldKey: 'address', type: 'input', colProps: { span: 24 }, formItemProps: { label: '地址' } },
      {
        fieldKey: 'channel',
        type: 'radio',
        colProps: { span: 12 },
        formItemProps: { label: '来源' },
        component: {
          options: [
            { label: '线上', value: 'online' },
            { label: '线下', value: 'offline' }
          ]
        }
      },
      { fieldKey: 'budget', type: 'number', colProps: { span: 12 }, formItemProps: { label: '预算' } },
      {
        fieldKey: 'remark',
        type: 'input',
        colProps: { span: 24 },
        formItemProps: { label: '备注' },
        component: {
          props: { type: 'textarea', rows: 2, placeholder: 'textarea 中 Enter 会换行，不参与导航' }
        }
      }
    ])

    async function submit() {
      const valid = await formRef.value?.validate()
      if (!valid) {
        await formRef.value?.scrollToFirstError()
        Message.warning('请检查第一个报错字段')
        return
      }
      Message.success('校验通过')
    }

    async function jumpToRemark() {
      await formRef.value?.focusField('remark')
    }

    function reset() {
      formRef.value?.resetFields()
    }

        const configCode = formatConfigFormConfig(items)
return { formRef, formModel, items, configCode, submit, jumpToRemark, reset }
  }
})
</script>

<style scoped>
.actions { padding-left: 96px; }
.demo-tip { color: #909399; font-size: 13px; }
</style>
