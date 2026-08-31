# 校验、重置与字段定位

实例类型使用与 FormTable 一致的 `Expose` 命名：

```ts
interface ConfigFormExpose {
  validate(callback?): Promise<boolean>
  validateField(fieldKeys: string | string[], callback?): Promise<boolean>
  resetFields(): void
  clearValidate(fieldKeys?: string | string[]): void
  focusField(fieldKey: string): Promise<boolean>
  scrollToFirstError(): Promise<boolean>
  getFormRef(): ElForm | null
}
```

提交数据始终读取父组件持有的 model：

```ts
async function submit() {
  if (!await formRef.value?.validate()) {
    await formRef.value?.scrollToFirstError()
    return
  }
  submitForm(model.value)
}
```

- `resetFields()` 恢复组件创建时的内部 model 快照，并清除校验状态。
- `validateField()` 支持一个或多个路径；隐藏或未知字段返回 `false`。
- `focusField()` 聚焦已挂载字段的第一个可交互元素。
- `scrollToFirstError()` 滚动并尝试聚焦第一个错误项。
- `getFormRef()` 返回完整 Element UI `ElForm` 实例，额外的底层能力直接从这里调用。

ConfigForm 不接管提交按钮和提交流程；按钮可放在根默认 Slot 中。
