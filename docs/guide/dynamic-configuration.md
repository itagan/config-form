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

详情模式可使用根级 `readonly`；纯文本字段使用 `type: 'text'`。完全自定义的 Slot 需要自行遵循只读状态。
