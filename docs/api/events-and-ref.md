# Hint、事件与实例

## Hint

`hintOptions` 只管理表单级展示策略：`mode`、默认字段内容 `field` 和透传给单例 `el-tooltip` 的 `tooltipProps`。字段自己的触发范围写在 `FormItemConfig.hintTrigger`：

```ts
const items = [{ fieldKey: 'name', type: 'input', hint: '姓名提示', hintTrigger: 'content' }]
```

`hintTrigger` 仅在 tooltip 模式生效；默认 `item` 覆盖整个 FormItem，`content` 只覆盖字段内容根节点。

## 事件

```ts
type ConfigFormEmits<TModel> = {
  'update:model': (model: TModel) => void
  'field-change': (payload: { fieldKey: string; value: any; previousValue: any }) => void
  'form-validate': (prop: string, valid: boolean, message: string | null) => void
}
```

`field-change` 与 FormTable 保持字段变化的最小载荷；下一份完整 model 由 `update:model` 提供。

## 实例

```ts
interface ConfigFormExpose {
  validate(callback?): Promise<boolean>
  validateField(props: string | string[], callback?): Promise<boolean>
  resetFields(): void
  clearValidate(props?: string | string[]): void
  getFormRef(): ElForm | null
  focusField(fieldKey: string): Promise<boolean>
  scrollToFirstError(): Promise<boolean>
}
```

ConfigForm 不额外提供 model 读写 Ref；读取和提交使用父组件持有的 `model`，写入走 `v-model` 或字段上下文，底层 Form 的其他能力可通过 `getFormRef()` 使用。

```ts
import type { ConfigFormExpose } from '@itagan/config-form'
import { ref } from 'vue'

const formRef = ref<ConfigFormExpose | null>(null)

async function submit() {
  if (await formRef.value?.validate()) submitForm(model.value)
}
```
