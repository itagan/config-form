<template>
  <section class="demo-page">
    <header>
      <router-link class="back-link" to="/">← 返回</router-link>
      <h1>字段组件事件与原生事件</h1>
      <p>
        <code>listeners</code> 监听组件 $emit 的业务事件，<code>nativeListeners</code> 监听组件根节点的 DOM 事件；两者首参都是字段上下文，可直接 setValue / updateModel。
      </p>
    </header>
    <div class="demo-card">
      <ConfigForm v-model="model" :items="items" :form-props="{ labelWidth: '96px', size: 'small' }" />
      <p class="demo-tip">
        Try：点击只读的合同编号或状态文本打开详情弹窗；在审批意见里按 Enter、点清除按钮，再让负责人失焦观察事件日志。
      </p>
    </div>
    <div class="demo-card">
      <div class="log-header">
        <span>事件日志（nativeListeners / listeners / model）</span>
        <el-button size="mini" @click="eventLogs = []">清空日志</el-button>
      </div>
      <ul class="event-log">
        <li v-for="(entry, index) in eventLogs" :key="index">
          <el-tag size="mini" :type="entry.tagType">{{ entry.source }}</el-tag>
          <strong>{{ entry.field }}</strong>
          <span>{{ entry.message }}</span>
        </li>
        <li v-if="eventLogs.length === 0" class="log-empty">暂无事件，操作上方表单试试。</li>
      </ul>
    </div>
    <DemoCollapsiblePanel class="demo-card" title="字段配置" :default-open="true">
      <pre>{{ configCode }}</pre>
    </DemoCollapsiblePanel>
    <DemoCollapsiblePanel class="demo-card" title="当前数据">
      <pre>{{ JSON.stringify(model, null, 2) }}</pre>
    </DemoCollapsiblePanel>

    <el-dialog title="合同详情" :visible.sync="detailVisible" width="420px">
      <p v-if="detail">{{ detail }}</p>
      <p class="demo-tip">弹窗由 nativeListeners.click 打开：监听的是组件根节点 DOM 事件，不依赖组件内部实现。</p>
    </el-dialog>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import ConfigForm, { defineConfigFormItems } from '@itagan/config-form'
import DemoCollapsiblePanel from '../components/DemoCollapsiblePanel.vue'
import { formatConfigFormConfig } from '../utils/formatConfigFormConfig'

interface EventLogEntry {
  source: 'nativeListeners' | 'listeners'
  field: string
  message: string
  tagType: 'primary' | 'success'
}

const detailDescriptions: Record<string, string> = {
  'HT-2026-0815': '合同 HT-2026-0815：华东区年度框架协议，有效期至 2026-12-31，归档于法务系统。',
  已归档: '状态流转：草稿 → 审批中 → 已归档；当前节点由 OA 系统维护，ConfigForm 只负责展示。'
}

export default defineComponent({
  components: { ConfigForm, DemoCollapsiblePanel },
  setup() {
    const model = ref({
      contractNo: 'HT-2026-0815',
      owner: '李雷  ',
      status: '已归档',
      comment: ''
    })
    const eventLogs = ref<EventLogEntry[]>([])
    const detailVisible = ref(false)
    const detail = ref('')

    const appendLog = (entry: EventLogEntry) => {
      eventLogs.value.unshift(entry)
    }

    const openDetail = (field: string, value: string) => {
      detail.value = detailDescriptions[value] || `字段 ${field} 当前值：${value || '（空）'}`
      detailVisible.value = true
    }

    const items = defineConfigFormItems([
      {
        fieldKey: 'contractNo',
        type: 'input',
        colProps: { span: 12 },
        formItemProps: { label: '合同编号' },
        component: {
          props: { readonly: true, placeholder: '点击查看详情' },
          nativeListeners: {
            // 只读 el-input 的典型场景：根节点 DOM click 打开详情
            click(context, event) {
              event.stopPropagation()
              appendLog({
                source: 'nativeListeners',
                field: 'contractNo',
                message: '根节点 click → 打开详情弹窗',
                tagType: 'primary'
              })
              openDetail(context.fieldKey, String(context.value))
            }
          }
        }
      },
      {
        fieldKey: 'owner',
        type: 'input',
        colProps: { span: 12 },
        formItemProps: { label: '负责人' },
        component: {
          // el-input 主动 $emit blur：属于 listeners 的职责
          listeners: {
            blur(context) {
              const trimmed = String(context.value).trim()
              if (trimmed === context.value) return
              context.setValue(trimmed)
              appendLog({
                source: 'listeners',
                field: 'owner',
                message: '$emit blur → setValue 去除首尾空格',
                tagType: 'success'
              })
            }
          }
        }
      },
      {
        fieldKey: 'status',
        type: 'text',
        colProps: { span: 12 },
        formItemProps: { label: '状态' },
        component: {
          props: { class: 'clickable-text' },
          // type: 'text' 渲染原生 span，nativeListeners 会转成普通 DOM listener
          nativeListeners: {
            click(context) {
              appendLog({
                source: 'nativeListeners',
                field: 'status',
                message: 'span click → 打开详情弹窗',
                tagType: 'primary'
              })
              openDetail(context.fieldKey, String(context.value))
            }
          }
        }
      },
      {
        fieldKey: 'comment',
        type: 'input',
        colProps: { span: 24 },
        formItemProps: { label: '审批意见' },
        component: {
          props: { clearable: true, placeholder: '按 Enter 提交意见，或点右侧清除' },
          // 同一字段可以同时配置两类监听：keydown 来自根节点 DOM，clear 来自组件 $emit
          nativeListeners: {
            keydown(context, event) {
              if (event.key !== 'Enter') return
              appendLog({
                source: 'nativeListeners',
                field: 'comment',
                message: '根节点 keydown.enter（内部 input 冒泡）',
                tagType: 'primary'
              })
            }
          },
          listeners: {
            clear(context) {
              appendLog({
                source: 'listeners',
                field: context.fieldKey,
                message: '$emit clear → 记录一次清空操作',
                tagType: 'success'
              })
            }
          }
        }
      }
    ])

    const configCode = formatConfigFormConfig(items)

    return { model, items, eventLogs, configCode, detailVisible, detail }
  }
})
</script>

<style>
.clickable-text { color: #409eff; cursor: pointer; text-decoration: underline; }
</style>

<style scoped>
.log-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  color: #303133;
}

.event-log {
  max-height: 220px;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  list-style: none;
}

.event-log li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px dashed #ebeef5;
  font-size: 13px;
  color: #606266;
}

.event-log li strong { flex: none; }

.log-empty { color: #909399; border-bottom: 0 !important; }

.demo-tip { margin: 12px 0 0; color: #909399; font-size: 13px; }
</style>
