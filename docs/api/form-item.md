# FormItem API

```ts
interface FormItemConfig<TModel extends FormModel = FormModel> {
  key?: string
  fieldKey: string
  type: FormItemType
  binding?: FieldBindingConfig
  meta?: Record<string, unknown>
  labelSlot?: string
  errorSlot?: string
  visible?: DynamicValue<boolean, ConfigFormFieldRenderContext<TModel>>
  disabled?: DynamicValue<boolean, ConfigFormFieldRenderContext<TModel>>
  readonly?: DynamicValue<boolean, ConfigFormFieldRenderContext<TModel>>
  hint?: DynamicValue<string | false | null | undefined, ConfigFormFieldRenderContext<TModel>>
  colProps?: DynamicValue<object, ConfigFormFieldRenderContext<TModel>>
  formItemProps?: DynamicValue<object, ConfigFormFieldRenderContext<TModel>>
  component?: FieldComponentConfig<TModel>
}
```

## 属性

| 属性 | 必填 | 说明 |
| --- | --- | --- |
| `fieldKey` | 是 | model 字段路径，支持 `profile.city`、`items[0].name` |
| `type` | 是 | [内置 type](/api/builtin-types)、`component`、`slot` 或注册的业务 type |
| `key` | 否 | 稳定渲染身份；默认使用 `fieldKey`，同一路径渲染多次时必须显式区分 |
| `visible` | 否 | `false` 时不渲染整个 `el-col`；默认为可见 |
| `disabled` | 否 | 禁用字段，支持动态值 |
| `readonly` | 否 | 将字段同时设为 disabled 和 readonly，支持动态值 |
| `colProps` | 否 | 透传给 `el-col`，与默认 `{ span: 24 }` 合并 |
| `formItemProps` | 否 | 透传给 `el-form-item`；`prop` 始终由 `fieldKey` 管理 |
| `component` | 否 | 字段组件、Props、监听器、选项和 model 协议 |
| `binding` | 否 | 多个 model 路径与一个复合组件值的双向映射 |
| `hint` | 否 | 提示文本、动态函数或 `false`；优先于全局提示策略 |
| `labelSlot` | 否 | 自定义 label 的具名 Slot |
| `errorSlot` | 否 | 自定义校验错误的具名 Slot |
| `meta` | 否 | 业务自定义元数据，ConfigForm 不解释其内容 |

## 动态值

`visible`、`disabled`、`readonly`、`hint`、`colProps`、`formItemProps` 均可写为静态值或同步函数：

```ts
{
  fieldKey: 'companyName',
  type: 'input',
  visible: ({ model }) => model.customerType === 'company',
  disabled: ({ model }) => model.status === 'approved',
  colProps: ({ model }) => ({ span: model.compact ? 8 : 12 }),
  formItemProps: ({ model }) => ({
    label: model.customerType === 'company' ? '企业名称' : '名称'
  })
}
```

回调获得 `ConfigFormFieldRenderContext`，应保持同步且无副作用。异步数据请在业务层加载完成后更新 `items` 或 `component.options`。

## 校验

Element UI 校验规则写在 `formItemProps.rules`：

```ts
{
  fieldKey: 'email',
  type: 'input',
  formItemProps: {
    label: '邮箱',
    rules: [
      { required: true, message: '请输入邮箱', trigger: 'blur' },
      { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
    ]
  }
}
```

`el-form-item` 的 `prop` 无需重复配置；即使传入也会被 `fieldKey` 覆盖。
