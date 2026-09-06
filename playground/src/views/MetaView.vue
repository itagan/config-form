<template>
  <section class="demo-page">
    <header>
      <router-link class="back-link" to="/">← 返回</router-link>
      <h1>业务元数据 meta</h1>
      <p>
        <code>meta</code> 是字段配置上的业务元数据挂载点：ConfigForm 不读取、不校验，只随 <code>context.itemConfig</code> 原样透出。组件只声明普通 Props，不感知 meta 的存在。
      </p>
    </header>
    <div class="demo-card">
      <div class="controls">
        <span>权限模拟（finance:invoice:view）：</span>
        <el-switch v-model="hasInvoicePermission" />
        <span class="gap">同一 MoneyInput 组件，靠 meta.currency 复用出人民币与美元两个字段。</span>
      </div>
      <ConfigForm v-model="model" :items="items" :form-props="{ labelWidth: '96px', size: 'small' }" />
    </div>
    <DemoCollapsiblePanel class="demo-card" title="字段配置" :default-open="true">
      <pre>{{ configCode }}</pre>
    </DemoCollapsiblePanel>
    <DemoCollapsiblePanel class="demo-card" title="当前数据">
      <pre>{{ JSON.stringify(model, null, 2) }}</pre>
    </DemoCollapsiblePanel>
    <div class="demo-card">
      <div class="log-header">
        <span>埋点上报（listeners 读取 meta.trackId）</span>
        <el-button size="mini" @click="trackLogs = []">清空日志</el-button>
      </div>
      <ul class="track-log">
        <li v-for="(entry, index) in trackLogs" :key="index">{{ entry }}</li>
        <li v-if="trackLogs.length === 0" class="log-empty">修改「费用类别」或「审批人」后失焦触发 change 上报。</li>
      </ul>
    </div>
    <p class="demo-tip">
      Try：切换权限开关观察「发票抬头」按 meta.permissionCode 显隐；查看字段配置中各字段挂载的 meta 数据。
    </p>
  </section>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'
import ConfigForm, { defineConfigFormItems } from '@itagan/config-form'
import DemoCollapsiblePanel from '../components/DemoCollapsiblePanel.vue'
import MoneyInput from '../components/MoneyInput.vue'
import { formatConfigFormConfig } from '../utils/formatConfigFormConfig'

interface FieldMeta {
  currency?: string
  dictKey?: string
  permissionCode?: string
  trackId?: string
}

// 业务侧在读取处把 Record<string, unknown> 收敛为自己的 meta 类型
const readMeta = (itemConfig: { meta?: Record<string, unknown> }): FieldMeta =>
  (itemConfig.meta ?? {}) as FieldMeta

// 模拟页面加载完成的字典数据；真实场景来自接口
const dictionaries: Record<string, Array<{ label: string; value: string }>> = {
  expense_category: [
    { label: '差旅费', value: 'travel' },
    { label: '会议费', value: 'meeting' },
    { label: '招待费', value: 'entertainment' }
  ]
}

export default defineComponent({
  components: { ConfigForm, DemoCollapsiblePanel },
  setup() {
    const hasInvoicePermission = ref(true)
    const trackLogs = ref<string[]>([])
    const model = ref({
      budgetAmount: 1200000,
      expenseType: 'travel',
      invoiceTitle: '杭州示例科技有限公司',
      approver: '王芳',
      bonusAmount: 5000
    })

    const report = (trackId: string, fieldKey: string, value: unknown) => {
      trackLogs.value.unshift(`report(${trackId}) ← ${fieldKey} = ${JSON.stringify(value ?? null)}`)
    }

    // 拥有的权限码集合；真实场景来自登录态
    const permissionCodes = computed(() => (
      hasInvoicePermission.value ? new Set(['finance:invoice:view']) : new Set<string>()
    ))
    const hasPermission = (code?: string) => !code || permissionCodes.value.has(code)

    const items = defineConfigFormItems([
      {
        fieldKey: 'budgetAmount',
        type: 'component',
        colProps: { span: 12 },
        formItemProps: { label: '预算金额' },
        component: {
          is: MoneyInput,
          // meta.currency 在 props 函数里转成组件 Props
          props: context => ({ currency: readMeta(context.itemConfig).currency ?? 'CNY' })
        },
        meta: { currency: 'CNY' }
      },
      {
        fieldKey: 'bonusAmount',
        type: 'component',
        colProps: { span: 12 },
        formItemProps: { label: '外币额度' },
        component: {
          is: MoneyInput,
          props: context => ({ currency: readMeta(context.itemConfig).currency ?? 'CNY' })
        },
        meta: { currency: 'USD' }
      },
      {
        fieldKey: 'expenseType',
        type: 'select',
        colProps: { span: 12 },
        formItemProps: { label: '费用类别' },
        component: {
          // meta.dictKey 只描述用哪个字典，选项数据由页面加载后传入
          options: context => dictionaries[readMeta(context.itemConfig).dictKey ?? ''] ?? [],
          listeners: {
            change(context, value) {
              const { trackId } = readMeta(context.itemConfig)
              if (trackId) report(trackId, context.fieldKey, value)
            }
          }
        },
        meta: { dictKey: 'expense_category', trackId: 'expense_type_change' }
      },
      {
        fieldKey: 'approver',
        type: 'input',
        colProps: { span: 12 },
        formItemProps: { label: '审批人' },
        component: {
          listeners: {
            change(context, value) {
              const { trackId } = readMeta(context.itemConfig)
              if (trackId) report(trackId, context.fieldKey, value)
            }
          }
        },
        meta: { trackId: 'approver_change' }
      },
      {
        fieldKey: 'invoiceTitle',
        type: 'input',
        colProps: { span: 24 },
        formItemProps: { label: '发票抬头' },
        // meta.permissionCode 驱动显隐；visible 与组件解析拿到同一份渲染上下文
        visible: context => hasPermission(readMeta(context.itemConfig).permissionCode),
        meta: { permissionCode: 'finance:invoice:view' }
      }
    ])

    const configCode = formatConfigFormConfig(items)

    return { model, items, configCode, hasInvoicePermission, trackLogs }
  }
})
</script>

<style scoped>
.controls {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  color: #606266;
  font-size: 13px;
}

.gap { color: #909399; }

.log-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  color: #303133;
}

.track-log {
  max-height: 180px;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  list-style: none;
}

.track-log li {
  padding: 6px 0;
  border-bottom: 1px dashed #ebeef5;
  font-size: 13px;
  color: #606266;
}

.log-empty { color: #909399; border-bottom: 0 !important; }

.demo-tip { color: #909399; font-size: 13px; }
</style>
