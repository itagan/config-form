# 上下文与 Slot

## 上下文层级

动态布局和 Hint 使用只读 `ConfigFormFieldRenderContext`。注册级与字段级 `component.props` 使用 `ConfigFormFieldBindingContext`，它额外提供已解析的只读 `bindingValue`：

```ts
interface ConfigFormFieldBindingContext<TModel> extends ConfigFormFieldRenderContext<TModel> {
  readonly bindingValue: any
}
```

监听器和 Slot 使用可写的 `ConfigFormFieldContext`：

```ts
interface ConfigFormFieldContext<TModel> extends ConfigFormFieldBindingContext<TModel> {
  setValue(value: any): void
  setBindingValue(value: any): void
  updateModel(patch: Partial<TModel> & Record<string, any>): void
}
```

所有字段级上下文都携带 `itemConfig`（当前字段的完整配置）；业务挂载在字段 `meta` 中的自定义元数据通过 `itemConfig.meta` 读取，详见 [业务元数据 meta](/features/meta)。

## 根默认 Slot

根默认 Slot 渲染在生成的 `el-row` 之后、`el-form` 内部，适合放操作区，并接收 `{ model }`：

```vue
<ConfigForm v-model="model" :items="items">
  <template #default="{ model: currentModel }">
    <el-button @click="submit(currentModel)">提交</el-button>
  </template>
</ConfigForm>
```

## 字段 Slot

`type: 'slot'` 通过 `component.slot` 指向根组件具名 Slot。其上下文为 `ConfigFormSlotContext`，包含字段完整上下文、`propPath` 和已解析的 `ResolvedComponentConfig`。字段 Slot 不接受 `nativeListeners`，因为实际组件和根节点由调用方创建；原生 DOM 事件应在 Slot 模板内显式监听。

```vue
<template #amountEditor="{ bindingValue, setBindingValue, propPath }">
  <MoneyInput :value="bindingValue" @input="setBindingValue" />
  <small>{{ propPath }}</small>
</template>
```

label Slot 使用 `ConfigFormFormItemSlotContext`；error Slot 使用额外带 `error` 的 `ConfigFormFormItemErrorSlotContext`。需要为具名 Slot 单独标注时，直接使用对应的上下文类型即可。

字段配置的 `leftSlot` / `rightSlot` 指向根组件具名 Slot，用于单位、前置操作和辅助链接；两者收到 `ConfigFormFormItemSlotContext`。主字段使用弹性宽度，并仍是 `focusField` 与内容型 Tooltip 的定位目标。

路径字段含义不同：`fieldKey` 始终是业务 model 路径，`binding.map.fieldPath` 是复合绑定中的业务写回路径，`valuePath` 是组件值内部路径，`propPath` 则是 Element Form 实际使用的校验路径。

## 原生组件插槽

只修改控件内部内容时，使用 `component.nativeSlots`，让 ConfigForm 继续负责创建组件和绑定数据。映射的键是原生组件插槽名，值是根 ConfigForm 具名 Slot 名：

```ts
const items = [{
  fieldKey: 'project',
  type: 'input',
  component: { nativeSlots: { prepend: 'projectPrefix', append: 'projectAction' } }
}]
```

```vue
<ConfigForm v-model="model" :items="items">
  <template #projectPrefix>项目</template>
  <template #projectAction="{ field }">
    <el-button @click="field.setValue('ConfigForm')">恢复项目名</el-button>
  </template>
</ConfigForm>
```

上下文类型为 `ConfigFormComponentSlotContext<TModel, TSlotProps>`：`field` 是当前字段的 `ConfigFormFieldContext`，`slotProps` 原样保留底层组件提供的插槽参数，两者不会扁平合并。例如 Autocomplete 的 `default` 插槽通过 `slotProps.item` 读取建议项，见[扩展示例](/examples/extensions)。

此配置适用于内置组件、注册字段和一次性组件；`text` 没有组件插槽，整字段 `type: 'slot'` 不接受 `component.nativeSlots`。`fieldTypes` 注册定义仍只包含 `is/props/model`。

只有映射的根插槽存在时才覆盖。对 select/radio/checkbox，存在的 `default` 插槽会替代自动生成的选项；仅配置其他插槽、或映射目标不存在时，保留 `options/optionProps` 行为。自定义分组与选项内容可在该默认插槽中直接使用原生 `el-option-group/el-option`。

选择顺序：原生属性用 `component.props`；局部内容用 `component.nativeSlots`；完全自定义字段或需要自行持有组件 `ref` 时用整字段 Slot。
