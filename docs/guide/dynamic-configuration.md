# 动态配置与业务实践

`visible`、`disabled`、`readonly`、`colProps`、`formItemProps`、组件 Props 与选项均可使用同步函数：

```ts
{
  fieldKey: 'company',
  type: 'input',
  visible: ({ model }) => model.type === 'company',
  disabled: ({ model }) => !model.editable,
  component: {
    props: ({ model }) => ({ placeholder: `请输入${model.companyLabel}` })
  }
}
```

动态函数应保持同步、无副作用。异步选项应由业务层加载后替换配置或选项数组，不在动态回调中发起请求。

详情态没有根级开关：全局禁用使用 `formProps: { disabled: true }`，纯展示字段使用 `type: 'text'`，部分锁定使用字段级 `readonly`。完全自定义的 Slot 需要自行遵循只读状态。
