# FormItem API

`FormItemConfig` 是按 `type` 区分的联合类型。基础配置如下：

```ts
interface BaseFormItemConfig<TModel> {
  key?: string
  fieldKey: string
  binding?: FieldBindingConfig
  meta?: Record<string, unknown>
  labelSlot?: string
  errorSlot?: string
  leftSlot?: string
  rightSlot?: string
  visible?: DynamicValue<boolean, ConfigFormFieldRenderContext<TModel>>
  hint?: DynamicValue<string | false | null | undefined, ConfigFormFieldRenderContext<TModel>>
  hintTrigger?: 'item' | 'content'
  colProps?: DynamicValue<object, ConfigFormFieldRenderContext<TModel>>
  formItemProps?: DynamicValue<ConfigFormFormItemProps, ConfigFormFieldRenderContext<TModel>>
}
```

- `fieldKey` 是必填 model 路径，支持点路径和数组下标。
- `visible` 为 `false` 时不渲染整个 `el-col`。
- `colProps` 透传给 `el-col`，与默认 `{ span: 24 }` 合并。
- `formItemProps` 透传给 `el-form-item`；`prop` 由 `fieldKey` 管理并在类型上禁止重复传入。
- `hint` 与 `hintTrigger` 管理当前字段提示。
- `labelSlot`、`errorSlot` 和 `type: 'slot'` 覆盖 Element FormItem 与字段内容插槽场景。
- `leftSlot`、`rightSlot` 在主字段两侧渲染装饰内容，共用字段 Slot 上下文。

交互状态不设独立字段 API：全局禁用使用 `formProps.disabled`，单字段状态通过 `component.props` 直接交给 Element 组件：

```ts
{
  fieldKey: 'companyName',
  type: 'input',
  visible: ({ model }) => model.customerType === 'company',
  component: {
    props: ({ model }) => ({
      disabled: model.status === 'approved',
      readonly: model.status === 'archived'
    })
  },
  formItemProps: ({ model }) => ({ label: model.customerType === 'company' ? '企业名称' : '名称' })
}
```

## type 分支

- 内置 type：`component` 可覆盖 Props、监听器、选项和 model 协议。
- `component`：必须提供 `component.is` 或 `component.resolveComponent`。
- `slot`：必须提供 `component.slot`。
- 注册业务 type：`component.props/listeners/model` 按注册协议收窄，且 `fieldTypes` 必填。

校验规则直接写在 `formItemProps.rules`，由 Element Form 执行。
