# 校验与聚焦

校验行为由 Element UI 的 `el-form` 提供：ConfigForm 把每个字段的 `fieldKey` 注册为 el-form-item 的 prop，`rules` 通过 `formItemProps` 按 Element 原生方式配置。ConfigForm 负责的是校验的**入口统一、聚焦定位和状态重置**。

## 校验入口

```ts
interface ConfigFormRef {
  validate(callback?): Promise<boolean>
  validateField(props: string | string[], callback?): Promise<boolean>
  resetFields(): void
  clearValidate(props?: string | string[]): void
}
```

- `validate` 无论 Element UI resolve 还是 reject 都返回 `Promise<boolean>`，调用方不需要捕获异常：

```ts
const valid = await formRef.value.validate()
if (!valid) return
const payload = formRef.value.getModel()
```

- `validateField` 支持点路径（`'owner.name'`）；字段未挂载（被 `visible` 隐藏）或未配置在 `items` 中时直接视为失败。
- Element 的逐字段校验结果会以 `form-validate` 事件透出：`(prop, valid, message)`。

## 错误定位

```ts
await formRef.value.scrollToFirstError() // 滚动到第一个报错字段（居中）并尝试聚焦
await formRef.value.focusField('remark') // 聚焦指定字段的第一个可聚焦元素
```

- 两个方法共用键盘导航的同一套挂载字段查询规则：隐藏、禁用、只读或无可聚焦内容的字段会被跳过。详见[键盘导航](/features/keyboard-navigation)。
- `scrollToFirstError` 在没有任何报错字段时返回 `false`，不产生滚动。
- 典型组合是提交失败后调用 `scrollToFirstError()`，把用户的注意力送到第一个错误（见[校验聚焦示例](/examples/interaction-validation)）。

## 重置语义

`resetFields()` 恢复为 **ConfigForm 创建时 model 的深拷贝**，并清除全部校验状态。这意味着：

- 表单的"初始值"在组件挂载那一刻固定，之后外部对 model 的修改不会成为新的重置基线。
- 编辑页在异步详情加载后需要新的重置基线时，两种做法：数据就绪后再挂载 ConfigForm，或用 `:key` 在数据就绪时重建组件。
- 默认快照器支持 Date、RegExp、Map、Set、数组、对象原型和循环引用；含 WeakMap、DOM 节点或不可枚举内部状态的模型应通过 `cloneModel` 提供业务克隆函数。
- `clearValidate(props?)` 只清校验状态，不动数据。

## 读写 model 的 Ref 方法

```ts
formRef.value.getFieldValue('owner.name')       // 按路径读本轮最新值
formRef.value.setFieldValue('owner.name', 'Ada') // 写单个路径
formRef.value.setFieldsValue({ 'owner.name': 'Ada', title: '巡检' }) // 单事务多路径
formRef.value.getModel()                         // 含未回写更新的本轮最新 model
formRef.value.getFormRef()                       // 底层 el-form 实例（谨慎使用）
```

`setFieldsValue` 一次修改多个路径时，每个实际变化且能关联字段配置的路径各触发一次 `field-change`。路径寻址规则与 `fieldKey` 一致，支持点路径与数组下标。

## 边界

- 校验消息的展示位置由 `el-form-item` 决定；需要自定义错误渲染时使用 `errorSlot`（见[布局与 Slot](/features/layout-and-slots)）。
- `visible: false` 的字段不参与校验；`disabled` 字段是否校验遵循 Element UI 原生行为。
- ConfigForm 不接管提交按钮和提交流程，`append` Slot 中自行调用 `validate` 后取 `getModel()` 提交。

## 示例

- [基础、校验与动态联动](/examples/basic-form)：validate / resetFields 最小闭环。
- [校验聚焦与键盘导航](/examples/interaction-validation)：scrollToFirstError / focusField 实战。
