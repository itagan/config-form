<template>
  <section class="demo-page">
    <header>
      <router-link class="back-link" to="/">← 返回</router-link>
      <h1>动态字段与增删</h1>
      <p>items 由 computed 派生：标签行走数组路径 fieldKey 并携带稳定 key，嵌套对象用点路径寻址；批量写回走受控事务。</p>
    </header>
    <div class="demo-card">
      <TaskConfigForm
        ref="formRef"
        v-model="formModel"
        :items="items"
        :form-props="{ labelWidth: '96px', size: 'small' }"
        @field-change="lastChange = $event"
      >
        <template #append>
          <div class="actions">
            <el-button type="primary" size="small" @click="fillDefaults">一键填充默认值</el-button>
            <el-button size="small" @click="reset">重置</el-button>
          </div>
        </template>
      </TaskConfigForm>
    </div>
    <div class="tag-manager">
      <el-tag
        v-for="(tag, index) in formModel.tags"
        :key="tag"
        closable
        @close="removeTag(index)"
      >{{ tag }}</el-tag>
      <el-button size="mini" icon="el-icon-plus" @click="addTag">添加标签</el-button>
    </div>
    <p v-if="lastChange" class="demo-tip">
      最近变化：{{ lastChange.fieldKey }}（{{ lastChange.previousValue }} → {{ lastChange.value }}）
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
import { computed, defineComponent, ref } from 'vue'
import { Message } from 'element-ui'
import { createConfigForm, defineFormItems } from '@itagan/config-form'
import type { FormItemConfig } from '@itagan/config-form'
import DemoCollapsiblePanel from '../components/DemoCollapsiblePanel.vue'
import { formatConfigFormConfig } from '../utils/formatConfigFormConfig'

interface TaskModel {
  title: string
  priority: 'normal' | 'high'
  budget: number
  discount: number
  tags: string[]
  owner: { name: string, phone: string }
}

const TaskConfigForm = createConfigForm<TaskModel>()

export default defineComponent({
  components: { TaskConfigForm, DemoCollapsiblePanel },
  setup() {
    const formRef = ref<any>(null)
    const formModel = ref<TaskModel>({
      title: '',
      priority: 'normal',
      budget: 0,
      discount: 100,
      tags: ['文档', '回归'],
      owner: { name: '', phone: '' }
    })
    const lastChange = ref<any>(null)
    let tagSeq = 0

    // items 跟随 tags 派生：key 基于标签内容而非下标，删除中间项时其余字段实例身份不变。
    const items = computed(() => defineFormItems<TaskModel>([
      {
        fieldKey: 'title',
        type: 'input',
        colProps: { span: 12 },
        formItemProps: { label: '任务名', rules: [{ required: true, message: '请输入任务名', trigger: 'blur' }] }
      },
      {
        fieldKey: 'priority',
        type: 'radio',
        colProps: { span: 12 },
        formItemProps: { label: '优先级' },
        component: {
          options: [
            { label: '普通', value: 'normal' },
            { label: '加急', value: 'high' }
          ]
        }
      },
      {
        fieldKey: 'budget',
        type: 'number',
        colProps: { span: 12 },
        visible: ({ model }) => model.priority === 'high',
        formItemProps: { label: '预算' }
      },
      {
        fieldKey: 'discount',
        type: 'slider',
        colProps: { span: 12 },
        visible: ({ model }) => model.priority === 'high',
        disabled: ({ model }) => model.budget <= 0,
        formItemProps: { label: '折扣 (%)' },
        component: { props: { min: 50, max: 100 } }
      },
      ...formModel.value.tags.map((tag, index): FormItemConfig<TaskModel> => ({
        key: `tag-${tag}`,
        fieldKey: `tags.${index}`,
        type: 'input',
        colProps: { span: 12 },
        formItemProps: { label: `标签：${tag}` }
      })),
      { fieldKey: 'owner.name', type: 'input', colProps: { span: 12 }, formItemProps: { label: '负责人' } },
      { fieldKey: 'owner.phone', type: 'input', colProps: { span: 12 }, formItemProps: { label: '联系电话' } }
    ]))

    function addTag() {
      tagSeq += 1
      const next = `${tagSeq > 1 ? `补充${tagSeq}` : '补充'}`
      formModel.value = {
        ...formModel.value,
        tags: [...formModel.value.tags, next]
      }
    }

    function removeTag(index: number) {
      formModel.value = {
        ...formModel.value,
        tags: formModel.value.tags.filter((_, current) => current !== index)
      }
    }

    // 一次事务更新多个路径；每个实际变化的路径都会各触发一次 field-change。
    function fillDefaults() {
      formRef.value?.setFieldsValue({
        title: '季度巡检',
        'owner.name': 'Ada',
        'owner.phone': '13800000000'
      })
      Message.success('已批量写入 3 个路径')
    }

    function reset() {
      formRef.value?.resetFields()
    }

        const configCode = computed(() => formatConfigFormConfig(items.value))
return { formRef, formModel, items, lastChange, configCode, addTag, removeTag, fillDefaults, reset }
  }
})
</script>

<style scoped>
.actions { padding-left: 96px; }
.tag-manager { margin-top: 16px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.demo-tip { color: #909399; font-size: 13px; }
</style>
