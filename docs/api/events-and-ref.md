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

字段级事件在 `component` 上配置：`listeners` 对应组件 `$emit`（首参为字段上下文），`nativeListeners` 对应组件根节点的标准 DOM 事件（`ConfigFormFieldContext, DOM Event`）。两者都不是 ConfigForm 根事件，配置方式与限制见[字段组件事件](/features/component-events)。

## 实例

```ts
interface ConfigFormExpose {
  validate(callback?): Promise<boolean>
  validateField(fieldKeys: string | string[], callback?): Promise<boolean>
  updateModel(patch: Record<string, any>): void
  resetFields(): void
  clearValidate(fieldKeys?: string | string[]): void
  getFormRef(): ElForm | null
  focusField(fieldKey: string): Promise<boolean>
  scrollToFirstError(): Promise<boolean>
}
```

ConfigForm 不额外提供 model 读写 Ref；读取和提交使用父组件持有的 `model`，写入走 `v-model` 或字段上下文，底层 Form 的其他能力可通过 `getFormRef()` 使用。

需要在字段回调之外做批量写入时，使用实例方法 `updateModel`：一次调用按路径合并为一份新 model 提交（支持 `profile.city` 点路径），值未变化的路径跳过，并按字段发出 `field-change`；每次有效调用分别提交一次更新；同步连续调用会基于最新待回写数据继续合并，避免更新丢失：

```ts
formRef.value?.updateModel({ status: 'approved', 'audit.checkedBy': 'admin' })
```

```ts
import type { ConfigFormExpose } from '@itagan/config-form'
import { ref } from 'vue'

const formRef = ref<ConfigFormExpose | null>(null)

async function submit() {
  if (await formRef.value?.validate()) submitForm(model.value)
}
```

## 校验与重置边界

`validate()` 校验失败返回 `false`，并将失败字段传给回调；回调只调用一次，业务回调抛出的异常会使返回的 Promise reject。

`validateField()` 只定位配置生成的已挂载字段。默认 Slot 中手写的原生 `el-form-item` 请使用 `getFormRef()?.validateField(prop, callback)`；全表 `validate()` 仍由 Element Form 校验全部已注册字段。

`resetFields()` 通过受控更新恢复组件创建时的**整份 model 快照**，包括隐藏字段和未配置到表单的业务属性，然后清除校验状态。动态挂载字段不会重新记录初值，创建之后新增的 model 属性也会随整份快照恢复而移除。父组件需要接收 `update:model`（通常使用 `v-model`）。这与 Element UI 按当前已挂载 FormItem 的挂载初值重置不同；组件不会直接修改父级 model，也不新增另一套重置 API。

快照仅递归克隆普通对象（含空原型对象）、数组、Date、RegExp、Map 和 Set，并保留循环与共享引用关系。自定义类实例、Blob/File、TypedArray、WeakMap/WeakSet、DOM 节点等其他对象保持引用；`resetFields()` 不会回滚这些对象的内部修改。需要恢复这类内部状态时，由父组件持有业务初值并替换对象。
