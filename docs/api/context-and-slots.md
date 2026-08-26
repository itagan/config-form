# 上下文与 Slot

## 上下文层级

动态配置函数收到只读渲染上下文：

```ts
interface ConfigFormFieldRenderContext<TModel> {
  model: Readonly<TModel>
  fieldKey: string
  value: any
  itemConfig: Readonly<FormItemConfig<TModel>>
}
```

字段监听器和 Slot 收到完整字段上下文，并增加更新助手：

```ts
interface ConfigFormFieldContext<TModel>
  extends ConfigFormFieldRenderContext<TModel> {
  bindingValue: any
  setValue(value: any): void
  setBindingValue(value: any): void
  updateModel(patch: Partial<TModel> & Record<string, any>): void
}
```

| 成员 | 用途 |
| --- | --- |
| `value` | `fieldKey` 对应的原始 model 值 |
| `bindingValue` | 应用 `binding.map` 后传给组件的值；无 binding 时等于 `value` |
| `setValue` | 仅更新 `fieldKey` |
| `setBindingValue` | 按 binding 拆分写回；无 binding 时等同 `setValue` |
| `updateModel` | 按路径批量更新 model，例如 `{ 'profile.name': 'Ada' }` |

连续同步调用更新助手时会基于本轮最新结果合并，不必等待父组件完成回写。

## 根级 Slot

| Slot | 参数 | 位置 |
| --- | --- | --- |
| `prepend` | `{ model }` | `el-row` 之前、`el-form` 内部 |
| `append` | `{ model }` | `el-row` 之后、`el-form` 内部 |

```vue
<ConfigForm v-model="model" :items="items">
  <template #prepend="{ model: currentModel }">
    <el-alert :title="`正在编辑：${currentModel.name || '未命名'}`" />
  </template>
  <template #append>
    <el-button @click="submit">提交</el-button>
  </template>
</ConfigForm>
```

## 字段 Slot

### 自定义字段

配置 `type: 'slot'` 和 `component.slot`：

```ts
{
  fieldKey: 'amount',
  type: 'slot',
  component: { slot: 'amountEditor' },
  formItemProps: { label: '金额' }
}
```

```vue
<template #amountEditor="{ value, setValue, model, propPath }">
  <MoneyInput
    :value="value"
    :currency="model.currency"
    @input="setValue"
  />
  <small>{{ propPath }}</small>
</template>
```

字段 Slot 在完整字段上下文之外还提供：

- `propPath`：当前 `fieldKey`；
- `component`：已合并 type 定义、字段配置和交互状态后的 `ResolvedFieldComponent`。

完全自定义 Slot 不会自动应用组件的 disabled/readonly 行为，应根据业务需要从 `itemConfig`、model 或外部状态自行处理。

### Label 与 Error

```ts
{
  fieldKey: 'email',
  type: 'input',
  labelSlot: 'emailLabel',
  errorSlot: 'emailError'
}
```

```vue
<template #emailLabel="{ value }">
  邮箱 <small v-if="value">已填写</small>
</template>

<template #emailError="{ error, setValue }">
  <span class="error">{{ error }}</span>
  <el-button type="text" @click="setValue('')">清空</el-button>
</template>
```

label Slot 获得字段上下文与 `propPath`；error Slot另有 `error: string`。
