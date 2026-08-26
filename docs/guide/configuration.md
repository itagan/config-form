# 配置总览

ConfigForm 固定渲染一个 `el-form` 和一个 `el-row`，每个可见字段对应一个 `el-col` 与 `el-form-item`。

```ts
const items = defineFormItems([
  { fieldKey: 'name', type: 'input', colProps: { span: 12 } },
  { fieldKey: 'phone', type: 'input', colProps: { span: 12 } },
  { fieldKey: 'address', type: 'input', colProps: { span: 24 } }
])
```

根级属性：

- `model`：受控表单数据。
- `items`：字段配置数组。
- `formProps`：透传给 `el-form`，但 model 由 ConfigForm 管理。
- `rowProps`：透传给唯一的 `el-row`。
- `fieldTypes`：当前实例的业务字段类型注册表。
- `hintOptions`：字段提示策略。
- `disabled`、`readonly`：全局交互状态。

内置 type 包括 input、select、date、time、time-select、number、switch、radio、checkbox、text、rate、slider、color、cascader 和 autocomplete。
