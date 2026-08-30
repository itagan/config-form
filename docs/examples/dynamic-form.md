# 动态字段与增删

<PlaygroundLink route="/dynamic" />

这个示例演示 `items` 由业务派生的完整形态：数组路径字段、稳定 key、动态显隐和组件 Props 透传。

## 数组路径与稳定 key

标签字段的数量跟随 `model.tags` 派生。`key` 用标签内容而非下标，删除中间标签时其余字段的组件实例身份不变：

```ts
const items = computed(() => defineConfigFormItems<TaskModel>([
  // ...固定字段
  ...formModel.value.tags.map((tag, index): FormItemConfig<TaskModel> => ({
    key: `tag-${tag}`,
    fieldKey: `tags.${index}`,
    type: 'input',
    colProps: { span: 12 },
    formItemProps: { label: `标签：${tag}` }
  })),
  { fieldKey: 'owner.name', type: 'input', colProps: { span: 12 }, formItemProps: { label: '负责人' } }
]))
```

增删通过受控更新整体替换 model，`items` 随之重算：

```ts
function removeTag(index: number) {
  formModel.value = {
    ...formModel.value,
    tags: formModel.value.tags.filter((_, current) => current !== index)
  }
}
```

## 动态显隐与禁用

预算字段只在加急时出现；折扣滑块在预算为零时禁用：

```ts
{
  fieldKey: 'budget',
  type: 'number',
  visible: ({ model }) => model.priority === 'high',
  formItemProps: { label: '预算' }
},
{
  fieldKey: 'discount',
  type: 'slider',
  visible: ({ model }) => model.priority === 'high',
  component: { props: ({ model }) => ({ min: 50, max: 100, disabled: model.budget <= 0 }) }
}
```

## 多字段写回

「一键填充默认值」直接替换父组件持有的 model：

```ts
formModel.value = {
  ...formModel.value,
  title: '季度巡检',
  owner: { ...formModel.value.owner, name: 'Ada', phone: '13800000000' }
}
```

## 适用边界

- 字段数量由数据决定（标签、成员、子任务列表）时用这种派生模式；固定字段之间的联动用 `visible` 函数即可。
- 数组规模大时注意：每个标签都是一个独立的 el-form-item，数百行列表场景更适合 FormTable 这类表格组件。
