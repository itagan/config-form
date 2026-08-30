# 详情与只读模式

<PlaygroundLink route="/readonly" />

ConfigForm 没有根级 `readonly` / `disabled` Props——详情态由业务层用透传和字段配置组合表达。编辑和详情共用同一份 Schema 时，全局禁用通过 `formProps.disabled` 透传，由 Element Form 原生下沉到全部字段组件：

```vue
<el-switch v-model="disabled" active-text="详情态" inactive-text="编辑" />

<ConfigForm
  v-model="model"
  :items="items"
  :form-props="formProps"
  :hint-options="{ mode: 'title', field: true }"
/>
```

```ts
const disabled = ref(true)
const formProps = computed(() => ({ labelWidth: '100px', disabled: disabled.value }))

const items = defineFormItems([
  {
    fieldKey: 'code',
    type: 'text',
    colProps: { span: 12 },
    formItemProps: { label: '编号' }
  },
  {
    fieldKey: 'owner',
    type: 'input',
    colProps: { span: 12 },
    formItemProps: { label: '负责人' }
  },
  {
    fieldKey: 'remark',
    type: 'input',
    colProps: { span: 24 },
    readonly: ({ model }) => model.status === 'enabled',
    formItemProps: { label: '备注' }
  }
])
```

## 选型建议

- `formProps.disabled`：整表禁用，Element Form 原生下沉，适合"详情态不可编辑"的交互锁定。
- `type: 'text'`：始终以纯文本展示，适合编号、状态快照等无需编辑的字段。
- 字段级动态 `readonly` / `disabled`：只锁定部分字段，例如审批后锁定备注（见示例中的备注字段）。
- `disabled` 只表达禁止交互，不表达"这是详情"的语义；详情页的展示形态由业务决定。

## 边界

- `el-form` 的原生 `disabled` 不影响表单外的按钮；提交按钮的可用性由业务根据同一状态控制。
- Slot 字段完全由业务模板渲染，ConfigForm 不会自动禁用 Slot 内部控件，需要自行遵循禁用状态。
- `hintOptions.field: true` 与详情态组合良好：把非空字段值字符串化为原生 title 提示。
