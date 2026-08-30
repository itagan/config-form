# 内置字段类型

内置 type 负责选择 Element UI 组件；组件属性仍通过 `component.props` 传入。

| type | 渲染目标 | 常见 Props |
| --- | --- | --- |
| `input` | `el-input` | `placeholder`、`clearable`、`type` |
| `select` | `el-select` + `el-option` | `multiple`、`filterable`、`clearable` |
| `date` | `el-date-picker` | `type`、`valueFormat`、`format` |
| `time` | `el-time-picker` | `valueFormat`、`pickerOptions` |
| `time-select` | `el-time-select` | `pickerOptions` |
| `number` | `el-input-number` | `min`、`max`、`step`、`precision` |
| `switch` | `el-switch` | `activeValue`、`inactiveValue` |
| `radio` | `el-radio-group` + `el-radio` | 选项见下文 |
| `checkbox` | `el-checkbox-group` + `el-checkbox` | 选项见下文 |
| `text` | `span` | 只做字符串展示 |
| `rate` | `el-rate` | `max`、`showText` |
| `slider` | `el-slider` | `min`、`max`、`range` |
| `color` | `el-color-picker` | `showAlpha`、`colorFormat` |
| `cascader` | `el-cascader` | `options`、`props` |
| `autocomplete` | `el-autocomplete` | `fetchSuggestions`、`valueKey` |

`select`、`radio`、`checkbox` 的子选项由 `component.options` 生成。其他组件自己的 `options` Props（如 `el-cascader`）应写进 `component.props`。

```ts
{
  fieldKey: 'status',
  type: 'select',
  component: {
    props: { clearable: true, placeholder: '请选择状态' },
    options: [
      { label: '启用', value: 'enabled' },
      { label: '停用', value: 'disabled', disabled: true }
    ]
  }
}
```

选项默认读取 `label`、`value`、`disabled`，可通过 `optionProps` 映射业务字段；详见[选项字段映射示例](/examples/options-mapping)。

## 通用组件行为

- `component.props` 可以是对象，也可以是接收字段渲染上下文的同步函数。
- 字段级 `disabled/readonly` 配置会合并为组件的 `disabled`、`readonly` Props；整表禁用走 `formProps.disabled`。
- 内置字段使用 Vue 组件自身的 model 协议；自定义协议由 `component.model` 配置。
- `text` 对 `null` 和 `undefined` 显示为空字符串，其他值使用 `String(value)`。

一次性业务组件使用 `type: 'component'`，完全自定义模板使用 `type: 'slot'`；长期复用组件建议注册[自定义字段类型](/api/custom-field-types)。
