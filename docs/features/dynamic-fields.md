# 动态字段与显隐

`visible`、组件 Props、选项和布局属性都接受同步函数。函数在每次渲染相关字段时求值：

```ts
interface ConfigFormFieldRenderContext<TModel> {
  model: Readonly<TModel>
  fieldKey: string
  value: ConfigFormValue
  itemConfig: Readonly<FormItemConfig<TModel>>
}
```

- `model` 是当前受控数据的只读视图，不要在回调里修改。
- `value` 是该字段当前值（配置了 binding 时为映射前的字段值）。
- `itemConfig` 是该字段完整配置，`meta` 中的业务元数据可在这里读取。

## 显隐与交互状态

```ts
const items = defineConfigFormItems<TaskModel>([
  {
    fieldKey: 'budget',
    type: 'number',
    visible: ({ model }) => model.priority === 'high',
    formItemProps: { label: '预算' },
    component: { props: ({ model }) => ({ disabled: model.budget <= 0 }) }
  },
  {
    fieldKey: 'remark',
    type: 'input',
    formItemProps: { label: '备注' },
    component: { props: ({ model }) => ({ readonly: model.locked }) }
  }
])
```

行为约定：

- `visible` 返回 `false` 时字段卸载，**不参与校验**，也不占栅格。
- 单字段禁用和只读通过 `component.props` 透传；整表禁用通过 `formProps: { disabled: true }` 由 Element 原生下沉。
- 函数必须同步、无副作用。异步数据应由页面加载后写入 model 或配置，再触发重渲染。

## 数组与嵌套路径

`fieldKey` 支持点路径与数组下标，写回时只浅拷贝被修改链路：

```ts
{ fieldKey: 'owner.name', type: 'input' }
{ fieldKey: 'tags.0', type: 'input' }
{ fieldKey: 'addresses[0].city', type: 'input' }
```

## 动态字段列表与稳定 key

字段增删由业务侧驱动：`items` 本身可以是 computed，随 model 数组长度派生。为每个动态字段提供 `key`，删除中间项时保持其余字段的组件实例身份（焦点、滚动位置、内部状态不丢失）：

```ts
const items = computed(() => defineConfigFormItems<TaskModel>([
  ...formModel.value.tags.map((tag, index): FormItemConfig<TaskModel> => ({
    key: `tag-${tag}`,
    fieldKey: `tags.${index}`,
    type: 'input',
    colProps: { span: 12 },
    formItemProps: { label: `标签：${tag}` }
  })),
  { fieldKey: 'owner.name', type: 'input', formItemProps: { label: '负责人' } }
]))
```

新增或删除标签时整体替换受控 model：

```ts
formModel.value = { ...formModel.value, tags: [...formModel.value.tags, next] }
```

注意 `key` 的取值：用下标作 key 时删除中间项会导致后续字段 key 全部平移、实例重建；用稳定业务标识（如标签内容、行 ID）作 key 才能保持实例。完整交互见[动态字段与增删示例](/examples/dynamic-form)。

## 多字段更新

页面逻辑直接不可变替换父组件 model；字段 Slot 或监听器内部可使用 `updateModel`：

```ts
formModel.value = {
  ...formModel.value,
  owner: { ...formModel.value.owner, name: 'Ada', phone: '13800000000' }
}
```

## 相关文档

- [动态字段与增删示例](/examples/dynamic-form)
- [ConfigForm API](/api/config-form)
- [受控数据流](/architecture/controlled-data-flow)
