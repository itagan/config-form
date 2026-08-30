# 复合字段映射（binding.map）

当一个编辑组件同时读写的值横跨多个 model 字段（时间区间、起止价格、坐标等），用 `binding.map` 在业务路径和组件受控值之间建立可序列化的双向映射：

```ts
{
  fieldKey: 'start',
  type: 'component',
  component: { is: TimeRangeEditor },
  binding: {
    map: [
      { fieldPath: 'start', valuePath: 'start' },
      { fieldPath: 'end', valuePath: 'end', fallbackValue: '18:00' }
    ]
  }
}
```

## 读取与写回

- **读取**：组件收到的受控值由所有 `map` 条目组装为 `{ start, end }` 形状（`valuePath` 作为键）。
- **写回**：组件回传新值时，ConfigForm 按 `valuePath` 拆分，逐条写回对应的 `fieldPath`，两次写回出现在同一份新 model 中。
- `fieldKey` 不参与映射取值，但仍是 el-form-item 的校验 prop 和 `field-change` 的身份。上例中校验针对 `start` 路径。

## fallbackValue

组件回传值缺少某个 `valuePath` 时（例如旧版本组件没有该字段），写入 `fallbackValue` 而不是 `undefined`：

```ts
{ fieldPath: 'end', valuePath: 'end', fallbackValue: '18:00' }
```

未配置 `fallbackValue` 时写回 `undefined`。

## 约束

- `fieldPath` 与 `valuePath` 各自不可重复或重叠，否则路径写入会互相覆盖。
- 映射是纯数据配置，可以随 JSON Schema 一起下发；只有组件目标本身需要在客户端绑定。
- 配置了 `binding` 的字段，上下文中的 `bindingValue` 是组装后的组件值，`setBindingValue(value)` 按映射写回；`value` 与 `setValue` 始终指向 `fieldKey` 对应的字段路径。

## 与 model 协议的关系

`binding` 解决"业务字段 ↔ 组件值"的结构映射；`component.model` 解决"组件值 ↔ 受控 prop"的协议问题。两者可叠加：先经 `model.valueToProp` 转换，再进入组件。见[自定义组件接入](/features/custom-components)。

## 示例

[扩展、Slot 与复合字段](/examples/extensions)用 `TimeRangeEditor` 演示了完整读写链路。
