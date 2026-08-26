# Select、Radio、Checkbox 选项映射

<PlaygroundLink route="/options" />

三个选项类字段共享 `options/optionProps`。业务数据无需预先转换成 `{ label, value }`：

```ts
const businessOptions = [
  { id: 1, text: '研发', code: 'rd', locked: false },
  { id: 2, text: '设计', code: 'design', locked: false },
  { id: 3, text: '归档', code: 'archived', locked: true }
]

const optionProps = {
  key: 'id',
  label: 'text',
  value: 'code',
  disabled: 'locked'
}

const items = defineFormItems([
  {
    fieldKey: 'department',
    type: 'select',
    colProps: { span: 12 },
    formItemProps: { label: '部门' },
    component: {
      props: { clearable: true, filterable: true },
      options: businessOptions,
      optionProps
    }
  },
  {
    fieldKey: 'role',
    type: 'radio',
    colProps: { span: 12 },
    formItemProps: { label: '角色' },
    component: { options: businessOptions, optionProps }
  },
  {
    fieldKey: 'permissions',
    type: 'checkbox',
    colProps: { span: 24 },
    formItemProps: { label: '权限' },
    component: { options: businessOptions, optionProps }
  }
])
```

选项和字段映射也可以动态计算：

```ts
component: {
  options: ({ model }) => model.includeArchived
    ? businessOptions
    : businessOptions.filter(option => !option.locked),
  optionProps: () => optionProps
}
```

动态函数必须同步执行。远程选项应由页面负责请求和缓存，再把响应式数组交给配置；不要在 `options` 回调中发起请求。

`el-cascader` 的选项不是由 ConfigForm 生成的子节点，应使用 `component.props.options`，不要使用这里的 `component.options`。
