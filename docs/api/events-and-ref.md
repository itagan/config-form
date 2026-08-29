# Hint、事件与 Ref

## Hint

```ts
interface ConfigFormHintOptions<TModel> {
  mode?: false | 'title' | 'tooltip'
  hintTrigger?: 'item' | 'content'
  field?: boolean | ((context: ConfigFormFieldRenderContext<TModel>) => string | false | null | undefined)
  tooltipProps?: Record<string, any>
}
```

默认配置为 `{ mode: 'title', field: false, tooltipProps: {} }`。

- `mode: 'title'` 使用原生 title；`tooltip` 使用表单级单例 Tooltip；`false` 全局关闭。
- `mode: 'tooltip'` 时整个表单只挂载一个 `el-tooltip`，通过事件委托展示：指针悬停或字段获得焦点时出现，`aria-describedby` 由组件自动维护，Escape 可临时关闭。大量字段时没有逐字段 Tooltip 的实例开销。
- `hintTrigger` 仅在 `tooltip` 模式下生效：`item`（默认）悬停整个 FormItem 触发；`content` 仅悬停字段内容根节点触发，Tooltip 也定位在内容根节点上。
- `field: true` 默认字符串化非空字段值；函数可统一格式化。
- 字段 `hint` 的非空字符串优先于 `field`；字段 `hint: false` 可单独关闭。
- `tooltipProps` 透传给单例 `el-tooltip`；`content`、`manual`、`value`、`enterable` 等受管属性会被忽略，`popperClass` 会与内部类名合并。

```vue
<ConfigForm
  :hint-options="{
    mode: 'tooltip',
    hintTrigger: 'content',
    field: ({ value }) => value ? `当前值：${value}` : false,
    tooltipProps: { placement: 'top', effect: 'dark' }
  }"
/>
```

## 事件

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `update:model` | `(model)` | 每次受控更新返回下一份 model |
| `field-change` | `(payload)` | 字段粒度变化；Ref 和上下文更新也会触发 |
| `form-validate` | `(prop, valid, message)` | Element Form 的逐字段校验结果 |

`field-change` payload：

```ts
interface ConfigFormFieldChangePayload<TModel> {
  fieldKey: string
  value: any
  previousValue: any
  model: TModel
  itemConfig: Readonly<FormItemConfig<TModel>>
}
```

`setFieldsValue()` 或 `updateModel()` 一次修改多个路径时，每个实际变化且能关联字段配置的路径各触发一次事件。通过 Ref 写入一个未配置在 `items` 中的路径仍会触发 `update:model`，但不会触发 `field-change`。

## Ref

```ts
interface ConfigFormRef {
  validate(callback?): Promise<boolean>
  validateField(props: string | string[], callback?): Promise<boolean>
  resetFields(): void
  clearValidate(props?: string | string[]): void
  getFieldValue(fieldKey: string): any
  setFieldValue(fieldKey: string, value: any): void
  setFieldsValue(patch: Record<string, any>): void
  getModel(): FormModel
  getFormRef(): unknown
  focusField(fieldKey: string): Promise<boolean>
  scrollToFirstError(): Promise<boolean>
}
```

| 方法 | 行为 |
| --- | --- |
| `validate(callback?)` | 校验全部字段；无论 Element UI resolve 或 reject 都返回 `Promise<boolean>` |
| `validateField(props, callback?)` | 校验一个或多个字段；返回 `Promise<boolean>`（全部通过为 `true`）。未挂载或未知的字段直接视为失败，不会等待 Element UI |
| `resetFields()` | 恢复为组件创建时 model 的深拷贝，并清除校验状态 |
| `clearValidate(props?)` | 清除全部或指定字段校验状态 |
| `getFieldValue(path)` | 按点路径或数组路径读取本轮最新值 |
| `setFieldValue(path, value)` | 更新一个路径 |
| `setFieldsValue(patch)` | 在一次受控事务中更新多个路径；patch 的 key 可为路径 |
| `getModel()` | 获取包含尚未被父组件回写更新的本轮最新 model |
| `getFormRef()` | 获取底层 Element UI `el-form` 实例 |
| `focusField(fieldKey)` | 聚焦已挂载字段的第一个可聚焦元素（input/textarea/select 等）；成功返回 `true`。字段未挂载（隐藏或未知）返回 `false` |
| `scrollToFirstError()` | 滚动到第一个校验失败的字段（居中）并尝试聚焦；无报错字段时返回 `false` |

连续同步调用字段更新方法会基于最近一次结果继续合并，父组件尚未回写时也不会丢失修改。

```ts
import type { ConfigFormRef } from '@itagan/config-form'
import { ref } from 'vue'

const formRef = ref<ConfigFormRef | null>(null)

async function submit() {
  const valid = await formRef.value?.validate()
  if (!valid) {
    await formRef.value?.scrollToFirstError()
    return
  }
  const payload = formRef.value.getModel()
  // 提交 payload
}
```
