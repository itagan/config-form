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

`type: 'slot'` 通过 `component.slot` 指向根组件具名 Slot。其上下文为 `ConfigFormSlotContext`，包含字段完整上下文、`propPath` 和已解析的 `ResolvedComponentConfig`。

```vue
<template #amountEditor="{ bindingValue, setBindingValue, propPath }">
  <MoneyInput :value="bindingValue" @input="setBindingValue" />
  <small>{{ propPath }}</small>
</template>
```

label Slot 使用 `ConfigFormFormItemSlotContext`；error Slot 使用额外带 `error` 的 `ConfigFormFormItemErrorSlotContext`。需要为具名 Slot 单独标注时，直接使用对应的上下文类型即可。

字段配置的 `leftSlot` / `rightSlot` 指向根组件具名 Slot，用于单位、前置操作和辅助链接；两者收到 `ConfigFormFormItemSlotContext`。主字段使用弹性宽度，并仍是 `focusField` 与内容型 Tooltip 的定位目标。

路径字段含义不同：`fieldKey` 始终是业务 model 路径，`binding.map.fieldPath` 是复合绑定中的业务写回路径，`valuePath` 是组件值内部路径，`propPath` 则是 Element Form 实际使用的校验路径。
