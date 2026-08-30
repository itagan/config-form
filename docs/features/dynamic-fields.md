# 动态字段与显隐

`visible`、`disabled`、`readonly` 以及组件 Props、选项、布局属性都接受同步函数。函数在每次渲染相关字段时求值，收到同一份字段渲染上下文：

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
const items = defineFormItems<TaskModel>([
  {
    fieldKey: 'budget',
    type: 'number',
    visible: ({ model }) => model.priority === 'high',
    disabled: ({ model }) => model.budget <= 0,
    formItemProps: { label: '预算' }
  },
  {
    fieldKey: 'remark',
    type: 'input',
    readonly: ({ model }) => model.locked,
    formItemProps: { label: '备注' }
  }
])
```

行为约定：

- `visible` 返回 `false` 时字段卸载，**不参与校验**，也不占栅格。
- `disabled`、`readonly` 与根级 `disabled`、`readonly` 取并集：任一为真即生效。
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
const items = computed(() => defineFormItems<TaskModel>([
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

## 批量更新

一次修改多个路径时使用 Ref 的 `setFieldsValue`（或 Slot/监听器上下文中的 `updateModel`），所有写回在同一次受控事务中完成，每个实际变化的路径各触发一次 `field-change`：

```ts
formRef.value.setFieldsValue({
  'owner.name': 'Ada',
  'owner.phone': '13800000000'
})
```

## 相关文档

- [动态字段与增删示例](/examples/dynamic-form)
- [ConfigForm API](/api/config-form)
- [受控数据流](/architecture/controlled-data-flow)
