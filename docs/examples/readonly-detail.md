# 详情与只读模式

<PlaygroundLink route="/readonly" />

编辑和详情共用同一份 Schema 时，可在根级切换 `readonly`：

```vue
<el-switch v-model="readonly" active-text="只读" inactive-text="编辑" />

<ConfigForm
  v-model="model"
  :items="items"
  :readonly="readonly"
  :form-props="{ labelWidth: '100px' }"
  :hint-options="{ mode: 'title', field: true }"
/>
```

```ts
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
    fieldKey: 'status',
    type: 'select',
    colProps: { span: 12 },
    formItemProps: { label: '状态' },
    component: {
      options: [
        { label: '启用', value: 'enabled' },
        { label: '停用', value: 'disabled' }
      ]
    }
  }
])
```

## 选型建议

- `readonly`：保留原组件形态，但统一下沉 `disabled: true` 与 `readonly: true`。
- `disabled`：只禁止交互，不表达详情语义。
- `type: 'text'`：始终以纯文本展示，适合编号、状态快照等无需编辑的字段。
- 动态 `item.readonly`：只锁定部分字段，例如审批后锁定金额。

Slot 字段完全由业务模板渲染，ConfigForm 不会自动禁用 Slot 内部控件。需要共用详情模式时，可把 `readonly` 放入业务 model、闭包状态或 Slot 组件 Props 中显式处理。
