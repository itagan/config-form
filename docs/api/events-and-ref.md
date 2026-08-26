# Hint、事件与 Ref

`hintOptions.mode` 支持 `title`、`tooltip` 和 false。`field: true` 默认字符串化当前值，也可传入统一格式化函数。字段自身 hint 优先，false 可单独关闭。

## 事件

- `update:model(model)`：受控 model 更新。
- `field-change(payload)`：字段路径、新旧值、下一份 model 与字段配置。
- `form-validate(prop, valid, message)`：Element Form 逐字段校验结果。

## Ref

- 校验：`validate`、`validateField`、`resetFields`、`clearValidate`。
- 数据：`getModel`、`getFieldValue`、`setFieldValue`、`setFieldsValue`。
- 底层实例：`getFormRef`。

连续同步调用字段更新方法会基于最近一次结果继续合并，父组件尚未回写时也不会丢失修改。
